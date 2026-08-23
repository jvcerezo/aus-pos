import React, { createContext, useContext, useState, useEffect } from 'react';
import type { VenueProfile } from '../types';

import { INITIAL_VENUES } from '../data/venues';

interface VenueContextType {
  venues: VenueProfile[];
  activeVenue: VenueProfile;
  setActiveVenueId: (id: string) => void;
  updateVenue: (venue: VenueProfile) => void;
  createVenue: (venue: VenueProfile) => void;
}

const VenueContext = createContext<VenueContextType | undefined>(undefined);

const VENUE_STORAGE_KEY = 'aus_pos_venues_v1';
const ACTIVE_VENUE_KEY = 'aus_pos_active_venue_id_v1';

export const VenueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [venues, setVenues] = useState<VenueProfile[]>(() => {
    const saved = localStorage.getItem(VENUE_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_VENUES;
  });

  const [activeVenueId, setActiveVenueIdState] = useState<string>(() => {
    return localStorage.getItem(ACTIVE_VENUE_KEY) || INITIAL_VENUES[0].id;
  });

  useEffect(() => {
    localStorage.setItem(VENUE_STORAGE_KEY, JSON.stringify(venues));
  }, [venues]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_VENUE_KEY, activeVenueId);
  }, [activeVenueId]);

  const activeVenue = venues.find(v => v.id === activeVenueId) || venues[0] || INITIAL_VENUES[0];

  const setActiveVenueId = (id: string) => {
    setActiveVenueIdState(id);
  };

  const updateVenue = (updated: VenueProfile) => {
    setVenues(prev => prev.map(v => (v.id === updated.id ? updated : v)));
  };

  const createVenue = (newVenue: VenueProfile) => {
    setVenues(prev => [...prev, newVenue]);
    setActiveVenueIdState(newVenue.id);
  };

  return (
    <VenueContext.Provider
      value={{
        venues,
        activeVenue,
        setActiveVenueId,
        updateVenue,
        createVenue,
      }}
    >
      {children}
    </VenueContext.Provider>
  );
};

export const useVenue = () => {
  const context = useContext(VenueContext);
  if (!context) {
    throw new Error('useVenue must be used within a VenueProvider');
  }
  return context;
};
