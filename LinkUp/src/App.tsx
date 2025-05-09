
/**
 * LinkUp Main Application Component
 * 
 * This is the root component of the LinkUp application, which:
 * - Sets up global providers (QueryClient, Auth, App context)
 * - Configures routing with protected routes
 * - Manages offline state and native platform detection
 */
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import PersonalCalendar from "./pages/PersonalCalendar";
import Groups from "./pages/Groups";
import GroupCalendar from "./pages/GroupCalendar";
import Friends from "./pages/Friends";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { AppProvider } from "./context/AppContext";
import { useAuth } from "./hooks/useAuth";
import { useEffect } from "react";
import { useOffline } from "./hooks/use-offline";
import { usePlatform } from "./hooks/use-platform";
import { toast } from "sonner";

/**
 * Configure the React Query client with default options
 * - Cache time and stale time configuration
 * - Network error handling for offline state
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60, // Data considered fresh for 1 hour
      gcTime: 1000 * 60 * 60 * 24, // Keep unused data in cache for 24 hours
      retry: (failureCount, error: any) => {
        // Don't retry on network errors or when offline
        if (error?.message?.includes('Network') || !navigator.onLine) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      }
    }
  }
});

/**
 * Main application content component
 * Handles platform detection and offline state
 */
const AppContent = () => {
  const { isOnline } = useOffline();
  const { isNative, platform } = usePlatform();
  
  useEffect(() => {
    // Apply platform-specific CSS classes for styling
    if (isNative) {
      document.documentElement.classList.add('native-app');
      document.documentElement.classList.add(`platform-${platform}`);
      
      // Handle iOS safe areas
      if (platform === 'ios') {
        document.documentElement.style.setProperty('--safe-area-inset-top', '0px');
        document.documentElement.style.setProperty('--safe-area-inset-bottom', '0px');
      }
    }
    
    // Show warning when offline
    if (!isOnline) {
      toast.warning("You're offline. Some features may be limited.");
    }
  }, [isNative, platform, isOnline]);
  
  return (
    <AuthProvider>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <PrivateRoute>
                    <PersonalCalendar />
                  </PrivateRoute>
                }
              />
              <Route
                path="/groups"
                element={
                  <PrivateRoute>
                    <Groups />
                  </PrivateRoute>
                }
              />
              <Route
                path="/friends"
                element={
                  <PrivateRoute>
                    <Friends />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/group/:groupId"
                element={
                  <PrivateRoute>
                    <GroupCalendar />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </AuthProvider>
  );
};

/**
 * Private Route component
 * Ensures routes are only accessible to authenticated users
 * Redirects to auth page if not authenticated
 * 
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Child components
 */
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  
  if (!session) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

/**
 * Main App component
 * Wraps the entire application with necessary providers
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppContent />
  </QueryClientProvider>
);

export default App;
