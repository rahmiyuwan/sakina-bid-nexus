-- Create offerings table for hotel bids
CREATE TABLE public.offerings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  provider_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  hotel_name TEXT NOT NULL,
  price_double DECIMAL(10,2) DEFAULT 0,
  price_triple DECIMAL(10,2) DEFAULT 0,
  price_quad DECIMAL(10,2) DEFAULT 0,
  price_quint DECIMAL(10,2) DEFAULT 0,
  admin_margin DECIMAL(5,2) DEFAULT 10.0,
  final_price_double DECIMAL(10,2) DEFAULT 0,
  final_price_triple DECIMAL(10,2) DEFAULT 0,
  final_price_quad DECIMAL(10,2) DEFAULT 0,
  final_price_quint DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELED')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(request_id, provider_user_id)
);

-- Enable Row Level Security
ALTER TABLE public.offerings ENABLE ROW LEVEL SECURITY;

-- Create policies for offerings
CREATE POLICY "Users can view all offerings" 
ON public.offerings 
FOR SELECT 
USING (true);

CREATE POLICY "Hotel providers can create their own offerings" 
ON public.offerings 
FOR INSERT 
WITH CHECK (auth.uid() = provider_user_id);

CREATE POLICY "Hotel providers can update their own offerings" 
ON public.offerings 
FOR UPDATE 
USING (auth.uid() = provider_user_id);

CREATE POLICY "Admins can manage all offerings" 
ON public.offerings 
FOR ALL 
USING (is_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_offerings_updated_at
BEFORE UPDATE ON public.offerings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to calculate final prices with admin margin
CREATE OR REPLACE FUNCTION public.calculate_final_prices()
RETURNS TRIGGER AS $$
BEGIN
  NEW.final_price_double = NEW.price_double * (1 + NEW.admin_margin / 100);
  NEW.final_price_triple = NEW.price_triple * (1 + NEW.admin_margin / 100);
  NEW.final_price_quad = NEW.price_quad * (1 + NEW.admin_margin / 100);
  NEW.final_price_quint = NEW.price_quint * (1 + NEW.admin_margin / 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_offering_final_prices
BEFORE INSERT OR UPDATE ON public.offerings
FOR EACH ROW
EXECUTE FUNCTION public.calculate_final_prices();