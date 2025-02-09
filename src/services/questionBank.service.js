import { apiService } from './api';

export const questionBankService = {
  // MCQ Operations
  addMCQs: async (data) => {
    try {
      const response = await apiService.post('/question-bank/mcqs', data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to add MCQ');
    }
  },

  importMCQsFromFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Check file extension
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      if (fileExtension === 'json') {
        // If JSON file, read it first
        const reader = new FileReader();
        const jsonData = await new Promise((resolve, reject) => {
          reader.onload = (e) => {
            try {
              let data = JSON.parse(e.target.result);
              // If the data is wrapped in an mcqs property, extract it
              if (data.mcqs) {
                data = data.mcqs;
              }
              // Validate each MCQ
              data.forEach(mcq => {
                if (!mcq.question) throw new Error('Question is required');
                if (!Array.isArray(mcq.options) || mcq.options.length < 2) {
                  throw new Error('At least two options are required');
                }
                if (!Array.isArray(mcq.correctOptions) || mcq.correctOptions.length < 1) {
                  throw new Error('At least one correct option is required');
                }
                if (!mcq.answerType) mcq.answerType = 'single';
                if (!mcq.marks) mcq.marks = 1;
                if (!mcq.difficulty) mcq.difficulty = 'easy';
                if (!mcq.category) mcq.category = 'General';
              });
              resolve(data);
            } catch (error) {
              reject(new Error('Invalid JSON file: ' + error.message));
            }
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsText(file);
        });

        // Send JSON data directly
        const response = await apiService.post('/question-bank/mcqs/import', jsonData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return response.data;
      } else {
        // For Excel files, use multipart/form-data
        const response = await apiService.post('/question-bank/mcqs/import', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      }
    } catch (error) {
      console.error('Import error:', error);
      throw new Error('Failed to import MCQs');
    }
  },

  // Coding Challenge Operations
  addCodingChallenges: async (data) => {
    try {
      const response = await apiService.post('/question-bank/coding', data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to add coding challenge');
    }
  },

  importCodingChallengesFromFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Check file extension
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      if (fileExtension === 'json') {
        // If JSON file, read it first
        const reader = new FileReader();
        const jsonData = await new Promise((resolve, reject) => {
          reader.onload = (e) => {
            try {
              let data = JSON.parse(e.target.result);
              // If the data is wrapped in a codingChallenges property, extract it
              if (data.codingChallenges) {
                data = data.codingChallenges;
              }
              // Validate each coding challenge
              data.forEach(challenge => {
                if (!challenge.title) throw new Error('Title is required');
                if (!challenge.description) throw new Error('Description is required');
                if (!challenge.problemStatement) throw new Error('Problem statement is required');
                if (!challenge.constraints) throw new Error('Constraints are required');
                
                // Validate allowed languages
                if (!Array.isArray(challenge.allowedLanguages) || challenge.allowedLanguages.length < 1) {
                  throw new Error('At least one programming language must be allowed');
                }

                // Validate language implementations
                if (!challenge.languageImplementations || typeof challenge.languageImplementations !== 'object') {
                  throw new Error('Language implementations are required');
                }

                // Check if implementations exist for all allowed languages
                challenge.allowedLanguages.forEach(lang => {
                  const impl = challenge.languageImplementations[lang];
                  if (!impl || !impl.visibleCode) {
                    throw new Error(`Implementation for ${lang} is missing or invalid`);
                  }
                });

                // Validate test cases
                if (!Array.isArray(challenge.testCases) || challenge.testCases.length < 1) {
                  throw new Error('At least one test case is required');
                }

                challenge.testCases.forEach((testCase, index) => {
                  if (!testCase.input) throw new Error(`Input is required for test case ${index + 1}`);
                  if (!testCase.output) throw new Error(`Output is required for test case ${index + 1}`);
                  testCase.isVisible = testCase.isVisible ?? true;
                });

                // Set default values for optional fields
                if (!challenge.marks) challenge.marks = 10;
                if (!challenge.timeLimit) challenge.timeLimit = 1;
                if (!challenge.memoryLimit) challenge.memoryLimit = 256;
                if (!challenge.difficulty) challenge.difficulty = 'easy';
                if (!challenge.category) challenge.category = 'General';
                if (!Array.isArray(challenge.tags)) challenge.tags = [];
              });
              resolve(data);
            } catch (error) {
              reject(new Error('Invalid JSON file: ' + error.message));
            }
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsText(file);
        });

        // Send JSON data directly
        const response = await apiService.post('/question-bank/coding/import', jsonData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return response.data;
      } else {
        // For Excel files, use multipart/form-data
        const response = await apiService.post('/question-bank/coding/import', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      }
    } catch (error) {
      console.error('Import error:', error);
      throw new Error('Failed to import coding challenges');
    }
  },

  // Search and Filter
  searchQuestions: async (params) => {
    try {
      const response = await apiService.get('/question-bank/search', { params });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch questions');
    }
  },

  deleteMCQ: async (id) => {
    try {
      const response = await apiService.delete(`/question-bank/mcqs/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to delete MCQ');
    }
  },

  deleteCodingChallenge: async (id) => {
    try {
      const response = await apiService.delete(`/question-bank/coding/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to delete coding challenge');
    }
  },

  updateMCQ: async (id, data) => {
    try {
      if (!id) {
        throw new Error('Question ID is required');
      }

      // Enhanced validation and formatting
      const formattedData = {
        ...data,
        options: Array.isArray(data.options) 
          ? data.options.filter(opt => opt && opt.trim() !== '')
          : [],
        correctOptions: Array.isArray(data.correctOptions)
          ? data.correctOptions.filter(index => 
              typeof index === 'number' && 
              index >= 0 && 
              index < (data.options?.length || 0)
            )
          : []
      };

      // Additional validation before sending to server
      if (formattedData.options.length < 2) {
        throw new Error('At least two valid options are required');
      }
      if (formattedData.correctOptions.length === 0) {
        throw new Error('At least one correct option is required');
      }

      const response = await apiService.put(`/question-bank/mcqs/${id}`, formattedData);
      return response.data;
    } catch (error) {
      console.error('Update MCQ error:', error);
      // Improved error handling
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update MCQ';
      throw new Error(errorMessage);
    }
  },

  updateCodingChallenge: async (id, data) => {
    try {
      if (!id) {
        throw new Error('Question ID is required');
      }

      // Format coding challenge data if needed
      const formattedData = {
        ...data,
        timeLimit: parseInt(data.timeLimit) || 300,
        memoryLimit: parseInt(data.memoryLimit) || 512,
        allowedLanguages: Array.isArray(data.allowedLanguages) 
          ? data.allowedLanguages 
          : ['javascript'],
        languageImplementations: data.languageImplementations || {}
      };

      const response = await apiService.put(`/question-bank/coding/${id}`, formattedData);
      return response.data;
    } catch (error) {
      console.error('Update coding challenge error:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.message || 'Failed to update coding challenge');
    }
  },

  // Helper method to validate MCQ data
  validateMCQData: (data) => {
    const errors = [];

    if (!Array.isArray(data.options) || data.options.length < 2) {
      errors.push('At least two options are required');
    }

    if (!Array.isArray(data.correctOptions) || data.correctOptions.length === 0) {
      errors.push('At least one correct option is required');
    }

    const validOptions = data.options.filter(opt => opt && opt.trim() !== '');
    if (validOptions.length < 2) {
      errors.push('At least two non-empty options are required');
    }

    const validCorrectOptions = data.correctOptions.filter(index => 
      typeof index === 'number' && 
      index >= 0 && 
      index < validOptions.length
    );
    if (validCorrectOptions.length === 0) {
      errors.push('Correct options must be valid indices of the options array');
    }

    return {
      isValid: errors.length === 0,
      errors,
      formattedData: {
        ...data,
        options: validOptions,
        correctOptions: validCorrectOptions
      }
    };
  },

  // Add a validation helper for coding challenges
  validateCodingChallengeData: (data) => {
    const errors = [];

    if (!data.title?.trim()) {
      errors.push('Title is required');
    }

    if (!data.description?.trim()) {
      errors.push('Description is required');
    }

    if (!data.problemStatement?.trim()) {
      errors.push('Problem statement is required');
    }

    if (!Array.isArray(data.allowedLanguages) || data.allowedLanguages.length < 1) {
      errors.push('At least one programming language must be allowed');
    }

    if (!data.languageImplementations || typeof data.languageImplementations !== 'object') {
      errors.push('Language implementations are required');
    } else {
      data.allowedLanguages?.forEach(lang => {
        const impl = data.languageImplementations[lang];
        if (!impl?.visibleCode) {
          errors.push(`Implementation for ${lang} is missing or invalid`);
        }
      });
    }

    if (!Array.isArray(data.testCases) || data.testCases.length < 1) {
      errors.push('At least one test case is required');
    } else {
      data.testCases.forEach((testCase, index) => {
        if (!testCase.input) errors.push(`Input is required for test case ${index + 1}`);
        if (!testCase.output) errors.push(`Output is required for test case ${index + 1}`);
      });
    }

    // Format the data with defaults
    const formattedData = {
      ...data,
      marks: Number(data.marks) || 10,
      timeLimit: Number(data.timeLimit) || 1,
      memoryLimit: Number(data.memoryLimit) || 256,
      difficulty: ['easy', 'medium', 'hard'].includes(data.difficulty) ? data.difficulty : 'easy',
      category: data.category || 'General',
      tags: Array.isArray(data.tags) ? data.tags : []
    };

    return {
      isValid: errors.length === 0,
      errors,
      formattedData
    };
  },
}; 