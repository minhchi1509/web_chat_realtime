import { FirebaseOptions, getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';
import { getStorage } from 'firebase/storage';

import { env } from 'src/configs/env.config';

const firebaseConfig: FirebaseOptions = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

export const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const firebaseAuth = getAuth(firebaseApp);
const firebaseDb = getFirestore(firebaseApp);
const firebaseStorage = getStorage(firebaseApp);
const getFirebaseMessaging = async () => {
  const isBrowserSupported = await isSupported();
  return isBrowserSupported ? getMessaging(firebaseApp) : null;
};

export { firebaseAuth, firebaseDb, firebaseStorage, getFirebaseMessaging };
