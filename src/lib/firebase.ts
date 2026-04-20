import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  runTransaction,
  serverTimestamp,
  Timestamp,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Registro } from '../types';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);

// Test connection as required by instructions
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

export async function addRegistro(data: Omit<Registro, 'id' | 'created_at'>) {
  return await runTransaction(db, async (transaction) => {
    const counterDocRef = doc(db, 'counters', 'registros');
    const counterDoc = await transaction.get(counterDocRef);
    
    let nextId = 1;
    if (counterDoc.exists()) {
      nextId = counterDoc.data().count + 1;
    }
    
    const newRegistroRef = doc(collection(db, 'registros'));
    const newRegistro: Registro = {
      ...data,
      id: nextId,
      created_at: serverTimestamp() as any, // Cast for local type compatibility
    };
    
    transaction.set(newRegistroRef, newRegistro);
    transaction.set(counterDocRef, { count: nextId }, { merge: true });
    
    return { ...newRegistro, firestoreId: newRegistroRef.id };
  });
}

export function handleFirestoreError(error: any) {
  if (error.code === 'permission-denied') {
    const user = auth.currentUser;
    const errorInfo = {
      error: error.message,
      operationType: 'write',
      path: null,
      authInfo: {
        userId: user?.uid || 'anonymous',
        email: user?.email || 'none',
        emailVerified: user?.emailVerified || false,
        isAnonymous: user?.isAnonymous || false,
        providerInfo: user?.providerData.map(p => ({
          providerId: p.providerId,
          displayName: p.displayName || '',
          email: p.email || ''
        })) || []
      }
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
}
