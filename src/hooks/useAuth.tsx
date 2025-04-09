
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
          // Check if the profiles table exists first
          const { error: tableCheckError } = await supabase
            .from('profiles')
            .select('count')
            .limit(1)
            .throwOnError();
          
          if (tableCheckError) {
            console.error('Error checking profiles table:', tableCheckError);
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || 'User',
              role: (session.user.user_metadata?.role as UserRole) || 'client',
            });
            setRole((session.user.user_metadata?.role as UserRole) || 'client');
          } else {
            // Profiles table exists, fetch user profile
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (error) {
              console.error('Error fetching user profile:', error);
              // Fallback to user metadata from session
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.name || 'User',
                role: (session.user.user_metadata?.role as UserRole) || 'client',
              });
              setRole((session.user.user_metadata?.role as UserRole) || 'client');
            } else if (profile) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: profile.name || '',
                role: profile.role,
              });
              setRole(profile.role);
            }
          }
        } catch (error) {
          console.error('Session check error:', error);
          // Fallback to user metadata from session
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'User',
            role: (session.user.user_metadata?.role as UserRole) || 'client',
          });
          setRole((session.user.user_metadata?.role as UserRole) || 'client');
        }
      }
      
      setIsLoading(false);
    };
    
    checkSession();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          setIsLoading(true);

          try {
            // Check if the profiles table exists
            const { error: tableCheckError } = await supabase
              .from('profiles')
              .select('count')
              .limit(1)
              .throwOnError();

            if (tableCheckError) {
              // If table doesn't exist, use user metadata
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.name || 'User',
                role: (session.user.user_metadata?.role as UserRole) || 'client',
              });
              setRole((session.user.user_metadata?.role as UserRole) || 'client');
            } else {
              // Profiles table exists, fetch user profile
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();

              if (error) {
                console.error('Error fetching user profile:', error);
                // Fallback to user metadata
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  name: session.user.user_metadata?.name || 'User',
                  role: (session.user.user_metadata?.role as UserRole) || 'client',
                });
                setRole((session.user.user_metadata?.role as UserRole) || 'client');
              } else if (profile) {
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  name: profile.name || '',
                  role: profile.role,
                });
                setRole(profile.role);
              }
            }
          } catch (error) {
            console.error('Auth state change error:', error);
            // Fallback to metadata
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || 'User',
              role: (session.user.user_metadata?.role as UserRole) || 'client',
            });
            setRole((session.user.user_metadata?.role as UserRole) || 'client');
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
      
      // User metadata will be accessed through the auth state change handler
      toast({
        title: "Login successful",
        description: `Welcome back!`,
      });
      
      navigate('/dashboard');
    } catch (error: any) {
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
      // Sign up the user with emailRedirectTo to skip confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: userRole,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        }
      });
      
      if (error) throw error;
      
      if (!data.user) {
        throw new Error('Failed to create user account');
      }
      
      try {
        // Check if profiles table exists before trying to insert
        const { error: tableCheckError } = await supabase
          .from('profiles')
          .select('count')
          .limit(1)
          .throwOnError();
          
        if (!tableCheckError) {
          // If table exists, create the profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ 
              id: data.user.id, 
              name,
              email, 
              role: userRole,
              created_at: new Date() 
            }]);
          
          if (profileError) {
            console.error('Error creating profile:', profileError);
            // Continue without throwing error - we'll use the auth metadata instead
          }
        }
      } catch (profileErr) {
        console.error('Profile creation error:', profileErr);
        // Continue without throwing error - we'll use the auth metadata instead
      }
      
      toast({
        title: "Account created successfully",
        description: "You can now log in with your new account.",
      });
      
      // Auto login the user after successful signup
      await login(email, password);
      
    } catch (error: any) {
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
