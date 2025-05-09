
/**
 * Authentication Hook and Provider
 * 
 * This module provides authentication functionality for LinkUp, handling:
 * - User session management
 * - Authentication state changes
 * - Sign out functionality
 * 
 * The AuthProvider component wraps the application to provide authentication context,
 * while the useAuth hook allows components to access authentication state.
 */
import { useEffect, useState, createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

/**
 * Authentication Context Type Definition
 * Defines the shape of the authentication context object
 */
interface AuthContextType {
  session: Session | null;  // Current user session
  user: User | null;        // Current authenticated user
  signOut: () => Promise<void>; // Function to sign out the user
}

// Create the authentication context with default values
const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  signOut: async () => {},
});

/**
 * Authentication Provider Component
 * 
 * Wraps the application to provide authentication state and functionality to all children
 * Handles initial session loading and subscribes to auth state changes
 * 
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial session when component mounts
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Subscribe to authentication state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Unsubscribe when component unmounts to prevent memory leaks
    return () => subscription.unsubscribe();
  }, []);

  /**
   * Signs out the current user
   * Clears the session and user state
   */
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Authentication Hook
 * 
 * Provides access to authentication state and functionality
 * Must be used within an AuthProvider component
 * 
 * @returns {AuthContextType} Authentication context object
 * @throws {Error} If used outside of an AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
