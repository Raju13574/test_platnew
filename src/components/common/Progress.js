import React from 'react';

export const Progress = ({ value, max = 100 }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${Math.min(Math.max(0, value), max)}%` }}
      />
    </div>
  );
}; 