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
      // ── Always clear stale data immediately on auth change ──────────────────
      setDbUser(null);
      setUser(firebaseUser);
      currentUidRef.current = firebaseUser?.uid || null;

      if (firebaseUser) {
        try {
          const { data } = await getMe();
          // Only apply if the Firebase user hasn't changed while we were fetching
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
    // Step 1: Create Firebase account
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    // Step 2: Create MongoDB profile
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
