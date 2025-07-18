import { supabase } from '@/integrations/supabase/client';
import type { Hotel, CreateHotel, UpdateHotel, CityType } from '@/types/database';

export const hotelService = {
  async getAll(): Promise<Hotel[]> {
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Hotel | null> {
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByCity(city: CityType): Promise<Hotel[]> {
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('city', city)
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async create(hotel: CreateHotel): Promise<Hotel> {
    const { data, error } = await supabase
      .from('hotels')
      .insert(hotel)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, hotel: UpdateHotel): Promise<Hotel> {
    const { data, error } = await supabase
      .from('hotels')
      .update(hotel)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('hotels')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};