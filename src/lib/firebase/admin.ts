import 'server-only';

import { cert, getApps, initializeApp, type App, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

type ClaveEnvPrivada =
  | 'FIREBASE_PROJECT_ID'
  | 'FIREBASE_CLIENT_EMAIL'
  | 'FIREBASE_PRIVATE_KEY'
  | 'FIREBASE_STORAGE_BUCKET';

function obtenerEnvPrivada(clave: ClaveEnvPrivada): string {
  const valor = process.env[clave];
  if (!valor) {
    throw new Error(`[Firebase Admin] Falta variable de entorno privada: ${clave}`);
  }

  return valor;
}

const nombreAppAdmin = 'inmobiliario-admin';
let appAdminMemo: App | null = null;

function obtenerAppAdmin(): App {
  if (appAdminMemo) {
    return appAdminMemo;
  }

  const appExistente = getApps().find((app) => app.name === nombreAppAdmin);
  if (appExistente) {
    appAdminMemo = appExistente;
    return appExistente;
  }

  const credenciales: ServiceAccount = {
    projectId: obtenerEnvPrivada('FIREBASE_PROJECT_ID'),
    clientEmail: obtenerEnvPrivada('FIREBASE_CLIENT_EMAIL'),
    privateKey: obtenerEnvPrivada('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
  };

  appAdminMemo = initializeApp(
    {
      credential: cert(credenciales),
      storageBucket: obtenerEnvPrivada('FIREBASE_STORAGE_BUCKET'),
    },
    nombreAppAdmin,
  );

  return appAdminMemo;
}

export function obtenerAdminDb() {
  return getFirestore(obtenerAppAdmin());
}

export function obtenerAdminStorage() {
  return getStorage(obtenerAppAdmin());
}
