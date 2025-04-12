import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { saveUserPreferences } from '../firebase/services';

// Predefined options for form selections
const GOAL_OPTIONS = [
  'Healthy eating',
  'Weight loss',
  'Learning to cook',
  'Trying new recipes',
  'Quick meals'
];

const DIETARY_RESTRICTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-free',
  'Lactose-free',
  'No restrictions'
];

const CUISINE_PREFERENCES = [
  'North Indian',
  'South Indian',
  'Punjabi',
  'Bengali',
  'Gujarati',
  'Rajasthani',
  'Maharashtrian',
  'Goan',
  'Mughlai',
  'Indo-Chinese'
];

const MEAL_FREQUENCIES = [
  'Breakfast: Daily',
  'Lunch: Daily',
  'Dinner: Daily',
  'Breakfast: Weekends only',
  'Lunch: Weekends only',
  'Dinner: Weekends only'
];

type FormStep = 'goals' | 'dietary' | 'cuisine' | 'meals' | 'summary';

const OnboardingForm: React.FC = () => {
  const { currentUser, setNeedsOnboarding } = useAuth();
  const [step, setStep] = useState<FormStep>('goals');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    goals: [] as string[],
    dietaryRestrictions: [] as string[],
    cuisinePreferences: [] as string[],
    mealFrequencies: [] as string[],
  });

  // Handle checkbox changes
  const handleCheckboxChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => {
      const currentValues = [...prev[field]];
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
  };

  // Navigate to next step
  const nextStep = () => {
    switch (step) {
      case 'goals':
        setStep('dietary');
        break;
      case 'dietary':
        setStep('cuisine');
        break;
      case 'cuisine':
        setStep('meals');
        break;
      case 'meals':
        setStep('summary');
        break;
      default:
        break;
    }
  };

  // Navigate to previous step
  const prevStep = () => {
    switch (step) {
      case 'dietary':
        setStep('goals');
        break;
      case 'cuisine':
        setStep('dietary');
        break;
      case 'meals':
        setStep('cuisine');
        break;
      case 'summary':
        setStep('meals');
        break;
      default:
        break;
    }
  };

  // Submit form data
  const handleSubmit = async () => {
    if (!currentUser) return;
    
    setIsSubmitting(true);
    try {
      await saveUserPreferences({
        uid: currentUser.uid,
        displayName: currentUser.displayName || '',
        email: currentUser.email || '',
        photoURL: currentUser.photoURL || '',
        preferences: {
          goals: formData.goals,
          dietaryRestrictions: formData.dietaryRestrictions,
          cuisinePreferences: formData.cuisinePreferences,
          mealFrequencies: formData.mealFrequencies,
        }
      });
      setNeedsOnboarding(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the current step form
  const renderStep = () => {
    switch (step) {
      case 'goals':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">What are your cooking goals?</h2>
            <p className="text-gray-600">Select all that apply</p>
            <div className="space-y-2">
              {GOAL_OPTIONS.map(goal => (
                <label key={goal} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.goals.includes(goal)}
                    onChange={() => handleCheckboxChange('goals', goal)}
                    className="h-4 w-4 text-pastel-orange"
                  />
                  <span>{goal}</span>
                </label>
              ))}
            </div>
          </div>
        );
      
      case 'dietary':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Any dietary restrictions?</h2>
            <p className="text-gray-600">Select all that apply</p>
            <div className="space-y-2">
              {DIETARY_RESTRICTIONS.map(restriction => (
                <label key={restriction} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.dietaryRestrictions.includes(restriction)}
                    onChange={() => handleCheckboxChange('dietaryRestrictions', restriction)}
                    className="h-4 w-4 text-pastel-orange"
                  />
                  <span>{restriction}</span>
                </label>
              ))}
            </div>
          </div>
        );
      
      case 'cuisine':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Which cuisines do you prefer?</h2>
            <p className="text-gray-600">Select all that apply</p>
            <div className="space-y-2">
              {CUISINE_PREFERENCES.map(cuisine => (
                <label key={cuisine} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.cuisinePreferences.includes(cuisine)}
                    onChange={() => handleCheckboxChange('cuisinePreferences', cuisine)}
                    className="h-4 w-4 text-pastel-orange"
                  />
                  <span>{cuisine}</span>
                </label>
              ))}
            </div>
          </div>
        );
      
      case 'meals':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">When do you usually cook?</h2>
            <p className="text-gray-600">Select all that apply</p>
            <div className="space-y-2">
              {MEAL_FREQUENCIES.map(meal => (
                <label key={meal} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.mealFrequencies.includes(meal)}
                    onChange={() => handleCheckboxChange('mealFrequencies', meal)}
                    className="h-4 w-4 text-pastel-orange"
                  />
                  <span>{meal}</span>
                </label>
              ))}
            </div>
          </div>
        );
      
      case 'summary':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Review Your Preferences</h2>
            <div className="border p-4 rounded-md space-y-3">
              <div>
                <h3 className="font-medium">Cooking Goals:</h3>
                <ul className="list-disc list-inside pl-2">
                  {formData.goals.length > 0 ? 
                    formData.goals.map(goal => <li key={goal}>{goal}</li>) : 
                    <li className="text-gray-500">None selected</li>
                  }
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium">Dietary Restrictions:</h3>
                <ul className="list-disc list-inside pl-2">
                  {formData.dietaryRestrictions.length > 0 ? 
                    formData.dietaryRestrictions.map(item => <li key={item}>{item}</li>) : 
                    <li className="text-gray-500">None selected</li>
                  }
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium">Cuisine Preferences:</h3>
                <ul className="list-disc list-inside pl-2">
                  {formData.cuisinePreferences.length > 0 ? 
                    formData.cuisinePreferences.map(item => <li key={item}>{item}</li>) : 
                    <li className="text-gray-500">None selected</li>
                  }
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium">Meal Habits:</h3>
                <ul className="list-disc list-inside pl-2">
                  {formData.mealFrequencies.length > 0 ? 
                    formData.mealFrequencies.map(item => <li key={item}>{item}</li>) : 
                    <li className="text-gray-500">None selected</li>
                  }
                </ul>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          {['goals', 'dietary', 'cuisine', 'meals', 'summary'].map((s, index) => (
            <div 
              key={s}
              className={`w-1/5 h-1 rounded-full ${
                ['goals', 'dietary', 'cuisine', 'meals', 'summary'].indexOf(step) >= index 
                  ? 'bg-pastel-orange' 
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-500 text-center">
          Step {['goals', 'dietary', 'cuisine', 'meals', 'summary'].indexOf(step) + 1} of 5
        </p>
      </div>
      
      {renderStep()}
      
      <div className="mt-8 flex justify-between">
        {step !== 'goals' && (
          <button
            onClick={prevStep}
            className="px-4 py-2 border border-pastel-orange text-pastel-orange rounded-lg hover:bg-pastel-orange hover:text-white transition-colors"
          >
            Back
          </button>
        )}
        
        {step !== 'summary' ? (
          <button
            onClick={nextStep}
            className={`px-4 py-2 bg-pastel-orange text-white rounded-lg hover:bg-opacity-90 transition-colors ${
              step === 'goals' ? 'ml-auto' : ''
            }`}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-pastel-orange text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Complete Setup'}
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingForm; 