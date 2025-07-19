export type UserRole = 'travel_agent' | 'hotel_provider' | 'admin' | 'super_admin';

export interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: UserRole;
  workspace_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type RequestStatus = 'Submitted' | 'Quoted' | 'Confirmed';
export type OfferingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface HotelRequest {
  id: string;
  travelName: string;
  tlName: string;
  paxCount: number;
  city: string;
  packageType: string;
  checkIn: string;
  checkOut: string;
  roomDb: number; // Double rooms
  roomTp: number; // Triple rooms
  roomQd: number; // Quad rooms
  roomQt: number; // Quint rooms
  status: RequestStatus;
  travelUserId: string;
  createdAt: string;
  workspace?: {
    id: string;
    name: string;
    description?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
}

export interface HotelOffering {
  id: string;
  request_id: string;
  provider_user_id: string;
  hotel_id: string;
  hotel_name: string;
  price_double: number;
  price_triple: number;
  price_quad: number;
  price_quint: number;
  admin_margin: number;
  final_price_double: number;
  final_price_triple: number;
  final_price_quad: number;
  final_price_quint: number;
  status: OfferingStatus;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalRequests: number;
  activeOfferings: number;
  confirmedDeals: number;
  totalRevenue: number;
}