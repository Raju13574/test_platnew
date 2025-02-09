import apiService from './api';

export const testService = {
  // Get all tests
  getAllTests: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return await apiService.get(`tests?${queryString}`);
  },

  // Create test - handles both manual form data and JSON upload
  createTest: async (testData) => {
    try {
      let formattedData = testData;

      if (testData.isJsonUpload) {
        // Transform MCQs to match the required schema
        formattedData = {
          ...testData,
          mcqs: testData.mcqs?.map(mcq => ({
            ...mcq,
            options: mcq.options.map(opt => ({
              text: opt,
              image: null
            })),
            // Ensure correctOptions are valid indices
            correctOptions: mcq.correctOptions.map(Number)
          })) || [],
          codingChallenges: testData.codingChallenges || [],
          submissionLimits: testData.submissionLimits || {
            maxAttempts: 1,
            retakeDelay: 0,
            allowRetake: false
          }
        };
      } else {
        // Original form data transformation
        formattedData = {
          ...testData,
          totalMarks: calculateTotalMarks(testData),
          passingMarks: calculatePassingMarks(testData),
          duration: parseInt(testData.duration),
          proctoring: testData.proctoring === 'true',
          mcqs: testData.mcqs?.map(mcq => ({
            ...mcq,
            marks: parseInt(mcq.marks),
            options: mcq.options?.map(opt => ({
              text: opt,
              image: null
            })),
            correctOptions: mcq.correctOptions?.map(Number),
            image: mcq.image || null
          })) || [],
          codingChallenges: testData.codingChallenges?.map(challenge => ({
            ...challenge,
            marks: parseInt(challenge.marks),
            timeLimit: parseInt(challenge.timeLimit),
            memoryLimit: parseInt(challenge.memoryLimit)
          })) || []
        };
      }

      const response = await apiService.post('/tests', formattedData);
      
      if (response.status === 201) {
        return {
          status: 201,
          data: response.data,
          message: 'Test created successfully'
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error in createTest:', error);
      
      const errorMessage = error.response?.data?.error || 'Failed to create test';
      const errorDetails = error.response?.data?.details || {};
      
      throw new Error(JSON.stringify({
        message: errorMessage,
        details: errorDetails,
        status: error.response?.status || 500
      }));
    }
  },
  

  // Add coding challenges to a test
  addCodingChallenges: async (testId, challenges) => {
    return await apiService.post(`/tests/${testId}/coding-challenges`, challenges);
  },

  // Update test
  updateTest: async (testId, testData) => {
    const response = await apiService.put(`/tests/${testId}`, testData);
    return response.data;
  },

  // Delete test
  deleteTest: async (testId) => {
    return await apiService.delete(`/tests/${testId}`);
  },

  // Publish test
  publishTest: async (testId) => {
    return await apiService.post(`/tests/${testId}/publish`);
  },

  // Share test
  shareTest: async (testId, emails) => {
    return await apiService.post(`/tests/${testId}/share`, { emails });
  },

  // Get test by ID
  getTestById: async (testId) => {
    try {
      const response = await apiService.get(`/tests/${testId}`);
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      // Transform the data to match form structure
      const formattedData = {
        ...response.data,
        duration: response.data.duration?.toString() || '',
        proctoring: response.data.proctoring?.toString() || 'false',
        settings: response.data.settings || {},
        mcqs: (response.data.mcqs || []).map(mcq => ({
          ...mcq,
          marks: mcq.marks?.toString() || '0'
        })),
        codingChallenges: (response.data.codingChallenges || []).map(challenge => ({
          ...challenge,
          marks: challenge.marks?.toString() || '0',
          timeLimit: challenge.timeLimit?.toString() || '0',
          memoryLimit: challenge.memoryLimit?.toString() || '0'
        }))
      };

      return { data: formattedData };
    } catch (error) {
      console.error('Error in getTestById:', error);
      throw error;
    }
  },

  // Update test visibility
  updateTestVisibility: async (testId, visibility) => {
    try {
      const response = await apiService.patch(`/tests/${testId}/visibility`, { 
        visibility,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to update test visibility:', error);
      throw error;
    }
  },

  // Get user's test results
  getUserTests: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiService.get(`/user/tests/all${queryString ? `?${queryString}` : ''}`);
      
      return { 
        data: response?.data || {} 
      };
    } catch (error) {
      console.error('Error fetching user tests:', error);
      return { data: {} };
    }
  },

  // Add this new method for dashboard metrics
  getDashboardMetrics: async () => {
    try {
      const response = await apiService.get('/vendor/dashboard/metrics');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }
};

// Helper functions to calculate marks
function calculateTotalMarks(testData) {
  const mcqMarks = (testData.mcqs || [])
    .reduce((sum, mcq) => sum + (parseInt(mcq.marks) || 0), 0);
  
  const codingMarks = (testData.codingChallenges || [])
    .reduce((sum, challenge) => sum + (parseInt(challenge.marks) || 0), 0);
  
  return mcqMarks + codingMarks;
}

function calculatePassingMarks(testData) {
  // Default to 40% of total marks if not specified
  return testData.passingMarks || Math.ceil(calculateTotalMarks(testData) * 0.4);
} 

