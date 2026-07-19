import { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updatePassword,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { getMe, registerProfile } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // Firebase user
  const [dbUser, setDbUser]   = useState(null);   // MongoDB profile (has role, branch, etc.)
  const [loading, setLoading] = useState(true);
  // Track the current Firebase UID so we don't apply a stale response
  const currentUidRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Reset loading at START of every auth change — prevents dashboard
      // from rendering before dbUser is fetched from MongoDB
      setLoading(true);
      setDbUser(null);
      setUser(firebaseUser);
      currentUidRef.current = firebaseUser?.uid || null;

      if (firebaseUser) {
        try {
          const { data } = await getMe();
          if (currentUidRef.current === firebaseUser.uid) {
            setDbUser(data);
          }
        } catch (err) {
          console.warn('[AuthContext] getMe failed:', err.response?.data?.message || err.message);
          setDbUser(null);
        }
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const register = async ({ name, enrollmentNo, email, branch, semester, password }) => {
    let credential;

    try {
      // Step 1: Try to create a new Firebase account
      credential = await createUserWithEmailAndPassword(auth, email, password);
    } catch (firebaseErr) {
      if (firebaseErr.code === 'auth/email-already-in-use') {
        // Firebase account exists but MongoDB profile may be missing (orphaned state).
        // Sign in with the provided credentials to get a valid token, then upsert the profile.
        credential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Re-throw any other Firebase errors (weak password, invalid email, etc.)
        throw firebaseErr;
      }
    }

    // Step 2: Upsert MongoDB profile (backend is idempotent — safe to call even if profile exists)
    const { data } = await registerProfile({ name, enrollmentNo, email, branch, semester });
    setDbUser(data.user);
    return credential;
  };

  const logout = async () => {
    // Clear state immediately — don't wait for onAuthStateChanged
    currentUidRef.current = null;
    setUser(null);
    setDbUser(null);
    await signOut(auth);
  };

  const changePassword = (newPassword) => {
    if (!user) throw new Error('Not authenticated.');
    return updatePassword(user, newPassword);
  };

  const refreshProfile = async () => {
    if (auth.currentUser) {
      const { data } = await getMe();
      setDbUser(data);
    }
  };

  const role = dbUser?.role || null;

  return (
    <AuthContext.Provider
      value={{ user, dbUser, role, loading, login, register, logout, changePassword, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
