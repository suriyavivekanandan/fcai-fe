import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export function AuthProvider({ children }) {
  const [isAuthenticated, setAuthenticated] = useState(false);

  // Check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthenticated(true);
    }
  }, []);

  // Login function
  const login = (token) => {
    localStorage.setItem('token', token);
    setAuthenticated(true);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use Auth Context
export function useAuth() {
  return useContext(AuthContext);
}
