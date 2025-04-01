
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

// Define types for our user and auth context
export type UserRole = 'admin' | 'lawyer' | 'judge' | 'client';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Mock user data - in a real app this would come from an API
const MOCK_USERS = [
  { id: '1', email: 'admin@example.com', password: 'password', name: 'Admin User', role: 'admin' as UserRole },
  { id: '2', email: 'lawyer@example.com', password: 'password', name: 'Jane Lawyer', role: 'lawyer' as UserRole },
  { id: '3', email: 'judge@example.com', password: 'password', name: 'Judge Smith', role: 'judge' as UserRole },
  { id: '4', email: 'client@example.com', password: 'password', name: 'Client Johnson', role: 'client' as UserRole },
];

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for existing auth on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('ccms-user');
    const storedRole = localStorage.getItem('ccms-role');
    
    if (storedUser && storedRole) {
      setUser(JSON.parse(storedUser));
      setRole(storedRole as UserRole);
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const foundUser = MOCK_USERS.find(
        u => u.email === email && u.password === password
      );
      
      if (!foundUser) {
        throw new Error('Invalid credentials');
      }
      
      const { password: _, ...userWithoutPassword } = foundUser;
      
      setUser({
        id: userWithoutPassword.id,
        name: userWithoutPassword.name,
        email: userWithoutPassword.email,
      });
      setRole(userWithoutPassword.role);
      
      // Store auth in localStorage
      localStorage.setItem('ccms-user', JSON.stringify({
        id: userWithoutPassword.id,
        name: userWithoutPassword.name,
        email: userWithoutPassword.email,
      }));
      localStorage.setItem('ccms-role', userWithoutPassword.role);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userWithoutPassword.name}!`,
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('ccms-user');
    localStorage.removeItem('ccms-role');
    navigate('/login');
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const value = {
    user,
    role,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook for easy context use
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
