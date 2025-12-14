import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useUser();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>Đang tải...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;