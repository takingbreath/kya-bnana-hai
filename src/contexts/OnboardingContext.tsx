import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../firebase/config';
import { saveUserPreferences, UserPreferences } from '../firebase/services';

interface OnboardingContextType {
  step: number;
  preferences: UserPreferences;
  isComplete: boolean;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  updatePreferences: (newPrefs: Partial<UserPreferences>) => void;
  completeOnboarding: () => Promise<void>;
}

// Default preferences
const defaultPreferences: UserPreferences = {
  dietaryPreferences: [],
  cuisinePreferences: [],
  cookingTime: [],
  skillLevel: 'beginner',
  allergies: [],
  isOnboardingComplete: false
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [step, setStep] = useState<number>(1);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  // Check if user has already completed onboarding
  useEffect(() => {
    // You would typically check Firestore here to see if the user
    // has already completed onboarding
    const checkOnboardingStatus = async () => {
      // Implementation depends on your Firebase setup
      // For now, we'll just use local storage as a placeholder
      const savedStatus = localStorage.getItem('onboardingComplete');
      if (savedStatus === 'true') {
        setIsComplete(true);
      }
    };

    checkOnboardingStatus();
  }, []);

  const nextStep = () => {
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const goToStep = (step: number) => {
    setStep(step);
  };

  const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
    setPreferences((prev: UserPreferences) => ({
      ...prev,
      ...newPrefs
    }));
  };

  const completeOnboarding = async () => {
    try {
      // Save preferences to Firestore
      if (auth.currentUser) {
        const updatedPreferences = {
          ...preferences,
          isOnboardingComplete: true
        };
        await saveUserPreferences(auth.currentUser.uid, updatedPreferences);
        setPreferences(updatedPreferences);
        setIsComplete(true);
        localStorage.setItem('onboardingComplete', 'true');
      } else {
        throw new Error('User not authenticated');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  const value = {
    step,
    preferences,
    isComplete,
    nextStep,
    prevStep,
    goToStep,
    updatePreferences,
    completeOnboarding
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}; 