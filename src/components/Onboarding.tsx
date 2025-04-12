import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, saveUserPreferences, UserPreferences } from '../firebase/services';
import { useAuth } from '../context/AuthContext';

// Define dietary preferences options
const DIETARY_PREFERENCES = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'dairy-free', label: 'Dairy-Free' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'nut-free', label: 'Nut-Free' },
  { id: 'keto', label: 'Keto' },
  { id: 'paleo', label: 'Paleo' }
];

// Define cuisine preferences options
const CUISINE_PREFERENCES = [
  { id: 'indian', label: 'Indian' },
  { id: 'italian', label: 'Italian' },
  { id: 'mexican', label: 'Mexican' },
  { id: 'chinese', label: 'Chinese' },
  { id: 'japanese', label: 'Japanese' },
  { id: 'mediterranean', label: 'Mediterranean' },
  { id: 'thai', label: 'Thai' },
  { id: 'american', label: 'American' }
];

// Define cooking skill levels
const SKILL_LEVELS = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' }
];

const COMMON_ALLERGIES = [
  'Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Wheat',
  'Soy', 'Fish', 'Shellfish', 'Sesame'
];

interface StepProps {
  onNext: () => void;
  onBack?: () => void;
  preferences: UserPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
}

// Step 1: Dietary Preferences
const DietaryPreferencesStep: React.FC<StepProps> = ({ onNext, preferences, setPreferences }) => {
  const handleTogglePreference = (preference: string) => {
    setPreferences(prev => {
      const currentPreferences = [...prev.dietaryPreferences];
      const index = currentPreferences.indexOf(preference);
      
      if (index === -1) {
        currentPreferences.push(preference);
      } else {
        currentPreferences.splice(index, 1);
      }
      
      return {
        ...prev,
        dietaryPreferences: currentPreferences
      };
    });
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dietary Preferences</h2>
      <p className="text-gray-600">Select all that apply to you:</p>
      
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {DIETARY_PREFERENCES.map(preference => (
          <button
            key={preference.id}
            onClick={() => handleTogglePreference(preference.id)}
            className={`p-3 rounded-lg border text-left transition-colors ${
              preferences.dietaryPreferences.includes(preference.id)
                ? 'bg-pastel-orange text-white border-pastel-orange'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {preference.label}
          </button>
        ))}
      </div>
      
      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          className="px-5 py-2 bg-pastel-orange text-white rounded-md hover:bg-opacity-90 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

// Step 2: Cuisine Preferences
const CuisinePreferencesStep: React.FC<StepProps> = ({ onNext, onBack, preferences, setPreferences }) => {
  const handleToggleCuisine = (cuisine: string) => {
    setPreferences(prev => {
      const currentCuisines = [...prev.cuisinePreferences];
      const index = currentCuisines.indexOf(cuisine);
      
      if (index === -1) {
        currentCuisines.push(cuisine);
      } else {
        currentCuisines.splice(index, 1);
      }
      
      return {
        ...prev,
        cuisinePreferences: currentCuisines
      };
    });
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Cuisine Preferences</h2>
      <p className="text-gray-600">Select cuisines you enjoy:</p>
      
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {CUISINE_PREFERENCES.map(cuisine => (
          <button
            key={cuisine.id}
            onClick={() => handleToggleCuisine(cuisine.id)}
            className={`p-3 rounded-lg border text-left transition-colors ${
              preferences.cuisinePreferences.includes(cuisine.id)
                ? 'bg-pastel-orange text-white border-pastel-orange'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {cuisine.label}
          </button>
        ))}
      </div>
      
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-5 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-5 py-2 bg-pastel-orange text-white rounded-md hover:bg-opacity-90 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

// Step 3: Skill Level & Allergies
const SkillAndAllergiesStep: React.FC<StepProps> = ({ onNext, onBack, preferences, setPreferences }) => {
  const [customAllergy, setCustomAllergy] = useState('');
  
  const handleSkillLevelChange = (level: string) => {
    setPreferences(prev => ({
      ...prev,
      skillLevel: level
    }));
  };
  
  const handleToggleAllergy = (allergy: string) => {
    setPreferences(prev => {
      const currentAllergies = [...(prev.allergies || [])];
      const index = currentAllergies.indexOf(allergy);
      
      if (index === -1) {
        currentAllergies.push(allergy);
      } else {
        currentAllergies.splice(index, 1);
      }
      
      return {
        ...prev,
        allergies: currentAllergies
      };
    });
  };
  
  const handleAddCustomAllergy = () => {
    if (customAllergy.trim() && !preferences.allergies?.includes(customAllergy.trim())) {
      setPreferences(prev => ({
        ...prev,
        allergies: [...(prev.allergies || []), customAllergy.trim()]
      }));
      setCustomAllergy('');
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Your Cooking Experience</h2>
      
      <div>
        <p className="text-gray-600 mb-3">How would you describe your cooking skills?</p>
        <div className="flex flex-col space-y-2">
          {SKILL_LEVELS.map(level => (
            <button
              key={level.id}
              onClick={() => handleSkillLevelChange(level.id)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                preferences.skillLevel === level.id
                  ? 'bg-pastel-orange text-white border-pastel-orange'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <p className="text-gray-600 mb-3">Do you have any allergies or dietary restrictions?</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {COMMON_ALLERGIES.map(allergy => (
            <button
              key={allergy}
              onClick={() => handleToggleAllergy(allergy)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                preferences.allergies?.includes(allergy)
                  ? 'bg-pastel-orange text-white border-pastel-orange'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {allergy}
            </button>
          ))}
        </div>
        
        <div className="mt-4 flex">
          <input
            type="text"
            value={customAllergy}
            onChange={(e) => setCustomAllergy(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-pastel-orange"
            placeholder="Add other allergy..."
          />
          <button
            onClick={handleAddCustomAllergy}
            className="px-4 py-2 bg-pastel-orange text-white rounded-r-md hover:bg-opacity-90 transition-colors"
          >
            Add
          </button>
        </div>
        
        {preferences.allergies && preferences.allergies.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {preferences.allergies.map(allergy => (
              <div key={allergy} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
                <span>{allergy}</span>
                <button
                  onClick={() => handleToggleAllergy(allergy)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-5 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-5 py-2 bg-pastel-orange text-white rounded-md hover:bg-opacity-90 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

// Step 4: Final Preferences (Cooking Time & Serving Size)
const FinalPreferencesStep: React.FC<StepProps> = ({ onNext, onBack, preferences, setPreferences }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Almost Done!</h2>
      
      <div>
        <label className="block text-gray-600 mb-2">How many people do you usually cook for?</label>
        <select
          value={preferences.servingSize || 2}
          onChange={(e) => setPreferences(prev => ({
            ...prev,
            servingSize: parseInt(e.target.value)
          }))}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pastel-orange"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map(size => (
            <option key={size} value={size}>
              {size} {size === 1 ? 'person' : 'people'}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-gray-600 mb-2">How much time do you usually spend cooking a meal?</label>
        <select
          value={preferences.cookingTime || 30}
          onChange={(e) => setPreferences(prev => ({
            ...prev,
            cookingTime: parseInt(e.target.value)
          }))}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pastel-orange"
        >
          <option value={15}>Less than 15 minutes</option>
          <option value={30}>15-30 minutes</option>
          <option value={45}>30-45 minutes</option>
          <option value={60}>45-60 minutes</option>
          <option value={90}>60-90 minutes</option>
          <option value={120}>More than 90 minutes</option>
        </select>
      </div>
      
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-5 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-5 py-2 bg-pastel-orange text-white rounded-md hover:bg-opacity-90 transition-colors"
        >
          Complete Setup
        </button>
      </div>
    </div>
  );
};

// Main Onboarding Component
const Onboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const { currentUser, setNeedsOnboarding } = useAuth();
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    dietaryPreferences: [],
    cuisinePreferences: [],
    skillLevel: 'beginner',
    allergies: [],
    servingSize: 2,
    cookingTime: 30,
    hasCompletedOnboarding: false
  });
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);
  
  const handleNext = () => {
    setStep(prev => prev + 1);
  };
  
  const handleBack = () => {
    setStep(prev => prev - 1);
  };
  
  const handleComplete = async () => {
    if (!currentUser) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Set that onboarding has been completed
      const updatedPreferences = {
        ...preferences,
        hasCompletedOnboarding: true
      };
      
      // Save the preferences to Firestore
      await saveUserPreferences(currentUser.uid, updatedPreferences);
      
      // Update the auth context
      setNeedsOnboarding(false);
      
      // Navigate to the main app
      navigate('/');
    } catch (err) {
      setError('Failed to save preferences. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Let's personalize your experience
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Step {step} of 4
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
            <div 
              className="bg-pastel-orange h-2.5 rounded-full" 
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {isSubmitting ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pastel-orange border-r-transparent mb-4"></div>
            <p className="text-gray-600">Saving your preferences...</p>
          </div>
        ) : (
          <>
            {step === 1 && (
              <DietaryPreferencesStep
                onNext={handleNext}
                preferences={preferences}
                setPreferences={setPreferences}
              />
            )}
            
            {step === 2 && (
              <CuisinePreferencesStep
                onNext={handleNext}
                onBack={handleBack}
                preferences={preferences}
                setPreferences={setPreferences}
              />
            )}
            
            {step === 3 && (
              <SkillAndAllergiesStep
                onNext={handleNext}
                onBack={handleBack}
                preferences={preferences}
                setPreferences={setPreferences}
              />
            )}
            
            {step === 4 && (
              <FinalPreferencesStep
                onNext={handleComplete}
                onBack={handleBack}
                preferences={preferences}
                setPreferences={setPreferences}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Onboarding; 