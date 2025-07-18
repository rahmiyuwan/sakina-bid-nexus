import { supabase } from '@/integrations/supabase/client';

type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: 'travel_agent' | 'hotel_provider' | 'admin' | 'super_admin';
  workspace_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  workspace?: any;
};

type CreateProfile = Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'workspace'>;
type UpdateProfile = Partial<Omit<CreateProfile, 'id'>>;

export const userService = {
  async getAll(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        workspace:workspaces(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        workspace:workspaces(*)
      `)
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async create(user: CreateProfile): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .insert(user as any)
      .select(`
        *,
        workspace:workspaces(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, user: UpdateProfile): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(user)
      .eq('id', id)
      .select(`
        *,
        workspace:workspaces(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};