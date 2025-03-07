import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Function to check if user is authenticated
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

function ProtectedRoute() {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
