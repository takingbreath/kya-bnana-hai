import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, saveUserPreferences, UserPreferences } from '../firebase/services';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/config';
import OnboardingForm from './OnboardingForm'; // Import the OnboardingForm component

// Define goals options - Keep these for potential UI use unless confirmed unused
const GOALS = [
  { id: 'eat-healthy', label: '🥗 Eat healthy' },
  { id: 'lose-weight', label: '⚖️ Lose weight' },
  { id: 'gain-muscle', label: '💪 Gain muscle' },
  { id: 'diabetic-friendly', label: '🩺 Diabetic-friendly' },
  { id: 'dont-know', label: '🤷 I don\'t know yet' }
];

// Define dietary preferences options - Keep these
const DIETARY_PREFERENCES = [
  { id: 'vegetarian', label: '🥦 Vegetarian' },
  { id: 'non-veg', label: '🍗 Non-Veg' },
  { id: 'eggetarian', label: '🥚 Eggetarian' },
  { id: 'jain', label: '🕉️ Jain' },
  { id: 'vegan', label: '🥬 Vegan' },
  { id: 'gluten-free', label: '🌾 Gluten-Free' }
];

// Define cuisine preferences options - Keep these
const CUISINE_PREFERENCES = [
  { id: 'north-indian', label: '🍛 North Indian' },
  { id: 'south-indian', label: '🍲 South Indian' },
  { id: 'italian', label: '🍕 Italian' },
  { id: 'asian', label: '🍜 Asian' },
  { id: 'mediterranean', label: '🥙 Mediterranean' },
  { id: 'continental', label: '🥐 Continental' },
  { id: 'street-food', label: '🌯 Street Food' },
  { id: 'fusion', label: '🍱 Fusion' }
];

// Define meal habits options - Keep these
const MEAL_HABITS = [
  { id: 'breakfast', label: '🌞 I usually eat breakfast' },
  { id: 'skip-lunch', label: '⏳ I often skip lunch' },
  { id: 'late-snack', label: '🍪 I snack late at night' },
  { id: 'dinner-main', label: '🌙 Dinner is my main meal' }
];

const Onboarding: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-extrabold text-center">Let's personalize your experience</h2>
        
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}

        {isSubmitting ? (
          <p className="text-center">Saving your preferences...</p>
        ) : (
          // Render the actual OnboardingForm component instead of the placeholder
          <OnboardingForm />
        )}
      </div>
    </div>
  );
};

export default Onboarding;
