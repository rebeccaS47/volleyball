import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { SyncLoader } from 'react-spinners';
import styled from 'styled-components';
import { useUserAuth } from '../context/userAuthContext';

const ProtectedRoutes: React.FC = () => {
  const { user, loading } = useUserAuth();

  if (loading) {
    return (
      <LoadingContainer>
        <SyncLoader
          margin={10}
          size={20}
          speedMultiplier={0.8}
          color="var(--color-secondary)"
        />
      </LoadingContainer>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoutes;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.9);
`;
