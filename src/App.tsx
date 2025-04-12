import React, { useState, useEffect } from 'react';
import '@fontsource/inter';
import './App.css';
import RecipeCard from './components/RecipeCard';
import AlternatesModal from './components/AlternatesModal';
import { getTodayRecipe, getAlternates } from './firebase/services';
import Header from './components/Header';

interface RecipeResponse {
  recipe: any;
  currentDay: string;
  currentMealTime: string;
}

type MealTime = 'breakfast' | 'lunch' | 'snack' | 'dinner';

function App() {
  const [showAlternates, setShowAlternates] = useState(false);
  const [currentDay, setCurrentDay] = useState<string>('');
  const [selectedMealTime, setSelectedMealTime] = useState<MealTime>('breakfast');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [allSnackRecipes, setAllSnackRecipes] = useState<any[]>([]);

  // Get current day and meal time on component mount
  useEffect(() => {
    const fetchCurrentInfo = async () => {
      try {
        const data = await getTodayRecipe() as RecipeResponse;
        if (data && data.currentDay && data.currentMealTime) {
          setCurrentDay(data.currentDay);
          setSelectedMealTime(data.currentMealTime.toLowerCase() as MealTime);
        }
      } catch (error) {
        console.error('Error fetching current day info:', error);
      }
    };
    
    fetchCurrentInfo();
  }, []);

  // Fetch recipes when selected meal time changes
  useEffect(() => {
    if (currentDay) {
      const fetchRecipes = async () => {
        setLoading(true);
        try {
          if (selectedMealTime === 'snack') {
            // For snacks, we get all snack recipes regardless of day
            const snackRecipes = await getAlternates('Any', 'snack');
            setAllSnackRecipes(snackRecipes || []);
            
            if (snackRecipes && snackRecipes.length > 0) {
              // Select a random snack recipe to display
              const randomIndex = Math.floor(Math.random() * snackRecipes.length);
              setRecipes(snackRecipes);
              setSelectedRecipe(snackRecipes[randomIndex]);
            } else {
              setRecipes([]);
              setSelectedRecipe(null);
            }
          } else {
            // For other meal times, get recipes for the current day
            const recipesData = await getAlternates(currentDay, selectedMealTime);
            setRecipes(recipesData || []);
            setSelectedRecipe(recipesData && recipesData.length > 0 ? recipesData[0] : null);
          }
        } catch (error) {
          console.error('Error fetching recipes:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchRecipes();
    }
  }, [selectedMealTime, currentDay]);

  // Handle tab click
  const handleTabClick = (mealTime: MealTime) => {
    setSelectedMealTime(mealTime);
  };

  // Handle recipe selection
  const handleSelectRecipe = (recipe: any) => {
    setSelectedRecipe(recipe);
  };

  // Handle day navigation
  const navigateDay = (direction: 'prev' | 'next') => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentIndex = days.findIndex(day => day === currentDay);
    
    if (currentIndex === -1) return;
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex === 0 ? days.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === days.length - 1 ? 0 : currentIndex + 1;
    }
    
    setCurrentDay(days[newIndex]);
  };

  // Method to show alternates modal
  const handleShowAlternates = () => {
    setShowAlternates(true);
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 font-inter">
      {/* Header with authentication */}
      <Header />
      
      {/* Fixed Tabs */}
      <div className="sticky top-0 bg-white shadow-sm z-10">
        {/* Day Header with Navigation - Only show for non-snack tabs */}
        {currentDay && selectedMealTime !== 'snack' && (
          <div className="flex items-center justify-center mt-2 mb-1">
            <button 
              onClick={() => navigateDay('prev')}
              className="text-pastel-orange hover:text-pastel-orange/80 transition-colors"
              aria-label="Previous day"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-center mx-3">
              Suggestions for {currentDay}
            </h2>
            <button 
              onClick={() => navigateDay('next')}
              className="text-pastel-orange hover:text-pastel-orange/80 transition-colors"
              aria-label="Next day"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Show "Snack Suggestions" header when on snack tab */}
        {selectedMealTime === 'snack' && (
          <div className="mt-2 mb-1">
            <h2 className="text-xl font-semibold text-center">
              Snack Suggestions
            </h2>
          </div>
        )}

        {/* Meal Time Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          {['breakfast', 'lunch', 'snack', 'dinner'].map((mealTime) => (
            <button
              key={mealTime}
              className={`flex-1 py-2 px-1 text-sm font-medium text-center ${
                selectedMealTime === mealTime
                  ? 'text-pastel-orange border-b-2 border-pastel-orange'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleTabClick(mealTime as MealTime)}
            >
              {mealTime.charAt(0).toUpperCase() + mealTime.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-6 max-w-md mx-auto">
        {/* Recipe Card */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-6 mt-4 flex items-center justify-center h-80">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-pastel-orange border-r-transparent mb-4"></div>
              <p className="text-gray-600">Finding the perfect recipe for you...</p>
            </div>
          </div>
        ) : selectedRecipe ? (
          <RecipeCard 
            recipe={selectedRecipe} 
            currentDay={selectedMealTime === 'snack' ? 'Any' : currentDay} 
            currentMealTime={selectedMealTime}
            onShowAlternates={handleShowAlternates}
            hasAlternates={recipes.length > 1}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6 mt-4">
            <div className="text-center text-gray-600">
              <p>No recipe found for {selectedMealTime === 'snack' ? 'Snacks' : `${currentDay} ${selectedMealTime}`}. Please check back later!</p>
            </div>
          </div>
        )}
      </div>

      {/* Alternates Modal */}
      {showAlternates && (
        <AlternatesModal 
          onClose={() => setShowAlternates(false)} 
          day={selectedMealTime === 'snack' ? 'Any' : currentDay}
          mealTime={selectedMealTime}
          onSelectRecipe={handleSelectRecipe}
        />
      )}
    </div>
  );
}

export default App;
