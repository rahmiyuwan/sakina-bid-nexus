export type UserRole = 'travel_agent' | 'hotel_provider' | 'admin' | 'super_admin';
export type CityType = 'Makkah' | 'Madinah';
export type PackageType = 'PROMO' | 'VIP' | 'REGULAR';
export type RequestStatus = 'Submitted' | 'Quoted' | 'Confirmed';
export type ValueType = 'decimal' | 'integer' | 'string' | 'boolean' | 'json';

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  workspace_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  workspace?: Workspace;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  value_type: ValueType;
  description?: string;
  category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Request {
  id: string;
  request_number: number;
  travel_workspace_id: string;
  travel_name: string;
  pax: number;
  tour_leader: string;
  city: CityType;
  package_type: PackageType;
  check_in_date: string;
  check_out_date: string;
  room_double: number;
  room_triple: number;
  room_quad: number;
  room_quint: number;
  status: RequestStatus;
  bidding_deadline: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  workspace?: Workspace;
}

export interface Hotel {
  id: string;
  name: string;
  city: CityType;
  address?: string;
  rating?: number;
  facilities?: any;
  distance_to_haram?: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Commission {
  id: string;
  request_id: string;
  admin_id: string;
  commission_double?: number;
  commission_triple?: number;
  commission_quad?: number;
  commission_quint?: number;
  created_at: string;
  updated_at: string;
  request?: Request;
  admin?: User;
}

export type CreateWorkspace = Omit<Workspace, 'id' | 'created_at' | 'updated_at'>;
export type UpdateWorkspace = Partial<CreateWorkspace>;

export type CreateUser = Omit<User, 'id' | 'created_at' | 'updated_at' | 'workspace'>;
export type UpdateUser = Partial<Omit<CreateUser, 'password'>>;

export type CreateSetting = Omit<Setting, 'id' | 'created_at' | 'updated_at'>;
export type UpdateSetting = Partial<CreateSetting>;

export type CreateRequest = Omit<Request, 'id' | 'request_number' | 'created_at' | 'updated_at' | 'workspace'>;
export type UpdateRequest = Partial<CreateRequest>;

export type CreateHotel = Omit<Hotel, 'id' | 'created_at' | 'updated_at'>;
export type UpdateHotel = Partial<CreateHotel>;

export type CreateCommission = Omit<Commission, 'id' | 'created_at' | 'updated_at' | 'request' | 'admin'>;
export type UpdateCommission = Partial<CreateCommission>;