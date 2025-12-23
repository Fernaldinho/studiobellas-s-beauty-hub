-- Create enum for user plans
CREATE TYPE public.user_plan AS ENUM ('FREE', 'PRO');

-- Create enum for subscription status
CREATE TYPE public.subscription_status AS ENUM ('active', 'canceled', 'incomplete', 'past_due');

-- Create enum for appointment status
CREATE TYPE public.appointment_status AS ENUM ('confirmed', 'cancelled', 'completed');

-- Create enum for image format
CREATE TYPE public.image_format AS ENUM ('square', 'rectangular', 'circular');

-- Create enum for theme preset
CREATE TYPE public.theme_preset AS ENUM ('purple', 'rose', 'gold');

-- Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  plan user_plan NOT NULL DEFAULT 'FREE',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status subscription_status NOT NULL DEFAULT 'incomplete',
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Create salon_settings table (one per user/salon owner)
CREATE TABLE public.salon_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL DEFAULT 'Meu Salão',
  description TEXT,
  whatsapp TEXT,
  cover_photo TEXT,
  banner_url TEXT,
  logo_url TEXT,
  logo_format image_format DEFAULT 'circular',
  banner_format image_format DEFAULT 'rectangular',
  theme_preset theme_preset DEFAULT 'purple',
  opening_hours_start TEXT DEFAULT '09:00',
  opening_hours_end TEXT DEFAULT '18:00',
  working_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on salon_settings
ALTER TABLE public.salon_settings ENABLE ROW LEVEL SECURITY;

-- Salon settings policies
CREATE POLICY "Users can view their own salon settings"
  ON public.salon_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own salon settings"
  ON public.salon_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own salon settings"
  ON public.salon_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Public can view salon settings by salon id (for client page)
CREATE POLICY "Public can view salon settings"
  ON public.salon_settings FOR SELECT
  USING (true);

-- Create professionals table
CREATE TABLE public.professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salon_settings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialty TEXT,
  photo TEXT,
  available_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6],
  available_hours_start TEXT DEFAULT '09:00',
  available_hours_end TEXT DEFAULT '18:00',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on professionals
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

-- Professionals policies
CREATE POLICY "Salon owners can manage their professionals"
  ON public.professionals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.salon_settings ss
      WHERE ss.id = salon_id AND ss.user_id = auth.uid()
    )
  );

-- Public can view professionals
CREATE POLICY "Public can view professionals"
  ON public.professionals FOR SELECT
  USING (true);

-- Create services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salon_settings(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 30,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Services policies
CREATE POLICY "Salon owners can manage their services"
  ON public.services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.salon_settings ss
      WHERE ss.id = salon_id AND ss.user_id = auth.uid()
    )
  );

-- Public can view services
CREATE POLICY "Public can view services"
  ON public.services FOR SELECT
  USING (true);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salon_settings(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  status appointment_status NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Appointments policies
CREATE POLICY "Salon owners can manage their appointments"
  ON public.appointments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.salon_settings ss
      WHERE ss.id = salon_id AND ss.user_id = auth.uid()
    )
  );

-- Public can insert appointments (clients booking)
CREATE POLICY "Public can create appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (true);

-- Create clients table (for salon CRM)
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salon_settings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  total_visits INTEGER DEFAULT 0,
  last_visit TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(salon_id, phone)
);

-- Enable RLS on clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Clients policies
CREATE POLICY "Salon owners can manage their clients"
  ON public.clients FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.salon_settings ss
      WHERE ss.id = salon_id AND ss.user_id = auth.uid()
    )
  );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'name');
  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_salon_settings_updated_at
  BEFORE UPDATE ON public.salon_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_professionals_updated_at
  BEFORE UPDATE ON public.professionals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();