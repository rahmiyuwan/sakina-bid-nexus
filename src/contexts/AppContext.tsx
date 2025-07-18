import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { HotelRequest, HotelOffering, UserRole, OfferingStatus, RequestStatus, UserProfile } from '@/types';
import type { Hotel, Setting, Workspace } from '@/types/database';

interface AppContextType {
  // Auth state
  currentUser: User | null;
  currentProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  
  // Auth actions
  signOut: () => Promise<void>;
  
  // Data state
  requests: HotelRequest[];
  offerings: HotelOffering[];
  hotels: Hotel[];
  settings: Setting[];
  workspaces: Workspace[];
  users: UserProfile[];
  commissions: any[];
  
  // Loading states
  dataLoading: boolean;
  
  // Data fetching actions
  refreshRequests: () => Promise<void>;
  refreshOfferings: () => Promise<void>;
  refreshHotels: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  refreshCommissions: () => Promise<void>;
  
  // Actions
  addRequest: (request: Omit<HotelRequest, 'id' | 'createdAt'>) => Promise<HotelRequest>;
  addOffering: (offering: Omit<HotelOffering, 'id' | 'created_at' | 'updated_at' | 'final_price_double' | 'final_price_triple' | 'final_price_quad' | 'final_price_quint'>) => Promise<HotelOffering>;
  confirmOffering: (offeringId: string, requestId: string) => void;
  updateOfferingMargin: (offeringId: string, margin: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [requests, setRequests] = useState<HotelRequest[]>([]);
  const [offerings, setOfferings] = useState<HotelOffering[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);

  // Auth effect
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setCurrentUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              setCurrentProfile(profile);
            } catch (error) {
              console.error('Error fetching profile:', error);
            }
          }, 0);
        } else {
          setCurrentProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCurrentUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch user profile
        setTimeout(async () => {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            setCurrentProfile(profile);
          } catch (error) {
            console.error('Error fetching profile:', error);
          }
          setLoading(false);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addRequest = async (requestData: Omit<HotelRequest, 'id' | 'createdAt'>) => {
    try {
      // Save to database using requestService
      const { requestService } = await import('@/services/requestService');
      const dbRequest = await requestService.create({
        travel_name: requestData.travelName,
        tour_leader: requestData.tlName,
        pax: requestData.paxCount,
        city: requestData.city as 'Makkah' | 'Madinah',
        package_type: requestData.packageType as 'PROMO' | 'VIP' | 'REGULAR',
        check_in_date: requestData.checkIn,
        check_out_date: requestData.checkOut,
        room_double: requestData.roomDb,
        room_triple: requestData.roomTp,
        room_quad: requestData.roomQd,
        room_quint: requestData.roomQt,
        travel_workspace_id: currentProfile?.workspace_id || '',
         status: 'Submitted' as const,
        bidding_deadline: new Date(new Date(requestData.checkIn).getTime() - 24 * 60 * 60 * 1000).toISOString(),
      });

      // Convert database format to app format and add to local state
      const newRequest: HotelRequest = {
        id: dbRequest.id,
        travelName: dbRequest.travel_name,
        tlName: dbRequest.tour_leader,
        paxCount: dbRequest.pax,
        city: dbRequest.city,
        packageType: dbRequest.package_type,
        checkIn: dbRequest.check_in_date,
        checkOut: dbRequest.check_out_date,
        roomDb: dbRequest.room_double,
        roomTp: dbRequest.room_triple,
        roomQd: dbRequest.room_quad,
        roomQt: dbRequest.room_quint,
        status: dbRequest.status as RequestStatus,
        travelUserId: dbRequest.travel_workspace_id,
        createdAt: dbRequest.created_at,
      };
      setRequests(prev => [...prev, newRequest]);
      return newRequest;
    } catch (error) {
      console.error('Error creating request:', error);
      throw error;
    }
  };

  // Data fetching functions
  const refreshRequests = async () => {
    try {
      setDataLoading(true);
      const { requestService } = await import('@/services/requestService');
      const dbRequests = await requestService.getAll();
      
      // Convert database format to app format
      const formattedRequests: HotelRequest[] = dbRequests.map(req => ({
        id: req.id,
        travelName: req.travel_name,
        tlName: req.tour_leader,
        paxCount: req.pax,
        city: req.city,
        packageType: req.package_type,
        checkIn: req.check_in_date,
        checkOut: req.check_out_date,
        roomDb: req.room_double,
        roomTp: req.room_triple,
        roomQd: req.room_quad,
        roomQt: req.room_quint,
        status: req.status as RequestStatus,
        travelUserId: req.travel_workspace_id,
        createdAt: req.created_at,
      }));
      
      setRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const refreshHotels = async () => {
    try {
      const { hotelService } = await import('@/services/hotelService');
      const hotels = await hotelService.getAll();
      setHotels(hotels);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    }
  };

  const refreshSettings = async () => {
    try {
      const { settingService } = await import('@/services/settingService');
      const settings = await settingService.getAll();
      setSettings(settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const refreshWorkspaces = async () => {
    try {
      const { workspaceService } = await import('@/services/workspaceService');
      const workspaces = await workspaceService.getAll();
      setWorkspaces(workspaces);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    }
  };

  const refreshUsers = async () => {
    try {
      const { userService } = await import('@/services/userService');
      const profiles = await userService.getAll();
      
      // Convert to UserProfile format
      const formattedUsers: UserProfile[] = profiles.map(profile => ({
        id: profile.id,
        username: profile.username,
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        role: profile.role,
        workspace_id: profile.workspace_id,
        is_active: profile.is_active,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      }));
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const refreshCommissions = async () => {
    try {
      const { commissionService } = await import('@/services/commissionService');
      const commissions = await commissionService.getAll();
      setCommissions(commissions);
    } catch (error) {
      console.error('Error fetching commissions:', error);
    }
  };

  // Load initial data when user is authenticated
  useEffect(() => {
    if (currentProfile && !loading) {
      refreshRequests();
      refreshOfferings();
      refreshHotels();
      refreshSettings();
      refreshWorkspaces();
      refreshUsers();
      refreshCommissions();
    }
  }, [currentProfile, loading]);

  const refreshOfferings = async () => {
    try {
      const { offeringService } = await import('@/services/offeringService');
      const offerings = await offeringService.getAll();
      setOfferings(offerings);
    } catch (error) {
      console.error('Error fetching offerings:', error);
    }
  };

  const addOffering = async (offeringData: Omit<HotelOffering, 'id' | 'created_at' | 'final_price_double' | 'final_price_triple' | 'final_price_quad' | 'final_price_quint' | 'updated_at'>) => {
    try {
      const { offeringService } = await import('@/services/offeringService');
      const createOffering = {
        request_id: offeringData.request_id,
        provider_user_id: offeringData.provider_user_id,
        hotel_id: offeringData.hotel_id,
        hotel_name: offeringData.hotel_name,
        price_double: offeringData.price_double,
        price_triple: offeringData.price_triple,
        price_quad: offeringData.price_quad,
        price_quint: offeringData.price_quint,
        admin_margin: offeringData.admin_margin,
      };
      
      const newOffering = await offeringService.create(createOffering);
      setOfferings(prev => [...prev, newOffering]);
      return newOffering;
    } catch (error) {
      console.error('Error creating offering:', error);
      throw error;
    }
  };

  const confirmOffering = async (offeringId: string, requestId: string) => {
    try {
      const { offeringService } = await import('@/services/offeringService');
      
      // Update selected offering to CONFIRMED
      await offeringService.update(offeringId, { status: 'CONFIRMED' });
      
      // Cancel other offerings for the same request
      const otherOfferings = offerings.filter(o => o.request_id === requestId && o.id !== offeringId);
      await Promise.all(
        otherOfferings.map(offering => 
          offeringService.update(offering.id, { status: 'CANCELED' })
        )
      );

      // Update local state
      setOfferings(prev => prev.map(offering => 
        offering.id === offeringId 
          ? { ...offering, status: 'CONFIRMED' as OfferingStatus }
          : offering.request_id === requestId 
            ? { ...offering, status: 'CANCELED' as OfferingStatus }
            : offering
      ));

      // Update request status to CONFIRMED
      setRequests(prev => prev.map(request => 
        request.id === requestId 
          ? { ...request, status: 'Confirmed' as const }
          : request
      ));
    } catch (error) {
      console.error('Error confirming offering:', error);
      throw error;
    }
  };

  const updateOfferingMargin = (offeringId: string, margin: number) => {
    setOfferings(prev => prev.map(offering => 
      offering.id === offeringId 
        ? { 
            ...offering, 
            admin_margin: margin,
            final_price_double: offering.price_double * (1 + margin / 100),
            final_price_triple: offering.price_triple * (1 + margin / 100),
            final_price_quad: offering.price_quad * (1 + margin / 100),
            final_price_quint: offering.price_quint * (1 + margin / 100),
          }
        : offering
    ));
  };

  const value: AppContextType = {
    currentUser,
    currentProfile,
    session,
    loading,
    signOut,
    requests,
    offerings,
    hotels,
    settings,
    workspaces,
    users,
    commissions,
    dataLoading,
    refreshRequests,
    refreshOfferings,
    refreshHotels,
    refreshSettings,
    refreshWorkspaces,
    refreshUsers,
    refreshCommissions,
    addRequest,
    addOffering,
    confirmOffering,
    updateOfferingMargin,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};