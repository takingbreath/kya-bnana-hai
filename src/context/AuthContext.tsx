import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  needsOnboarding: boolean;
  setNeedsOnboarding: (value: boolean) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Use a stable callback for setting needsOnboarding
  const handleSetNeedsOnboarding = useCallback((value: boolean) => {
    setNeedsOnboarding(value);
  }, []);

  useEffect(() => {
    // Store a reference to the last user to avoid duplicate Firestore checks
    let lastCheckedUserId: string | null = null;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Update current user immediately for better UX
      setCurrentUser(user);
      
      if (user) {
        // Skip Firestore check if we already checked this user
        if (lastCheckedUserId === user.uid) {
          setLoading(false);
          return;
        }
        
        lastCheckedUserId = user.uid;
        
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            // Check if onboarding has been completed
            const userData = userDoc.data();
            setNeedsOnboarding(userData.onboardingCompleted === false);
          } else {
            // New user, needs onboarding
            setNeedsOnboarding(true);
          }
        } catch (error) {
          // Assume onboarding is needed in case of error
          setNeedsOnboarding(true);
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    currentUser,
    loading,
    needsOnboarding,
    setNeedsOnboarding: handleSetNeedsOnboarding,
    isAuthenticated: !!currentUser
  }), [currentUser, loading, needsOnboarding, handleSetNeedsOnboarding]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
} 