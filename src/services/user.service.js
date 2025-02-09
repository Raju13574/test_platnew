import api from './api';

export const userService = {
  // Get user profile with proper error handling
  getProfile: async () => {
    try {
      // Log the request attempt
      console.log('Fetching user profile...');
      
      // Make the API call with proper headers
      const response = await api.get('/user/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Log successful response
      console.log('Profile data received:', response.data);

      // Return the transformed data
      return {
        basics: response.data.basics || {
          name: '',
          headline: '',
          email: '',
          phone: '',
          location: {
            address: '',
            city: '',
            country: '',
            postalCode: ''
          },
          url: { label: '', href: '' },
          customFields: []
        },
        sections: response.data.sections || {
          summary: { visible: true, content: '', columns: 1 },
          experience: [],
          education: [],
          skills: [],
          languages: [],
          interests: [],
          references: [],
          publications: [],
          volunteer: [],
          awards: []
        },
        resumePreferences: response.data.resumePreferences || {
          template: 'modern',
          layout: { columns: 2, spacing: 'normal' },
          typography: { fontSize: 'medium', fontFamily: 'Inter' },
          colors: {
            primary: '#1a73e8',
            text: '#2d3748',
            background: '#ffffff'
          }
        }
      };
    } catch (error) {
      // Enhanced error logging
      console.error('Profile fetch error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });

      // Throw a user-friendly error
      throw new Error(
        error.response?.data?.message || 
        'Failed to load profile. Please try again.'
      );
    }
  },

  // Create or update full profile
  updateFullProfile: async (profileData) => {
    try {
      const response = await api.post('/user/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating full profile:', error);
      throw error;
    }
  },

  // Update profile with proper error handling
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/user/profile', profileData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to update profile. Please try again.'
      );
    }
  },

  // Update skills
  updateSkills: async (skills) => {
    try {
      const response = await api.put('/user/skills', { skills });
      return response.data;
    } catch (error) {
      console.error('Error updating skills:', error);
      throw error;
    }
  },

  // Update specific section
  updateSection: async (sectionKey, sectionData) => {
    try {
      const response = await api.put(`/api/user/resume/section/${sectionKey}`, sectionData);
      return response.data;
    } catch (error) {
      console.error(`Error updating section ${sectionKey}:`, error);
      throw new Error(`Failed to update ${sectionKey} section`);
    }
  },

  // Update resume preferences
  updateResumePreferences: async (preferences) => {
    try {
      const response = await api.put('/api/user/resume/preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Error updating resume preferences:', error);
      throw new Error('Failed to update resume preferences');
    }
  },

  // Update custom section
  updateCustomSection: async (sectionId, sectionData) => {
    try {
      const response = await api.put(`/api/user/resume/custom-section/${sectionId}`, sectionData);
      return response.data;
    } catch (error) {
      console.error('Error updating custom section:', error);
      throw new Error('Failed to update custom section');
    }
  }
}; 