import React, { useEffect, useState } from 'react';
import { getAlternates } from '../firebase/services';

interface Recipe {
  id: string;
  title: string;
  day: string;
  mealTime: string;
  ingredients: string[];
  steps: string[];
  nutritionalBenefits: string;
  description?: string;
}

interface AlternatesModalProps {
  onClose: () => void;
  day?: string;
  mealTime?: string;
  onSelectRecipe: (recipe: Recipe) => void;
}

const AlternatesModal: React.FC<AlternatesModalProps> = ({ onClose, day, mealTime, onSelectRecipe }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [alternates, setAlternates] = useState<Recipe[]>([]);

  useEffect(() => {
    const fetchAlternates = async () => {
      try {
        setLoading(true);
        // Pass current day and mealTime if provided, otherwise the backend will use the current day/time
        const currentDay = day || '';
        const currentMealTime = mealTime || '';
        const data = await getAlternates(currentDay, currentMealTime) as Recipe[];
        setAlternates(data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching alternates:', err);
        setError('Failed to load alternative recipes. Please try again later.');
        setLoading(false);
      }
    };

    fetchAlternates();
  }, [day, mealTime]);

  const handleSelectRecipe = (recipe: Recipe) => {
    onSelectRecipe(recipe);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto modal-animation">
        <div className="p-5 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Alternative Dishes</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="flex justify-center p-6">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pastel-orange border-r-transparent"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-4">{error}</div>
          ) : alternates.length === 0 ? (
            <div className="text-center text-gray-600 p-4">No alternative recipes available for today.</div>
          ) : (
            <div className="space-y-3">
              {alternates.map((alt) => (
                <div 
                  key={alt.id} 
                  className="p-4 border border-gray-200 rounded-lg hover:border-pastel-orange transition-colors cursor-pointer"
                  onClick={() => handleSelectRecipe(alt)}
                >
                  <h3 className="font-medium text-gray-900">{alt.title}</h3>
                  <p className="text-gray-600 text-sm">{alt.description || `${alt.ingredients.length} ingredients, ${alt.steps.length} steps`}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlternatesModal;
