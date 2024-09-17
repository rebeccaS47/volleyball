import { useContext } from 'react';
import { CityCourtContext, CityCourtContextType } from './CityCourtContext';

export const useCityCourtContext = (): CityCourtContextType => {
  const context = useContext(CityCourtContext);
  if (context === undefined) {
    throw new Error('useCityCourtContext must be used within a CityCourtProvider');
  }
  return context;
};