import { supabase } from '@/integrations/supabase/client';
import type { CreateCommission, UpdateCommission } from '@/types/database';

type Commission = {
  id: string;
  request_id: string;
  admin_id: string;
  commission_double?: number;
  commission_triple?: number;
  commission_quad?: number;
  commission_quint?: number;
  created_at: string;
  updated_at: string;
  request?: any;
  admin?: any;
};

export const commissionService = {
  async getAll(): Promise<Commission[]> {
    const { data, error } = await supabase
      .from('commissions')
      .select(`
        *,
        request:requests(*),
        admin:profiles(*)
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
        admin:profiles(*)
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
        admin:profiles(*)
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
        admin:profiles(*)
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
        admin:profiles(*)
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