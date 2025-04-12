import { httpsCallable } from 'firebase/functions';
import { signInWithPopup, signOut } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { functions, auth, googleProvider, db } from './config';

/**
 * Get today's recipe based on current day and time
 * @returns {Promise<Object>} Recipe object
 */
export const getTodayRecipe = async () => {
  try {
    const getTodayRecipeFunction = httpsCallable(functions, 'getTodayRecipeV2');
    const result = await getTodayRecipeFunction();
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
  try {
    const getAlternatesFunction = httpsCallable(functions, 'getAlternatesV2');
    const result = await getAlternatesFunction({ day, mealTime });
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
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Save user preferences to Firestore
 * @param {string} uid - User ID
 * @param {Object} preferences - User preferences (goal, diet, cuisine, mealHabits)
 */
export const saveUserPreferences = async (uid, preferences) => {
  try {
    const { displayName, email, photoURL, goal, diet, cuisine, mealHabits } = preferences;
    
    await setDoc(doc(db, 'users', uid), {
      uid,
      name: displayName,
      email,
      photoURL,
      goal,
      diet,
      cuisine,
      mealHabits,
      createdAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error saving user preferences:', error);
    throw error;
  }
}; 