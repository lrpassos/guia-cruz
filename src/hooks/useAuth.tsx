import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        const userDoc = await getDoc(doc(db, 'users', fUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          const newUser: User = {
            uid: fUser.uid,
            name: fUser.displayName || '',
            email: fUser.email || '',
            role: 'user'
          };
          await setDoc(doc(db, 'users', fUser.uid), newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Use custom parameters to force account selection if needed
      provider.setCustomParameters({ prompt: 'select_account' });
      
      console.log('Starting Google Login...');
      const result = await signInWithPopup(auth, provider);
      console.log('Login successful:', result.user.email);
    } catch (error: any) {
      console.error('Detailed Login Error:', error);
      
      if (error.code === 'auth/popup-blocked') {
        alert('O popup de login foi bloqueado pelo seu navegador. Por favor, permita popups para este site.');
      } else if (error.code === 'auth/unauthorized-domain') {
        alert('Este domínio não está autorizado no Console do Firebase. Adicione ' + window.location.hostname + ' aos domínios autorizados.');
      } else {
        alert('Erro ao entrar com Google: ' + (error.message || 'Erro desconhecido'));
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isAdmin = user?.role === 'admin' || user?.email === 'luiz.rogerios@gmail.com';

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
