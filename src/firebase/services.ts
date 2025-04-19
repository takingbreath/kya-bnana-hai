import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  updateDoc, 
  query, 
  where,
  serverTimestamp,
  Timestamp,
  deleteField
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth, db, functions } from './config';

// Simple sanitizer function to remove undefined fields
const removeUndefinedFields = (obj: Record<string, any>): Record<string, any> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  );
};

// Deep sanitizer that recursively cleans objects and arrays for Firestore
function deepSanitizeFirestore(obj: Record<string, any>): Record<string, any> {
  return Object.entries(obj).reduce((acc: Record<string, any>, [key, value]) => {
    if (value === undefined) return acc; // skip undefined values
    if (value === null) {
      acc[key] = null; // null is valid in Firestore
    } else if (Array.isArray(value)) {
      acc[key] = value.filter((v) => v !== undefined); // clean arrays
    } else if (typeof value === 'object' && value !== null) {
      acc[key] = deepSanitizeFirestore(value); // recursive for nested objects
    } else {
      acc[key] = value; // primitive values pass through
    }
    return acc;
  }, {});
}

// Function to specifically check and remove undefined keys
function removeUndefinedKeys(obj: Record<string, any>): Record<string, any> {
  return Object.entries(obj).reduce((acc: Record<string, any>, [key, value]) => {
    if (key === undefined || key === "undefined") {
      console.warn("🚨 Removed undefined key from object:", key);
      return acc;
    }
    acc[key] = value;
    return acc;
  }, {});
}

// Helper function to remove undefined values recursively
const removeUndefinedValues = (obj: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    
    if (value === undefined) {
      // Skip undefined values
      return;
    }
    
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively clean nested objects
      result[key] = removeUndefinedValues(value);
    } else {
      // Keep arrays and primitive values as they are
      result[key] = value;
    }
  });
  
  return result;
};

// Define user preferences type
export interface UserPreferences {
  goals?: string[];
  dietaryPreferences: string[];
  cuisinePreferences: string[];
  mealHabits?: string[];
  hasCompletedOnboarding?: boolean;
}

interface AuthResult {
  user: FirebaseUser;
  isNewUser: boolean;
  needsOnboarding: boolean;
}

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
export const getAlternates = async (day: string, mealTime: string) => {
  try {
    const getAlternatesFunction = httpsCallable(functions, 'getAlternatesV2');
    const result = await getAlternatesFunction({ day, mealTime });
    return result.data;
  } catch (error) {
    console.error('Error fetching alternate recipes:', error);
    throw error;
  }
};

// Authentication functions
export const signInWithGoogle = async (): Promise<AuthResult> => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  
  // Check if this is a new user by querying Firestore
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);
  
  const isNewUser = !userDoc.exists();
  const needsOnboarding = isNewUser || (userDoc.exists() && userDoc.data().onboardingCompleted === false);
  
  // Save user info to Firestore
  if (isNewUser) {
    // Define explicit user document structure
    interface NewUserDocument {
      uid: string;
      createdAt: any; // Using any for FirebaseFieldValue
      lastLogin: any; // Using any for FirebaseFieldValue
      onboardingCompleted: boolean;
      displayName?: string;
      email?: string;
      photoURL?: string;
    }
    
    // Create a new document with only the fields we need
    const userData: NewUserDocument = {
      uid: user.uid,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      onboardingCompleted: false
    };
    
    // Add optional fields only if they exist and are not undefined
    if (user.displayName) {
      userData.displayName = user.displayName;
    }
    
    if (user.email) {
      userData.email = user.email;
    }
    
    if (user.photoURL) {
      userData.photoURL = user.photoURL;
    }
    
    // Clean the object JUST before saving to remove any potential undefined fields
    const sanitizedUserData = deepSanitizeFirestore(userData);
    
    // Then check for and remove any undefined keys
    const cleanedUserData = removeUndefinedKeys(sanitizedUserData);
    
    // Debug log for first-time user creation
    console.log('New user document being created:', JSON.stringify(cleanedUserData));
    
    // Extra critical debug right before setDoc
    console.log("🧾 Cleaned and Key-Checked User Data Preview:", cleanedUserData);
    Object.keys(cleanedUserData).forEach(key => {
      if (key === undefined || key === "undefined") {
        console.error(`🔥🔥🔥 CRITICAL: Undefined key detected in new user:`, key);
      }
    });
    
    await setDoc(userDocRef, cleanedUserData);
  } else {
    // Update last login time
    await updateDoc(userDocRef, {
      lastLogin: serverTimestamp()
    });
  }
  
  return { user, isNewUser, needsOnboarding };
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

// Add a new function to fix the document structure before saving preferences
export const cleanExistingUserDocument = async (userId: string): Promise<void> => {
  console.log('📝 DOCUMENT CLEANER: Starting document cleanup for user', userId);
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log('📝 DOCUMENT CLEANER: Document exists, checking for issues');
      const userData = docSnap.data();
      console.log('📝 DOCUMENT CLEANER: Document fields:', Object.keys(userData));
      
      // Check if the problematic 'name' field exists
      if ('name' in userData) {
        console.log('📝 DOCUMENT CLEANER: Found problematic name field with value:', userData.name);
        
        // Create a new object without the name field
        const { name, ...cleanedData } = userData;
        console.log('📝 DOCUMENT CLEANER: Created cleaned data without name field');
        
        // Use set with merge:false to completely replace the document
        await setDoc(docRef, cleanedData);
        console.log('📝 DOCUMENT CLEANER: Successfully replaced document without name field');
      } else {
        console.log('📝 DOCUMENT CLEANER: No name field found in document, no cleanup needed');
      }
    } else {
      console.log('📝 DOCUMENT CLEANER: Document does not exist yet, nothing to clean');
    }
  } catch (error) {
    console.error('📝 DOCUMENT CLEANER: Error cleaning document:', error);
  }
};

// User preferences functions
export const saveUserPreferences = async (
  userId: string, 
  preferences: UserPreferences
): Promise<void> => {
  try {
    if (!userId) {
      throw new Error("User ID is required to save preferences");
    }
    
    console.log('📊 ONBOARDING STEP: Starting to save preferences for user:', userId);
    console.log('📊 ONBOARDING STEP: Preferences object to save:', JSON.stringify(preferences));
    
    // FIRST: Clean any existing document to remove problematic fields
    await cleanExistingUserDocument(userId);
    
    // Create a completely fresh, simple object with ONLY the required fields
    // This is the most reliable way to avoid prototype chain issues
    const sanitizedUserData = {
      // User info
      uid: userId,
      displayName: auth.currentUser?.displayName || "Anonymous User",
      email: auth.currentUser?.email || "",
      photoURL: auth.currentUser?.photoURL || "",
      
      // Preferences - only include fields from the UserPreferences interface
      goals: Array.isArray(preferences.goals) ? [...preferences.goals] : [],
      dietaryPreferences: Array.isArray(preferences.dietaryPreferences) ? [...preferences.dietaryPreferences] : [],
      cuisinePreferences: Array.isArray(preferences.cuisinePreferences) ? [...preferences.cuisinePreferences] : [],
      mealHabits: Array.isArray(preferences.mealHabits) ? [...preferences.mealHabits] : [],
      
      // System fields
      onboardingCompleted: true,
      updatedAt: serverTimestamp(),
    };
    
    console.log('📊 ONBOARDING STEP: Created clean user data object with fields:', Object.keys(sanitizedUserData));
    
    // Convert to a pure JSON object and back to remove any prototype chain issues
    const jsonString = JSON.stringify(sanitizedUserData);
    console.log('📊 ONBOARDING STEP: JSON string:', jsonString);
    
    // Parse but handle any undefined that might appear in the JSON
    let pureData = JSON.parse(jsonString, (key, value) => {
      if (value === undefined) {
        console.log(`📊 ONBOARDING STEP: Found undefined value for key ${key}, replacing with null`);
        return null;
      }
      return value;
    });
    
    // Extra safety: explicitly check and remove the 'name' property
    if ('name' in pureData) {
      console.error('⚠️ WARNING: name field still exists after sanitization!');
      delete pureData.name;
    }
    
    console.log('📊 ONBOARDING STEP: Final data to write:', JSON.stringify(pureData));
    
    // Use set instead of setDoc to completely replace any existing document
    // This is more reliable than using merge when dealing with problematic fields
    await setDoc(doc(db, "users", userId), pureData);
    
    console.log('✅ ONBOARDING COMPLETE: Successfully saved user preferences');
  } catch (error) {
    console.error("❌ ERROR SAVING PREFERENCES:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error; 
  }
};

export const getUserPreferences = async (
  userId: string
): Promise<UserPreferences | null> => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const userData = docSnap.data();
      // Return only the fields defined in the UserPreferences interface
      // Ensure fields not present in userData default gracefully (e.g., to empty arrays or false)
      return {
          goals: userData.goals || [],
          dietaryPreferences: userData.dietaryPreferences || [],
          cuisinePreferences: userData.cuisinePreferences || [],
          mealHabits: userData.mealHabits || [],
          hasCompletedOnboarding: userData.onboardingCompleted || false // Map from onboardingCompleted field
      } as UserPreferences; // Cast necessary if TS can't infer perfectly
    } else {
      console.log(`No user preferences found for user ${userId}`);
      return null;
    }
  } catch (error) {
    console.error("Error getting user preferences:", error);
    throw error;
  }
};

// Get recipes based on user preferences
export const getRecommendedRecipes = async (userId: string) => {
  try {
    const userPrefs = await getUserPreferences(userId);
    
    if (!userPrefs) return [];
    
    // Query recipes that match user's dietary preferences
    const q = query(
      collection(db, 'recipes'),
      // Add appropriate filters based on preferences
      // This is a simplified example - you would add more complex filtering
      where('dietaryTags', 'array-contains-any', userPrefs.dietaryPreferences)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting recommended recipes:", error);
    throw error;
  }
};

// Auth state listener
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void): (() => void) => {
  return onAuthStateChanged(auth, callback);
}; 