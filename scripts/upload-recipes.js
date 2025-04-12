/**
 * Script for batch uploading recipes from a JSON file to Firestore.
 * This script reads a JSON file containing recipes and uploads them to Firestore.
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// Initialize Firebase Admin with service account
function initializeFirebase() {
  const serviceAccount = require(path.join(process.env.HOME, 'Downloads', 'kyabananahai-173eb-firebase-adminsdk-fbsvc-f7fee5b10f.json'));
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  return admin.firestore();
}

// Read recipes from JSON file
function readRecipesFromFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading recipes file: ${error.message}`);
    return [];
  }
}

// Validate recipe data
function validateRecipe(recipe) {
  const requiredFields = ['title', 'ingredients', 'steps', 'day', 'mealTime'];
  const missingFields = [];
  
  for (const field of requiredFields) {
    if (!recipe[field]) {
      missingFields.push(field);
    }
  }
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missingFields.join(', ')}`
    };
  }
  
  // Validate ingredients and steps are non-empty arrays
  if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
    return {
      valid: false,
      error: 'Ingredients must be a non-empty array'
    };
  }
  
  if (!Array.isArray(recipe.steps) || recipe.steps.length === 0) {
    return {
      valid: false,
      error: 'Steps must be a non-empty array'
    };
  }
  
  // Clean up the title by removing newlines and trimming whitespace
  if (recipe.title) {
    recipe.title = recipe.title.replace(/\n/g, ' ').trim();
  }
  
  return { valid: true };
}

// Upload recipes to Firestore
const uploadRecipes = async (db, recipes) => {
  console.log(`Starting upload of ${recipes.length} recipes...`);
  
  const stats = {
    success: 0,
    skipped: 0,
    updated: 0,
    failed: 0,
    errors: []
  };
  
  // Check if force update is enabled (default to false)
  const forceUpdate = process.argv[3] === '--update' || process.argv[3] === '--force';
  if (forceUpdate) {
    console.log('Update mode enabled: Will replace existing recipes');
  }
  
  const recipesCollection = db.collection('recipes');
  
  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i];
    
    // Clean up text fields (remove newlines and excess whitespace)
    if (recipe.title) {
      recipe.title = recipe.title.replace(/\n/g, ' ').trim();
    }
    if (recipe.nutritionalBenefits) {
      recipe.nutritionalBenefits = recipe.nutritionalBenefits.replace(/\n/g, ' ').trim();
    }
    
    // Clean up steps array
    if (recipe.steps && Array.isArray(recipe.steps)) {
      recipe.steps = recipe.steps.map(step => step.replace(/\n/g, ' ').trim());
    }
    
    console.log(`Processing recipe ${i+1}/${recipes.length}: ${recipe.title}`);
    
    // Validate recipe
    const validation = validateRecipe(recipe);
    if (!validation.valid) {
      console.error(`Validation failed for recipe "${recipe.title}": ${validation.error}`);
      stats.failed++;
      stats.errors.push(`Recipe "${recipe.title}": ${validation.error}`);
      continue;
    }
    
    try {
      // Check if recipe already exists
      const query = await recipesCollection
        .where('day', '==', recipe.day)
        .where('mealTime', '==', recipe.mealTime)
        .where('title', '==', recipe.title)
        .get();
      
      if (!query.empty) {
        if (forceUpdate) {
          // Update existing recipe
          const docId = query.docs[0].id;
          await recipesCollection.doc(docId).update({
            ...recipe,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log(`Updated existing recipe: ${recipe.title}`);
          stats.updated++;
        } else {
          console.log(`Recipe "${recipe.title}" for ${recipe.day} ${recipe.mealTime} already exists. Skipping.`);
          stats.skipped++;
          continue;
        }
      } else {
        // Add new recipe
        await recipesCollection.add({
          ...recipe,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Successfully uploaded recipe: ${recipe.title}`);
        stats.success++;
      }
    } catch (error) {
      console.error(`Failed to process recipe: ${recipe.title}`, error);
      stats.failed++;
      stats.errors.push(`Recipe "${recipe.title}": ${error.message}`);
    }
  }
  
  return stats;
};

// Main function
const main = async () => {
  try {
    // Initialize Firebase
    const db = initializeFirebase();
    console.log('Firebase initialized successfully');
    
    // Read recipes from file
    const recipesFilePath = process.argv[2] || path.join(__dirname, 'recipes.json');
    console.log(`Reading recipes from: ${recipesFilePath}`);
    const recipes = await readRecipesFromFile(recipesFilePath);
    console.log(`Found ${recipes.length} recipes`);
    
    // Upload recipes
    const stats = await uploadRecipes(db, recipes);
    
    console.log('\n--- Upload Summary ---');
    console.log(`Total recipes processed: ${recipes.length}`);
    console.log(`Successfully uploaded: ${stats.success}`);
    console.log(`Updated: ${stats.updated}`);
    console.log(`Skipped (already exist): ${stats.skipped}`);
    console.log(`Failed: ${stats.failed}`);
    
    if (stats.errors.length > 0) {
      console.log('\nErrors:');
      stats.errors.forEach(error => console.log(`- ${error}`));
    }
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

// Run the script
main(); 