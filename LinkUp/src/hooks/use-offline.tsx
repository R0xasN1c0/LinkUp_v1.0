
import { useState, useEffect } from 'react';
import { offlineService } from '@/services/offline-service';

export function useOffline() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  
  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);
    
    // Subscribe to changes
    const unsubscribe = offlineService.addOfflineListener((online) => {
      setIsOnline(online);
    });
    
    return unsubscribe;
  }, []);
  
  const storeDataForOffline = (key: string, data: any) => {
    offlineService.storeOfflineData(key, data);
  };
  
  const getOfflineData = <T,>(key: string): T | null => {
    return offlineService.getOfflineData<T>(key);
  };
  
  return {
    isOnline,
    storeDataForOffline,
    getOfflineData
  };
}
