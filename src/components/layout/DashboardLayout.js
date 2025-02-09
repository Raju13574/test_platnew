import React from 'react';

const DashboardLayout = ({ children, title, subtitle }) => {
  return (
    <div className="p-6">
      {/* Header Section */}
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      
      {/* Content Section */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
