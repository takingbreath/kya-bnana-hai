import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { saveUserPreferences, UserPreferences } from '../firebase/services';
import { useNavigate } from 'react-router-dom';

// Predefined options for form selections - move outside component for better memory usage
const GOAL_OPTIONS = [
  { id: 'Eat healthy', label: '🥗 Eat healthy' },
  { id: 'Lose weight', label: '⚖️ Lose weight' },
  { id: 'Gain muscle', label: '💪 Gain muscle' },
  { id: 'Diabetic-friendly', label: '🩺 Diabetic-friendly' },
  { id: 'Just exploring', label: '🤷 I don\'t know yet' }
];

const DIETARY_PREFERENCES = [
  { id: 'Vegetarian', label: '🥦 Vegetarian' },
  { id: 'Non-Veg', label: '🍗 Non-Veg' },
  { id: 'Eggetarian', label: '🥚 Eggetarian' },
  { id: 'Jain', label: '🕉️ Jain' },
  { id: 'Vegan', label: '🥬 Vegan' },
  { id: 'Gluten-Free', label: '🌾 Gluten-Free' }
];

const CUISINE_PREFERENCES = [
  { id: 'North Indian', label: '🍛 North Indian' },
  { id: 'South Indian', label: '🍲 South Indian' },
  { id: 'Italian', label: '🍕 Italian' },
  { id: 'Asian', label: '🍜 Asian' },
  { id: 'Mediterranean', label: '🥙 Mediterranean' },
  { id: 'Continental', label: '🥐 Continental' },
  { id: 'Street Food', label: '🌯 Street Food' },
  { id: 'Fusion', label: '🍱 Fusion' }
];

const MEAL_HABITS = [
  { id: 'I usually eat breakfast', label: '🌞 I usually eat breakfast' },
  { id: 'I often skip lunch', label: '⏳ I often skip lunch' },
  { id: 'I snack late at night', label: '🍪 I snack late at night' },
  { id: 'Dinner is my main meal', label: '🌙 Dinner is my main meal' }
];

// Define step order once to avoid repeated arrays
const STEPS_ORDER: FormStep[] = ['goals', 'dietary', 'cuisine', 'meals'];

type FormStep = 'goals' | 'dietary' | 'cuisine' | 'meals';

const OnboardingForm: React.FC = () => {
  const { currentUser, setNeedsOnboarding } = useAuth();
  const [step, setStep] = useState<FormStep>('goals');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    goals: [] as string[],
    dietaryPreferences: [] as string[],
    cuisinePreferences: [] as string[],
    mealHabits: [] as string[],
  });

  // Memoize the current step index to avoid recalculating it
  const currentStepIndex = useMemo(() => STEPS_ORDER.indexOf(step), [step]);

  // Handle checkbox changes - optimized with useCallback to avoid recreation on each render
  const handleCheckboxChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => {
      const currentValues = [...prev[field]];
      
      // For goals, only allow single selection
      if (field === 'goals') {
        return {
          ...prev,
          [field]: [value]
        };
      }
      
      // For other fields, allow multiple selections
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [field]: currentValues.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          [field]: [...currentValues, value]
        };
      }
    });
  }, []);

  // Navigate to next step - optimized with useCallback
  const nextStep = useCallback(() => {
    setStep(STEPS_ORDER[currentStepIndex + 1]);
  }, [currentStepIndex]);

  // Navigate to previous step - optimized with useCallback
  const prevStep = useCallback(() => {
    setStep(STEPS_ORDER[currentStepIndex - 1]);
  }, [currentStepIndex]);

  // Submit form data - optimized with useCallback
  const handleSubmit = useCallback(async () => {
    if (!currentUser) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Convert form data to UserPreferences format
      const userPreferences: UserPreferences = {
        goals: formData.goals,
        dietaryPreferences: formData.dietaryPreferences,
        cuisinePreferences: formData.cuisinePreferences,
        mealHabits: formData.mealHabits,
        hasCompletedOnboarding: true
      };
      
      await saveUserPreferences(currentUser.uid, userPreferences);
      setNeedsOnboarding(false);
      navigate('/');
    } catch (error) {
      alert('Failed to save your preferences. Please try again or contact support.');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentUser, formData, navigate, setNeedsOnboarding]);

  // Render the current step form - memoize with useMemo to avoid recreating on each render
  const renderStep = useMemo(() => {
    switch (step) {
      case 'goals':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">🎯 What's your goal?</h2>
            <p className="text-gray-600">(Single select)</p>
            <div className="space-y-2">
              {GOAL_OPTIONS.map(goal => (
                <label key={goal.id} className="flex items-center p-3 border rounded-lg hover:bg-orange-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    checked={formData.goals.includes(goal.id)}
                    onChange={() => handleCheckboxChange('goals', goal.id)}
                    className="h-4 w-4 text-pastel-orange mr-3"
                    name="goals"
                  />
                  <span className="text-lg">{goal.label}</span>
                </label>
              ))}
            </div>
          </div>
        );
      
      case 'dietary':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">🌱 What's your dietary preference?</h2>
            <p className="text-gray-600">(Multi-select)</p>
            <div className="space-y-2">
              {DIETARY_PREFERENCES.map(preference => (
                <label key={preference.id} className="flex items-center p-3 border rounded-lg hover:bg-orange-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.dietaryPreferences.includes(preference.id)}
                    onChange={() => handleCheckboxChange('dietaryPreferences', preference.id)}
                    className="h-4 w-4 text-pastel-orange mr-3"
                  />
                  <span className="text-lg">{preference.label}</span>
                </label>
              ))}
            </div>
          </div>
        );
      
      case 'cuisine':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">🍽️ What cuisines do you enjoy?</h2>
            <p className="text-gray-600">(Multi-select)</p>
            <div className="space-y-2">
              {CUISINE_PREFERENCES.map(cuisine => (
                <label key={cuisine.id} className="flex items-center p-3 border rounded-lg hover:bg-orange-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.cuisinePreferences.includes(cuisine.id)}
                    onChange={() => handleCheckboxChange('cuisinePreferences', cuisine.id)}
                    className="h-4 w-4 text-pastel-orange mr-3"
                  />
                  <span className="text-lg">{cuisine.label}</span>
                </label>
              ))}
            </div>
          </div>
        );
      
      case 'meals':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">⏰ Your meal habits</h2>
            <p className="text-gray-600">(Multi-select)</p>
            <div className="space-y-2">
              {MEAL_HABITS.map(habit => (
                <label key={habit.id} className="flex items-center p-3 border rounded-lg hover:bg-orange-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.mealHabits.includes(habit.id)}
                    onChange={() => handleCheckboxChange('mealHabits', habit.id)}
                    className="h-4 w-4 text-pastel-orange mr-3"
                  />
                  <span className="text-lg">{habit.label}</span>
                </label>
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  }, [step, formData, handleCheckboxChange]);

  // Memoize progress indicators to avoid recreating array on each render
  const progressIndicators = useMemo(() => 
    STEPS_ORDER.map((s, index) => (
      <div 
        key={s}
        className={`w-1/4 h-2 rounded-full ${
          currentStepIndex >= index 
            ? 'bg-pastel-orange' 
            : 'bg-gray-200'
        }`}
      />
    )), 
  [currentStepIndex]);

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          {progressIndicators}
        </div>
        <p className="text-sm text-gray-500 text-center">
          Step {currentStepIndex + 1} of {STEPS_ORDER.length}
        </p>
      </div>
      
      {renderStep}
      
      <div className="mt-8 flex justify-between">
        {step !== 'goals' && (
          <button
            onClick={prevStep}
            className="px-6 py-3 border border-pastel-orange text-pastel-orange rounded-lg hover:bg-pastel-orange hover:text-white transition-colors font-medium"
          >
            Back
          </button>
        )}
        
        {step === 'goals' && (
          <div></div> // Empty div for spacing when Back button is not shown
        )}
        
        {step !== 'meals' ? (
          <button
            onClick={nextStep}
            className="px-6 py-3 bg-pastel-orange text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
            disabled={step === 'goals' && formData.goals.length === 0}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 bg-pastel-orange text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 font-medium"
          >
            {isSubmitting ? '⏳ Saving...' : '✨ Complete Setup'}
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(OnboardingForm); 