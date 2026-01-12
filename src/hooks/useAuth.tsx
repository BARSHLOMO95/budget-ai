import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import {
  signUp as signUpService,
  signIn as signInService,
  signInWithGoogle as signInWithGoogleService,
  signOut as signOutService,
  getUserData,
  updateUserProfile as updateUserProfileService,
} from '../services/auth.service';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await getUserData(firebaseUser.uid);
          setUser(userData);
        } catch (error) {
          console.error('Error loading user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    const userData = await signUpService(email, password, displayName);
    setUser(userData);
  };

  const signIn = async (email: string, password: string) => {
    const userData = await signInService(email, password);
    setUser(userData);
  };

  const signInWithGoogle = async () => {
    const userData = await signInWithGoogleService();
    setUser(userData);
  };

  const signOut = async () => {
    await signOutService();
    setUser(null);
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return;
    await updateUserProfileService(user.uid, data);
    setUser({ ...user, ...data });
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
