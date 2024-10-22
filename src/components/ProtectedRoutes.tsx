import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { SyncLoader } from 'react-spinners';
import { useUserAuth } from '../context/userAuthContext';

interface ProtectedRoutesProps {}

const ProtectedRoutes: React.FC<ProtectedRoutesProps> = () => {
  const { user, loading } = useUserAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
          position: 'fixed',
          top: 0,
          left: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        }}
      >
        <SyncLoader
          margin={10}
          size={20}
          speedMultiplier={0.8}
          color="var(--color-secondary)"
        />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoutes;
