import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User, SubscriptionPlan } from '../types';

/**
 * Create a new user with email and password
 */
export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  // Create Firebase auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  // Update display name
  await updateProfile(firebaseUser, { displayName });

  // Create user document in Firestore
  const user: User = {
    uid: firebaseUser.uid,
    email: firebaseUser.email!,
    displayName,
    photoURL: null,
    plan: 'free',
    defaultWorkspaceId: null,
    createdAt: new Date(),
  };

  await setDoc(doc(db, 'users', firebaseUser.uid), {
    ...user,
    createdAt: serverTimestamp(),
  });

  return user;
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return await getUserData(userCredential.user.uid);
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account',
  });

  const userCredential = await signInWithPopup(auth, provider);
  const firebaseUser = userCredential.user;

  // Check if user document exists
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

  if (!userDoc.exists()) {
    // Create new user document
    const user: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      plan: 'free',
      defaultWorkspaceId: null,
      createdAt: new Date(),
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...user,
      createdAt: serverTimestamp(),
    });

    return user;
  }

  return await getUserData(firebaseUser.uid);
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Get user data from Firestore
 */
export async function getUserData(uid: string): Promise<User> {
  const userDoc = await getDoc(doc(db, 'users', uid));

  if (!userDoc.exists()) {
    throw new Error('User document not found');
  }

  const data = userDoc.data();
  return {
    uid,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    plan: data.plan,
    defaultWorkspaceId: data.defaultWorkspaceId,
    stripeCustomerId: data.stripeCustomerId,
    createdAt: data.createdAt?.toDate() || new Date(),
  };
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  uid: string,
  data: Partial<User>
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, data);

  // Update Firebase Auth profile if display name or photo URL changed
  if (auth.currentUser && (data.displayName || data.photoURL)) {
    await updateProfile(auth.currentUser, {
      displayName: data.displayName || auth.currentUser.displayName,
      photoURL: data.photoURL || auth.currentUser.photoURL,
    });
  }
}

/**
 * Update user subscription plan
 */
export async function updateUserPlan(
  uid: string,
  plan: SubscriptionPlan
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { plan });
}

/**
 * Convert Firebase user to app user
 */
export function convertFirebaseUser(firebaseUser: FirebaseUser, userData?: User): User {
  if (userData) {
    return userData;
  }

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email!,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    plan: 'free',
    defaultWorkspaceId: null,
    createdAt: new Date(),
  };
}
