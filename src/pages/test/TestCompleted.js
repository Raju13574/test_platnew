import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { toast } from 'react-hot-toast';

export default function TestCompleted() {
  const location = useLocation();
  const navigate = useNavigate();
  const { testId, submission, sessionId } = location.state || {};

  // Update test status when component mounts
  useEffect(() => {
    const updateTestStatus = async () => {
      try {
        // Get testId from state or localStorage as fallback
        const currentTestId = testId || localStorage.getItem('currentTestId');
        
        if (currentTestId) {
          // Update test status to completed using the MongoDB ObjectId
          await apiService.post('submissions/update-status', {
            testId: currentTestId, // This should now be a MongoDB ObjectId
            status: 'completed'
          });

          // Clear localStorage items
          const itemsToClear = [
            'testEndTime',
            'testAnalytics',
            'mcq_answers',
            'coding_answers',
            'currentMcqIndex',
            'currentTestId',
            'currentTestData',
            'submissionId',
            'testStarted',
            'testStartTime',
            'codingSubmissionStatus',
            'currentVendorId',
            'testStatus'
          ];

          itemsToClear.forEach(item => localStorage.removeItem(item));
          
          // Clear items with specific prefixes
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('coding_state_') || 
                key.startsWith('test_') || 
                key.startsWith('submission_')) {
              localStorage.removeItem(key);
            }
          });
        } else {
          console.warn('No test ID found in state or localStorage');
        }
      } catch (error) {
        console.error('Error updating test status:', error);
        toast.error('Error updating test status. Please contact support.');
      }
    };

    updateTestStatus();

    // Prevent going back to test
    const handlePopState = (e) => {
      e.preventDefault();
      navigate('/dashboard/user', { replace: true });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [testId, navigate]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Test Completed!</h1>
        </div>
        
        <p className="text-gray-600 mb-8">
          Thank you for completing the test. Your responses have been submitted successfully.
          {submission?.submissionType === 'manual' && (
            <span className="block mt-2 text-red-600 font-medium">
              Note: Your test was automatically submitted due to violation of test rules.
            </span>
          )}
          {sessionId ? (
            <span className="block mt-2">Session ID: {sessionId}</span>
          ) : (
            <span className="block mt-2 text-yellow-600">
              If your session ended due to technical issues or you encountered any problems, 
              please contact our support team.
            </span>
          )}
        </p>

        <div className="space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            to="/dashboard/user"
            className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </Link>
          
          <Link
            to="/dashboard/user"
            className="inline-block bg-gray-100 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors"
          >
            View Results
          </Link>
        </div>
      </div>
    </div>
  );
} 