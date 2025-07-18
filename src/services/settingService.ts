import { supabase } from '@/integrations/supabase/client';
import type { Setting, CreateSetting, UpdateSetting } from '@/types/database';

export const settingService = {
  async getAll(): Promise<Setting[]> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .order('category', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Setting | null> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByKey(key: string): Promise<Setting | null> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', key)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(setting: CreateSetting): Promise<Setting> {
    const { data, error } = await supabase
      .from('settings')
      .insert(setting)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, setting: UpdateSetting): Promise<Setting> {
    const { data, error } = await supabase
      .from('settings')
      .update(setting)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('settings')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};