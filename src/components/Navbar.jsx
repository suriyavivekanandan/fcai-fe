import React from 'react';
import { Link } from 'react-router-dom';
import { Home, LogIn, UserPlus, KeyRound, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800">
            <Home className="h-5 w-5 mr-2" />
            <span className="font-semibold text-lg">FoodWaste</span>
          </Link>
        </div>
        
        <ul className="flex space-x-6">
          <li>
            <Link 
              to="/signup" 
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <UserPlus className="h-4 w-4 mr-1" />
              <span>Signup</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/login" 
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <LogIn className="h-4 w-4 mr-1" />
              <span>Login</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/password-reset" 
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <KeyRound className="h-4 w-4 mr-1" />
              <span>Reset Password</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/otp-verification" 
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ShieldCheck className="h-4 w-4 mr-1" />
              <span>OTP Verification</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;