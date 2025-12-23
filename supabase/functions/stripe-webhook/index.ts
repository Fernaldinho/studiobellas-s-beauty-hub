import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      throw new Error("Missing Stripe configuration");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logStep("Webhook signature verification failed", { error: errorMessage });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Event verified", { type: event.type });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout completed", { sessionId: session.id, customerEmail: session.customer_email });

        if (session.mode === "subscription" && session.customer_email) {
          // Find user by email
          const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("email", session.customer_email)
            .maybeSingle();

          if (profileError) {
            logStep("Error finding profile", { error: profileError.message });
            break;
          }

          if (profile) {
            // Update user plan to PRO
            await supabaseAdmin
              .from("profiles")
              .update({ plan: "PRO" })
              .eq("id", profile.id);

            // Create or update subscription record
            await supabaseAdmin
              .from("subscriptions")
              .upsert({
                user_id: profile.id,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
                status: "active",
              }, { onConflict: "user_id" });

            logStep("User upgraded to PRO", { userId: profile.id });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription updated", { subscriptionId: subscription.id, status: subscription.status });

        const { data: subRecord } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .maybeSingle();

        if (subRecord) {
          const newStatus = subscription.status === "active" ? "active" : 
                           subscription.status === "canceled" ? "canceled" : 
                           subscription.status === "past_due" ? "past_due" : "incomplete";

          await supabaseAdmin
            .from("subscriptions")
            .update({ 
              status: newStatus,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
            })
            .eq("stripe_subscription_id", subscription.id);

          // Update user plan based on subscription status
          const newPlan = subscription.status === "active" ? "PRO" : "FREE";
          await supabaseAdmin
            .from("profiles")
            .update({ plan: newPlan })
            .eq("id", subRecord.user_id);

          logStep("Subscription and plan updated", { userId: subRecord.user_id, plan: newPlan });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription deleted", { subscriptionId: subscription.id });

        const { data: subRecord } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .maybeSingle();

        if (subRecord) {
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: "canceled" })
            .eq("stripe_subscription_id", subscription.id);

          await supabaseAdmin
            .from("profiles")
            .update({ plan: "FREE" })
            .eq("id", subRecord.user_id);

          logStep("User downgraded to FREE", { userId: subRecord.user_id });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Payment failed", { invoiceId: invoice.id, customerEmail: invoice.customer_email });
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
