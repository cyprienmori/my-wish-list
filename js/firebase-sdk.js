// Chargement de Firebase (base de données + identification).
// Ce fichier n'a normalement jamais besoin d'être modifié.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, setPersistence, browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, collection, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot,
  writeBatch, runTransaction
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

export const configured = !String(firebaseConfig.apiKey).includes("A_REMPLACER");

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(() => {});

let firestore;
try {
  // Cache local : le site reste consultable et les modifications sont
  // conservées pendant une coupure de connexion.
  firestore = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
  });
} catch (e) {
  firestore = initializeFirestore(app, {});
}
export const db = firestore;

export {
  onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  doc, collection, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, writeBatch, runTransaction
};
