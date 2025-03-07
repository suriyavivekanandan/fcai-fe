import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Scale, ClipboardList, Database, Calendar, BarChart, LogOut, Info, Phone } from 'lucide-react';

function Home() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const hideNavbarRoutes = ['/login', '/signup', '/otp-verification'];
  if (hideNavbarRoutes.includes(location.pathname)) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div>
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-green-700 text-white py-4 shadow-md z-10 flex justify-between px-6">
        <h1 className="text-2xl font-bold">Food Waste Management</h1>
        <div className="flex items-center space-x-6">
          <Link to="/" className="hover:underline flex items-center"><Scale className="h-5 w-5 mr-2" />Home</Link>
          <Link to="/about" className="hover:underline flex items-center"><Info className="h-5 w-5 mr-2" />About</Link>
          <Link to="/contact" className="hover:underline flex items-center"><Phone className="h-5 w-5 mr-2" />Contact</Link>
          {isAuthenticated ? (
            <button 
              onClick={handleLogout} 
              className="flex items-center bg-red-600 px-4 py-2 rounded-full hover:bg-red-700 transition"
            >
              <LogOut className="h-5 w-5 mr-2" /> Logout
            </button>
          ) : (
            <Link to="/login" className="hover:underline">Login</Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-24 text-center bg-green-100 rounded-2xl p-12 shadow-lg mx-4">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6">Welcome to Food Waste Management</h1>
        <p className="text-xl text-gray-700 mb-6">Track, manage, and reduce food waste efficiently.</p>
        <Link to="/initial-entry" className="bg-green-600 text-white px-6 py-3 rounded-full text-lg hover:bg-green-700 transition">Get Started</Link>
      </div>

      {/* About Section */}
      <div className="mt-12 px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-800">About the Project</h2>
        <p className="mt-4 text-lg text-gray-600">
          Food Waste Management is designed to help individuals and organizations
          monitor and reduce food waste. By tracking initial and remaining food
          quantities, analyzing data, and managing redistributions, we aim to create
          a more sustainable future.
        </p>
      </div>

      {/* Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-16 px-6">
        <Link to="/initial-entry" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center">
          <Scale className="h-12 w-12 text-blue-600 mr-4" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Initial Entry</h2>
            <p className="text-gray-600">Record initial weight and details of food items.</p>
          </div>
        </Link>

        <Link to="/remaining-entry" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center">
          <ClipboardList className="h-12 w-12 text-green-600 mr-4" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Remaining Entry</h2>
            <p className="text-gray-600">Update remaining weights and track wastage.</p>
          </div>
        </Link>

        <Link to="/data-view" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center">
          <Database className="h-12 w-12 text-purple-600 mr-4" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Data View</h2>
            <p className="text-gray-600">Analyze food waste data and trends.</p>
          </div>
        </Link>

        <Link to="/food-analysis" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center">
          <BarChart className="h-12 w-12 text-orange-600 mr-4" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Food Analysis</h2>
            <p className="text-gray-600">Visualize waste patterns and get recommendations.</p>
          </div>
        </Link>

        <Link to="/bookings" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center">
          <Calendar className="h-12 w-12 text-red-600 mr-4" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Bookings</h2>
            <p className="text-gray-600">Manage trust bookings for remaining food.</p>
          </div>
        </Link>
      </div>

      {/* Footer */}
      <footer className="mt-16 bg-gray-800 text-gray-300 py-8 text-center">
        <p>&copy; 2025 Food Waste Management. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
