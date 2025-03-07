import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react'; // Import logout icon

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const hideNavbarRoutes = ['/login', '/signup', '/otp-verification'];

  if (hideNavbarRoutes.includes(location.pathname)) return null;

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to home after logout
  };

  return (
    <nav className="bg-green-600 p-4 shadow-md text-white flex justify-between">
      <div className="text-2xl font-bold">Food Waste Management</div>
      <div className="flex items-center">
        <Link to="/" className="px-4">Home</Link>
        {!isAuthenticated ? (
          <Link to="/login" className="px-4">Login</Link>
        ) : (
          <>
            <Link to="/initial-entry" className="px-4">Initial Entry</Link>
            <Link to="/remaining-entry" className="px-4">Remaining Entry</Link>
            <Link to="/data-view" className="px-4">Data View</Link>
            <Link to="/food-analysis" className="px-4">Food Analysis</Link>
            <Link to="/bookings" className="px-4">Bookings</Link>
            <button 
              onClick={handleLogout} 
              className="ml-4 p-2 bg-red-500 rounded-full hover:bg-red-600 transition duration-200"
            >
              <LogOut className="h-5 w-5 text-white" /> {/* Logout icon */}
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
