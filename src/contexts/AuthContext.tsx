import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  email: string;
  name: string | null;
  plan: 'FREE' | 'PRO';
}

interface Subscription {
  subscribed: boolean;
  plan: 'FREE' | 'PRO';
  subscriptionEnd: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  subscription: Subscription;
  isLoading: boolean;
  isCheckingSubscription: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  checkSubscription: () => Promise<void>;
  createCheckout: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [subscription, setSubscription] = useState<Subscription>({
    subscribed: false,
    plan: 'FREE',
    subscriptionEnd: null,
  });

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data as Profile | null;
  };

  const refreshProfile = async () => {
    if (!user) return;
    const profileData = await fetchProfile(user.id);
    if (profileData) {
      setProfile(profileData);
      setSubscription(prev => ({
        ...prev,
        plan: profileData.plan,
        subscribed: profileData.plan === 'PRO',
      }));
    }
  };

  const checkSubscription = async () => {
    if (!session) return;

    setIsCheckingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      if (data) {
        setSubscription({
          subscribed: data.subscribed,
          plan: data.plan || 'FREE',
          subscriptionEnd: data.subscription_end,
        });

        // Also refresh profile to sync
        await refreshProfile();
      }
    } catch (err) {
      console.error('Error invoking check-subscription:', err);
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Defer profile fetch to avoid deadlock
          setTimeout(() => {
            fetchProfile(currentSession.user.id).then(profileData => {
              if (profileData) {
                setProfile(profileData);
                setSubscription(prev => ({
                  ...prev,
                  plan: profileData.plan,
                  subscribed: profileData.plan === 'PRO',
                }));
              }
            });
          }, 0);
        } else {
          setProfile(null);
          setSubscription({
            subscribed: false,
            plan: 'FREE',
            subscriptionEnd: null,
          });
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);

      if (existingSession?.user) {
        fetchProfile(existingSession.user.id).then(profileData => {
          if (profileData) {
            setProfile(profileData);
            setSubscription({
              subscribed: profileData.plan === 'PRO',
              plan: profileData.plan,
              subscriptionEnd: null,
            });
          }
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  // Check subscription periodically
  useEffect(() => {
    if (session) {
      checkSubscription();

      const interval = setInterval(() => {
        checkSubscription();
      }, 60000); // Every minute

      return () => clearInterval(interval);
    }
  }, [session]);

  const signUp = async (email: string, password: string, name?: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name },
      },
    });

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSubscription({
      subscribed: false,
      plan: 'FREE',
      subscriptionEnd: null,
    });
  };

  const createCheckout = async () => {
    if (!session) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para assinar.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Error creating checkout:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível iniciar o checkout. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const openCustomerPortal = async () => {
    if (!session) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Error opening portal:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível abrir o portal. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        subscription,
        isLoading,
        isCheckingSubscription,
        signUp,
        signIn,
        signOut,
        checkSubscription,
        createCheckout,
        openCustomerPortal,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
