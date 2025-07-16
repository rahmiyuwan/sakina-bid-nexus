export type UserRole = 'TRAVEL' | 'PROVIDER' | 'ADMIN';

export type RequestStatus = 'PENDING' | 'BIDDING' | 'CONFIRMED' | 'CANCELED';
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
}

export interface HotelOffering {
  id: string;
  requestId: string;
  hotelName: string;
  providerUserId: string;
  priceDb: number;
  priceTp: number;
  priceQd: number;
  priceQt: number;
  adminMargin: number;
  finalPriceDb: number;
  finalPriceTp: number;
  finalPriceQd: number;
  finalPriceQt: number;
  status: OfferingStatus;
  createdAt: string;
}

export interface DashboardStats {
  totalRequests: number;
  activeOfferings: number;
  confirmedDeals: number;
  totalRevenue: number;
}