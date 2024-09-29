import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { findUserById } from '../firebase';
import type { User } from '../types.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logOut: async () => {},
});

export const useUserAuth = () => useContext(AuthContext);

const UserAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      async (authUser: FirebaseUser | null) => {
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
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default UserAuthProvider;
