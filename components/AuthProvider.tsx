'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { 
  User, 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  walletBalance: number;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  walletBalance: 0,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [pendingProfile, setPendingProfile] = useState<{name: string, phone: string} | null>(null);

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (currUser) => {
      if (currUser) {
        if (active) setUser(currUser);
        
        // Ensure user doc exists
        const userRef = doc(db, 'users', currUser.uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
          await setDoc(userRef, {
            email: currUser.email,
            name: pendingProfile?.name || 'User',
            phone: pendingProfile?.phone || '',
            walletBalance: 10000, // Sign up bonus
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
          setPendingProfile(null);
        }
      } else {
        if (active) setUser(null);
      }
      if (active) setLoading(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [pendingProfile]);

  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const unsub = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setWalletBalance(docSnap.data().walletBalance || 0);
        }
      });
      return () => unsub();
    }
  }, [user]);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const register = async (email: string, pass: string, name: string, phone: string) => {
    setPendingProfile({ name, phone });
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName: name });
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, walletBalance: user ? walletBalance : 0, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
