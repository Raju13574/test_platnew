import React, { useState,  useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Popover } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import Layout from '../../layout/Layout';
import { Card,  CardContent } from '../../common/Card';
import { 
  Search, Plus, MoreVertical, Clock, Users, Calendar, Download,
  Edit, Trash2, TrendingUp, Brain, Target, Settings,  TrendingDown, Upload
} from 'lucide-react';
import { testService } from '../../../services/test.service';
import { apiService } from '../../../services/api';
import JsonUploadModal from './JsonUploadModal';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Progress } from '../../common/Progress';

const AllTests = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalTests: { 
      value: 0, 
      trend: 0, 
      subtitle: 'Total active assessments',
      details: {
        active: 0,
        draft: 0
      }
    },
    activeCandidates: { 
      value: 0, 
      trend: 0, 
      subtitle: 'In last 30 days',
      details: {
        total: 0,
        thisWeek: 0
      }
    },
    passRate: { 
      value: 0, 
      trend: 0, 
      subtitle: 'Pass rate in last 30 days',
      details: {
        total: 0,
        completed: 0,
        passed: 0
      }
    },
    avgTimeSpent: { 
      value: 0, 
      trend: 0, 
      subtitle: 'Average test duration',
      details: {
        overall: 0,
        distribution: {
          over60min: 0
        }
      }
    }
  });

  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [testsPerPage] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  // Update state to store dynamic filter options
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);

  // Add these state declarations at the top with other state variables
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Separate useEffect for debouncing search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Update the search handler
  const handleSearch = (e) => {
    e.preventDefault(); // Prevent form submission
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Update the clear search handler
  const handleClearSearch = (e) => {
    e.preventDefault(); // Prevent default behavior
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setCurrentPage(1);
  };

  // 2. Add category handler
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    setCurrentPage(1); // Reset to first page when category changes
  };

  // 3. Add filter status handler
  const handleFilterStatusChange = (e) => {
    const value = e.target.value;
    setFilterStatus(value.toLowerCase());
    setCurrentPage(1);
  };

  // Update TestCard component to remove unused features
  const TestCard = React.memo(({ test }) => {
    const [showStats, setShowStats] = useState(false);

    const status = test?.status?.toLowerCase() || 'draft';
    const category = test?.category || 'Uncategorized';
    const difficulty = test?.difficulty || 'Beginner';
    const duration = test?.duration ? `${test.duration} mins` : '0 mins';
    const totalQuestions = (() => {
      // Check multiple possible field names
      const mcqCount = test?.mcqs?.length || 0;
      const codingCount = test?.codingChallenges?.length || 0;
      
      // If we have direct counts, use them
      if (mcqCount > 0 || codingCount > 0) {
        return mcqCount + codingCount;
      }
      
      // Fall back to totalQuestions field if it exists
      return test?.totalQuestions || 
             test?.questions?.length || 
             'N/A';
    })();
    const lastModified = test?.updatedAt || test?.createdAt;

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    return (
      <Card className="hover:shadow-xl transition-all duration-200 h-full">
        <CardContent className="p-6 space-y-4">
          {/* Test Info */}
          <div className="min-h-[80px] pt-2">
            <h3 className="font-semibold text-lg text-gray-900 pr-24 line-clamp-2 mb-2">
              {test?.title || 'Untitled Test'}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 truncate">{category}</span>
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
              <span className={`text-sm font-medium ${
                difficulty === 'Advanced' ? 'text-red-500' :
                difficulty === 'intermediate' ? 'text-yellow-500' :
                'text-green-500'
              }`}>
                {difficulty}
              </span>
            </div>
          </div>

          {/* Test Details in Grid */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center text-sm text-gray-600 space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>{duration}</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center text-sm text-gray-600 space-x-2 mb-1">
                <Brain className="h-4 w-4 text-gray-400" />
                <span>{totalQuestions > 0 ? `${totalQuestions} Total` : 'No questions'}</span>
              </div>
              {totalQuestions > 0 && (
                <div className="text-xs text-gray-500 pl-6">
                  <span className="inline-flex items-center">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full mr-1"></span>
                    {test?.mcqs?.length || 0} MCQs
                  </span>
                  <span className="mx-1">•</span>
                  <span className="inline-flex items-center">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full mr-1"></span>
                    {test?.codingChallenges?.length || 0} Coding
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center text-sm text-gray-600 space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>{formatDate(lastModified)}</span>
            </div>
            <div className="flex items-center text-sm space-x-2">
              <Settings className="h-4 w-4 text-gray-400" />
              <span className={`${
                status === 'published' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {status === 'published' ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>

          {/* Quick Stats Toggle */}
          <button 
            onClick={() => setShowStats(!showStats)}
            className="mt-6 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </button>

          {/* Action Buttons */}
          <div className="mt-8 pt-4 border-t flex justify-between items-center">
            <div className="flex gap-2">
              <button 
                onClick={() => navigate(`/vendor/tests/edit/${test._id}`)}
                className="p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200 group" 
                title="Edit Test"
              >
                <Edit className="h-4 w-4 text-gray-600 group-hover:text-indigo-600" />
              </button>
              <button 
                onClick={() => handlePublish(test)}
                className="p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200 group" 
                title="Publish & Get Shareable Link"
              >
                <TrendingUp className="h-4 w-4 text-gray-600 group-hover:text-indigo-600" />
              </button>
            </div>
            
            <Popover className="relative">
              <Popover.Button className="p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <MoreVertical className="h-4 w-4 text-gray-600" />
              </Popover.Button>

              <Popover.Panel className="absolute right-0 z-10 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <button
                    onClick={() => handleDelete(test._id)}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Test
                  </button>
                
                  <button
                    onClick={() => handleExportResults(test._id)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent mr-2" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export Results
                      </>
                    )}
                  </button>
                </div>
              </Popover.Panel>
            </Popover>
          </div>
        </CardContent>
      </Card>
    );
  });

  // Update useEffect to properly handle filter parameters
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Create filter params object with proper parameter names
        const params = new URLSearchParams();
        params.append('page', currentPage);
        params.append('limit', testsPerPage);

        if (debouncedSearchTerm.trim()) {
          params.append('search', debouncedSearchTerm.trim());
        }
        
        if (selectedCategory && selectedCategory !== 'all') {
          params.append('category', selectedCategory);
        }
        
        // Update status filter to use lowercase
        if (filterStatus && filterStatus !== 'all') {
          params.append('status', filterStatus.toLowerCase());
        }

        // Update API calls to use the params
        const [testsResponse, metricsResponse] = await Promise.all([
          testService.getAllTests(params.toString()),
          apiService.get('vendor/dashboard/metrics')
        ]);

        if (testsResponse.data) {
          // Get the tests array from the response
          const testsArray = Array.isArray(testsResponse.data.tests) 
            ? testsResponse.data.tests 
            : testsResponse.data;

          // Apply client-side filtering if server filtering isn't working
          let filteredTests = testsArray;
          if (filterStatus && filterStatus !== 'all') {
            filteredTests = filteredTests.filter(test => 
              test.status?.toLowerCase() === filterStatus.toLowerCase()
            );
          }

          setTests(filteredTests);
          
          // Update filter options
          if (testsResponse.data.filters) {
            setCategoryOptions(testsResponse.data.filters.categories || []);
            setStatusOptions(testsResponse.data.filters.statuses || []);
          } else {
            // Extract unique values from the original tests array
            const uniqueCategories = [...new Set(testsArray.map(test => test.category))].filter(Boolean);
            const uniqueStatuses = [...new Set(testsArray.map(test => test.status))].filter(Boolean);
            
            setCategoryOptions(uniqueCategories);
            setStatusOptions(uniqueStatuses);
          }

          // Update pagination based on filtered results
          const total = filteredTests.length;
          setTotalPages(Math.ceil(total / testsPerPage));

          // Show message if no results
          if (filteredTests.length === 0 && 
              (debouncedSearchTerm || selectedCategory !== 'all' || filterStatus !== 'all')) {
            toast.error('No tests found matching your criteria');
          }
        }
        
        if (metricsResponse.data) {
          setDashboardMetrics(metricsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [debouncedSearchTerm, selectedCategory, filterStatus, currentPage, testsPerPage]);

  // Add trend indicator helper function
  const renderTrendIndicator = (trend) => {
    if (trend > 0) {
      return (
        <div className="flex items-center text-green-500">
          <TrendingUp className="h-3 w-3 mr-1" />
          <span>+{trend}%</span>
        </div>
      );
    } else if (trend < 0) {
      return (
        <div className="flex items-center text-red-500">
          <TrendingDown className="h-3 w-3 mr-1" />
          <span>{trend}%</span>
        </div>
      );
    }
    return null;
  };

  // Handle test deletion
  const handleDelete = async (testId) => {
    if (!testId) {
      toast.error('Invalid test ID');
      return;
    }

    try {
      await testService.deleteTest(testId);
      toast.success('Test deleted successfully');
      // Update the local state to remove the deleted test
      setTests(prevTests => prevTests.filter(test => test._id !== testId));
    } catch (error) {
      console.error('Error deleting test:', error);
      toast.error('Failed to delete test');
    }
  };

  // Update the handlePublish function
  const handlePublish = async (test) => {
    try {
      const response = await apiService.post(`tests/${test._id}/publish`);
      
      if (response.data) {
        // Update the test in state with published info and shareableLink
        setTests(prevTests => 
          prevTests.map(t => 
            t._id === test._id 
              ? { 
                  ...t, 
                  ...response.data.test,
                  shareableLink: response.data.shareableLink
                }
              : t
          )
        );
        
        // Show success message with copy button
        toast.success(
          (t) => (
            <div className="flex flex-col gap-2">
              <p>Test published successfully!</p>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(response.data.shareableLink);
                    toast.success('Link copied to clipboard!');
                  } catch (err) {
                    // Fallback for clipboard API failure
                    const textarea = document.createElement('textarea');
                    textarea.value = response.data.shareableLink;
                    document.body.appendChild(textarea);
                    textarea.select();
                    try {
                      document.execCommand('copy');
                      toast.success('Link copied to clipboard!');
                    } catch (err) {
                      toast.error('Failed to copy link. Please copy it manually.');
                    }
                    document.body.removeChild(textarea);
                  }
                }}
                className="px-3 py-1 text-sm bg-white text-indigo-600 rounded border border-indigo-200 hover:bg-indigo-50"
              >
                Copy Shareable Link
              </button>
            </div>
          ),
          {
            duration: 8000, // Show for 5 seconds
            style: {
              minWidth: '300px',
            },
          }
        );
      }
    } catch (error) {
      console.error('Error publishing test:', error);
      if (error.response?.status === 403) {
        toast.error('Not authorized to publish this test');
      } else if (error.response?.status === 400) {
        toast.error('Test validation failed. Please check all required fields.');
      } else {
        toast.error('Failed to publish test');
      }
    }
  };

  // Add this helper function to generate sample JSON
  const generateSampleJson = () => {
    const sampleTest = {
      title: "Sample Programming Assessment",
      description: "A comprehensive test covering programming fundamentals",
      duration: 120,
      proctoring: false,
      instructions: "Please read all questions carefully before attempting",
      type: "coding_challenge", //coding_challenge is prefred for this dont change it
      category: "Programming",
      difficulty: "intermediate",
      totalMarks: 100,
      passingMarks: 40,
      mcqs: [
        {
          question: "What is the output of console.log(typeof null)?",
          options: ["null", "undefined", "object", "string"],
          correctOptions: [2],
          answerType: "single",
          marks: 5,
          explanation: "In JavaScript, typeof null returns 'object' due to a historical bug",
          difficulty: "medium"
        }
      ],
      codingChallenges: [
        {
          title: "Sum of Two Numbers",
          description: "Write a function to add two numbers",
          problemStatement: "Given two integers, return their sum",
          constraints: "Input numbers will be between -1000 and 1000",
          allowedLanguages: ["javascript", "python", "java"],
          languageImplementations: {
            javascript: {
              visibleCode: "function sum(a, b) {\n  // Your code here\n}",
              invisibleCode: "module.exports = { sum };"
            },
            python: {
              visibleCode: "def sum(a, b):\n    # Your code here\n    pass",
              invisibleCode: "if __name__ == '__main__':\n    pass"
            }
          },
          testCases: [
            {
              input: "2 3",
              output: "5",
              isVisible: true,
              explanation: "2 + 3 = 5"
            }
          ],
          marks: 10,
          timeLimit: 1000,
          memoryLimit: 256,
          difficulty: "easy",
          tags: ["math", "basic"]
        }
      ],
      warningSystem: {
        enabled: true,
        maxWarnings: 3,
        actions: {
          autoSubmit: true,
          notifyVendor: true
        }
      },
      submissionLimits: {
        maxAttempts: 2,
        retakeDelay: 24,
        allowRetake: true
      },
      scheduling: {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        timezone: "UTC",
        autoStart: true,
        autoEnd: true
      }
    };

    return sampleTest;
  };

  // Add this function to handle sample JSON download
  const handleDownloadSample = () => {
    const sampleJson = generateSampleJson();
    const blob = new Blob([JSON.stringify(sampleJson, null, 2)], { type: 'application/json' });
    saveAs(blob, 'sample-test.json');
  };

  // Update the handleCreateTest component to include the sample download option
  const handleCreateTest = () => {
    return (
      <Popover className="relative">
        <Popover.Button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Test
        </Popover.Button>

        <Popover.Panel className="absolute right-0 z-10 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <button
              onClick={() => navigate('/vendor/tests/create')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Using QuestionBank
            </button>
            <button
              onClick={() => setIsJsonModalOpen(true)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload JSON
            </button>
            <button
              onClick={handleDownloadSample}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Sample JSON
            </button>
          </div>
        </Popover.Panel>
      </Popover>
    );
  };

  // Add success handler
  const handleTestCreated = (newTest) => {
    setTests(prevTests => [newTest, ...prevTests]);
  };

  // Update the Pagination component with safety checks
  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    // Ensure valid numbers
    const validCurrentPage = Math.max(1, currentPage || 1);
    const validTotalPages = Math.max(1, totalPages || 1);

    // Create array of page numbers to show
    const getPageNumbers = () => {
      const delta = 2; // Number of pages to show on each side of current page
      const range = [];
      const rangeWithDots = [];

      // Handle small number of pages
      if (validTotalPages <= 7) {
        for (let i = 1; i <= validTotalPages; i++) {
          range.push(i);
        }
      } else {
        // Always include first page
        range.push(1);

        // Calculate start and end of range around current page
        let start = Math.max(2, validCurrentPage - delta);
        let end = Math.min(validTotalPages - 1, validCurrentPage + delta);

        // Adjust if current page is near the beginning
        if (validCurrentPage - delta <= 2) {
          end = 1 + (2 * delta);
        }
        // Adjust if current page is near the end
        else if (validCurrentPage + delta >= validTotalPages - 1) {
          start = validTotalPages - (2 * delta);
        }

        // Add pages to range
        for (let i = start; i <= end; i++) {
          range.push(i);
        }
        
        // Always include last page
        if (validTotalPages > 1) {
          range.push(validTotalPages);
        }
      }

      // Add dots where needed
      let l;
      for (let i of range) {
        if (l) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1);
          } else if (i - l !== 1) {
            rangeWithDots.push('...');
          }
        }
        rangeWithDots.push(i);
        l = i;
      }

      return rangeWithDots;
    };

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="flex items-center">
          <p className="text-sm text-gray-700">
            Page <span className="font-medium">{validCurrentPage}</span> of{' '}
            <span className="font-medium">{validTotalPages}</span>
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(validCurrentPage - 1)}
            disabled={validCurrentPage === 1}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              validCurrentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border`}
          >
            Previous
          </button>
          
          {getPageNumbers().map((pageNum, idx) => (
            <button
              key={idx}
              onClick={() => pageNum !== '...' && onPageChange(pageNum)}
              disabled={pageNum === '...'}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                pageNum === validCurrentPage
                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                  : pageNum === '...'
                  ? 'bg-white text-gray-400 cursor-default'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => onPageChange(validCurrentPage + 1)}
            disabled={validCurrentPage === validTotalPages}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              validCurrentPage === validTotalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border`}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  // Add the handlePageChange function
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Add a "No Results" component with better UI
  const NoResults = () => (
    <div className="col-span-full py-12 flex flex-col items-center justify-center bg-white rounded-lg border border-dashed border-gray-300">
      <div className="mx-auto w-24 h-24 mb-4 text-gray-200">
        <Search className="w-full h-full" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No tests found</h3>
      <p className="text-gray-500 text-center max-w-md mb-4">
        {debouncedSearchTerm 
          ? `No results found for "${debouncedSearchTerm}"`
          : 'No tests match the selected filters'}
      </p>
      {(debouncedSearchTerm || selectedCategory !== 'all' || filterStatus !== 'all') && (
        <button
          onClick={() => {
            setSearchTerm('');
            setDebouncedSearchTerm('');
            setSelectedCategory('all');
            setFilterStatus('all');
            setCurrentPage(1);
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Clear all filters
        </button>
      )}
    </div>
  );

  // Add these helper functions before the handleExportData function


  const handleExportData = async () => {
    try {
      setIsExporting(true);
      setExportProgress(10);

      // Fetch all tests data
      const response = await apiService.get('vendor/tests');
      const testsData = response.data.tests;
      
      setExportProgress(30);

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      
      // Format the data for export - removed Pass Status
      const formattedData = testsData.map(test => ({
        'Title': test.title,
        'Description': test.description,
        'Category': test.category,
        'Difficulty': test.difficulty,
        'Duration (mins)': test.duration,
        'Status': test.status,
        'Total Marks': test.totalMarks,
        'Passing Marks': test.passingMarks,
        'Created Date': new Date(test.createdAt).toLocaleDateString(),
        'Last Updated': new Date(test.updatedAt).toLocaleDateString()
      }));

      setExportProgress(60);

      // Convert data to worksheet
      const ws = XLSX.utils.json_to_sheet(formattedData);

      // Set column widths
      ws['!cols'] = [
        { wch: 40 }, // Title
        { wch: 50 }, // Description
        { wch: 20 }, // Category
        { wch: 15 }, // Difficulty
        { wch: 15 }, // Duration
        { wch: 15 }, // Status
        { wch: 15 }, // Total Marks
        { wch: 15 }, // Passing Marks
        { wch: 20 }, // Created Date
        { wch: 20 }  // Last Updated
      ];

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Tests');

      setExportProgress(80);

      // Generate and save file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const filename = `Tests_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(data, filename);

      setExportProgress(100);
      toast.success('Tests exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export tests: ' + error.message);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // Add this function to handle exporting test results
  const handleExportResults = async (testId) => {
    try {
      setIsExporting(true);
      setExportProgress(10);

      const response = await apiService.get(`submissions/test/${testId}`);
      setExportProgress(30);

      if (response.data?.data) {
        const submissions = response.data.data;
        const summary = response.data.summary;
        const wb = XLSX.utils.book_new();

        // 1. Basic Info Sheet
        const basicData = submissions.map(sub => ({
          'Submission ID': sub.submissionId,
          'Candidate Name': sub.user.name,
          'Email': sub.user.email,
          'Status': sub.status,
          'Start Time': new Date(sub.startTime).toLocaleString(),
          'End Time': new Date(sub.endTime).toLocaleString(),
          'Duration (mins)': Math.round(sub.duration / 60),
          'Total Score': sub.scores.total,
          'MCQ Score': sub.scores.mcq,
          'Coding Score': sub.scores.coding,
          'Percentage': `${sub.scores.percentage}%`,
          'Pass Status': sub.scores.passed ? 'PASSED' : 'FAILED'
        }));

        const basicWs = XLSX.utils.json_to_sheet(basicData);
        XLSX.utils.book_append_sheet(wb, basicWs, 'Overview');

        // 2. MCQ Submissions Sheet
        const mcqData = submissions.flatMap(sub => 
          sub.mcqSubmission?.answers?.map(ans => ({
            'Submission ID': sub.submissionId,
            'Candidate': sub.user.name,
            'Question ID': ans.questionId,
            'Question': ans.question,
            'Selected Options': ans.selectedOptions.join(', '),
            'Correct Options': ans.correctOptions.join(', '),
            'Is Correct': ans.isCorrect ? 'Yes' : 'No',
            'Marks Obtained': ans.marks,
            'Max Marks': ans.maxMarks,
            'Submitted At': new Date(sub.mcqSubmission.submittedAt).toLocaleString()
          })) || []
        );

        const mcqWs = XLSX.utils.json_to_sheet(mcqData);
        XLSX.utils.book_append_sheet(wb, mcqWs, 'MCQ Details');

        // 3. Coding Submissions Sheet
        const codingData = submissions.flatMap(sub => 
          sub.codingSubmission?.challenges?.flatMap(challenge => 
            challenge.submissions.map((submission, index) => ({
              'Submission ID': sub.submissionId,
              'Candidate': sub.user.name,
              'Challenge ID': challenge.challengeId,
              'Challenge Title': challenge.title,
              'Difficulty': challenge.difficulty,
              'Max Marks': challenge.maxMarks,
              'Attempt Number': index + 1,
              'Language': submission.language,
              'Status': submission.status,
              'Marks': submission.marks,
              'Execution Time (ms)': submission.executionTime,
              'Memory Used (KB)': submission.memory,
              'Submitted At': new Date(submission.submittedAt).toLocaleString(),
              'Code': submission.code,
              'Test Cases Passed': submission.testCaseResults.filter(t => t.passed).length,
              'Total Test Cases': submission.testCaseResults.length
            }))
          ) || []
        );

        const codingWs = XLSX.utils.json_to_sheet(codingData);
        XLSX.utils.book_append_sheet(wb, codingWs, 'Coding Details');

        // 4. Test Cases Sheet
        const testCasesData = submissions.flatMap(sub => 
          sub.codingSubmission?.challenges?.flatMap(challenge => 
            challenge.submissions.flatMap(submission => 
              submission.testCaseResults.map((testCase, index) => ({
                'Submission ID': sub.submissionId,
                'Candidate': sub.user.name,
                'Challenge': challenge.title,
                'Test Case #': index + 1,
                'Status': testCase.passed ? 'Passed' : 'Failed',
                'Input': testCase.input,
                'Expected Output': testCase.expectedOutput,
                'Actual Output': testCase.actualOutput,
                'Error': testCase.error || 'None'
              }))
            )
          ) || []
        );

        const testCasesWs = XLSX.utils.json_to_sheet(testCasesData);
        XLSX.utils.book_append_sheet(wb, testCasesWs, 'Test Cases');

        // 5. Summary Sheet
        const summaryData = [
          ['Test Summary', ''],
          ['Total Submissions', summary.totalSubmissions],
          ['Completed Submissions', summary.completedSubmissions],
          ['Average Score', `${summary.averageScore}%`],
          ['Highest Score', `${summary.highestScore}%`],
          ['Lowest Score', `${summary.lowestScore}%`],
          ['Pass Rate', `${summary.passRate}%`],
          ['', ''],
          ['MCQ Statistics', ''],
          ['Average Score', `${summary.mcqStats.averageScore}%`],
          ['Completion Rate', `${summary.mcqStats.completionRate}%`],
          ['', ''],
          ['Coding Statistics', ''],
          ['Average Score', `${summary.codingStats.averageScore}%`],
          ['Completion Rate', `${summary.codingStats.completionRate}%`],
          ['Average Attempts', summary.codingStats.averageAttempts],
          ['', ''],
          ['Time Statistics', ''],
          ['Average Duration (mins)', Math.round(summary.timeStats.averageDuration / 60)],
          ['Fastest Completion (mins)', Math.round(summary.timeStats.fastestCompletion / 60)]
        ];

        const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

        // Apply styling to all sheets
        [basicWs, mcqWs, codingWs, testCasesWs, summaryWs].forEach(ws => {
          const range = XLSX.utils.decode_range(ws['!ref']);
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const address = XLSX.utils.encode_cell({ r: 0, c: C });
            if (!ws[address]) continue;
            ws[address].s = {
              font: { bold: true, color: { rgb: "FFFFFF" } },
              fill: { fgColor: { rgb: "4F46E5" } },
              alignment: { horizontal: "center" }
            };
          }
        });

        setExportProgress(80);

        // Generate and save file
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        
        const filename = `Test_Results_${testId}_${new Date().toISOString().split('T')[0]}.xlsx`;
        saveAs(data, filename);

        toast.success('Test results exported successfully!');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export test results: ' + (error.message || 'Unknown error'));
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // Update the loading state handling at the top of the return statement
  if (loading) {
    return (
      <Layout>
        <div className="space-y-8">
          {/* Shimmer loading for metrics */}
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <motion.div
                  className="h-[140px] relative overflow-hidden"
                  animate={{
                    backgroundColor: ['#f3f4f6', '#e5e7eb', '#f3f4f6'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </motion.div>
              </div>
            ))}
          </div>

          {/* Main content loading skeleton */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b">
              <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 border">
                    <div className="space-y-4">
                      <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                      <div className="h-20 bg-gray-100 rounded animate-pulse" />
                      <div className="flex justify-between">
                        <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Update the stats array definition before the return statement
  const stats = [
    {
      title: 'Total Tests',
      value: dashboardMetrics?.totalTests?.value || 0,
      trend: dashboardMetrics?.totalTests?.trend || 0,
      subtext: dashboardMetrics?.totalTests?.subtitle || 'Total active assessments',
      color: 'blue',
      icon: Target
    },
    {
      title: 'Active Candidates',
      value: dashboardMetrics?.activeCandidates?.value || 0,
      trend: dashboardMetrics?.activeCandidates?.trend || 0,
      subtext: dashboardMetrics?.activeCandidates?.subtitle || 'In last 30 days',
      color: 'green',
      icon: Users
    },
    {
      title: 'Pass Rate',
      value: `${dashboardMetrics?.passRate?.value || 0}%`,
      trend: dashboardMetrics?.passRate?.trend || 0,
      subtext: dashboardMetrics?.passRate?.subtitle || 'Pass rate in last 30 days',
      color: 'yellow',
      icon: TrendingUp
    },
    {
      title: 'Avg Time Spent',
      value: `${Math.round((dashboardMetrics?.avgTimeSpent?.value || 0) / 60)}m`,
      trend: dashboardMetrics?.avgTimeSpent?.trend || 0,
      subtext: dashboardMetrics?.avgTimeSpent?.subtitle || 'Average test duration',
      color: 'purple',
      icon: Clock
    }
  ];

  // Update the SearchInput component
  const SearchInput = () => (
    <form 
      onSubmit={(e) => e.preventDefault()} 
      className="relative flex-1 max-w-xl"
    >
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Search tests by name or category..."
        value={searchTerm}
        onChange={handleSearch}
        className="block w-full pl-12 pr-12 py-3.5 text-sm
          border-0 rounded-2xl
          focus:outline-none focus:ring-1 focus:ring-gray-200
          placeholder-gray-400 bg-gray-50/50
          transition-colors duration-200"
      />
      {loading && searchTerm && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-gray-600" />
        </div>
      )}
      {searchTerm && !loading && (
        <button
          onClick={handleClearSearch}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </form>
  );

  // Update the filters section
  const FiltersSection = () => (
    <div className="flex flex-wrap gap-3">
      <select 
        className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none
          ${selectedCategory !== 'all' ? 'border-emerald-500 bg-emerald-50' : ''}`}
        value={selectedCategory}
        onChange={handleCategoryChange}
        disabled={loading || categoryOptions.length === 0}
      >
        <option value="all">All Categories</option>
        {categoryOptions.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <select 
        className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none
          ${filterStatus !== 'all' ? 'border-emerald-500 bg-emerald-50' : ''}`}
        value={filterStatus}
        onChange={handleFilterStatusChange}
        disabled={loading || statusOptions.length === 0}
      >
        <option value="all">All Status</option>
        <option value="draft">Draft</option>
        <option value="active">Active</option>
      </select>
      
      {/* Clear filters button */}
      {(selectedCategory !== 'all' || filterStatus !== 'all') && (
        <button
          onClick={() => {
            setSelectedCategory('all');
            setFilterStatus('all');
            setCurrentPage(1);
          }}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          Clear Filters
        </button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="space-y-4">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6 flex flex-col justify-center min-h-[160px]">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                    <div className="flex items-center gap-2">
                      {renderTrendIndicator(stat.trend)}
                      <span className="text-xs text-gray-500">{stat.subtext}</span>
                    </div>
                  </div>
                  <div className={`p-4 bg-${stat.color}-50 rounded-full flex-shrink-0`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-500`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Header */}
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Assessment Tests</h1>
              <p className="text-sm text-gray-500 mt-1">Create, manage and analyze your tests</p>
            </div>
            <div className="flex gap-3">
              {/* Updated Export Button */}
              <button
                onClick={() => {
                  if (tests.length > 0) {
                    // If a single test is selected, export that test's data
                    // Otherwise export all visible tests' data
                    const selectedTests = tests.map(test => test._id);
                    handleExportData(selectedTests);
                  } else {
                    toast.error('No tests available to export');
                  }
                }}
                disabled={isExporting || tests.length === 0}
                className={`px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2 ${
                  (isExporting || tests.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export Data'}
              </button>
              
              {handleCreateTest()}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <SearchInput />
            <div className="flex-shrink-0">
              <FiltersSection />
            </div>
          </div>
        </div>

        {/* Test Cards Grid - Removed view toggle and adjusted spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {loading ? (
            // Show loading skeletons
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 border animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))
          ) : tests.length > 0 ? (
            tests.map((test) => (
              <TestCard key={test._id} test={test} />
            ))
          ) : (
            <NoResults />
          )}
        </div>

        {/* Pagination */}
        {tests.length > 0 && (
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
      
      {/* Add Modal */}
      <JsonUploadModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        onSuccess={handleTestCreated}
      />

      {/* Export Progress Modal */}
      {isExporting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-medium mb-4">Exporting Tests Data</h3>
            <Progress value={exportProgress} />
            <p className="text-sm text-gray-500 mt-2 text-center">{exportProgress}% Complete</p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AllTests; 