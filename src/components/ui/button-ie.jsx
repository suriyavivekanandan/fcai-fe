import React from 'react';

const Button = ({ children, onClick, variant = 'primary', loading = false, ...props }) => {
  const baseStyle = "px-4 py-2 rounded-md font-medium flex items-center justify-center";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100"
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`${baseStyle} ${variants[variant]} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default Button;
