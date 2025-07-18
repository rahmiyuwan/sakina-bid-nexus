-- Create enums
CREATE TYPE public.user_role AS ENUM ('travel_agent', 'hotel_provider', 'admin', 'super_admin');
CREATE TYPE public.city_type AS ENUM ('Makkah', 'Madinah');
CREATE TYPE public.package_type AS ENUM ('PROMO', 'VIP', 'REGULAR');
CREATE TYPE public.request_status AS ENUM ('Submitted', 'Quoted', 'Confirmed');
CREATE TYPE public.value_type AS ENUM ('decimal', 'integer', 'string', 'boolean', 'json');

-- Create Workspace table
CREATE TABLE public.workspaces (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Users table
CREATE TABLE public.users (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role user_role NOT NULL,
    workspace_id UUID REFERENCES public.workspaces(id),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Settings table
CREATE TABLE public.settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    value_type value_type NOT NULL,
    description TEXT,
    category TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sequence for request numbers
CREATE SEQUENCE public.request_number_seq;

-- Create Requests table
CREATE TABLE public.requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    request_number INTEGER NOT NULL DEFAULT nextval('public.request_number_seq'),
    travel_workspace_id UUID NOT NULL REFERENCES public.workspaces(id),
    travel_name TEXT NOT NULL,
    pax INTEGER NOT NULL,
    tour_leader TEXT NOT NULL,
    city city_type NOT NULL,
    package_type package_type NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    room_double INTEGER NOT NULL DEFAULT 0,
    room_triple INTEGER NOT NULL DEFAULT 0,
    room_quad INTEGER NOT NULL DEFAULT 0,
    room_quint INTEGER NOT NULL DEFAULT 0,
    status request_status NOT NULL DEFAULT 'Submitted',
    bidding_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Hotels table
CREATE TABLE public.hotels (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    city city_type NOT NULL,
    address TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    facilities JSONB,
    distance_to_haram INTEGER,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Commissions table
CREATE TABLE public.commissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES public.users(id),
    commission_double DECIMAL(10,2),
    commission_triple DECIMAL(10,2),
    commission_quad DECIMAL(10,2),
    commission_quint DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON public.requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON public.hotels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON public.commissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to set default bidding deadline
CREATE OR REPLACE FUNCTION public.set_bidding_deadline()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.bidding_deadline IS NULL THEN
        NEW.bidding_deadline = NEW.check_in_date - INTERVAL '1 day';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_requests_bidding_deadline 
BEFORE INSERT ON public.requests 
FOR EACH ROW EXECUTE FUNCTION public.set_bidding_deadline();

-- Enable RLS
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies - can be refined based on business logic)
-- For now, allowing authenticated users to perform operations

-- Workspaces policies
CREATE POLICY "Users can view workspaces" ON public.workspaces FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage workspaces" ON public.workspaces FOR ALL TO authenticated USING (true);

-- Users policies  
CREATE POLICY "Users can view users" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage users" ON public.users FOR ALL TO authenticated USING (true);

-- Settings policies
CREATE POLICY "Users can view settings" ON public.settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage settings" ON public.settings FOR ALL TO authenticated USING (true);

-- Requests policies
CREATE POLICY "Users can view requests" ON public.requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage requests" ON public.requests FOR ALL TO authenticated USING (true);

-- Hotels policies
CREATE POLICY "Users can view hotels" ON public.hotels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage hotels" ON public.hotels FOR ALL TO authenticated USING (true);

-- Commissions policies
CREATE POLICY "Users can view commissions" ON public.commissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage commissions" ON public.commissions FOR ALL TO authenticated USING (true);