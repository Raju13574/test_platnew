import React from 'react';
import Layout from '../../layout/Layout';
import { Card, CardContent } from '../../common/Card';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiService } from '../../../services/api';

const ActiveCandidates = () => {
  const [activeCandidates, setActiveCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    testType: 'all',
    status: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchActiveCandidates = async () => {
      try {
        const response = await apiService.getCandidateMetrics({ status: 'in_progress' });
        const formattedCandidates = response.data.candidates.map(candidate => ({
          id: candidate.candidateId,
          name: candidate.candidateName,
          email: candidate.email,
          testName: candidate.testType,
          startTime: new Date(candidate.testPeriod.start).toLocaleString(),
          progress: candidate.progress || 0,
          status: candidate.progress >= 100 ? 'Completed' : 'In Progress'
        }));
        setActiveCandidates(formattedCandidates);
      } catch (error) {
        console.error('Error fetching active candidates:', error);
      }
    };

    fetchActiveCandidates();
  }, []);

  const filteredCandidates = activeCandidates.filter(candidate => {
    const matchesSearch = 
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.testName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTestType = filters.testType === 'all' || candidate.testName === filters.testType;
    const matchesStatus = filters.status === 'all' || candidate.status === filters.status;

    return matchesSearch && matchesTestType && matchesStatus;
  });

  // Get unique test types for filter dropdown
  const testTypes = [...new Set(activeCandidates.map(c => c.testName))];

  // Pagination logic
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCandidates = filteredCandidates.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">Active Candidates</h1>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50 ${
                showFilters ? 'bg-gray-50' : ''
              }`}
            >
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or test..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none"
                />
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="mt-4 flex gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
                  <select
                    value={filters.testType}
                    onChange={(e) => setFilters(prev => ({ ...prev, testType: e.target.value }))}
                    className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-100 outline-none"
                  >
                    <option value="all">All Tests</option>
                    {testTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-100 outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
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
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Test Name</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Start Time</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Progress</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-gray-800">{candidate.name}</div>
                        <div className="text-sm text-gray-500">{candidate.email}</div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{candidate.testName}</td>
                    <td className="p-4 text-sm text-gray-600">{candidate.startTime}</td>
                    <td className="p-4">
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full" 
                          style={{ width: `${candidate.progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{candidate.progress}% completed</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                        {candidate.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCandidates.length)} of{' '}
                    {filteredCandidates.length} results
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ActiveCandidates; 