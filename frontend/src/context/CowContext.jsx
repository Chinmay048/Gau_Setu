import React, { createContext, useState, useCallback } from 'react';
import { cowAPI } from '../services/apiService';

export const CowContext = createContext();

export const CowProvider = ({ children }) => {
  const [cows, setCows] = useState([]);
  const [currentCow, setCurrentCow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMyCows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await cowAPI.getMyCows();
      setCows(response.data.cows);
      return response.data.cows;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch cows';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerCow = useCallback(async (data, type = 'newborn') => {
    setLoading(true);
    setError(null);
    try {
      const response = type === 'newborn'
        ? await cowAPI.registerNewborn(data)
        : await cowAPI.registerPurchased(data);

      setCows([...cows, response.data.cow]);
      return response.data.cow;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to register cow';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cows]);

  const getCowDetail = useCallback(async (cowId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await cowAPI.getCowDetail(cowId);
      setCurrentCow(response.data.cow);
      return response.data.cow;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch cow details';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    cows,
    currentCow,
    loading,
    error,
    fetchMyCows,
    registerCow,
    getCowDetail,
  };

  return <CowContext.Provider value={value}>{children}</CowContext.Provider>;
};
