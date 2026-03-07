import { useContext } from 'react';
import { CowContext } from '../context/CowContext';

export const useCow = () => {
  const context = useContext(CowContext);
  if (!context) {
    throw new Error('useCow must be used within CowProvider');
  }
  return context;
};
