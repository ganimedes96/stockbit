// Em src/lib/firebase/admin.ts

import admin, { ServiceAccount } from "firebase-admin";
import { getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Suas credenciais, como já estavam
const serviceAccount: ServiceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // IMPORTANTE: Garante que as quebras de linha na variável de ambiente sejam interpretadas corretamente
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
};

// Padrão Singleton para garantir uma única instância
// Se não houver apps inicializados, inicializa um.
if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });

  // APLICA AS CONFIGURAÇÕES AQUI, LOGO APÓS A INICIALIZAÇÃO
  // E DENTRO DO BLOCO QUE SÓ RODA UMA VEZ.
  getFirestore().settings({ ignoreUndefinedProperties: true });
  console.log("Firebase Admin initialized and settings applied.");
}

// Exporta as instâncias já prontas para serem usadas em qualquer lugar.
const db = getFirestore();
const storage = getStorage().bucket();
const auth = admin.auth();
const firestore = admin.firestore;
 // Exportando o namespace para Timestamps

export { db, storage, auth, firestore };