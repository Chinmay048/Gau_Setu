import { useState, useCallback } from 'react';

export const useRFIDScanner = () => {
  const [scannedRFID, setScannedRFID] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const startScanning = useCallback(() => {
    setIsScanning(true);
    setScannedRFID('');
  }, []);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
  }, []);

  const simulateScan = useCallback((rfidValue) => {
    setScannedRFID(rfidValue);
    setIsScanning(false);
  }, []);

  return {
    scannedRFID,
    isScanning,
    startScanning,
    stopScanning,
    simulateScan,
  };
};
