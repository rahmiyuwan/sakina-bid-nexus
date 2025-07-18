import { supabase } from '@/integrations/supabase/client';
import type { Request, CreateRequest, UpdateRequest } from '@/types/database';

export const requestService = {
  async getAll(): Promise<Request[]> {
    const { data, error } = await supabase
      .from('requests')
      .select(`
        *,
        workspace:workspaces!travel_workspace_id(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Request | null> {
    const { data, error } = await supabase
      .from('requests')
      .select(`
        *,
        workspace:workspaces!travel_workspace_id(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(request: CreateRequest): Promise<Request> {
    const { data, error } = await supabase
      .from('requests')
      .insert(request)
      .select(`
        *,
        workspace:workspaces!travel_workspace_id(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, request: UpdateRequest): Promise<Request> {
    const { data, error } = await supabase
      .from('requests')
      .update(request)
      .eq('id', id)
      .select(`
        *,
        workspace:workspaces!travel_workspace_id(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('requests')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};