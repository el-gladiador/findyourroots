'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export type UserRole = 'admin' | 'user' | 'guest';

interface AuthUser {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  isGuest: boolean;
}

interface AuthContextType {
  user: User | null;
  authUser: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const googleProvider = new GoogleAuthProvider();

// Your admin email - replace with your actual email
const ADMIN_EMAIL = 'mohammadamiri.py@gmail.com'; // Replace with your email

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Create AuthUser object for authenticated users
        const role: UserRole = user.email === ADMIN_EMAIL ? 'admin' : 'user';
        setAuthUser({
          uid: user.uid,
          email: user.email || '',
          name: user.displayName || '',
          role,
          isGuest: false,
        });
      } else {
        setAuthUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setAuthUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const continueAsGuest = () => {
    // Sign out of Firebase auth first to ensure no token is attached to requests
    if (auth.currentUser) {
      firebaseSignOut(auth).catch(error => {
        console.error('Error signing out before guest mode:', error);
      });
    }
    
    // Set local guest state
    setAuthUser({
      uid: 'guest',
      email: '',
      name: 'Guest',
      role: 'guest',
      isGuest: true,
    });
  };

  const isAdmin = authUser?.role === 'admin';

  const value = {
    user,
    authUser,
    loading,
    signInWithGoogle,
    signOut,
    continueAsGuest,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
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
