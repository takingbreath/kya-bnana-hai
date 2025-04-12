# Firebase Setup for Kya Bnana Hai Bhayia

This document provides instructions on how to set up Firebase for this project.

## Prerequisites

1. Node.js and npm installed
2. Firebase account (sign up at https://firebase.google.com)
3. Firebase CLI installed globally (`npm install -g firebase-tools`)

## Setup Steps

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Enable Google Analytics if desired

### 2. Register Your Web App

1. From the project overview page, click the web icon (</>) to add a web app
2. Enter a nickname for your app (e.g., "Kya Bnana Hai Bhayia")
3. Register the app
4. Copy the Firebase configuration object that shows up

### 3. Set Up Environment Variables

1. Create a `.env` file in the root of your project (or copy the `.env.example`)
2. Fill in the values from your Firebase config:

```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### 4. Set Up Firestore Database

1. In the Firebase console, navigate to "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode" or "Start in test mode" (for development)
4. Select a location for your database
5. Click "Enable"

### 5. Create Firestore Indexes

Create the following composite indexes for the `recipes` collection:

1. Fields indexed:
   - `day` (Ascending)
   - `mealTime` (Ascending)

### 6. Set Up Firebase Functions

1. Login to Firebase CLI:
```
firebase login
```

2. Initialize Firebase in your project:
```
firebase init
```

3. Select the following features:
   - Firestore
   - Functions
   - Hosting

4. Choose your Firebase project
5. Accept default options for Firestore rules and indexes
6. Choose JavaScript for Functions
7. Install dependencies when asked
8. Choose "build" as your public directory for Hosting
9. Configure as a single-page app when asked

### 7. Deploy Firebase Functions

1. Update the functions code in `functions/index.js` (this should already be done if you followed the project setup)
2. Deploy the functions:
```
firebase deploy --only functions
```

### 8. Seed Firestore with Sample Data

1. Generate a service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file to the root of your project as `serviceAccountKey.json`

2. Run the seed script:
```
node scripts/seed-firestore.js
```

### 9. Deploy the React App to Firebase Hosting

1. Build the React app:
```
npm run build
```

2. Deploy to Firebase Hosting:
```
firebase deploy --only hosting
```

3. Your app should now be live at the URL provided by Firebase!

## Troubleshooting

- If you encounter CORS issues, make sure your Firebase Functions have CORS enabled (already done in the provided code)
- If functions timeout, you might need to upgrade to the Blaze plan (pay-as-you-go)
- For local development, use Firebase emulators:
```
firebase emulators:start
```

## References

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting) 