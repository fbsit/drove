
-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id SERIAL PRIMARY KEY,
  transfer_id UUID REFERENCES public.vehicle_transfers(id),
  method TEXT CHECK (method IN ('card', 'bank_transfer')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed')) NOT NULL DEFAULT 'pending',
  amount DECIMAL(10, 2),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  confirmed_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create invoices table 
CREATE TABLE IF NOT EXISTS public.invoices (
  id SERIAL PRIMARY KEY,
  transfer_id UUID REFERENCES public.vehicle_transfers(id),
  invoice_number TEXT,
  issued BOOLEAN DEFAULT false,
  issued_at TIMESTAMP WITH TIME ZONE,
  issued_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add role column to users table if it doesn't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('admin', 'traffic_manager', 'client', 'drover'));

-- Update the existing user types to the new role system
UPDATE public.users SET role = user_type WHERE role IS NULL;

-- Add company_name column for users that are companies
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- Add RLS policies for payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything with payments"
  ON public.payments
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');
  
CREATE POLICY "Traffic managers can view payments"
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'traffic_manager');
  
CREATE POLICY "Clients can view their own payments"
  ON public.payments
  FOR SELECT
  TO authenticated
  USING ((SELECT client_id FROM public.vehicle_transfers WHERE id = transfer_id) = auth.uid());

-- Add RLS policies for invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything with invoices"
  ON public.invoices
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');
  
CREATE POLICY "Traffic managers can view invoices"
  ON public.invoices
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'traffic_manager');
  
CREATE POLICY "Clients can view their own invoices"
  ON public.invoices
  FOR SELECT
  TO authenticated
  USING ((SELECT client_id FROM public.vehicle_transfers WHERE id = transfer_id) = auth.uid());
