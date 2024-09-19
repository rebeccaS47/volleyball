import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

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
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      console.log('user認證資料', user);
      setLoading(false);
    });

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
