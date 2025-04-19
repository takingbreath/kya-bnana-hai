import { httpsCallable } from 'firebase/functions';
import { signInWithPopup, signOut } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp
} from 'firebase/firestore';
import { functions, auth, googleProvider, db } from './config';

// Cache for Firebase function calls to reduce repeat calls
const functionCache = new Map();

/**
 * Get today's recipe based on current day and time
 * @returns {Promise<Object>} Recipe object
 */
export const getTodayRecipe = async () => {
  // Use cache key based on current date to refresh daily
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `todayRecipe_${today}`;
  
  // Check cache first
  if (functionCache.has(cacheKey)) {
    return functionCache.get(cacheKey);
  }
  
  try {
    const getTodayRecipeFunction = httpsCallable(functions, 'getTodayRecipeV2');
    const result = await getTodayRecipeFunction();
    
    // Cache the result
    functionCache.set(cacheKey, result.data);
    return result.data;
  } catch (error) {
    console.error('Error fetching today\'s recipe:', error);
    throw error;
  }
};

/**
 * Get alternate recipes for a specific day and mealTime
 * @param {string} day - Day of the week
 * @param {string} mealTime - Meal time (breakfast, lunch, dinner)
 * @returns {Promise<Array>} Array of alternate recipe objects
 */
export const getAlternates = async (day, mealTime) => {
  // Use cache key based on day and mealTime
  const cacheKey = `alternates_${day}_${mealTime}`;
  
  // Check cache first
  if (functionCache.has(cacheKey)) {
    return functionCache.get(cacheKey);
  }
  
  try {
    const getAlternatesFunction = httpsCallable(functions, 'getAlternatesV2');
    const result = await getAlternatesFunction({ day, mealTime });
    
    // Cache the result
    functionCache.set(cacheKey, result.data);
    return result.data;
  } catch (error) {
    console.error('Error fetching alternate recipes:', error);
    throw error;
  }
};

/**
 * Sign in with Google using popup
 * @returns {Promise<Object>} User data and onboarding status
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user document exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const needsOnboarding = !userDoc.exists();
    
    return {
      user: {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      },
      needsOnboarding
    };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const signOutUser = async () => {
  try {
    // Clear function cache on sign out
    functionCache.clear();
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Save user preferences to Firestore
 * @param {string} userId - User ID
 * @param {Object} preferences - User preferences (goals, dietaryPreferences, cuisinePreferences, mealHabits)
 */
export const saveUserPreferences = async (userId, preferences) => {
  if (!userId) {
    throw new Error("User ID is required to save preferences");
  }
  
  try {
    // Create a lean object with exactly what we need
    const userData = {
      uid: userId,
      displayName: auth.currentUser?.displayName || "Anonymous User",
      email: auth.currentUser?.email || "",
      photoURL: auth.currentUser?.photoURL || "",
      
      // Only allow these fields with safe defaults
      goals: Array.isArray(preferences.goals) ? [...preferences.goals] : [],
      dietaryPreferences: Array.isArray(preferences.dietaryPreferences) ? [...preferences.dietaryPreferences] : [],
      cuisinePreferences: Array.isArray(preferences.cuisinePreferences) ? [...preferences.cuisinePreferences] : [],
      mealHabits: Array.isArray(preferences.mealHabits) ? [...preferences.mealHabits] : [],
      
      onboardingCompleted: true,
      updatedAt: serverTimestamp()
    };
    
    // Remove any potential 'name' field that could cause problems
    if ('name' in userData) {
      delete userData.name;
    }
    
    // Convert to pure JSON to remove prototype issues
    const cleanData = JSON.parse(JSON.stringify(userData));
    
    // Write to Firestore
    await setDoc(doc(db, "users", userId), cleanData);
    return true;
  } catch (error) {
    console.error("Error saving user preferences:", error);
    throw error;
  }
}; 