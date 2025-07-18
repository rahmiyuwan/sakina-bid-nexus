import { supabase } from '@/integrations/supabase/client';
import type { HotelOffering } from '@/types/index';

export interface CreateOffering {
  request_id: string;
  provider_user_id: string;
  hotel_id: string;
  hotel_name: string;
  price_double: number;
  price_triple: number;
  price_quad: number;
  price_quint: number;
  admin_margin?: number;
}

export interface UpdateOffering {
  price_double?: number;
  price_triple?: number;
  price_quad?: number;
  price_quint?: number;
  admin_margin?: number;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELED';
}

export const offeringService = {
  async getAll(): Promise<HotelOffering[]> {
    const { data, error } = await supabase
      .from('offerings')
      .select(`
        *,
        request:requests!request_id(*),
        provider:profiles!provider_user_id(*),
        hotel:hotels!hotel_id(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []) as HotelOffering[];
  },

  async getByRequestId(requestId: string): Promise<HotelOffering[]> {
    const { data, error } = await supabase
      .from('offerings')
      .select(`
        *,
        request:requests!request_id(*),
        provider:profiles!provider_user_id(*),
        hotel:hotels!hotel_id(*)
      `)
      .eq('request_id', requestId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []) as HotelOffering[];
  },

  async getByProviderId(providerId: string): Promise<HotelOffering[]> {
    const { data, error } = await supabase
      .from('offerings')
      .select(`
        *,
        request:requests!request_id(*),
        provider:profiles!provider_user_id(*),
        hotel:hotels!hotel_id(*)
      `)
      .eq('provider_user_id', providerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []) as HotelOffering[];
  },

  async getById(id: string): Promise<HotelOffering | null> {
    const { data, error } = await supabase
      .from('offerings')
      .select(`
        *,
        request:requests!request_id(*),
        provider:profiles!provider_user_id(*),
        hotel:hotels!hotel_id(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as HotelOffering | null;
  },

  async create(offering: CreateOffering): Promise<HotelOffering> {
    // Get default margin from settings if not provided
    let finalOffering = { ...offering };
    if (!finalOffering.admin_margin) {
      const { data: defaultMarginSetting } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'default_margin')
        .eq('is_active', true)
        .single();
      
      finalOffering.admin_margin = defaultMarginSetting ? parseFloat(defaultMarginSetting.value) : 10;
    }

    const { data, error } = await supabase
      .from('offerings')
      .insert(finalOffering)
      .select(`
        *,
        request:requests!request_id(*),
        provider:profiles!provider_user_id(*),
        hotel:hotels!hotel_id(*)
      `)
      .single();
    
    if (error) throw error;
    return data as HotelOffering;
  },

  async update(id: string, offering: UpdateOffering): Promise<HotelOffering> {
    const { data, error } = await supabase
      .from('offerings')
      .update(offering)
      .eq('id', id)
      .select(`
        *,
        request:requests!request_id(*),
        provider:profiles!provider_user_id(*),
        hotel:hotels!hotel_id(*)
      `)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error(`Offering with id ${id} not found or cannot be updated`);
    return data as HotelOffering;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('offerings')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};