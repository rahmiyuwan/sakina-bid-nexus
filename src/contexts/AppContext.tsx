import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { HotelRequest, HotelOffering, UserRole, OfferingStatus, RequestStatus, UserProfile } from '@/types';

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
  
  // Actions
  addRequest: (request: Omit<HotelRequest, 'id' | 'createdAt'>) => Promise<HotelRequest>;
  addOffering: (offering: Omit<HotelOffering, 'id' | 'createdAt' | 'finalPriceDb' | 'finalPriceTp' | 'finalPriceQd' | 'finalPriceQt'>) => void;
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
  const [requests, setRequests] = useState<HotelRequest[]>([]);
  const [offerings, setOfferings] = useState<HotelOffering[]>([]);

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

  const addOffering = (offeringData: Omit<HotelOffering, 'id' | 'createdAt' | 'finalPriceDb' | 'finalPriceTp' | 'finalPriceQd' | 'finalPriceQt'>) => {
    const newOffering: HotelOffering = {
      ...offeringData,
      id: generateId(),
      finalPriceDb: offeringData.priceDb + offeringData.adminMargin,
      finalPriceTp: offeringData.priceTp + offeringData.adminMargin,
      finalPriceQd: offeringData.priceQd + offeringData.adminMargin,
      finalPriceQt: offeringData.priceQt + offeringData.adminMargin,
      createdAt: new Date().toISOString(),
    };
    setOfferings(prev => [...prev, newOffering]);
  };

  const confirmOffering = (offeringId: string, requestId: string) => {
    // Update selected offering to CONFIRMED
    setOfferings(prev => prev.map(offering => 
      offering.id === offeringId 
        ? { ...offering, status: 'CONFIRMED' as OfferingStatus }
        : offering.requestId === requestId 
          ? { ...offering, status: 'CANCELED' as OfferingStatus }
          : offering
    ));

    // Update request status to CONFIRMED
    setRequests(prev => prev.map(request => 
      request.id === requestId 
        ? { ...request, status: 'CONFIRMED' as const }
        : request
    ));
  };

  const updateOfferingMargin = (offeringId: string, margin: number) => {
    setOfferings(prev => prev.map(offering => 
      offering.id === offeringId 
        ? { 
            ...offering, 
            adminMargin: margin,
            finalPriceDb: offering.priceDb + margin,
            finalPriceTp: offering.priceTp + margin,
            finalPriceQd: offering.priceQd + margin,
            finalPriceQt: offering.priceQt + margin,
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