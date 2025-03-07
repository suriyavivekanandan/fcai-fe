import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Signup from './pages/Signup';
import OTPVerification from './pages/OtpVerification';
import Login from './pages/Login';
import InitialEntry from './pages/InitialEntry';
import RemainingEntry from './pages/RemainingEntry';
import DataView from './pages/DataView';
import FoodAnalysis from './pages/FoodAnalysis';
import Bookings from './pages/Bookings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/otp-verification" element={<OTPVerification />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/initial-entry" element={<InitialEntry />} />
            <Route path="/remaining-entry" element={<RemainingEntry />} />
            <Route path="/data-view" element={<DataView />} />
            <Route path="/food-analysis" element={<FoodAnalysis />} />
            <Route path="/bookings" element={<Bookings />} />
          </Route>

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
