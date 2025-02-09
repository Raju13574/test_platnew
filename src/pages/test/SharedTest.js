import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { toast } from 'react-hot-toast';


// Update the helper function to handle IST
const formatScheduleTime = (date) => {
  if (!date) return null;
  
  // Ensure we're working with a Date object
  const dateObj = new Date(date);
  
  // Debug log
  console.log('Formatting date:', dateObj, dateObj.toISOString());
  
  return dateObj.toLocaleString('en-IN', { 
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'long'
  });
};

// Add helper function to check if test is currently available
const isTestAvailable = (scheduleStatus) => {
  if (!scheduleStatus) return true;
  
  const now = new Date();
  const startDate = scheduleStatus.startDate ? new Date(scheduleStatus.startDate) : null;
  const endDate = scheduleStatus.endDate ? new Date(scheduleStatus.endDate) : null;

  if (startDate && now < startDate) {
    return false;
  }
  if (endDate && now > endDate) {
    return false;
  }
  return true;
};

// Add helper function to get schedule message
const getScheduleMessage = (scheduleStatus) => {
  if (!scheduleStatus) return null;

  const now = new Date();
  const startDate = scheduleStatus.startDate ? new Date(scheduleStatus.startDate) : null;
  const endDate = scheduleStatus.endDate ? new Date(scheduleStatus.endDate) : null;

  if (startDate && now < startDate) {
    return `Test will start on ${formatScheduleTime(startDate)}`;
  }
  if (endDate && now > endDate) {
    return `Test ended on ${formatScheduleTime(endDate)}`;
  }
  if (startDate && endDate) {
    return `Test is available until ${formatScheduleTime(endDate)}`;
  }
  return null;
};

// Add new helper function for countdown
const getTimeRemaining = (startDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const diff = start - now;

  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
};

// Add helper function to format test type
const formatTestType = (type) => {
  if (!type) return '';
  
  // Split by underscore and capitalize each word
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export default function SharedTest() {
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [vendorBalance, setVendorBalance] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [testStatus, setTestStatus] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [submissionLimits, setSubmissionLimits] = useState(null);

  useEffect(() => {
    const verifyAndCheckRegistration = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          // Store the shared test URL path
          const testPath = `/test/shared/${uuid}`;
          console.log('Storing redirect URL:', testPath);
          localStorage.setItem('redirectAfterLogin', testPath);
          navigate('/login');
          return;
        }

        // Step 1: Parse UUID to get test and vendor IDs
        const parseResponse = await apiService.get(`tests/parse-uuid/${uuid}`);
        console.log('Parse Response:', parseResponse?.data);

        if (!parseResponse?.data?.data) {
          throw new Error('Invalid test data received');
        }

        const { testId, vendorId } = parseResponse.data.data;
        
        // Store IDs immediately
        localStorage.setItem('currentTestId', testId);
        localStorage.setItem('currentVendorId', vendorId);

        // Step 2: Verify Test
        const verifyResponse = await apiService.post(`tests/verify/${uuid}`);
        console.log('Verify Response:', verifyResponse?.data);

        if (!verifyResponse?.data?.test) {
          throw new Error('Invalid test data received');
        }

        // Check vendor balance
        const vendorData = verifyResponse?.data?.test?.vendor || {};
        if (!vendorData.hasBalance) {
          setError(`This test is currently unavailable. Please contact the test administrator.`);
          setVendorBalance({ hasBalance: false });
          return;
        }

        const testData = verifyResponse.data.test;
        setVendorBalance({ hasBalance: true });
        
        // Step 3: Check submission limits
        const limitsResponse = await apiService.get(`tests/submission-limits/${uuid}`);
        console.log('Submission Limits Response:', limitsResponse?.data);
        setSubmissionLimits(limitsResponse?.data);

        // Update test data to include schedule status
        const scheduleStatus = {
          isAvailable: isTestAvailable({
            startDate: testData.scheduling?.startDate,
            endDate: testData.scheduling?.endDate
          }),
          message: getScheduleMessage({
            startDate: testData.scheduling?.startDate,
            endDate: testData.scheduling?.endDate,
            timezone: testData.scheduling?.timezone || 'Asia/Kolkata'
          }),
          startDate: testData.scheduling?.startDate,
          endDate: testData.scheduling?.endDate,
          timezone: testData.scheduling?.timezone || 'Asia/Kolkata'
        };
        
        // Set test data
        setTest({
          ...testData,
          id: testId,
          uuid: uuid,
          vendorId: vendorId,
          scheduleStatus
        });

        // Step 4: Check Registration Status
        const regResponse = await apiService.post(`tests/${uuid}/check-registration`);
        console.log('Registration Response:', regResponse?.data);

        if (!regResponse?.data) {
          throw new Error('Invalid registration status received');
        }

        setRegistrationStatus({
          canAccess: regResponse.data.canAccess || false,
          requiresRegistration: regResponse.data.requiresRegistration || false,
          isRegistered: regResponse.data.isRegistered || false,
          message: regResponse.data.message || '',
          testType: regResponse.data.test?.type,
          lastSession: regResponse.data.lastSession || null,
          accessControl: regResponse.data.test?.accessControl || null
        });

      } catch (err) {
        console.error('Error details:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Error loading test';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    verifyAndCheckRegistration();
  }, [uuid, navigate]);

  useEffect(() => {
    // Add mobile detection
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };
    checkMobile();
  }, []);

  // Add new effect to check test status
  useEffect(() => {
    const checkTestStatus = async () => {
      try {
        const response = await apiService.get(`/tests/status/${uuid}`);
        // Convert the dates to the correct timezone
        const status = {
          ...response.data,
          startDate: response.data.startDate ? new Date(response.data.startDate) : null,
          endDate: response.data.endDate ? new Date(response.data.endDate) : null
        };
        setTestStatus(status);
        console.log('Test Status:', status); // Debug log
      } catch (error) {
        console.error('Error checking test status:', error);
      }
    };

    // Check initially and set up interval
    checkTestStatus();
    const interval = setInterval(checkTestStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [uuid]);

  // Modified countdown effect
  useEffect(() => {
    if (!testStatus?.startDate || testStatus?.isAvailable) return;

    const timer = setInterval(() => {
      const timeLeft = getTimeRemaining(testStatus.startDate);
      if (timeLeft) {
        setCountdown(timeLeft);
      } else {
        clearInterval(timer);
        // Instead of reloading, just check the status again
        const checkStatus = async () => {
          try {
            const response = await apiService.get(`/tests/status/${uuid}`);
            setTestStatus(response.data);
          } catch (error) {
            console.error('Error checking test status:', error);
          }
        };
        checkStatus();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [testStatus, uuid]);

  const handleRegister = async () => {
    try {
      if (!testStatus?.isAvailable) {
        toast.error(testStatus?.message || 'Test is not currently available');
        return;
      }

      setLoading(true);
      setError(null);

      const testId = localStorage.getItem('currentTestId');
      const vendorId = localStorage.getItem('currentVendorId');

      if (!testId || !vendorId) {
        throw new Error('Missing test or vendor information');
      }

      // First try to debit the test fee from vendor's wallet
      const debitResponse = await apiService.post('vendor/wallet/debit-test-fee', {
        vendorId: vendorId,
        testId: testId
      });

      if (!debitResponse.data.success) {
        throw new Error(debitResponse.data.message || 'Failed to process test fee');
      }

      // Store complete test data
      localStorage.setItem('currentTestData', JSON.stringify({
        id: testId,
        uuid: uuid,
        title: test.title,
        type: test.type,
        duration: test.duration,
        totalMarks: test.totalMarks,
        vendorId: vendorId
      }));

      toast.success('Registration successful');
      navigate(`/test/take/${uuid}`);

    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message;
      
      if (error.response?.status === 400 && error.response?.data?.error === "Insufficient balance") {
        setError("This test is currently unavailable. Please contact the test coordinator for assistance.");
        toast.error("Test registration unavailable. Please contact coordinator.");
      } else {
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async () => {
    try {
      if (!testStatus?.isAvailable) {
        toast.error(testStatus?.message || 'Test is not currently available');
        return;
      }

      // Check submission limits
      if (submissionLimits && !submissionLimits.canRetake) {
        toast.error(submissionLimits.message);
        return;
      }

      setLoading(true);
      setError(null);

      const testId = localStorage.getItem('currentTestId');
      const vendorId = localStorage.getItem('currentVendorId');

      if (!testId || !vendorId) {
        throw new Error('Missing test or vendor information');
      }

      localStorage.setItem('currentTestData', JSON.stringify({
        id: testId,
        uuid: uuid,
        title: test.title,
        type: test.type,
        duration: test.duration,
        totalMarks: test.totalMarks,
        vendorId: vendorId
      }));

      try {
        await document.documentElement.requestFullscreen();
      } catch (error) {
        console.error('Fullscreen request failed:', error);
      }

      navigate(`/test/take/${uuid}`);

    } catch (error) {
      console.error('Error starting test:', error);
      const errorMessage = error.message || 'Failed to start test';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update the schedule information section
  const renderScheduleInfo = () => {
    if (!testStatus) return null;

    return (
      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-700 px-8 py-8">
          <h3 className="text-lg font-semibold text-white mb-4">Test Schedule</h3>
          <div className="space-y-4">
            {testStatus.startDate && (
              <div className="flex items-center space-x-3">
                <svg className="h-6 w-6 text-gray-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-300">Starts</p>
                  <p className="font-medium text-gray-100">
                    {formatScheduleTime(testStatus.startDate)}
                  </p>
                </div>
              </div>
            )}

            {testStatus.endDate && (
              <div className="flex items-center space-x-3">
                <svg className="h-6 w-6 text-gray-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-300">Ends</p>
                  <p className="font-medium text-gray-100">
                    {formatScheduleTime(testStatus.endDate)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Add submission limits info to the UI
  const renderSubmissionLimitsInfo = () => {
    if (!submissionLimits) return null;

    return (
      <div className="mt-6 bg-white shadow-lg rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Limits</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Attempts Used:</span>
            <span className="font-medium">{submissionLimits.attemptsUsed} / {submissionLimits.totalAttempts}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Attempts Left:</span>
            <span className="font-medium">{submissionLimits.attemptsLeft}</span>
          </div>
          {submissionLimits.nextAttemptTime && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Next Attempt Available:</span>
              <span className="font-medium">
                {new Date(submissionLimits.nextAttemptTime).toLocaleString()}
              </span>
            </div>
          )}
          {submissionLimits.message && (
            <div className={`mt-2 p-2 rounded ${
              submissionLimits.canRetake ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
            }`}>
              {submissionLimits.message}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading test details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-lg rounded-xl p-8 border-l-4 border-red-500">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Test</h1>
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-lg rounded-xl p-8 border-l-4 border-yellow-500">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <svg className="h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Desktop Mode Recommended</h1>
                <p className="text-gray-600">For the best test-taking experience, please use a computer or switch to desktop mode.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {test && (
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Section - Enhanced gradient and shadow */}
          <div className="bg-white shadow-2xl rounded-2xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
            <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-700 px-8 py-8">
              <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">{test.title}</h1>
              <p className="text-blue-50 text-lg">{test.description}</p>
            </div>

            {/* Test Details Grid - Enhanced cards */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                    label: "Duration",
                    value: `${test.duration} minutes`,
                    bgColor: "bg-blue-50",
                    iconColor: "text-blue-600"
                  },
                  {
                    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                    label: "Total Marks",
                    value: test.totalMarks,
                    bgColor: "bg-green-50",
                    iconColor: "text-green-600"
                  },
                  {
                    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
                    label: "Type",
                    value: formatTestType(test.type),
                    bgColor: "bg-purple-50",
                    iconColor: "text-purple-600"
                  },
                  {
                    icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
                    label: "Category",
                    value: test.category,
                    bgColor: "bg-yellow-50",
                    iconColor: "text-yellow-600"
                  }
                ].map((item, index) => (
                  <div key={index} 
                    className={`${item.bgColor} rounded-xl p-6 transform hover:scale-105 transition-transform duration-300 shadow-md`}>
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 ${item.bgColor} rounded-full`}>
                        <svg className={`h-7 w-7 ${item.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">{item.label}</p>
                        <p className="text-lg font-semibold text-gray-900">{item.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons - Keep existing functionality but enhance styling */}
              {registrationStatus && (
                <div className="mt-8 space-y-4">
                  {!registrationStatus.isRegistered && registrationStatus.canAccess && 
                    vendorBalance?.hasBalance && (
                    <>
                      {testStatus?.endDate && new Date() > new Date(testStatus.endDate) ? (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                          <div className="flex items-center justify-center space-x-3">
                            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-center">
                              <h3 className="text-lg font-semibold text-red-800">Test Has Ended</h3>
                              <p className="text-red-600">
                                This test ended on {formatScheduleTime(testStatus.endDate)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : !testStatus?.isAvailable ? (
                        <div className="bg-white shadow-lg rounded-xl p-6 border border-blue-100">
                          <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test starts in:</h3>
                            {countdown && (
                              <div className="grid grid-cols-4 gap-4">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                  <div className="text-2xl font-bold text-blue-700">{countdown.days}</div>
                                  <div className="text-sm text-blue-600">Days</div>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-lg">
                                  <div className="text-2xl font-bold text-blue-700">{countdown.hours}</div>
                                  <div className="text-sm text-blue-600">Hours</div>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-lg">
                                  <div className="text-2xl font-bold text-blue-700">{countdown.minutes}</div>
                                  <div className="text-sm text-blue-600">Minutes</div>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-lg">
                                  <div className="text-2xl font-bold text-blue-700">{countdown.seconds}</div>
                                  <div className="text-sm text-blue-600">Seconds</div>
                                </div>
                              </div>
                            )}
                            <p className="mt-4 text-gray-600">
                              Please wait until the scheduled start time to begin the test.
                            </p>
                          </div>
                        </div>
                      ) : (
                        submissionLimits?.canRetake !== false && (
                          <button
                            onClick={handleRegister}
                            disabled={loading || !vendorBalance?.hasBalance}
                            className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold text-lg 
                              hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] transition-all duration-300 
                              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                              shadow-lg hover:shadow-xl"
                          >
                            {loading ? (
                              <span className="flex items-center space-x-3">
                                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Processing Registration...</span>
                              </span>
                            ) : (
                              <span className="flex items-center space-x-2">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span>Register for Test</span>
                              </span>
                            )}
                          </button>
                        )
                      )}
                    </>
                  )}
                  
                  {registrationStatus.isRegistered && registrationStatus.canAccess && 
                    vendorBalance?.hasBalance && test.scheduleStatus?.isAvailable && (
                    <button
                      onClick={handleStartTest}
                      disabled={loading || !vendorBalance?.hasBalance || !test.scheduleStatus?.isAvailable}
                      className="w-full flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      <span className="flex items-center space-x-2">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Start Test Now</span>
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Status Messages - Enhanced styling */}
          {vendorBalance && !vendorBalance.hasBalance && (
            <div className="mt-6 bg-red-50 rounded-xl p-6 border border-red-200 shadow-lg transform hover:scale-[1.01] transition-transform duration-300">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Test Unavailable</h3>
                  <p className="text-red-600 mt-1">This test is currently unavailable. Please contact the test administrator for assistance.</p>
                </div>
              </div>
            </div>
          )}

          {registrationStatus && (
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Access Status</h3>
              {registrationStatus.canAccess && vendorBalance?.hasBalance ? (
                <div className="flex items-center space-x-3 text-green-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium">You are authorized to take this test</p>
                    {registrationStatus.accessControl?.allowedUsers?.[0] && (
                      <p className="text-sm text-gray-600 mt-1">
                        Registered email: {registrationStatus.accessControl.allowedUsers[0].email}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 text-yellow-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="font-medium">
                    {!vendorBalance?.hasBalance 
                      ? 'This test is currently unavailable. Please try again later.' 
                      : (registrationStatus.message || 'This is a private test. Please contact the test administrator for access.')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Schedule Info - Enhanced card design */}
          {renderScheduleInfo()}

          {/* Submission Limits Info - Enhanced card design */}
          {renderSubmissionLimitsInfo()}
        </div>
      )}
    </div>
  );
} 

