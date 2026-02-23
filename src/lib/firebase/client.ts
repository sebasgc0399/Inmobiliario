import { getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

type ClaveEnvPublica =
  | 'NEXT_PUBLIC_FIREBASE_API_KEY'
  | 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'
  | 'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  | 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'
  | 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'
  | 'NEXT_PUBLIC_FIREBASE_APP_ID';

const envPublicas: Record<ClaveEnvPublica, string | undefined> = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function obtenerEnvPublica(clave: ClaveEnvPublica): string {
  const valor = envPublicas[clave];
  if (!valor) {
    throw new Error(`[Firebase] Falta variable de entorno publica: ${clave}`);
  }

  return valor;
}

const firebaseConfig: FirebaseOptions = {
  apiKey: obtenerEnvPublica('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: obtenerEnvPublica('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: obtenerEnvPublica('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: obtenerEnvPublica('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: obtenerEnvPublica('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: obtenerEnvPublica('NEXT_PUBLIC_FIREBASE_APP_ID'),
};

export const appCliente = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(appCliente);
export const db = getFirestore(appCliente);
export const storage = getStorage(appCliente);
