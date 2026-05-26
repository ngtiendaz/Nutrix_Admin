import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  type Firestore,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  type FirebaseStorage,
} from 'firebase/storage';
import type { DocumentData } from 'firebase/firestore';
import type { Food } from '../models/Food';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export function isFirebaseConfigured(): boolean {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId);
}

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

if (isFirebaseConfigured()) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map((e: string) => e.trim()).filter(Boolean);

export function isAdminEmail(email: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email);
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export function login(email: string, password: string) {
  if (!auth) throw new Error('Firebase chưa được cấu hình.');
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  if (!auth) throw new Error('Firebase chưa được cấu hình.');
  return signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
  return auth?.currentUser ?? null;
}

// ─── Storage ────────────────────────────────────────────────────────────────

export async function uploadImage(file: File, path: string): Promise<string> {
  if (!storage) throw new Error('Firebase Storage chưa được cấu hình.');
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

// ─── Firestore: Foods ───────────────────────────────────────────────────────

export async function fetchFoods(): Promise<Food[]> {
  if (!db) throw new Error('Firebase chưa được cấu hình.');
  const foodsQuery = query(collection(db, 'foods'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(foodsQuery);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Food));
}

export async function addFood(data: Omit<Food, 'id'>) {
  if (!db) throw new Error('Firebase chưa được cấu hình.');
  const docRef = doc(collection(db, 'foods'));
  await setDoc(docRef, { ...data, id: docRef.id });
  return docRef;
}

export async function updateFood(foodId: string, data: Partial<Food>) {
  if (!db) throw new Error('Firebase chưa được cấu hình.');
  return updateDoc(doc(db, 'foods', foodId), data);
}

export async function deleteFood(foodId: string) {
  if (!db) throw new Error('Firebase chưa được cấu hình.');
  return deleteDoc(doc(db, 'foods', foodId));
}

// ─── Firestore: Users ────────────────────────────────────────────────────────

export async function fetchUsers(): Promise<DocumentData[]> {
  if (!db) throw new Error('Firebase chưa được cấu hình.');
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fetchUserById(userId: string): Promise<DocumentData | null> {
  if (!db) throw new Error('Firebase chưa được cấu hình.');
  const snap = await getDoc(doc(db, 'users', userId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ─── Firestore: User Sub-collections ────────────────────────────────────────

export async function fetchUserMeals(userId: string): Promise<DocumentData[]> {
  if (!db) throw new Error('Firebase chưa được cấu hình.');
  const snapshot = await getDocs(collection(db, 'users', userId, 'meals'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fetchUserPlan(userId: string): Promise<DocumentData | null> {
  if (!db) throw new Error('Firebase chưa được cấu hình.');
  const snap = await getDoc(doc(db, 'users', userId, 'plans', 'current_plan'));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function fetchUserActivities(userId: string): Promise<DocumentData[]> {
  if (!db) throw new Error('Firebase chưa được cấu hình.');
  const snapshot = await getDocs(collection(db, 'users', userId, 'userActivities'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fetchUserDailySummaries(userId: string): Promise<DocumentData[]> {
  if (!db) throw new Error('Firebase chưa được cấu hình.');
  const snapshot = await getDocs(collection(db, 'users', userId, 'daily_summaries'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fetchUserHistoryPlans(userId: string): Promise<DocumentData[]> {
  if (!db) throw new Error('Firebase chưa được cấu hình.');
  const snapshot = await getDocs(collection(db, 'users', userId, 'history_plans'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}


// ─── Firestore: Global Activities ───────────────────────────────────────────

export async function fetchActivities(): Promise<DocumentData[]> {
  if (!db) throw new Error('Firebase chưa được cấu hình.');
  const snapshot = await getDocs(collection(db, 'activities'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addActivity(data: { name: string; metValue: number; icon: string }) {
  if (!db) throw new Error('Firebase chưa được cấu hình.');
  const docRef = doc(collection(db, 'activities'));
  await setDoc(docRef, { ...data, id: docRef.id });
  return docRef;
}

export async function updateActivity(activityId: string, data: { name: string; metValue: number; icon: string }) {
  if (!db) throw new Error('Firebase chưa được cấu hình.');
  return updateDoc(doc(db, 'activities', activityId), data);
}

export async function deleteActivity(activityId: string) {
  if (!db) throw new Error('Firebase chưa được cấu hình.');
  return deleteDoc(doc(db, 'activities', activityId));
}

export { auth, db };
