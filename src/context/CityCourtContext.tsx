import React, { createContext, useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Court } from '../types';

export interface CityCourtContextType {
  courts: Court[];
  cities: string[];
  loading: boolean;
  error: string | null;
  getCityCourtList: () => Promise<void>;
}

export const CityCourtContext = createContext<CityCourtContextType | undefined>(undefined);

export const CityCourtProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courts, setCourts] = useState<Court[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCityCourtList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const courtCollectionRef = collection(db, 'courts');
      const data = await getDocs(courtCollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Court[];
      setCourts(filteredData);

      const citySet = new Set<string>();
      filteredData.forEach((court) => {
        citySet.add(court.city);
      });
      setCities(Array.from(citySet));
    } catch (error) {
      console.error('Error fetching court list:', error);
      setError('Failed to fetch court list');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getCityCourtList();
  }, [getCityCourtList]);

  return (
    <CityCourtContext.Provider value={{ courts, cities, loading, error, getCityCourtList }}>
      {children}
    </CityCourtContext.Provider>
  );
};
