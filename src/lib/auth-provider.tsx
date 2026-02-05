/**
 * Auth Provider
 *
 * React context for managing authentication state throughout the app.
 */

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import {
  getSession,
  signInWithPassword as apiSignIn,
  signOut as apiSignOut,
  onAuthStateChange,
} from '@/api/auth';

/**
 * Auth context state shape.
 */
interface AuthContextType {
  /** Current user, null if not authenticated */
  user: User | null;
  /** Current session, null if not authenticated */
  session: Session | null;
  /** Whether auth state is being loaded */
  loading: boolean;
  /** Sign in with email and password */
  signIn: (email: string, password: string) => Promise<void>;
  /** Sign out current user */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Auth provider props.
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth provider component.
 *
 * Wraps the app to provide authentication state and methods.
 *
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentSession = await getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth changes
    const unsubscribe = onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const newSession = await apiSignIn(email, password);
    setSession(newSession);
    setUser(newSession.user);
  }, []);

  const signOut = useCallback(async () => {
    await apiSignOut();
    setSession(null);
    setUser(null);
  }, []);

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context.
 *
 * @returns Auth context value
 * @throws If used outside of AuthProvider
 *
 * @example
 * const { user, signIn, signOut } = useAuth();
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
