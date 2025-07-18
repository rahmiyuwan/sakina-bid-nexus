import { supabase } from '@/integrations/supabase/client';
import type { User, CreateUser, UpdateUser } from '@/types/database';

export const userService = {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        workspace:workspaces(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        workspace:workspaces(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(user: CreateUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select(`
        *,
        workspace:workspaces(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, user: UpdateUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
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
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};