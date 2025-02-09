import React from 'react';
import Layout from '../../layout/Layout';
import { Card, CardContent } from '../../common/Card';
import { Search, Filter } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiService } from '../../../services/api';
import * as XLSX from 'xlsx';

const AllCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    testsCompleted: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await apiService.getCandidates();
        const formattedCandidates = response.data.candidates.map(candidate => ({
          name: candidate.name,
          email: candidate.email,
          status: 'Active',
          testsCompleted: candidate.totalAttempts,
          lastActive: new Date(candidate.lastAttempt).toLocaleDateString()
        }));
        setCandidates(formattedCandidates);
      } catch (error) {
        console.error('Error fetching candidates:', error);
      }
    };

    fetchCandidates();
  }, []);

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(candidates);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");
    XLSX.writeFile(workbook, "candidates.xlsx");
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || candidate.status === filters.status;
    const matchesTests = filters.testsCompleted === 'all' || 
      (filters.testsCompleted === 'completed' && candidate.testsCompleted > 0) ||
      (filters.testsCompleted === 'pending' && candidate.testsCompleted === 0);

    return matchesSearch && matchesStatus && matchesTests;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">All Candidates</h1>
          <div className="flex gap-3">
            <button 
              onClick={handleExport} 
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              Export
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search candidates..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none"
                />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50 ${
                  showFilters ? 'bg-gray-50' : ''
                }`}
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="mt-4 flex gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-100 outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tests</label>
                  <select
                    value={filters.testsCompleted}
                    onChange={(e) => setFilters(prev => ({ ...prev, testsCompleted: e.target.value }))}
                    className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-100 outline-none"
                  >
                    <option value="all">All Tests</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Candidates Table */}
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Name</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Email</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Tests Completed</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm">
                      <span className="font-medium text-gray-800">{candidate.name}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{candidate.email}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        candidate.status === 'Active' 
                          ? 'bg-green-50 text-green-600' 
                          : 'bg-gray-50 text-gray-600'
                      }`}>
                        {candidate.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{candidate.testsCompleted}</td>
                    <td className="p-4 text-sm text-gray-600">{candidate.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AllCandidates; 