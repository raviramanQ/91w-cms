'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import api from '@/lib/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      return;
    }

    if (status === 'authenticated' && session?.user) {
      // Fetch full user data with permissions from backend
      fetchUserData(session.user.email);
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [session, status]);

  const fetchUserData = async (email) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/oauth/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        const userData = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          permissions: data.user.permissions || []
        };
        setUser(userData);
        // Set email in API client for backend authentication
        api.setUserEmail(userData.email);
      } else {
        // Fallback to session data if backend fails
        if (session?.user) {
          const userData = {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            role: session.user.role,
            permissions: []
          };
          setUser(userData);
          api.setUserEmail(userData.email);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // Fallback to session data on error
      if (session?.user) {
        const userData = {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
          permissions: []
        };
        setUser(userData);
        api.setUserEmail(userData.email);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut({ callbackUrl: '/login' });
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  const hasPermission = (module, action) => {
    if (!user || !user.permissions) return false;
    if (user.role === 'admin' || user.role === 'superadmin') return true;
    
    const modulePermission = user.permissions.find(p => p.module === module);
    if (!modulePermission) return false;
    
    return modulePermission.actions.includes(action);
  };

  const isAdmin = () => {
    return user?.role === 'admin' || user?.role === 'superadmin';
  };

  const isSuperAdmin = () => {
    return user?.role === 'superadmin';
  };

  const value = {
    user,
    loading,
    logout,
    hasPermission,
    isAdmin,
    isSuperAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
