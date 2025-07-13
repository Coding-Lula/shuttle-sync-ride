import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client'; // adjust path as needed

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
    // Load initial session
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUser(profile);
          localStorage.setItem('shuttleUser', JSON.stringify(profile));
        }
      }
      setIsLoading(false);
    };

    loadUser();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('shuttleUser');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

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
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        setUser(profile);
        localStorage.setItem('shuttleUser', JSON.stringify(profile));
      }
    }

    setIsLoading(false);
    return true;
  };

  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('shuttleUser');
    setIsLoading(false);
  };

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