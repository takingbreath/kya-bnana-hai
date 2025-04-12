const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const { OpenAI } = require('openai');

// Version 1.1 - Added IST timezone support
// Initialize Firebase Admin
admin.initializeApp();

// Reference to Firestore database
const db = admin.firestore();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: functions.config().openai.apikey, // Get API key from Firebase Functions config
});

/**
 * Helper function to determine current meal time based on hour
 * @param {number} hour - Current hour (0-23)
 * @returns {string} Meal time (breakfast, lunch, or dinner)
 */
const getCurrentMealTime = (hour) => {
  if (hour >= 5 && hour < 11) {
    return 'breakfast';
  } else if (hour >= 11 && hour < 16) {
    return 'lunch';
  } else {
    return 'dinner';
  }
};

/**
 * Get day of week as string
 * @param {Date} date - Date object to get day from (defaults to current date)
 * @returns {string} Day of week
 */
const getDayOfWeek = (date = new Date()) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

/**
 * Cloud Function to get today's recipe based on current day and time
 */
exports.getTodayRecipeV2 = functions.https.onCall(async (data, context) => {
  try {
    // Get current day and meal time with IST adjustment (UTC+5:30)
    const now = new Date();
    // Add 5 hours and 30 minutes to account for IST timezone
    const istTime = new Date(now.getTime() + (5 * 60 * 60 * 1000) + (30 * 60 * 1000));
    const currentDay = getDayOfWeek(istTime);
    const currentHour = istTime.getHours();
    const currentMealTime = getCurrentMealTime(currentHour);
    
    console.log(`Current IST time: ${istTime}, Day: ${currentDay}, Hour: ${currentHour}, MealTime: ${currentMealTime}`);

    // Query Firestore for a recipe matching current day and meal time (case-insensitive)
    const recipesRef = db.collection('recipes');
    
    // Get all recipes and filter in memory for case-insensitive matching
    const allRecipes = await recipesRef.get();
    const matchingRecipes = [];
    
    allRecipes.forEach(doc => {
      const recipeData = doc.data();
      if (recipeData.day && recipeData.mealTime &&
          recipeData.day.toLowerCase() === currentDay.toLowerCase() &&
          recipeData.mealTime.toLowerCase() === currentMealTime.toLowerCase()) {
        const recipe = recipeData;
        recipe.id = doc.id;
        matchingRecipes.push(recipe);
      }
    });

    if (matchingRecipes.length === 0) {
      console.log('No matching recipes found');
      return null;
    }

    // Return the first matching recipe
    const recipe = matchingRecipes[0];
    
    return {
      recipe,
      currentDay,
      currentMealTime
    };
  } catch (error) {
    console.error('Error getting today\'s recipe:', error);
    throw new functions.https.HttpsError('internal', 'Error fetching recipe', error);
  }
});

/**
 * Cloud Function to get alternate recipes for a specific day and meal time
 */
exports.getAlternatesV2 = functions.https.onCall(async (data, context) => {
  try {
    // Get day and meal time from request or use current values with IST adjustment
    const day = data.day || (() => {
      const now = new Date();
      const istTime = new Date(now.getTime() + (5 * 60 * 60 * 1000) + (30 * 60 * 1000));
      return getDayOfWeek(istTime);
    })();
    
    const mealTime = data.mealTime || (() => {
      const now = new Date();
      const istTime = new Date(now.getTime() + (5 * 60 * 60 * 1000) + (30 * 60 * 1000));
      return getCurrentMealTime(istTime.getHours());
    })();

    console.log(`Searching for alternate recipes for ${day} ${mealTime}`);

    // Query Firestore for recipes matching day and meal time (case-insensitive)
    const recipesRef = db.collection('recipes');
    
    // Get all recipes and filter in memory for case-insensitive matching
    const allRecipes = await recipesRef.get();
    const matchingRecipes = [];
    
    allRecipes.forEach(doc => {
      const recipeData = doc.data();
      if (recipeData.day && recipeData.mealTime &&
          recipeData.day.toLowerCase() === day.toLowerCase() &&
          recipeData.mealTime.toLowerCase() === mealTime.toLowerCase()) {
        const recipe = recipeData;
        recipe.id = doc.id;
        matchingRecipes.push(recipe);
      }
    });

    if (matchingRecipes.length === 0) {
      console.log('No matching alternate recipes found');
      return [];
    }

    return matchingRecipes;
  } catch (error) {
    console.error('Error getting alternate recipes:', error);
    throw new functions.https.HttpsError('internal', 'Error fetching alternate recipes', error);
  }
});

/**
 * Cloud Function to handle Bhayia AI recipe inquiries
 */
exports.askBhayiaAI = functions.https.onCall(async (data, context) => {
  try {
    // Extract recipe data and user question
    const { recipe, question } = data;
    
    if (!recipe || !question) {
      throw new functions.https.HttpsError(
        'invalid-argument', 
        'Recipe data or question missing'
      );
    }

    // Format recipe data for the prompt
    const recipeDetails = `
Title: ${recipe.title}
Ingredients: ${recipe.ingredients.join(', ')}
Steps: ${recipe.steps.join('\n')}
Nutrition: ${recipe.nutritionalBenefits}
    `;

    console.log(`Processing question: "${question}" for recipe "${recipe.title}"`);
    
    // Make OpenAI API call
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are Bhayia AI, a friendly Indian cooking assistant. Always keep answers short, clear, and to the point. Use bullet points or short sentences when needed. Avoid unnecessary explanations or over-friendly tone. Prioritize clarity and brevity. Be warm and helpful, but concise."
        },
        {
          role: "user",
          content: `Here's the recipe:\n${recipeDetails}\n\nQuestion: ${question}`
        }
      ],
      max_tokens: 500
    });

    // Return the response
    const answer = completion.choices[0].message.content;
    console.log(`Generated response for "${question}": ${answer.substring(0, 100)}...`);
    
    return answer;
  } catch (error) {
    console.error('Error with Bhayia AI:', error);
    throw new functions.https.HttpsError('internal', 'Error processing your question', error);
  }
}); 