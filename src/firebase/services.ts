import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from './config';

// Define user preferences type
export interface UserPreferences {
  dietaryPreferences: string[];
  cuisinePreferences: string[];
  skillLevel: string;
  allergies?: string[];
  servingSize?: number;
  cookingTime?: number;
  hasCompletedOnboarding?: boolean;
}

interface AuthResult {
  user: FirebaseUser;
  isNewUser: boolean;
}

// Authentication functions
export const signInWithGoogle = async (): Promise<AuthResult> => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  
  // Check if this is a new user by querying Firestore
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);
  
  const isNewUser = !userDoc.exists();
  
  // Save user info to Firestore
  if (isNewUser) {
    await setDoc(userDocRef, {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      onboardingCompleted: false
    });
  } else {
    // Update last login time
    await updateDoc(userDocRef, {
      lastLogin: serverTimestamp()
    });
  }
  
  return { user, isNewUser };
};

export const logOut = async () => {
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

// User preferences functions
export const saveUserPreferences = async (
  userId: string, 
  preferences: UserPreferences
): Promise<void> => {
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, {
    preferences,
    onboardingCompleted: true,
    updatedAt: serverTimestamp()
  });
};

export const getUserPreferences = async (
  userId: string
): Promise<UserPreferences | null> => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserPreferences;
    } else {
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