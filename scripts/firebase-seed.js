/**
 * This script seeds the Firestore database with sample recipe data.
 * It uses the Firebase service account key for authentication.
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Path to your downloaded service account key
const keyPath = path.resolve(process.env.HOME, 'Downloads', 'kyabananahai-173eb-firebase-adminsdk-fbsvc-f7fee5b10f.json');

// Initialize Firebase Admin with service account
if (fs.existsSync(keyPath)) {
  const serviceAccount = require(keyPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'kyabananahai-173eb'
  });
} else {
  console.error(`Service account key not found at ${keyPath}`);
  console.error('Please make sure you have downloaded the key and it\'s in the Downloads folder');
  process.exit(1);
}

const db = admin.firestore();

// Sample recipe data
const recipes = [
  // Monday Recipes
  {
    title: 'Masala Dosa',
    day: 'Monday',
    mealTime: 'breakfast',
    ingredients: [
      '2 cups rice',
      '1 cup urad dal',
      '1/2 tsp fenugreek seeds',
      'Salt to taste',
      'Oil for cooking'
    ],
    steps: [
      'Soak rice, urad dal, and fenugreek seeds separately for 4-6 hours',
      'Grind them to a smooth batter and ferment overnight',
      'Heat a pan, pour a ladleful of batter and spread in a circular motion',
      'Drizzle oil around the edges and cook until golden brown',
      'Serve hot with coconut chutney and sambar'
    ],
    nutritionalBenefits: 'Rich in carbohydrates and proteins. The fermentation process increases bioavailability of nutrients and aids digestion.'
  },
  {
    title: 'Paneer Butter Masala',
    day: 'Monday',
    mealTime: 'lunch',
    ingredients: [
      '250g paneer, cubed',
      '2 tbsp butter',
      '1 large onion, finely chopped',
      '2 tomatoes, pureed',
      '1 tbsp ginger-garlic paste',
      '1 tsp garam masala',
      '1 tsp red chili powder',
      '1/2 cup cream',
      'Salt to taste'
    ],
    steps: [
      'Heat butter in a pan. Add chopped onions and sauté till golden brown',
      'Add ginger-garlic paste and cook for 1 minute',
      'Add tomato puree, salt, red chili powder, and garam masala. Cook for 5 minutes',
      'Add paneer cubes and simmer for 2-3 minutes',
      'Pour cream, mix well, and cook for another minute',
      'Garnish with coriander leaves and serve hot with naan or rice'
    ],
    nutritionalBenefits: 'Rich in protein from paneer, calcium for bone health, and antioxidants from the spices. A balanced meal that provides sustained energy.'
  },
  {
    title: 'Dal Tadka',
    day: 'Monday',
    mealTime: 'dinner',
    ingredients: [
      '1 cup yellow moong dal',
      '1 onion, finely chopped',
      '1 tomato, chopped',
      '1 green chili, slit',
      '1 tsp cumin seeds',
      '1/2 tsp turmeric powder',
      '1 tbsp ghee',
      'Salt to taste',
      'Fresh coriander for garnish'
    ],
    steps: [
      'Wash and soak moong dal for 30 minutes',
      'Pressure cook the dal with turmeric and salt until soft',
      'In a separate pan, heat ghee and add cumin seeds',
      'Add chopped onions and sauté until golden brown',
      'Add green chili, tomatoes and cook until tomatoes soften',
      'Pour this tempering over the cooked dal',
      'Garnish with fresh coriander and serve with rice or roti'
    ],
    nutritionalBenefits: 'High in protein and fiber. Moong dal is easily digestible and provides essential amino acids. The spices aid digestion and have anti-inflammatory properties.'
  },
  
  // Monday Alternates
  {
    title: 'Poha',
    day: 'Monday',
    mealTime: 'breakfast',
    ingredients: [
      '2 cups flattened rice (poha)',
      '1 onion, finely chopped',
      '1 potato, diced',
      '1 green chili, chopped',
      '1/2 tsp mustard seeds',
      '1/4 tsp turmeric powder',
      '1 tbsp oil',
      'Salt to taste',
      'Fresh coriander and lemon juice for garnish'
    ],
    steps: [
      'Rinse the poha in water and set aside',
      'Heat oil in a pan and add mustard seeds',
      'Add onions, potatoes, and green chilies. Sauté until potatoes are cooked',
      'Add turmeric powder and salt',
      'Add the rinsed poha and mix well',
      'Cook for 2-3 minutes',
      'Garnish with fresh coriander and lemon juice before serving'
    ],
    nutritionalBenefits: 'Light and easily digestible breakfast. Rich in carbohydrates for instant energy. Low in fat when prepared with minimal oil.'
  },
  {
    title: 'Rajma Chawal',
    day: 'Monday',
    mealTime: 'lunch',
    ingredients: [
      '1 cup kidney beans (rajma), soaked overnight',
      '1 onion, finely chopped',
      '2 tomatoes, pureed',
      '1 tbsp ginger-garlic paste',
      '1 tsp cumin powder',
      '1 tsp coriander powder',
      '1/2 tsp garam masala',
      '2 tbsp oil',
      'Salt to taste',
      '2 cups cooked rice'
    ],
    steps: [
      'Pressure cook the soaked rajma until soft',
      'In a separate pan, heat oil and add chopped onions',
      'Sauté until golden brown and add ginger-garlic paste',
      'Add tomato puree and cook until oil separates',
      'Add all spices and salt, cook for 2-3 minutes',
      'Add the cooked rajma and simmer for 10-15 minutes',
      'Serve hot with steamed rice'
    ],
    nutritionalBenefits: 'Excellent source of plant-based protein and dietary fiber. The combination of rajma and rice provides all essential amino acids. Rich in iron and folate.'
  },
  
  // Tuesday Recipes
  {
    title: 'Idli Sambar',
    day: 'Tuesday',
    mealTime: 'breakfast',
    ingredients: [
      '2 cups idli rice',
      '1 cup urad dal',
      'Salt to taste',
      'For sambar: Toor dal, vegetables, tamarind, sambar powder'
    ],
    steps: [
      'Soak rice and dal separately for 4-6 hours',
      'Grind to a smooth batter and ferment overnight',
      'Pour batter into idli molds and steam for 10-12 minutes',
      'Prepare sambar by cooking toor dal with vegetables and spices',
      'Serve hot idlis with sambar and coconut chutney'
    ],
    nutritionalBenefits: 'Fermented foods are excellent for gut health. Idlis are steamed, making them low in fat and calories. The sambar adds protein and nutrients from various vegetables.'
  },
  {
    title: 'Chole Bhature',
    day: 'Tuesday',
    mealTime: 'lunch',
    ingredients: [
      '2 cups chickpeas, soaked overnight',
      'For bhature: 2 cups maida, yogurt, oil',
      'Spices: cumin, coriander, garam masala',
      'Onions, tomatoes, ginger-garlic paste'
    ],
    steps: [
      'Pressure cook chickpeas with salt until soft',
      'Prepare masala with onions, tomatoes, and spices',
      'Mix chickpeas with the masala and simmer',
      'For bhature, knead dough with maida, yogurt, and let it rest',
      'Roll out the dough and deep fry until golden and puffy',
      'Serve hot chole with bhature'
    ],
    nutritionalBenefits: 'Chickpeas are rich in protein, fiber, and complex carbohydrates. They help regulate blood sugar levels and support digestive health.'
  }
];

// Add recipes to Firestore
async function seedFirestore() {
  try {
    console.log('Starting Firestore seed process...');
    
    // Create a batch write operation
    const batch = db.batch();
    
    // Add each recipe to the batch
    for (const recipe of recipes) {
      const docRef = db.collection('recipes').doc(); // Auto-generate ID
      batch.set(docRef, recipe);
      console.log(`Added recipe: ${recipe.title}`);
    }
    
    // Commit the batch
    await batch.commit();
    
    console.log('Firestore seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding Firestore:', error);
  } finally {
    process.exit(0);
  }
}

// Run the seed function
seedFirestore(); 