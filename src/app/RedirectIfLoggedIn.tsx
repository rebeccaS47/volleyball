import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserAuth } from '../context/userAuthContext';

interface RedirectIfLoggedInProps {
  children: ReactNode;
}

const RedirectIfLoggedIn: React.FC<RedirectIfLoggedInProps> = ({
  children,
}) => {
  const { user } = useUserAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RedirectIfLoggedIn;
