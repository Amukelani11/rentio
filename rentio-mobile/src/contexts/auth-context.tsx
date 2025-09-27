import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const { data: userData, error } = await supabase
            .from('users')
            .select(`
              *,
              user_roles (
                role
              )
            `)
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('Error fetching user data:', error);
            setLoading(false);
            return;
          }

          const roles = userData.user_roles?.map((ur: any) => ur.role as Role) || [];
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            phone: userData.phone,
            avatar: userData.avatar,
            bio: userData.bio,
            status: userData.status,
            kycStatus: userData.kyc_status,
            emailVerified: userData.email_verified,
            phoneVerified: userData.phone_verified,
            isBlocked: userData.is_blocked,
            createdAt: userData.created_at,
            updatedAt: userData.updated_at,
            roles,
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: userData, error } = await supabase
            .from('users')
            .select(`
              *,
              user_roles (
                role
              )
            `)
            .eq('id', session.user.id)
            .single();

          if (!error && userData) {
            const roles = userData.user_roles?.map((ur: any) => ur.role as Role) || [];
            setUser({
              id: userData.id,
              email: userData.email,
              name: userData.name,
              phone: userData.phone,
              avatar: userData.avatar,
              bio: userData.bio,
              status: userData.status,
              kycStatus: userData.kyc_status,
              emailVerified: userData.email_verified,
              phoneVerified: userData.phone_verified,
              isBlocked: userData.is_blocked,
              createdAt: userData.created_at,
              updatedAt: userData.updated_at,
              roles,
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (!error && data.user) {
      // Create user record in database
      const { error: userError } = await supabase.from('users').insert({
        id: data.user.id,
        email: data.user.email!,
        name: name || data.user.email?.split('@')[0] || 'User',
      });

      if (userError) {
        console.error('Error creating user record:', userError);
      }
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const { data: userData, error } = await supabase
        .from('users')
        .select(`
          *,
          user_roles (
            role
          )
        `)
        .eq('id', session.user.id)
        .single();

      if (!error && userData) {
        const roles = userData.user_roles?.map((ur: any) => ur.role as Role) || [];
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          avatar: userData.avatar,
          bio: userData.bio,
          status: userData.status,
          kycStatus: userData.kyc_status,
          emailVerified: userData.email_verified,
          phoneVerified: userData.phone_verified,
          isBlocked: userData.is_blocked,
          createdAt: userData.created_at,
          updatedAt: userData.updated_at,
          roles,
        });
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};