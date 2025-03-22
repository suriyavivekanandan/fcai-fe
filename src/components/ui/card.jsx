// /src/components/ui/card.jsx
import React from 'react';

const Card = ({ children }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
      {children}
    </div>
  );
};

const CardContent = ({ children }) => {
  return (
    <div className="p-4">
      {children}
    </div>
  );
};

export { Card, CardContent };
