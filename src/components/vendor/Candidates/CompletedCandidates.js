import React from 'react';
import Layout from '../../layout/Layout';
import { Card, CardContent } from '../../common/Card';
import { Search, Filter, Download, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiService } from '../../../services/api';
import * as XLSX from 'xlsx';

const CompletedCandidates = () => {
  const [completedCandidates, setCompletedCandidates] = useState([]);
  const [metrics, setMetrics] = useState({
    activeTestTakers: 0,
    totalCandidates: 0,
    statusBreakdown: {
      completed: 0,
      inProgress: 0,
      pending: 0
    }
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCompletedCandidates = async () => {
      try {
        const response = await apiService.getCandidateMetrics({ status: 'completed' });
        
        // Filter only completed candidates
        const formattedCandidates = response.data.candidates
          .filter(candidate => candidate.status === 'completed')
          .map(candidate => {
            const userDetails = candidate.user || {};
            
            return {
              id: candidate.candidateId,
              testId: candidate.testId,
              vendorId: candidate.vendorId,
              userId: candidate.candidateId,
              name: candidate.candidateName,
              email: userDetails.email || candidate.email || 'Email not available',
              testName: candidate.testType,
              completionDate: new Date(candidate.lastActivity.time).toLocaleDateString(),
              score: candidate.score || 0,
              scoreDetails: {
                mcqScore: candidate.scoreDetails?.mcqScore || 0,
                codingScore: candidate.scoreDetails?.codingScore || 0,
                totalPossibleScore: candidate.scoreDetails?.totalPossibleScore || 100
              }
            };
          });

        setCompletedCandidates(formattedCandidates);
        setMetrics(response.data.metrics);
      } catch (error) {
        console.error('Error fetching completed candidates:', error);
      }
    };

    fetchCompletedCandidates();
  }, []);

  const fetchReportDetails = async (testId, userId) => {
    console.log('Fetching report for:', { testId, userId });
    if (!testId || !userId) {
      console.error('Missing testId or userId:', { testId, userId });
      return;
    }

    setReportLoading(true);
    try {
      const response = await apiService.getComprehensiveSubmission(testId, userId);
      console.log('Report response:', response);
      
      if (!response.data?.data) {
        console.error('No data in response');
        return;
      }
      
      // Transform the comprehensive submission data to match the expected format
      const report = {
        user: {
          name: response.data.data.user.name,
          email: response.data.data.user.email
        },
        test: {
          title: response.data.data.testTitle,
          difficulty: 'Standard' // Add default or get from response if available
        },
        scores: {
          percentage: response.data.data.scores.percentage,
          mcq: response.data.data.scores.mcq,
          coding: response.data.data.scores.coding,
          passed: response.data.data.scores.passed
        },
        startTime: response.data.data.startTime,
        endTime: response.data.data.endTime,
        duration: response.data.data.duration,
        mcq: {
          answers: response.data.data.mcq.answers
        },
        coding: {
          challenges: response.data.data.coding.challenges
        }
      };
      
      setSelectedReport(report);
    } catch (error) {
      console.error('Error fetching report details:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert('Failed to load report. Please try again.');
    } finally {
      setReportLoading(false);
    }
  };

  const downloadExcel = (report) => {
    // Define styles
    const styles = {
      title: {
        fill: { fgColor: { rgb: '4472C4' } },
        font: { color: { rgb: 'FFFFFF' }, bold: true, sz: 16 },
        alignment: { horizontal: 'center', vertical: 'center' }
      },
      sectionHeader: {
        fill: { fgColor: { rgb: 'D9E1F2' } },
        font: { bold: true, sz: 12 },
        alignment: { horizontal: 'left' }
      },
      subHeader: {
        fill: { fgColor: { rgb: 'F2F2F2' } },
        font: { bold: true, sz: 11 },
        alignment: { horizontal: 'left' }
      },
      cell: {
        alignment: { horizontal: 'left' },
        border: {
          top: { style: 'thin', color: { rgb: 'E0E0E0' } },
          bottom: { style: 'thin', color: { rgb: 'E0E0E0' } },
          left: { style: 'thin', color: { rgb: 'E0E0E0' } },
          right: { style: 'thin', color: { rgb: 'E0E0E0' } }
        }
      },
      highlight: {
        fill: { fgColor: { rgb: 'FFD966' } },
        font: { bold: true, sz: 12 },
        alignment: { horizontal: 'center' }
      }
    };

    // Create the data
    const data = [
      // Main Title
      [{ v: 'Test Report Dashboard', s: styles.title }],
      [''], // Empty row for spacing

      // Overview Section
      [{ v: 'Overview', s: styles.sectionHeader }],
      ['Test Name', report.test.title],
      ['Candidate', report.user.name],
      ['Status', report.scores.passed ? 'PASSED' : 'FAILED'],
      ['Total Score', `${report.scores.percentage}%`],
      [''], // Spacing

      // Analytics Section
      [{ v: 'Analytics', s: styles.sectionHeader }],
      ['MCQ Score', report.scores.mcq],
      ['Coding Score', report.scores.coding],
      ['Start Time', new Date(report.startTime).toLocaleString()],
      ['End Time', new Date(report.endTime).toLocaleString()],
      ['Duration', `${Math.round(report.duration / 60)} minutes`],
      [''], // Spacing

      // MCQ Details Section
      [{ v: 'MCQ Details', s: styles.sectionHeader }],
      ['Question', 'Selected Options', 'Correct'],
      ...report.mcq.answers.map((answer, index) => [
        `Question ${index + 1}`,
        answer.selectedOptions.join(', '),
        answer.isCorrect ? 'Yes' : 'No'
      ]),
      [''], // Spacing

      // Coding Challenge Details Section
      [{ v: 'Coding Challenge Details', s: styles.sectionHeader }],
      ['Challenge', 'Best Score', 'Attempts', 'Test Cases Passed'],
      ...report.coding.challenges.map((challenge) => [
        `Challenge ${challenge.challengeId}`,
        `${challenge.bestScore}%`,
        challenge.attempts,
        `${challenge.submissions[0]?.testCasesPassed || 0}/${challenge.submissions[0]?.totalTestCases || 0}`
      ])
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, // Column A
      { wch: 40 }, // Column B
      { wch: 15 }, // Column C
      { wch: 15 }  // Column D
    ];

    // Merge cells for the main title
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } } // Merge first row across all columns
    ];

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Test Report');

    // Generate filename
    const sanitizedName = report.user.name.replace(/[^a-zA-Z0-9]/g, '_');
    const sanitizedTestName = report.test.title.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `${sanitizedName}_${sanitizedTestName}_${timestamp}.xlsx`;

    // Write file
    XLSX.writeFile(wb, fileName);
  };

  const ReportModal = ({ report, onClose }) => {
    if (!report) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-3/4 max-h-[90vh] overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-2xl font-semibold">Test Report</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Candidate Details</h3>
                  <p className="text-gray-600">{report.user.name}</p>
                  <p className="text-gray-600">{report.user.email}</p>
                </div>
                <div>
                  <h3 className="font-medium">Test Details</h3>
                  <p className="text-gray-600">{report.test.title}</p>
                  <p className="text-gray-600">Duration: {Math.round(report.duration / 60)} minutes</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Score Summary</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Score</p>
                    <p className="text-xl font-semibold">{report.scores.percentage}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">MCQ Score</p>
                    <p className="text-xl font-semibold">{report.scores.mcq}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Coding Score</p>
                    <p className="text-xl font-semibold">{report.scores.coding}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`text-sm font-medium ${report.scores.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {report.scores.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                </div>
              </div>

              {report.mcq && (
                <div className="border rounded-lg">
                  <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-medium">MCQ Responses</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    {report.mcq.answers.map((answer, index) => (
                      <div key={answer.questionId} className="border-b last:border-0 pb-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium">Q{index + 1}: {answer.question}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Selected: {answer.selectedOptions.join(', ')}
                            </p>
                            <p className="text-sm text-gray-600">
                              Correct: {answer.correctOptions.join(', ')}
                            </p>
                            {answer.explanation && (
                              <p className="text-sm text-gray-600 mt-2">
                                Explanation: {answer.explanation}
                              </p>
                            )}
                          </div>
                          <div className="ml-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              answer.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {answer.marks}/{answer.maxMarks}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {report.coding && (
                <div className="border rounded-lg">
                  <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-medium">Coding Challenges</h3>
                  </div>
                  <div className="p-4 space-y-6">
                    {report.coding.challenges.map((challenge) => (
                      <div key={challenge.challengeId} className="border rounded-lg">
                        <div className="p-4 border-b bg-gray-50">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{challenge.title}</h4>
                            <span className="text-sm text-gray-600">
                              Best Score: {challenge.bestScore}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                          <p className="text-sm text-gray-600">Difficulty: {challenge.difficulty}</p>
                        </div>
                        <div className="p-4">
                          {challenge.submissions.map((submission, index) => (
                            <div key={index} className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  Attempt {index + 1} - {new Date(submission.submittedAt).toLocaleString()}
                                </span>
                                <span className={`text-sm font-medium ${
                                  submission.status === 'passed' ? 'text-green-600' : 'text-orange-600'
                                }`}>
                                  {submission.status.toUpperCase()}
                                </span>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <pre className="text-sm overflow-x-auto">
                                  <code>{submission.code}</code>
                                </pre>
                              </div>
                              <div className="space-y-2">
                                <h5 className="font-medium text-sm">Test Cases</h5>
                                {submission.testCaseResults.map((testCase, tcIndex) => (
                                  <div key={tcIndex} className="text-sm border rounded p-2">
                                    <div className="flex justify-between">
                                      <span>Test Case {tcIndex + 1}</span>
                                      <span className={testCase.passed ? 'text-green-600' : 'text-red-600'}>
                                        {testCase.passed ? 'PASSED' : 'FAILED'}
                                      </span>
                                    </div>
                                    <div className="mt-1 space-y-1 text-gray-600">
                                      <p>Input: {testCase.input}</p>
                                      <p>Expected: {testCase.expectedOutput}</p>
                                      <p>Actual: {testCase.actualOutput || 'No output'}</p>
                                      {testCase.error && (
                                        <p className="text-red-600">Error: {testCase.error}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 p-4 border-t">
                <button 
                  onClick={() => downloadExcel(report)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Excel
                </button>
                <button 
                  onClick={onClose} 
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const filteredCandidates = completedCandidates.filter(candidate => {
    const searchLower = searchTerm.toLowerCase();
    return (
      candidate.name.toLowerCase().includes(searchLower) ||
      candidate.email.toLowerCase().includes(searchLower) ||
      candidate.testName.toLowerCase().includes(searchLower)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCandidates = filteredCandidates.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Metrics Summary */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">Total Candidates</div>
              <div className="text-2xl font-semibold">{metrics.totalCandidates}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">Completed Tests</div>
              <div className="text-2xl font-semibold">{metrics.statusBreakdown.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">In Progress</div>
              <div className="text-2xl font-semibold">{metrics.statusBreakdown.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">Active Test Takers</div>
              <div className="text-2xl font-semibold">{metrics.activeTestTakers}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">Completed Tests</h1>
          <div className="flex gap-3">
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Results
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
                  onChange={handleSearch}
                  placeholder="Search by name, email or test name..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none"
                />
              </div>
              <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50">
                <Filter className="h-4 w-4" />
                Filters
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Completed Candidates Table */}
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Candidate</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Test Name</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Completion Date</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Score</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-gray-800">{candidate.name}</div>
                        <div className="text-sm text-gray-500">{candidate.email}</div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{candidate.testName}</td>
                    <td className="p-4 text-sm text-gray-600">{candidate.completionDate}</td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full text-sm font-medium">
                          {candidate.score}%
                        </span>
                        <div className="text-xs text-gray-500">
                          MCQ: {candidate.scoreDetails.mcqScore} | 
                          Coding: {candidate.scoreDetails.codingScore}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => fetchReportDetails(candidate.testId, candidate.userId)}
                        className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        disabled={reportLoading}
                      >
                        {reportLoading ? 'Loading...' : 'View Report'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
          <div className="text-sm text-gray-500">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCandidates.length)} of {filteredCandidates.length} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`px-3 py-1 rounded-lg border ${
                  currentPage === index + 1 ? 'bg-blue-50 text-blue-600 border-blue-200' : 'hover:bg-gray-50'
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedReport && (
        <ReportModal 
          report={selectedReport} 
          onClose={() => setSelectedReport(null)} 
        />
      )}
    </Layout>
  );
};

export default CompletedCandidates; 