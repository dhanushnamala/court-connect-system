
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

// Define types for our user and auth context
export type UserRole = 'admin' | 'lawyer' | 'judge' | 'client';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for existing auth session on mount
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      
      // Get session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        try {
          // Set basic user info from session
          const userRole = (session.user.user_metadata?.role as UserRole) || 'client';
          
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'User',
            role: userRole,
          });
          setRole(userRole);
          
          // Get profile data from database as a backup
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role, name')
            .eq('id', session.user.id)
            .single();
            
          if (profileData) {
            // Update with profile data if available
            setUser(prev => prev ? {
              ...prev,
              name: profileData.name || prev.name,
              role: profileData.role as UserRole || prev.role
            } : null);
            setRole(profileData.role as UserRole || userRole);
          }
        } catch (error) {
          console.error('Session check error:', error);
        }
      }
      
      setIsLoading(false);
    };
    
    checkSession();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          const userRole = (session.user.user_metadata?.role as UserRole) || 'client';
          
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'User',
            role: userRole,
          });
          setRole(userRole);
          
          // Check for profile data in a setTimeout to avoid potential Supabase deadlocks
          if (session.user.id) {
            setTimeout(async () => {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('role, name')
                .eq('id', session.user.id)
                .single();
                
              if (profileData) {
                setUser(prev => prev ? {
                  ...prev,
                  name: profileData.name || prev.name,
                  role: profileData.role as UserRole || prev.role
                } : null);
                setRole(profileData.role as UserRole || userRole);
              }
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setRole(null);
        }
        setIsLoading(false);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast({
        title: "Login successful",
        description: `Welcome back!`,
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "An unknown error occurred",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const signup = async (email: string, password: string, name: string, userRole: UserRole = 'client') => {
    setIsLoading(true);
    
    try {
      console.log(`Attempting to sign up user with role: ${userRole}`);
      
      // Check for existing email to provide a better error message
      const { data: existingUserData, error: existingUserError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();
        
      if (existingUserData) {
        throw new Error("An account with this email already exists");
      }
      
      if (existingUserError && existingUserError.code !== 'PGRST116') {
        console.error("Error checking existing user:", existingUserError);
      }
      
      // Try to sign up the user with clearer metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name.trim(),
            role: userRole,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        }
      });
      
      if (error) {
        console.error("Signup error from auth:", error);
        
        // Handle duplicate email error more specifically
        if (error.message.includes("email already registered")) {
          throw new Error("An account with this email already exists");
        }
        
        throw error;
      }
      
      if (!data.user) {
        throw new Error('Failed to create user account');
      }

      console.log("Auth user created successfully with ID:", data.user.id);
      
      // The database trigger function will handle creating the profile and role-specific records
      
      // Auto sign in after signup
      console.log("Attempting to auto sign in user after signup");
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        console.error("Auto sign-in error:", signInError);
        throw new Error('Account created, but failed to automatically sign in. Please go to login page.');
      }
      
      console.log("Sign in successful, navigating to dashboard");
      
      toast({
        title: "Account created successfully",
        description: "You can now use your new account.",
      });
      
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message || "An unknown error occurred",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
      navigate('/login');
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: error.message || "An unknown error occurred",
      });
    }
  };

  const value = {
    user,
    role,
    login,
    signup,
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
