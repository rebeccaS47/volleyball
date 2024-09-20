import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUserAuth } from '../context/userAuthContext';

interface ProtectedRoutesProps {}

const ProtectedRoutes: React.FC<ProtectedRoutesProps> = () => {
  const { user, loading } = useUserAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoutes;
