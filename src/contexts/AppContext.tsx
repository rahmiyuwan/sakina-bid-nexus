import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types/database';
import { HotelRequest, HotelOffering, UserRole, OfferingStatus, RequestStatus } from '@/types';

interface AppContextType {
  // User management
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  
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
  const [requests, setRequests] = useState<HotelRequest[]>([]);
  const [offerings, setOfferings] = useState<HotelOffering[]>([]);

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
    setCurrentUser,
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