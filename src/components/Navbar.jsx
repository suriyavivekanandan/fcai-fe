import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Scale, Info, Phone, LogOut, Menu, X, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const hideNavbarRoutes = ["/login", "/signup", "/otp-verification"];
  if (hideNavbarRoutes.includes(location.pathname)) return null;

  return (
    <nav className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 shadow-sm z-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <Scale className="h-6 w-6 text-green-600 mr-2" />
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
              Food Waste Management
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-green-600 transition flex items-center gap-1.5">
              <Scale className="h-4 w-4" />
              <span>Home</span>
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/initial-entry" className="text-gray-700 hover:text-green-600 transition flex items-center gap-1.5">
                  Initial Entry
                </Link>
                <Link to="/remaining-entry" className="text-gray-700 hover:text-green-600 transition flex items-center gap-1.5">
                  Remaining Entry
                </Link>
                <Link to="/data-view" className="text-gray-700 hover:text-green-600 transition flex items-center gap-1.5">
                  Data View
                </Link>
                <Link to="/food-analysis" className="text-gray-700 hover:text-green-600 transition flex items-center gap-1.5">
                  Food Analysis
                </Link>
                <Link to="/bookings" className="text-gray-700 hover:text-green-600 transition flex items-center gap-1.5">
                  Bookings
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm font-medium"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Navigation Toggle */}
          <button className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100" onClick={toggleMenu}>
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-lg p-5">
            <div className="flex justify-between items-center mb-6">
              <Link to="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
                <Scale className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-lg font-bold">Food Waste Management</span>
              </Link>
              <button onClick={toggleMenu} className="p-2">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="flex items-center py-2 text-base font-medium text-gray-900 hover:text-green-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/initial-entry"
                    className="flex items-center py-2 text-base font-medium text-gray-900 hover:text-green-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Initial Entry
                  </Link>
                  <Link
                    to="/remaining-entry"
                    className="flex items-center py-2 text-base font-medium text-gray-900 hover:text-green-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Remaining Entry
                  </Link>
                  <Link
                    to="/data-view"
                    className="flex items-center py-2 text-base font-medium text-gray-900 hover:text-green-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Data View
                  </Link>
                  <Link
                    to="/food-analysis"
                    className="flex items-center py-2 text-base font-medium text-gray-900 hover:text-green-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Food Analysis
                  </Link>
                  <Link
                    to="/bookings"
                    className="flex items-center py-2 text-base font-medium text-gray-900 hover:text-green-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Bookings
                  </Link>
                </>
              )}
            </nav>

            <div className="mt-6 pt-6 border-t border-gray-200">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-base font-medium flex items-center justify-center gap-2"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="block w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-center text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;