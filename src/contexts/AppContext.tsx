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
  addRequest: (request: Omit<HotelRequest, 'id' | 'createdAt'>) => void;
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

  const addRequest = (requestData: Omit<HotelRequest, 'id' | 'createdAt'>) => {
    const newRequest: HotelRequest = {
      ...requestData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setRequests(prev => [...prev, newRequest]);
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