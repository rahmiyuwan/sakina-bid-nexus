-- Update all existing offerings to recalculate final prices with the new formula (adding margin as fixed amount)
UPDATE public.offerings 
SET 
  final_price_double = price_double + admin_margin,
  final_price_triple = price_triple + admin_margin,
  final_price_quad = price_quad + admin_margin,
  final_price_quint = price_quint + admin_margin,
  updated_at = now();