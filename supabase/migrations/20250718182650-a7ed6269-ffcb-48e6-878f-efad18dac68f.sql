-- Update the calculate_final_prices function to add margin as a fixed currency amount
CREATE OR REPLACE FUNCTION public.calculate_final_prices()
RETURNS TRIGGER AS $$
BEGIN
  NEW.final_price_double = NEW.price_double + NEW.admin_margin;
  NEW.final_price_triple = NEW.price_triple + NEW.admin_margin;
  NEW.final_price_quad = NEW.price_quad + NEW.admin_margin;
  NEW.final_price_quint = NEW.price_quint + NEW.admin_margin;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;