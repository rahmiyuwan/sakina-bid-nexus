-- Update the check constraint to allow 'user' as a valid related_entity_type
ALTER TABLE public.notifications 
DROP CONSTRAINT notifications_related_entity_type_check;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_related_entity_type_check 
CHECK (related_entity_type = ANY (ARRAY['request'::text, 'bid'::text, 'commission'::text, 'user'::text]));