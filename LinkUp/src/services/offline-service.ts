
import { toast } from 'sonner';

/**
 * Service to manage offline functionality and state for LinkUp
 * 
 * Provides methods for detecting online/offline status,
 * storing data for offline use, and notifying components about connectivity changes
 */
class OfflineService {
  private isOnline: boolean = navigator.onLine;
  private offlineListeners: Array<(isOnline: boolean) => void> = [];
  
  constructor() {
    this.setupListeners();
  }
  
  private setupListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      toast.success('You are back online');
      this.notifyListeners();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      toast.error('You are offline. Some features may be limited');
      this.notifyListeners();
    });
  }
  
  public getIsOnline(): boolean {
    return this.isOnline;
  }
  
  public addOfflineListener(listener: (isOnline: boolean) => void) {
    this.offlineListeners.push(listener);
    return () => {
      this.offlineListeners = this.offlineListeners.filter(l => l !== listener);
    };
  }
  
  private notifyListeners() {
    this.offlineListeners.forEach(listener => listener(this.isOnline));
  }
  
  /**
   * Store data for offline use
   */
  public storeOfflineData(key: string, data: any): void {
    try {
      localStorage.setItem(`offline_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to store offline data:', error);
    }
  }
  
  /**
   * Retrieve offline data
   */
  public getOfflineData<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(`offline_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to retrieve offline data:', error);
      return null;
    }
  }
}

// Create a singleton instance
export const offlineService = new OfflineService();
