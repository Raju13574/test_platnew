import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../common/Card';
import { toast } from 'react-hot-toast';
import { useTestManagement } from '../../../hooks/useTestManagement';
import SettingsTab from './components/SettingsTab';
import { testService } from '../../../services/test.service';
import MCQSection from './components/MCQSection';
import CodingSection from './components/CodingSection';
import QuestionBankModal from './components/QuestionBankModal';
import AddQuestionModal from './components/AddQuestionModal';
import { Database, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

const CreateTest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  useTestManagement();
  
  const [activeTab, setActiveTab] = useState('details');
  
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
      type: 'public'
    },
    warningSystem: {
      enabled: false,
      maxWarnings: 3,
      actions: {
        autoSubmit: true,
        notifyVendor: true
      }
    },
    submissionLimits: {
      maxAttempts: 1,
      retakeDelay: 0,
      allowRetake: false
    },
    scheduling: {
      startDate: null,
      endDate: null,
      timezone: 'Asia/Kolkata',
      autoStart: false,
      autoEnd: true
    }
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [questionType, setQuestionType] = useState('mcq'); // For tracking which type of question to add

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setValidationErrors({});
      
      const errors = {};
      
      if (!testData.title) {
        errors.title = 'Test title is required';
      }
      if (!testData.type) {
        errors.type = 'Test type is required';
      }
      if (!testData.duration) {
        errors.duration = 'Test duration is required';
      }
      if (!testData.difficulty) {
        errors.difficulty = 'Test difficulty is required';
      }
      if (!testData.category) {
        errors.category = 'Test category is required';
      }
      if (testData.mcqs.length === 0 && testData.codingChallenges.length === 0) {
        errors.questions = 'Add at least one question (MCQ or Coding Challenge)';
      }

      if (testData.scheduling.startDate && testData.scheduling.endDate) {
        const startDate = new Date(testData.scheduling.startDate);
        const endDate = new Date(testData.scheduling.endDate);
        const now = new Date();

        if (startDate >= endDate) {
          errors.scheduling = 'End date must be after start date';
        }

        if (startDate < now && testData.scheduling.autoStart) {
          errors.scheduling = 'Start date cannot be in the past for auto-start tests';
        }
      }

      // Validate submission limits
      if (testData.submissionLimits.allowRetake) {
        if (testData.submissionLimits.maxAttempts < 2) {
          errors.submissionLimits = 'Maximum attempts must be at least 2 when retakes are allowed';
        }
        if (testData.submissionLimits.retakeDelay < 0) {
          errors.submissionLimits = 'Retake delay cannot be negative';
        }
      }

      // Validate coding challenges
      if (testData.codingChallenges.length > 0) {
        testData.codingChallenges.forEach((challenge, index) => {
          if (challenge.allowedLanguages) {
            challenge.allowedLanguages.forEach(lang => {
              const impl = challenge.languageImplementations[lang];
              if (!impl || !impl.visibleCode || !impl.invisibleCode) {
                errors.codingChallenges = errors.codingChallenges || [];
                errors.codingChallenges.push(
                  `Challenge "${challenge.title}": Both visibleCode and invisibleCode are required for language: ${lang}`
                );
              }
            });
          }
        });
      }

      // Prepare test data with access control
      const finalTestData = {
        ...testData,
        accessControl: {
          ...testData.accessControl,
          // Set type to private for assessments, public for coding challenges
          type: testData.type === 'assessment' ? 'private' : 'public',
          // Initialize or maintain allowedUsers array
          allowedUsers: testData.accessControl.allowedUsers || [],
          // Initialize or maintain allowedEmails array
          allowedEmails: testData.accessControl.allowedEmails || []
        },
        warningSystem: {
          ...testData.warningSystem,
          enabled: Boolean(testData.warningSystem.enabled),
          maxWarnings: parseInt(testData.warningSystem.maxWarnings),
          actions: {
            ...testData.warningSystem.actions,
            autoSubmit: Boolean(testData.warningSystem.actions.autoSubmit),
            notifyVendor: Boolean(testData.warningSystem.actions.notifyVendor)
          }
        }
      };

      // For assessments, ensure access control is properly set
      if (testData.type === 'assessment') {
        // Validate that there are allowed users or emails
        if (!testData.accessControl.allowedUsers?.length && !testData.accessControl.allowedEmails?.length) {
          errors.accessControl = 'Assessment tests require at least one allowed user or email';
        }
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        if (errors.codingChallenges) {
          errors.codingChallenges.forEach(error => toast.error(error));
        } else {
          Object.values(errors).forEach(error => toast.error(error));
        }
        return;
      }

      await testService.createTest(finalTestData);
      toast.success('Test created successfully!');
      navigate('/vendor/tests');
    } catch (error) {
      console.error('Error creating test:', error);
      toast.error(error.message || 'Failed to create test');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
      navigate('/vendor/tests');
    }
  };

  const renderError = (field) => {
    if (validationErrors[field]) {
      return (
        <span className="text-red-500 text-xs mt-1 flex items-center">
          {validationErrors[field]}
        </span>
      );
    }
    return null;
  };

  const handleSelectFromQuestionBank = (selectedQuestions) => {
    if (questionType === 'mcq') {
      setTestData({
        ...testData,
        mcqs: [...testData.mcqs, ...selectedQuestions]
      });
    } else {
      setTestData({
        ...testData,
        codingChallenges: [...testData.codingChallenges, ...selectedQuestions]
      });
    }
    setIsQuestionBankOpen(false);
  };

  const handleAddQuestion = (questionData) => {
    if (questionData.type === 'mcq') {
      // Convert simple string options to object format
      const formattedOptions = questionData.options.map(opt => ({
        text: opt,
        image: null // or { url: '', caption: '' } if you want to add image later
      }));

      const formattedQuestion = {
        ...questionData,
        options: formattedOptions,
        image: null, // or { url: '', caption: '', position: 'top' }
        correctOptions: questionData.correctOptions.filter(index => index < formattedOptions.length) // Ensure valid indices
      };

      setTestData({
        ...testData,
        mcqs: [...testData.mcqs, formattedQuestion]
      });
    } else {
      // For coding challenges
      const formattedQuestion = {
        ...questionData,
        // Ensure constraints is always an array of strings
        constraints: questionData.constraints ? (
          Array.isArray(questionData.constraints) 
            ? questionData.constraints.map(String)
            : [String(questionData.constraints)]
        ) : [],
        // Initialize other required fields if they don't exist
        languageImplementations: questionData.languageImplementations || {},
        allowedLanguages: questionData.allowedLanguages || [],
        testCases: questionData.testCases || []
      };

      setTestData({
        ...testData,
        codingChallenges: [...testData.codingChallenges, formattedQuestion]
      });
    }
    setIsAddQuestionModalOpen(false);
  };

  // Update the handleAddAllowedUser function to handle multiple emails
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

  // Update the renderAccessControlSection with new placeholder text
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

        {/* Display allowed users */}
        <div className="mt-4">
          {testData.accessControl.allowedUsers?.map((user, index) => (
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
        {renderError('accessControl')}
      </div>
    )
  );

  const handleSubmissionLimitsChange = (field, value) => {
    setTestData(prev => {
      const newLimits = { ...prev.submissionLimits };
      
      if (field === 'allowRetake') {
        newLimits.allowRetake = value;
        // Reset or set default values when toggling allowRetake
        if (value) {
          newLimits.maxAttempts = Math.max(2, newLimits.maxAttempts);
        } else {
          newLimits.maxAttempts = 1;
          newLimits.retakeDelay = 0;
        }
      } else if (field === 'maxAttempts') {
        newLimits.maxAttempts = Math.max(newLimits.allowRetake ? 2 : 1, parseInt(value) || 1);
      } else if (field === 'retakeDelay') {
        newLimits.retakeDelay = Math.max(0, parseInt(value) || 0);
      }

      return {
        ...prev,
        submissionLimits: newLimits
      };
    });
  };

  const renderDetailsTab = () => (
    <div className="space-y-6">
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
              {renderError('title')}
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
              {renderError('category')}
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
              {renderError('type')}
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
              {renderError('duration')}
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
              {renderError('difficulty')}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proctoring
              </label>
              <select
                value={testData.proctoring}
                onChange={(e) => setTestData({...testData, proctoring: e.target.value === 'true'})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none"
              >
                <option value="false">Disabled</option>
                <option value="true">Enabled</option>
              </select>
            </div>
          </div>

          {testData.proctoring && (
            <div className="mt-4 p-4 border rounded-lg">
              <h4 className="text-lg font-medium mb-4">Warning System Settings</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warning System
                  </label>
                  <select
                    value={testData.warningSystem.enabled}
                    onChange={(e) => setTestData({
                      ...testData,
                      warningSystem: {
                        ...testData.warningSystem,
                        enabled: e.target.value === 'true'
                      }
                    })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none"
                  >
                    <option value="false">Disabled</option>
                    <option value="true">Enabled</option>
                  </select>
                </div>

                {testData.warningSystem.enabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Warnings
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={testData.warningSystem.maxWarnings}
                      onChange={(e) => setTestData({
                        ...testData,
                        warningSystem: {
                          ...testData.warningSystem,
                          maxWarnings: parseInt(e.target.value) || 3
                        }
                      })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none"
                    />
                  </div>
                )}
              </div>

              {testData.warningSystem.enabled && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Actions on Maximum Warnings
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={testData.warningSystem.actions.autoSubmit}
                        onChange={(e) => setTestData({
                          ...testData,
                          warningSystem: {
                            ...testData.warningSystem,
                            actions: {
                              ...testData.warningSystem.actions,
                              autoSubmit: e.target.checked
                            }
                          }
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm">Auto-submit test</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

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

          {/* Add the access control section only here */}
          {renderAccessControlSection()}
        </CardContent>
      </Card>
    </div>
  );

  const renderQuestionsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b p-4">
          <div className="flex justify-between items-center">
            <CardTitle>Multiple Choice Questions</CardTitle>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setQuestionType('mcq');
                  setIsQuestionBankOpen(true);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                Select from Question Bank
              </button>
              <button
                onClick={() => {
                  setQuestionType('mcq');
                  setIsAddQuestionModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New Question
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <MCQSection testData={testData} setTestData={setTestData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b p-4">
          <div className="flex justify-between items-center">
            <CardTitle>Coding Challenges</CardTitle>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setQuestionType('coding');
                  setIsQuestionBankOpen(true);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                Select from Question Bank
              </button>
              <button
                onClick={() => {
                  setQuestionType('coding');
                  setIsAddQuestionModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New Question
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CodingSection testData={testData} setTestData={setTestData} />
        </CardContent>
      </Card>
    </div>
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
              value={testData.scheduling.startDate ? 
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
              value={testData.scheduling.endDate ? 
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
              value={testData.scheduling.timezone}
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
              checked={testData.scheduling.autoStart}
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
              checked={testData.scheduling.autoEnd}
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

        {testData.scheduling.startDate && testData.scheduling.endDate && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Test will be available from{' '}
              <span className="font-semibold">
                {formatInTimeZone(
                  new Date(testData.scheduling.startDate),
                  testData.scheduling.timezone,
                  'PPpp'
                )}
              </span>
              {' '}to{' '}
              <span className="font-semibold">
                {formatInTimeZone(
                  new Date(testData.scheduling.endDate),
                  testData.scheduling.timezone,
                  'PPpp'
                )}
              </span>
              {' '}IST
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderWarningSystemSection = () => (
    <Card>
      <CardHeader className="border-b p-4">
        <CardTitle>Warning System Settings</CardTitle>
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
                Number of warnings before actions are triggered
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Actions on Maximum Warnings</label>
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
            </div>

            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                When enabled, the warning system will:
                <ul className="list-disc ml-5 mt-1">
                  <li>Track suspicious behavior during the test</li>
                  <li>Issue warnings to the candidate</li>
                  <li>Take configured actions after {testData.warningSystem?.maxWarnings} warnings</li>
                </ul>
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      {renderSchedulingSection()}
      
      {/* Add Submission Limits Card */}
      <Card>
        <CardHeader className="border-b p-4">
          <CardTitle>Submission Limits</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allow Retakes
              </label>
              <select
                value={testData.submissionLimits.allowRetake.toString()}
                onChange={(e) => handleSubmissionLimitsChange('allowRetake', e.target.value === 'true')}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>

            {testData.submissionLimits.allowRetake && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Attempts
                  </label>
                  <input
                    type="number"
                    min="2"
                    value={testData.submissionLimits.maxAttempts}
                    onChange={(e) => handleSubmissionLimitsChange('maxAttempts', e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Minimum 2 attempts when retakes are allowed
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retake Delay (hours)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={testData.submissionLimits.retakeDelay}
                    onChange={(e) => handleSubmissionLimitsChange('retakeDelay', e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Time to wait between attempts (0 for no delay)
                  </p>
                </div>
              </>
            )}

            {testData.submissionLimits.allowRetake && (
              <div className="mt-2 text-sm text-gray-500">
                <p>
                  Candidates can retake the test up to {testData.submissionLimits.maxAttempts} times
                  {testData.submissionLimits.retakeDelay > 0 
                    ? `, with a ${testData.submissionLimits.retakeDelay} hour waiting period between attempts`
                    : ' with no waiting period between attempts'
                  }.
                </p>
              </div>
            )}
          </div>
          {renderError('submissionLimits')}
        </CardContent>
      </Card>
      
      {renderWarningSystemSection()}
      
      <SettingsTab testData={testData} setTestData={setTestData} testId={null} />
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return renderDetailsTab();
      case 'questions':
        return renderQuestionsTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-8">
          {/* Header loading skeleton */}
          <div className="flex justify-between items-center">
            <div className="h-8 w-1/4 bg-gray-200 rounded animate-pulse" />
            <div className="flex gap-3">
              <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Form loading skeleton */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b">
              <div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-10 w-full bg-gray-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="h-4 w-1/6 bg-gray-200 rounded animate-pulse" />
                <div className="h-32 w-full bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Tab loading skeleton */}
          <div className="flex gap-4 border-b pb-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Create New Test</h1>
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
              {loading ? 'Creating...' : 'Create Test'}
            </button>
          </div>
        </div>

        <div className="space-y-6">
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

          {renderTabContent()}
        </div>
      </div>

      {/* Question Bank Modal */}
      {isQuestionBankOpen && (
        <QuestionBankModal
          type={questionType}
          onClose={() => setIsQuestionBankOpen(false)}
          onSelect={handleSelectFromQuestionBank}
          existingQuestions={questionType === 'mcq' ? testData.mcqs : testData.codingChallenges}
        />
      )}

      {/* Add Question Modal */}
      {isAddQuestionModalOpen && (
        <AddQuestionModal
          onClose={() => setIsAddQuestionModalOpen(false)}
          onSubmit={handleAddQuestion}
          initialType={questionType}
        />
      )}
    </Layout>
  );
};

export default CreateTest; 