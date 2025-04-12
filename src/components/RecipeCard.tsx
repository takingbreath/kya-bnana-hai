import React, { useState } from 'react';
import BhayiaAI from './BhayiaAI';

interface Recipe {
  id: string;
  title: string;
  day: string;
  mealTime: string;
  ingredients: string[];
  steps: string[];
  nutritionalBenefits: string;
}

interface RecipeCardProps {
  recipe: Recipe;
  currentDay: string;
  currentMealTime: string;
  onShowAlternates: () => void;
  hasAlternates: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  currentDay, 
  currentMealTime,
  onShowAlternates,
  hasAlternates
}) => {
  const [chatStarted, setChatStarted] = useState(false);

  const handleChatStarted = () => {
    setChatStarted(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-4">
      <h2 className="text-2xl font-bold mb-1 text-gray-900">{recipe.title}</h2>
      <p className="text-gray-600 mb-4">Perfect for your {currentDay} {currentMealTime}</p>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Ingredients</h3>
        <ul className="list-disc pl-5 text-gray-700 space-y-1">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Steps</h3>
        <ol className="list-decimal pl-5 text-gray-700 space-y-2">
          {recipe.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Nutritional Benefits</h3>
        <p className="text-gray-700 italic">{recipe.nutritionalBenefits}</p>
      </div>
      
      {/* Show Alternates Button - Only visible if there are alternates and chat hasn't started */}
      {hasAlternates && !chatStarted && (
        <div className="mt-6 mb-2">
          <button 
            className="w-full px-4 py-2 bg-pastel-orange text-white rounded-lg hover:bg-opacity-90 transition-colors"
            onClick={onShowAlternates}
          >
            Show Alternates
          </button>
        </div>
      )}

      {/* BhayiaAI Component */}
      <BhayiaAI recipe={recipe} onChatStarted={handleChatStarted} />
    </div>
  );
};

export default RecipeCard;
