// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, collection, doc, connectFirestoreEmulator } from "firebase/firestore";


import type {QueryDocumentSnapshot, SnapshotOptions, DocumentData} from "firebase/firestore";

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
export const app = initializeApp(firebaseConfig);

// Setup the Auth provider
export const auth = getAuth();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// TODO(miguel): wire this up with an env var to tell if we are in dev or prod
// eslint-disable-next-line no-restricted-globals
if (location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099")
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}

class Factory {
    create<T>(type: (new (...args : any[]) => T)): T {
        return new type();
    }
}

const factory = new Factory();

export function converter<T>(type: (new (...args : any[]) => T)) {
  return {
    toFirestore(data: T): DocumentData {
      return JSON.parse(JSON.stringify(data)) as DocumentData;
    },
    fromFirestore(snap: QueryDocumentSnapshot, options: SnapshotOptions): T {
      const result: T = factory.create(type);
      const data = snap.data(options) as any;
      return Object.assign(result as any, data);
    },
  };
}

export function typedCollection<T>(collectionPath: string, type: (new (...args : any[]) => T)) {
  return collection(db, collectionPath).withConverter(converter<T>(type));
}

export function typedDoc<T>(collectionPath: string, type: (new (...args : any[]) => T)) {
  const closedConverter = converter<T>(type);
  return (docPath: string) => doc(db, collectionPath, docPath).withConverter(closedConverter);
}