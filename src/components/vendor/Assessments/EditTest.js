import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../common/Card';
import { toast } from 'react-hot-toast';
import { useTestManagement } from '../../../hooks/useTestManagement';
import SettingsTab from './components/SettingsTab';
import { testService } from '../../../services/test.service';
import MCQSection from './components/MCQSection';
import CodingSection from './components/CodingSection';
import { format } from 'date-fns';

const EditTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [validationErrors, setValidationErrors] = useState({});
  useTestManagement();

  const [testData, setTestData] = useState({
    title: '',
    description: '',
    duration: '',
    proctoring: false,
    type: '',
    category: '',
    difficulty: '',
    instructions: '',
    mcqs: [],
    codingChallenges: [],
    accessControl: {
      type: 'private'
    },
    settings: {},
    scheduling: {},
    warningSystem: {
      enabled: false,
      maxWarnings: 3,
      actions: {
        autoSubmit: true,
        notifyVendor: true
      }
    },
    totalMarks: 0,
    passingMarks: 0,
    submissionLimits: {
      maxAttempts: 1,
      retakeDelay: 0,
      allowRetake: false
    }
  });

  // Fetch test data on component mount
  useEffect(() => {
    const fetchTestData = async () => {
      try {
        setLoading(true);
        const response = await testService.getTestById(testId);
        
        if (response.data) {
          // Ensure warning system has default values if not present
          const data = {
            ...response.data,
            warningSystem: response.data.warningSystem || {
              enabled: false,
              maxWarnings: 3,
              actions: {
                autoSubmit: true,
                notifyVendor: true
              }
            }
          };
          setTestData(data);
          console.log('Loaded test data:', data); // For debugging
        } else {
          throw new Error('No test data received');
        }
      } catch (error) {
        console.error('Error fetching test:', error);
        toast.error('Failed to fetch test data');
        navigate('/vendor/tests');
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [testId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setValidationErrors({});
      
      const errors = {};
      
      // Basic validation
      if (!testData.title?.trim()) {
        errors.title = 'Test title is required';
      }
      if (!testData.category?.trim()) {
        errors.category = 'Category is required';
      }
      if (!testData.difficulty) {
        errors.difficulty = 'Difficulty level is required';
      }
      if (!testData.totalMarks || testData.totalMarks < 0) {
        errors.totalMarks = 'Total marks must be greater than 0';
      }
      if (!testData.passingMarks || testData.passingMarks < 0) {
        errors.passingMarks = 'Passing marks must be greater than 0';
      }
      if (testData.passingMarks > testData.totalMarks) {
        errors.passingMarks = 'Passing marks cannot exceed total marks';
      }

      // Warning system validation
      if (testData.warningSystem?.enabled) {
        if (!testData.warningSystem.maxWarnings || testData.warningSystem.maxWarnings < 1) {
          errors.warningSystem = 'Maximum warnings must be at least 1';
        }
        if (testData.warningSystem.maxWarnings > 10) {
          errors.warningSystem = 'Maximum warnings cannot exceed 10';
        }
      }

      // Submission limits validation
      if (testData.submissionLimits?.allowRetake && testData.submissionLimits.maxAttempts < 2) {
        errors.submissionLimits = 'Maximum attempts must be at least 2 when retakes are allowed';
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        Object.values(errors).forEach(error => toast.error(error));
        return;
      }

      // Format data for API
      const formattedData = {
        ...testData,
        warningSystem: {
          ...testData.warningSystem,
          enabled: Boolean(testData.warningSystem?.enabled),
          maxWarnings: parseInt(testData.warningSystem?.maxWarnings || 3),
          actions: {
            autoSubmit: Boolean(testData.warningSystem?.actions?.autoSubmit),
            notifyVendor: Boolean(testData.warningSystem?.actions?.notifyVendor)
          }
        }
      };

      await testService.updateTest(testId, formattedData);
      toast.success('Test updated successfully!');
      navigate('/vendor/tests');
    } catch (error) {
      console.error('Error updating test:', error);
      toast.error(error.message || 'Failed to update test');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
      navigate('/vendor/tests');
    }
  };

  const handleAddAllowedUser = (emailString) => {
    // Split by comma and trim whitespace
    const emails = emailString.split(',').map(email => email.trim());
    
    // Filter out empty strings and validate email format
    const validEmails = emails.filter(email => 
      email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );

    if (validEmails.length === 0) {
      toast.error('Please enter valid email addresses');
      return;
    }

    setTestData({
      ...testData,
      accessControl: {
        ...testData.accessControl,
        type: 'private',
        allowedUsers: [
          ...(testData.accessControl.allowedUsers || []),
          ...validEmails.map(email => ({
            email,
            name: '',
            addedAt: new Date()
          }))
        ]
      }
    });
  };

  const renderAccessControlSection = () => (
    testData.type === 'assessment' && (
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Add Allowed Users
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter email addresses (separated by commas)"
            className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target.value) {
                handleAddAllowedUser(e.target.value);
                e.target.value = '';
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[type="text"]');
              if (input.value) {
                handleAddAllowedUser(input.value);
                input.value = '';
              }
            }}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            Add
          </button>
        </div>
        <p className="text-sm text-gray-500">
          Example: user1@example.com, user2@example.com, user3@example.com
        </p>

        <div className="mt-4">
          {testData.accessControl?.allowedUsers?.map((user, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg mb-2">
              <span>{user.email}</span>
              <button
                onClick={() => {
                  const newAllowedUsers = testData.accessControl.allowedUsers.filter(
                    (_, i) => i !== index
                  );
                  setTestData({
                    ...testData,
                    accessControl: {
                      ...testData.accessControl,
                      allowedUsers: newAllowedUsers
                    }
                  });
                }}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  );

  const renderSchedulingSection = () => (
    <Card>
      <CardHeader className="border-b p-4">
        <CardTitle>Test Schedule</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              value={testData.scheduling?.startDate ? 
                format(new Date(testData.scheduling.startDate), "yyyy-MM-dd'T'HH:mm") : 
                ''
              }
              onChange={(e) => setTestData({
                ...testData,
                scheduling: {
                  ...testData.scheduling,
                  startDate: e.target.value ? new Date(e.target.value).toISOString() : null
                }
              })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              value={testData.scheduling?.endDate ? 
                format(new Date(testData.scheduling.endDate), "yyyy-MM-dd'T'HH:mm") : 
                ''
              }
              onChange={(e) => setTestData({
                ...testData,
                scheduling: {
                  ...testData.scheduling,
                  endDate: e.target.value ? new Date(e.target.value).toISOString() : null
                }
              })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            <select
              value={testData.scheduling?.timezone || 'Asia/Kolkata'}
              onChange={(e) => setTestData({
                ...testData,
                scheduling: {
                  ...testData.scheduling,
                  timezone: e.target.value
                }
              })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none"
            >
              <option value="Asia/Kolkata">India Standard Time (IST)</option>
              <option value="UTC">Coordinated Universal Time (UTC)</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoStart"
              checked={testData.scheduling?.autoStart || false}
              onChange={(e) => setTestData({
                ...testData,
                scheduling: {
                  ...testData.scheduling,
                  autoStart: e.target.checked
                }
              })}
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            <label htmlFor="autoStart" className="ml-2 text-sm text-gray-700">
              Auto-start test at scheduled time
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoEnd"
              checked={testData.scheduling?.autoEnd || false}
              onChange={(e) => setTestData({
                ...testData,
                scheduling: {
                  ...testData.scheduling,
                  autoEnd: e.target.checked
                }
              })}
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            <label htmlFor="autoEnd" className="ml-2 text-sm text-gray-700">
              Auto-end test at scheduled time
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderWarningSystemSection = () => (
    <Card>
      <CardHeader className="border-b p-4">
        <CardTitle>Warning System</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="warningEnabled"
            checked={testData.warningSystem?.enabled || false}
            onChange={(e) => setTestData({
              ...testData,
              warningSystem: {
                ...testData.warningSystem,
                enabled: e.target.checked
              }
            })}
            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
          />
          <label htmlFor="warningEnabled" className="ml-2 text-sm text-gray-700">
            Enable Warning System
          </label>
        </div>

        {testData.warningSystem?.enabled && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Warnings
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={testData.warningSystem?.maxWarnings || 3}
                onChange={(e) => setTestData({
                  ...testData,
                  warningSystem: {
                    ...testData.warningSystem,
                    maxWarnings: Math.max(1, parseInt(e.target.value) || 3)
                  }
                })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none"
              />
              <p className="mt-1 text-sm text-gray-500">
                Number of warnings before actions are triggered (1-10)
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Actions on Maximum Warnings
              </label>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoSubmit"
                  checked={testData.warningSystem?.actions?.autoSubmit || false}
                  onChange={(e) => setTestData({
                    ...testData,
                    warningSystem: {
                      ...testData.warningSystem,
                      actions: {
                        ...testData.warningSystem?.actions,
                        autoSubmit: e.target.checked
                      }
                    }
                  })}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="autoSubmit" className="ml-2 text-sm text-gray-700">
                  Auto-submit test
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifyVendor"
                  checked={testData.warningSystem?.actions?.notifyVendor || false}
                  onChange={(e) => setTestData({
                    ...testData,
                    warningSystem: {
                      ...testData.warningSystem,
                      actions: {
                        ...testData.warningSystem?.actions,
                        notifyVendor: e.target.checked
                      }
                    }
                  })}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="notifyVendor" className="ml-2 text-sm text-gray-700">
                  Notify vendor
                </label>
              </div>
            </div>

            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                When enabled, the warning system will:
                <ul className="list-disc ml-5 mt-1">
                  <li>Monitor for suspicious behavior during the test</li>
                  <li>Issue warnings to the candidate when detected</li>
                  <li>Take selected actions after {testData.warningSystem?.maxWarnings} warnings</li>
                </ul>
              </p>
            </div>
          </>
        )}
        {renderError('warningSystem')}
      </CardContent>
    </Card>
  );

  const renderSubmissionLimitsSection = () => (
    <Card>
      <CardHeader className="border-b p-4">
        <CardTitle>Submission Limits</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="allowRetake"
            checked={testData.submissionLimits?.allowRetake || false}
            onChange={(e) => setTestData({
              ...testData,
              submissionLimits: {
                ...testData.submissionLimits,
                allowRetake: e.target.checked,
                maxAttempts: e.target.checked ? 2 : 1 // Default to 2 attempts when enabled
              }
            })}
            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
          />
          <label htmlFor="allowRetake" className="ml-2 text-sm text-gray-700">
            Allow Test Retakes
          </label>
        </div>

        {testData.submissionLimits?.allowRetake && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Attempts
              </label>
              <input
                type="number"
                min="2"
                value={testData.submissionLimits?.maxAttempts || 2}
                onChange={(e) => setTestData({
                  ...testData,
                  submissionLimits: {
                    ...testData.submissionLimits,
                    maxAttempts: Math.max(2, parseInt(e.target.value) || 2)
                  }
                })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Retake Delay (hours)
              </label>
              <input
                type="number"
                min="0"
                value={testData.submissionLimits?.retakeDelay || 0}
                onChange={(e) => setTestData({
                  ...testData,
                  submissionLimits: {
                    ...testData.submissionLimits,
                    retakeDelay: Math.max(0, parseInt(e.target.value) || 0)
                  }
                })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none"
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  const renderTestScoreSection = () => (
    <Card>
      <CardHeader className="border-b p-4">
        <CardTitle>Test Scoring</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Marks*
            </label>
            <input
              type="number"
              min="0"
              value={testData.totalMarks || ''}
              onChange={(e) => setTestData({
                ...testData,
                totalMarks: parseInt(e.target.value) || 0
              })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passing Marks*
            </label>
            <input
              type="number"
              min="0"
              max={testData.totalMarks || 0}
              value={testData.passingMarks || ''}
              onChange={(e) => setTestData({
                ...testData,
                passingMarks: parseInt(e.target.value) || 0
              })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <Card>
            <CardHeader className="border-b p-4">
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Title*
                  </label>
                  <input
                    type="text"
                    value={testData.title}
                    onChange={(e) => setTestData({...testData, title: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none"
                    placeholder="Enter test title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category*
                  </label>
                  <select
                    value={testData.category}
                    onChange={(e) => setTestData({...testData, category: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none"
                  >
                    <option value="">Select category</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Programming">Programming</option>
                    <option value="Data Structures">Data Structures</option>
                    <option value="Algorithms">Algorithms</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Database">Database</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Type*
                  </label>
                  <select
                    value={testData.type}
                    onChange={(e) => setTestData({...testData, type: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none"
                  >
                    <option value="">Select type</option>
                    <option value="assessment">Assessment</option>
                    <option value="coding_challenge">Coding Challenge</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)*
                  </label>
                  <input
                    type="number"
                    value={testData.duration}
                    onChange={(e) => setTestData({...testData, duration: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none"
                    placeholder="Enter duration"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level*
                  </label>
                  <select
                    value={testData.difficulty}
                    onChange={(e) => setTestData({...testData, difficulty: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none"
                  >
                    <option value="">Select difficulty</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proctoring
                  </label>
                  <select
                    value={testData.proctoring.toString()}
                    onChange={(e) => setTestData({
                      ...testData,
                      proctoring: e.target.value === 'true'
                    })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none"
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={testData.description}
                  onChange={(e) => setTestData({...testData, description: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none"
                  rows={3}
                  placeholder="Enter test description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions
                </label>
                <textarea
                  value={testData.instructions}
                  onChange={(e) => setTestData({...testData, instructions: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none"
                  rows={3}
                  placeholder="Enter test instructions"
                />
              </div>

              {renderAccessControlSection()}
            </CardContent>
          </Card>
        );
      case 'questions':
        return (
          <div className="space-y-6">
            <MCQSection 
              testData={testData} 
              setTestData={setTestData} 
              renderOptionText={(option) => option?.text || ''}
            />
            <CodingSection testData={testData} setTestData={setTestData} />
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            {renderTestScoreSection()}
            {renderSchedulingSection()}
            {renderSubmissionLimitsSection()}
            {renderWarningSystemSection()}
            <SettingsTab testData={testData} setTestData={setTestData} testId={testId} />
          </div>
        );
      default:
        return null;
    }
  };

  // Helper function to render validation error
  const renderError = (field) => {
    if (validationErrors[field]) {
      return (
        <p className="mt-1 text-sm text-red-600">
          {validationErrors[field]}
        </p>
      );
    }
    return null;
  };

  // Loading state UI
  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-8">
          {/* Add loading skeleton similar to CreateTest */}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Edit Test</h1>
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 ${
                activeTab === 'details'
                  ? 'border-b-2 border-emerald-500 text-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Basic Details
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-4 py-2 ${
                activeTab === 'questions'
                  ? 'border-b-2 border-emerald-500 text-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Questions
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 ${
                activeTab === 'settings'
                  ? 'border-b-2 border-emerald-500 text-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {!loading && renderTabContent()}
      </div>
    </Layout>
  );
};

export default EditTest; 