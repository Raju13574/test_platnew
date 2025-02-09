import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Eye, 
} from 'lucide-react';
import { testService } from '../../services/test.service';
import SideBar from './SideBar';

const UserTests = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeVersions, setActiveVersions] = useState({}); // Track active version for each test

  // Add toggleSidebar function
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // Fetch tests
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await testService.getUserTests();
        if (response?.data?.results && Array.isArray(response.data.results)) {
          const transformedTests = response.data.results.map(test => {
            // Group submissions by version
            const submissions = (test.submissions || []).reduce((acc, submission) => {
              const version = submission.version || 1;
              if (!acc[version]) {
                acc[version] = [];
              }
              acc[version].push(submission);
              return acc;
            }, {});
            
            // Set the latest version as active by default
            const latestVersion = Math.max(...Object.keys(submissions).map(Number));
            setActiveVersions(prev => ({
              ...prev,
              [test.testId]: latestVersion
            }));

            return {
              ...test,
              submissions
            };
          });
          setTests(transformedTests);
        }
      } catch (error) {
        console.error('Error fetching tests:', error);
        setTests([]);
      }
    };

    fetchTests();
  }, []);

  // Search functionality
  const filteredTests = tests
    .filter(test => test.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

  const TestCard = ({ test }) => {
    const versions = Object.keys(test.submissions || {}).sort((a, b) => b - a);
    const activeVersion = activeVersions[test.testId] || versions[0];
    const versionSubmissions = test.submissions[activeVersion] || [];
    const latestSubmission = versionSubmissions[versionSubmissions.length - 1];

    return (
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden flex flex-col h-full">
        {/* Test Header - Fixed Height */}
        <div className="p-6 flex-grow">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2">{test.title}</h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium whitespace-nowrap ml-4">
              {test.category}
            </span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{test.description}</p>
        </div>

        {/* Version Tabs - Fixed Height */}
        <div className="border-t border-gray-100">
          <div className="flex overflow-x-auto scrollbar-hide">
            {versions.map(version => (
              <button
                key={version}
                onClick={() => setActiveVersions(prev => ({
                  ...prev,
                  [test.testId]: version
                }))}
                className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all duration-200 flex items-center ${
                  activeVersion === version
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Version {version}
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                  activeVersion === version
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {test.submissions[version].length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Version Content - Fixed Height */}
        <div className="p-6 border-t border-gray-100">
          {latestSubmission ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium text-gray-800">Latest Attempt</div>
                <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                  {new Date(latestSubmission.attemptedAt).toLocaleDateString()}
                </div>
              </div>

              <button
                onClick={() => navigate(`/dashboard/user/test-results/${test.testId}/${latestSubmission.submissionId}`)}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                  font-medium flex items-center justify-center gap-2 transition-all duration-200"
              >
                <Eye className="h-4 w-4" />
                View Results
              </button>

              {versionSubmissions.length > 1 && (
                <details className="group mt-3">
                  <summary className="flex items-center cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    <span>Previous Attempts ({versionSubmissions.length - 1})</span>
                    <svg className="w-4 h-4 ml-2 transition-transform group-open:rotate-180" 
                         fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-2 space-y-1 bg-gray-50 rounded-lg p-2">
                    {versionSubmissions.slice(0, -1).reverse().map((submission) => (
                      <div key={submission.submissionId} 
                           className="flex justify-between items-center p-2 hover:bg-white rounded-md">
                        <span className="text-sm text-gray-600">
                          {new Date(submission.attemptedAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => navigate(`/dashboard/user/test-results/${test.testId}/${submission.submissionId}`)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-3xl mb-2">📝</div>
              <div className="font-medium text-gray-900">No attempts yet</div>
              <div className="text-sm text-gray-500">Start your first attempt</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SideBar isOpen={isSidebarOpen} onClose={toggleSidebar} />
      
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
        <div className="p-6">
          {/* Header with Search */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className="text-2xl font-bold text-gray-900">My Tests</h1>
              <div className="relative w-full md:w-96">
                <Search className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Test Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <TestCard key={test.testId} test={test} />
            ))}
          </div>

          {/* Empty State */}
          {filteredTests.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <Search className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No tests found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserTests;
