import React from 'react';
import { Building2 } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';

const Companies = () => {
  return (
    <div className="flex">
      <Sidebar isOpen={true} />
      {/* Main content with margin-left to account for sidebar */}
      <div className="flex-1 ml-64 min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
              <Building2 className="h-6 w-6 text-emerald-600" />
              Companies
            </h1>
            <p className="text-gray-600 mt-2">Manage and view all company relationships</p>
          </div>

          {/* Companies Content with Blur Overlay */}
          <div className="relative">
            {/* Background Content - Blurred */}
            <div className="blur-[2px] pointer-events-none">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[
                  { name: 'Tech Solutions Inc.', status: 'Active', employees: '250+' },
                  { name: 'Digital Innovations', status: 'Pending', employees: '100+' },
                  { name: 'Future Systems', status: 'Active', employees: '500+' },
                  { name: 'Cloud Computing Co.', status: 'Active', employees: '150+' },
                  { name: 'Data Analytics Ltd.', status: 'Pending', employees: '75+' },
                  { name: 'Smart Solutions', status: 'Active', employees: '300+' }
                ].map((company, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-gray-900">{company.name}</h3>
                      <span className={`px-2 py-1 text-sm rounded-full ${
                        company.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {company.status}
                      </span>
                    </div>
                    <div className="text-gray-600 text-sm">Employees: {company.employees}</div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                        <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                        <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-white/60">
              <div className="text-center">
                <h2 className="text-5xl font-bold text-emerald-600 mb-4">Coming Soon</h2>
                <p className="text-xl text-emerald-700 mb-2">Invite companies</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Companies; 