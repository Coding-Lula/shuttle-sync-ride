
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
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

// Mock users for demo purposes
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'student@example.com',
    role: 'student',
    studentType: 'community',
    startLocation: 'Dormitory A'
  },
  {
    id: '2',
    name: 'Jane Driver',
    email: 'driver@example.com',
    role: 'driver'
  },
  {
    id: '3',
    name: 'Mike Manager',
    email: 'manager@example.com',
    role: 'manager'
  },
  {
    id: '4',
    name: 'Sarah Senior',
    email: 'senior@example.com',
    role: 'senior'
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('shuttleUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('shuttleUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call with more realistic delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find user with exact email match (case-insensitive)
      const foundUser = mockUsers.find(u => 
        u.email.toLowerCase() === email.toLowerCase().trim()
      );
      
      // Check if user exists and password is correct
      if (foundUser && password.trim() === 'password') {
        setUser(foundUser);
        localStorage.setItem('shuttleUser', JSON.stringify(foundUser));
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('shuttleUser');
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
