import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  signOut,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { findUserById } from '../firebase';
import type { User } from '../types.ts';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  logOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<FirebaseUser>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  logOut: async () => {},
  signUp: async () => ({} as FirebaseUser),
  updateUser: () => {},
});

export const useUserAuth = () => useContext(AuthContext);

const UserAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      async (authUser: FirebaseUser | null) => {
        setFirebaseUser(authUser);
        if (authUser) {
          try {
            const userFirestore = await findUserById(authUser.uid);
            if (userFirestore) {
              setUser(userFirestore);
              console.log('user認證資料', userFirestore);
            } else {
              console.log('未找到用戶數據');
              setUser(null);
            }
          } catch (error) {
            console.error('獲取用戶數據時出錯:', error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const logOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const signUp = async (
    email: string,
    password: string
  ): Promise<FirebaseUser> => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    setFirebaseUser(userCredential.user);
    return userCredential.user;
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(
      (prevUser) =>
        ({
          ...prevUser,
          ...userData,
        } as User)
    );
  };

  return (
    <AuthContext.Provider
      value={{ user, firebaseUser, loading, logOut, signUp, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default UserAuthProvider;
