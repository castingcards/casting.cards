// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Extract the secrets from the local environment vars.
// You should populate .env.local with your own secrets.
const {
  REACT_APP_FIREBASE_API_KEY: apiKey,
  REACT_APP_FIREBASE_AUTH_DOMAIN: authDomain,
  REACT_APP_FIREBASE_DATABASE_URL: databaseURL,
  REACT_APP_FIREBASE_PROJECT_ID: projectId,
  REACT_APP_FIREBASE_STORAGE_BUCKET: storageBucket,
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID: messagingSenderId,
  REACT_APP_FIREBASE_APP_ID: appId,
  REACT_APP_FIREBASE_MEASUREMENT_ID: measurementId,
} = process.env;

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey,
  authDomain,
  databaseURL,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Setup the Google Provider
const auth = getAuth();
const loginProvider = new GoogleAuthProvider();
loginProvider.setCustomParameters({
  prompt: "select_account"
});

// Create a function to handle Google sign in
export const signInWithGoogle = async () => {
  try {
    const result: any = await signInWithPopup(auth, loginProvider);
    return result.user;
  } catch (error: any) {
    console.log("ERROR!!!", error);
  }
};

