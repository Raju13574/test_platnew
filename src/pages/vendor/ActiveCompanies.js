import React from 'react';
import { Building2, Activity } from 'lucide-react';

const ActiveCompanies = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
            <Activity className="h-6 w-6 text-emerald-600" />
            Active Companies
          </h1>
          <p className="text-gray-600 mt-2">View and manage currently active company partnerships</p>
        </div>

        {/* Coming Soon Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="max-w-md mx-auto">
            <Building2 className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Active Companies Dashboard Coming Soon
            </h2>
            <p className="text-gray-600 blur-[1px]">
              Monitor active partnerships, track engagement metrics, and manage company-specific settings. 
              This feature will help you maintain strong relationships with your active company partners.
            </p>
            <div className="mt-6">
              <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-emerald-100">
                Feature in Development
              </span>
            </div>
          </div>
        </div>

        {/* Placeholder Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {['Total Active', 'Recent Activity', 'Partnership Health'].map((stat) => (
            <div key={stat} className="bg-white rounded-lg shadow-sm p-6 blur-[1px]">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActiveCompanies; 