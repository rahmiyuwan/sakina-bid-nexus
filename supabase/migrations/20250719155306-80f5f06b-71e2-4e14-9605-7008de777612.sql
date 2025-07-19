-- Add notes column to requests table
ALTER TABLE public.requests 
ADD COLUMN notes TEXT;