import { supabase } from '@/integrations/supabase/client';
import type { Commission, CreateCommission, UpdateCommission } from '@/types/database';

export const commissionService = {
  async getAll(): Promise<Commission[]> {
    const { data, error } = await supabase
      .from('commissions')
      .select(`
        *,
        request:requests(*),
        admin:users(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Commission | null> {
    const { data, error } = await supabase
      .from('commissions')
      .select(`
        *,
        request:requests(*),
        admin:users(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByRequestId(requestId: string): Promise<Commission[]> {
    const { data, error } = await supabase
      .from('commissions')
      .select(`
        *,
        request:requests(*),
        admin:users(*)
      `)
      .eq('request_id', requestId);
    
    if (error) throw error;
    return data || [];
  },

  async create(commission: CreateCommission): Promise<Commission> {
    const { data, error } = await supabase
      .from('commissions')
      .insert(commission)
      .select(`
        *,
        request:requests(*),
        admin:users(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, commission: UpdateCommission): Promise<Commission> {
    const { data, error } = await supabase
      .from('commissions')
      .update(commission)
      .eq('id', id)
      .select(`
        *,
        request:requests(*),
        admin:users(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('commissions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};