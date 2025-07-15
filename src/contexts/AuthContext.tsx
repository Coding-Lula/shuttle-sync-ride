
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  name?: string;
  email: string;
  role: 'student' | 'driver' | 'manager' | 'senior';
  studentType?: 'community' | 'yoyl';
  startLocation?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (session?.user) {
          // Fetch user profile when we have a session
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            console.log('Setting user from auth state change:', profile);
            setUser(profile);
            localStorage.setItem('shuttleUser', JSON.stringify(profile));
          }
        } else {
          console.log('Clearing user from auth state change');
          setUser(null);
          localStorage.removeItem('shuttleUser');
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session?.user?.id);
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            console.log('Setting user from initial session:', profile);
            setUser(profile);
            localStorage.setItem('shuttleUser', JSON.stringify(profile));
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Login attempt for:', email);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        setIsLoading(false);
        return false;
      }

      if (data.user) {
        console.log('Login successful for user:', data.user.id);
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          console.log('Profile fetched after login:', profile);
          setUser(profile);
          localStorage.setItem('shuttleUser', JSON.stringify(profile));
        }
      }

      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Unexpected login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    console.log('Logout initiated');
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('shuttleUser');
    setIsLoading(false);
  };

  console.log('Auth context state - user:', user?.email, 'isLoading:', isLoading);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
