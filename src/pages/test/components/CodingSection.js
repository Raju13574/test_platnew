import React, { useState, useEffect, useCallback } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { 
  Check, X, Play, ChevronLeft, ChevronRight, 
  Eye, Sun, Moon, Maximize2, RotateCcw, Clock, Database, CheckCircle
} from 'lucide-react';
import { apiService } from '../../../services/api';
import { toast } from 'react-hot-toast';

export default function CodingSection({ 
  challenges, 
  answers, 
  setAnswers, 
  onSubmitCoding, 
  setAnalytics,
  test
}) {
  // Move ALL state declarations to the top
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [language, setLanguage] = useState('');
  const [testResults, setTestResults] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [theme, setTheme] = useState('vs-dark');
  const [submissionStatus, setSubmissionStatus] = useState({});
  const [isLoadingTestId, setIsLoadingTestId] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wordWrap, setWordWrap] = useState(true);
  const [autoComplete, setAutoComplete] = useState(true);
  const [editorValue, setEditorValue] = useState(() => {
    const savedState = localStorage.getItem(`coding_state_${test?._id}`);
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return parsed.editorValue || '// Please select a language to start coding\n';
    }
    return '// Please select a language to start coding\n';
  });
  const [executingTests, setExecutingTests] = useState(new Set());
  const [layout, setLayout] = useState({
    leftPanel: 35,
    rightPanel: 25,
    isDragging: false
  });
  const [isExecuting, setIsExecuting] = useState(false);
  const [challengeStartTime, setChallengeStartTime] = useState(Date.now());
  const [isTestSubmitted, setIsTestSubmitted] = useState(() => {
    // Check if test is already completed from localStorage or test prop
    return test?.status === 'completed' || localStorage.getItem('testStatus') === 'completed';
  });

  // Constants
  const MIN_PANEL_WIDTH = 20;
  const MAX_PANEL_WIDTH = 60;
  
  // Get current challenge
  const challenge = challenges?.[currentChallenge];

  // Fix for setAnswers exhaustive deps warning - add at the top of the component
  const memoizedSetAnswers = useCallback((newAnswers) => {
    setAnswers(newAnswers);
  }, [setAnswers]);

  // Update handleEditorChange to use optional chaining
  const handleEditorChange = useCallback((value) => {
    if (typeof value !== 'string') return;
    
    setEditorValue(value);
    
    if (challenge?._id && language) {
      const newAnswers = {
        ...answers,
        [challenge._id]: {
          code: value,
          language: language
        }
      };
      memoizedSetAnswers(newAnswers);
    }
  }, [answers, challenge?._id, language, memoizedSetAnswers]);

  // Define handleResetCode before any useEffect hooks
  const handleResetCode = () => {
    const challenge = challenges[currentChallenge];
    if (!challenge || !language) return;
    
    const defaultCode = challenge.languageImplementations?.[language]?.visibleCode;
    if (defaultCode) {
      setEditorValue(defaultCode);
      setAnswers(prev => ({
        ...prev,
        [challenge._id]: {
          code: defaultCode,
          language
        }
      }));
    }
  };

  // Move ALL useEffect hooks to be together at the top
  useEffect(() => {
    const parseTestUUID = async () => {
      try {
        setIsLoadingTestId(true);
        const uuid = window.location.pathname.split('/').pop();
        
        // Check if uuid exists and is not 'completed'
        if (!uuid || uuid === 'completed') {
          console.log('Invalid or missing UUID:', uuid);
          toast.error('Invalid test URL');
          return;
        }

        // Log the UUID being requested
        console.log('Requesting test with UUID:', uuid);
        
        const response = await apiService.get(`tests/parse/${uuid}`);

        if (response?.data?.id) {
          // Store both the ID and the full test data
          localStorage.setItem('currentTestId', response.data.id);
          localStorage.setItem('currentTest', JSON.stringify(response.data));
        }
      } catch (error) {
        console.error('Error parsing test UUID:', error);
        // Add more specific error messaging
        if (error.response?.status === 404) {
          toast.error('Test not found. Please check the URL.');
        } else {
          toast.error(`Error loading test: ${error.message}`);
        }
      } finally {
        setIsLoadingTestId(false);
      }
    };
    parseTestUUID();
  }, []);

  useEffect(() => {
    if (challenges?.length > 0) {
      // Initialize submission status for all challenges
      const initialStatus = {};
      challenges.forEach(challenge => {
        initialStatus[challenge._id] = undefined;
      });
      setSubmissionStatus(initialStatus);
    }
  }, [challenges]);

  // Update useEffect for challenge changes to prevent infinite loops
  useEffect(() => {
    if (challenges?.length > 0 && currentChallenge >= 0) {
      // Track time spent on previous challenge before switching
      const timeSpent = (Date.now() - challengeStartTime) / 1000;
      
      // Update analytics for the challenge
      setAnalytics(prev => {
        const prevTimePerChallenge = prev?.codingMetrics?.timePerChallenge || {};
        return {
          ...prev,
          codingMetrics: {
            ...prev.codingMetrics,
            timePerChallenge: {
              ...prevTimePerChallenge,
              [currentChallenge]: (prevTimePerChallenge[currentChallenge] || 0) + timeSpent
            }
          }
        };
      });

      // Reset start time for new challenge
      setChallengeStartTime(Date.now());

      const challenge = challenges[currentChallenge];
      
      if (challenge?.allowedLanguages?.length > 0) {
        // Check if there's an existing answer with a language
        const existingAnswer = answers[challenge._id];
        
        if (existingAnswer?.language) {
          setLanguage(existingAnswer.language);
          setEditorValue(existingAnswer.code || '// Write your code here\n');
        } else {
          // Get first allowed language
          const defaultLanguage = challenge.allowedLanguages[0];
          setLanguage(defaultLanguage);
          
          // Get default code for this language
          const defaultCode = challenge.languageImplementations?.[defaultLanguage]?.visibleCode || '// Write your code here\n';
          
          // Initialize answers only if they don't exist
          if (!answers[challenge._id]) {
            memoizedSetAnswers({
              ...answers,
              [challenge._id]: {
                code: defaultCode,
                language: defaultLanguage
              }
            });
          }
          
          // Set editor value
          setEditorValue(defaultCode);
        }
      }
    }
  }, [challenges, currentChallenge, answers, challengeStartTime, setAnalytics, memoizedSetAnswers]);

  // Handle left panel resize
  const handleLeftResize = useCallback((e) => {
    if (layout.isDragging) {
      const containerWidth = document.querySelector('.h-[calc(100vh-10rem)]')?.clientWidth || 0;
      const newLeftWidth = (e.clientX / containerWidth) * 100;
      
      // Ensure the panel stays within min/max bounds
      if (newLeftWidth >= MIN_PANEL_WIDTH && newLeftWidth <= MAX_PANEL_WIDTH) {
        setLayout(prev => ({
          ...prev,
          leftPanel: newLeftWidth
        }));
      }
    }
  }, [layout.isDragging]);

  // Handle right panel resize
  const handleRightResize = useCallback((e) => {
    if (layout.isDragging) {
      const containerWidth = document.querySelector('.h-[calc(100vh-10rem)]')?.clientWidth || 0;
      const rightEdge = containerWidth;
      const newRightWidth = ((rightEdge - e.clientX) / containerWidth) * 100;
      
      // Ensure the panel stays within min/max bounds
      if (newRightWidth >= MIN_PANEL_WIDTH && newRightWidth <= MAX_PANEL_WIDTH) {
        setLayout(prev => ({
          ...prev,
          rightPanel: newRightWidth
        }));
      }
    }
  }, [layout.isDragging]);

  // Update the existing useEffect to include these functions in dependencies
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (layout.isDragging) {
        handleLeftResize(e);
        handleRightResize(e);
      }
    };

    const handleMouseUp = () => {
      setLayout(prev => ({ ...prev, isDragging: false }));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [layout.isDragging, handleLeftResize, handleRightResize]);

  // Move these useEffect hooks up, right after all state declarations and before any early returns
  useEffect(() => {
    if (test?._id) {
      const stateToSave = {
        editorValue,
        currentChallenge,
        language,
        answers,
        submissionStatus,
        testResults,
        theme,
        fontSize,
        showLineNumbers,
        wordWrap,
        autoComplete,
      };

      localStorage.setItem(`coding_state_${test._id}`, JSON.stringify(stateToSave));
    }
  }, [
    test?._id,
    editorValue,
    currentChallenge,
    language,
    answers,
    submissionStatus,
    testResults,
    theme,
    fontSize,
    showLineNumbers,
    wordWrap,
    autoComplete,
  ]);

  useEffect(() => {
    if (test?._id) {
      const savedState = localStorage.getItem(`coding_state_${test._id}`);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        
        // Restore all saved states
        setCurrentChallenge(parsed.currentChallenge || 0);
        setLanguage(parsed.language || '');
        setAnswers(parsed.answers || {});
        setSubmissionStatus(parsed.submissionStatus || {});
        setTestResults(parsed.testResults || {});
        setTheme(parsed.theme || 'vs-dark');
        setFontSize(parsed.fontSize || 14);
        setShowLineNumbers(parsed.showLineNumbers ?? true);
        setWordWrap(parsed.wordWrap ?? true);
        setAutoComplete(parsed.autoComplete ?? true);
      }
    }
  }, [test?._id, setAnswers]);

  // Update useEffect to load submission status
  useEffect(() => {
    // Load saved submission status
    const loadSubmissionStatus = () => {
      try {
        // Check test status from props or localStorage
        const isCompleted = test?.status === 'completed' || 
                          localStorage.getItem('testStatus') === 'completed';
        
        if (isCompleted) {
          setIsTestSubmitted(true);
          
          // Load submission statuses for all challenges
          challenges.forEach(challenge => {
            setSubmissionStatus(prev => ({
              ...prev,
              [challenge._id]: 'submitted'
            }));
          });
        } else {
          // Load individual challenge submission states
          const savedStatus = localStorage.getItem('codingSubmissionStatus');
          if (savedStatus) {
            setSubmissionStatus(JSON.parse(savedStatus));
          }
        }
      } catch (error) {
        console.error('Error loading submission status:', error);
      }
    };

    loadSubmissionStatus();
  }, [test, challenges]);

  // Now your early returns
  if (!challenges || challenges.length === 0) {
    return <div>No challenges available</div>;
  }

  if (!challenge) {
    return <div>Challenge not found</div>;
  }

  // Update handleSubmitChallenge to log requests and responses
  const handleSubmitChallenge = async () => {
    try {
      const currentTestId = localStorage.getItem('currentTestId');
      
      if (!currentTestId || !challenge?._id) {
        toast.error('Test or challenge not found');
        return;
      }

      setSubmissionStatus(prev => ({ ...prev, [challenge._id]: 'submitting' }));
      
      const currentAnswer = answers[challenge._id];
      if (!currentAnswer?.code) {
        toast.error('Please write some code before submitting');
        setSubmissionStatus(prev => ({ ...prev, [challenge._id]: undefined }));
        return;
      }

      // First run the code to get results
      console.log('Running code for submission...');
      const results = await handleExecuteCode(true);
      if (!results) {
        throw new Error('Code execution failed');
      }

      // Remove version from payload - let backend handle versioning
      const submissionData = {
        testId: currentTestId,
        completing: true,
        challengeId: challenge._id,
        submissions: [{
          challengeId: challenge._id,
          code: currentAnswer.code,
          language: language,
          testCaseResults: results.map(r => ({
            input: r.input,
            expectedOutput: r.expectedOutput,
            actualOutput: r.actualOutput,
            passed: r.passed,
            executionTime: r.executionTime,
            memory: r.memory,
            error: r.error,
            isHidden: r.isHidden
          })),
          executionTime: results.reduce((sum, r) => sum + r.executionTime, 0),
          memory: Math.max(...results.map(r => r.memory)),
          output: results[0]?.output || '',
          error: results.some(r => r.error) ? results.find(r => r.error)?.error : null
        }]
      };

      console.log('Sending submission:', submissionData);
      const response = await apiService.post('submissions/submit/coding', submissionData);
      console.log('Received submission response:', response.data);

      if (response?.data?.success) {
        // Update submission status
        const newSubmissionStatus = {
          ...submissionStatus,
          [challenge._id]: 'submitted'
        };
        setSubmissionStatus(newSubmissionStatus);
        
        // Save to localStorage with challenge ID
        localStorage.setItem(`codingSubmissionStatus_${challenge._id}`, JSON.stringify({
          status: 'submitted',
          timestamp: Date.now()
        }));

        toast.success('Challenge submitted successfully!');
        
        // Check if all challenges are completed
        const allChallengesCompleted = challenges.every(ch => 
          newSubmissionStatus[ch._id] === 'submitted'
        );

        if (allChallengesCompleted) {
          localStorage.setItem('testStatus', 'completed');
          setIsTestSubmitted(true);
          toast.success('All coding challenges completed!');
          
          const submissionResult = {
            codingSubmission: response.data.submission.codingSubmission,
            status: response.data.submission.status,
            totalScore: response.data.submission.codingSubmission.totalScore || 0
          };
          
          onSubmitCoding(submissionResult);
          localStorage.removeItem(`coding_state_${test?._id}`);
        } else if (currentChallenge < challenges.length - 1) {
          setTimeout(() => setCurrentChallenge(prev => prev + 1), 1500);
        }
      } else {
        throw new Error(response?.data?.message || 'Submission failed');
      }

    } catch (error) {
      console.error('Submission Error:', error);
      setSubmissionStatus(prev => ({
        ...prev,
        [challenge._id]: undefined
      }));
      toast.error('Failed to submit: ' + (error.response?.data?.message || error.message));
    }
  };

  // Update handleExecuteCode to log requests and responses
  const handleExecuteCode = async (isSubmission = false) => {
    try {
      if (!language) {
        toast.error('Please select a language first');
        return null;
      }

      if (!challenge?._id) {
        toast.error('Challenge not found');
        return null;
      }

      setIsExecuting(true);
      setShowTestPanel(true);
      
      const currentCode = answers[challenge._id]?.code;
      
      if (!currentCode) {
        toast.error('Please write some code before running');
        return null;
      }

      // IMPORTANT: Get all test cases for submission, only visible ones for normal run
      const testCasesToRun = isSubmission 
        ? challenge.testCases // Get ALL test cases for submission
        : challenge.testCases?.filter(test => test.isVisible !== false); // Only visible for normal run

      if (!testCasesToRun?.length) {
        toast.error('No test cases available');
        return null;
      }

      const results = [];
      const loadingToast = toast.loading(
        isSubmission ? 'Running all test cases (including hidden)...' : 'Running test cases...'
      );

      // Run ALL test cases for submission, only visible ones for normal run
      for (const testCase of testCasesToRun) {
        setExecutingTests(prev => new Set(prev).add(testCase.id));
        
        try {
          // Log what we're sending
          const requestPayload = {
            code: currentCode,
            language: language.toLowerCase(),
            inputs: testCase.input
          };
          console.log('Sending execution request:', requestPayload);

          const response = await apiService.post('code/execute', requestPayload);
          
          // Log what we received
          console.log('Received execution response:', response.data);
          
          const data = response.data;
          
          const executionTime = parseFloat(data?.executionTime) || 0;
          const memory = parseFloat(data?.memory) || 0;
          const actualOutput = (data?.output || '').trim();
          const expectedOutput = (testCase.output || '').trim();
          const passed = data?.status === 'Accepted' && actualOutput === expectedOutput;

          results.push({
            input: testCase.input || '',
            expectedOutput: expectedOutput,
            actualOutput: actualOutput,
            error: data?.error || '',
            passed: passed,
            executionTime: executionTime,
            memory: memory,
            status: data?.status || 'Error',
            isHidden: testCase.isVisible === false
          });

        } catch (error) {
          console.error('Execution error:', error);
          results.push({
            input: testCase.input || '',
            expectedOutput: testCase.output || '',
            actualOutput: '',
            error: error.message || 'Execution failed',
            passed: false,
            executionTime: 0,
            memory: 0,
            status: 'Error',
            isHidden: testCase.isVisible === false
          });
        } finally {
          setExecutingTests(prev => {
            const newSet = new Set(prev);
            newSet.delete(testCase.id);
            return newSet;
          });
        }
      }

      toast.dismiss(loadingToast);

      // For UI: Show only visible results in normal run, all results in submission
      const resultsToShow = isSubmission 
        ? results  // Show all results including hidden for submission
        : results.filter(r => !r.isHidden); // Only show visible results for normal run
      
      setTestResults(prev => ({
        ...prev,
        [challenge._id]: {
          status: results.every(r => r.passed) ? 'Passed' : 'Failed', // Check ALL results for status
          executionTime: results.reduce((sum, r) => sum + r.executionTime, 0),
          memory: Math.max(...results.map(r => r.memory)),
          testCaseResults: resultsToShow // Store filtered results for UI
        }
      }));

      // Return all results for submission, visible only for normal run
      return isSubmission ? results : resultsToShow;

    } catch (error) {
      console.error('Code execution error:', error);
      toast.error('Failed to execute code: ' + (error.message || 'Unknown error'));
      return null;
    } finally {
      setIsExecuting(false);
      setExecutingTests(new Set());
    }
  };

  const renderSubmitButton = () => {
    if (!challenge?._id) return null;

    const status = submissionStatus[challenge._id];
    const hasCode = answers[challenge._id]?.code;
    
    if (!hasCode) {
      return (
        <button 
          disabled
          className="px-3 py-1.5 bg-gray-400 text-white rounded flex items-center gap-1 text-sm cursor-not-allowed"
          title="Write some code first"
        >
          <Check className="w-3.5 h-3.5" />
          Submit
        </button>
      );
    }

    switch (status) {
      case 'submitted':
        return (
          <button 
            disabled 
            className="px-3 py-1.5 bg-green-600 text-white rounded flex items-center gap-1 text-sm cursor-not-allowed"
          >
            <Check className="w-3.5 h-3.5" />
            Submitted
          </button>
        );
      
      case 'submitting':
        return (
          <button 
            disabled 
            className="px-3 py-1.5 bg-blue-600 text-white rounded flex items-center gap-1 text-sm cursor-not-allowed"
          >
            <span className="animate-spin">⌛</span>
            Submitting...
          </button>
        );
      
      default:
        return (
          <button 
            onClick={handleSubmitChallenge}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 cursor-pointer text-white rounded flex items-center gap-1 text-sm transition-colors"
            title="Submit your solution"
          >
            <Check className="w-3.5 h-3.5" />
            Submit
          </button>
        );
    }
  };

  // Update editor options with additional settings
  const editorOptions = {
    minimap: { enabled: false },
    fontSize: fontSize,
    lineNumbers: showLineNumbers ? 'on' : 'off',
    wordWrap: wordWrap ? 'on' : 'off',
    automaticLayout: true,
    readOnly: false,
    domReadOnly: false,
    scrollBeyondLastLine: false,
    tabSize: 2,
    formatOnPaste: false, // Disable format on paste
    tabCompletion: 'on',

    // Disable clipboard operations
    disableLayerHinting: true,
    contextmenu: false,
    quickSuggestions: autoComplete,
    suggestOnTriggerCharacters: autoComplete,
    parameterHints: autoComplete ? { enabled: true } : { enabled: false },

    // Additional clipboard restrictions
    'editor.clipboard.enabled': false,
  };

  // Update the renderTestResults function to better handle errors
  const renderTestResults = () => {
    const currentResults = testResults[challenge?._id];
    
    if (!currentResults) {
      if (isExecuting) {
        return (
          <div className="space-y-4">
            {challenge?.testCases?.map((testCase, index) => (
              <div key={index} className="bg-[#1e1e1e] p-4 rounded-lg border border-[#333333]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                    <span className="text-gray-300">
                      {testCase.isVisible === false 
                        ? `Running Hidden Test Case ${index + 1}`
                        : `Running Test Case ${index + 1}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      }
      
      return (
        <div className="text-gray-400 text-center py-8 bg-[#1e1e1e] rounded-lg border border-[#333333]">
          <div className="text-4xl mb-3">⚡</div>
          <div className="text-lg">Run your code to see test results</div>
        </div>
      );
    }

    // Get all test cases when submitting, only visible ones when running
    const testCasesToShow = submissionStatus[challenge?._id] === 'submitting' 
      ? challenge?.testCases 
      : challenge?.testCases?.filter(testCase => testCase.isVisible !== false);

    return (
      <div className="space-y-4">
        {/* Summary of hidden test cases when submitting */}
        {submissionStatus[challenge?._id] === 'submitting' && (
          <div className="bg-blue-500/10 text-blue-400 p-4 rounded-lg border border-blue-500/20 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4" />
              <span className="font-medium">Running All Test Cases (Including Hidden)</span>
            </div>
            <div className="text-sm opacity-80">
              Your code will be tested against both visible and hidden test cases
            </div>
          </div>
        )}

        {testCasesToShow?.map((testCase, index) => {
          const result = currentResults?.testCaseResults?.[index] || {
            input: '',
            expectedOutput: '',
            actualOutput: '',
            error: '',
            passed: false,
            executionTime: 0,
            memory: 0,
            status: 'Error'
          };

          const isExecuting = executingTests.has(testCase.id);
          const isHidden = testCase.isVisible === false;

          if (isExecuting) {
            return (
              <div key={index} className="bg-[#1e1e1e] p-4 rounded-lg border border-[#333333]">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                  <span className="text-gray-300">
                    {isHidden ? 'Executing Hidden Test Case...' : 'Executing Test Case...'}
                  </span>
                </div>
              </div>
            );
          }

          // For hidden test cases, show minimal info
          if (isHidden) {
            return (
              <div key={index} className="bg-[#1e1e1e] p-4 rounded-lg border border-[#333333]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">Hidden Test Case {index + 1}</span>
                  </div>
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm
                    ${result.passed 
                      ? 'bg-green-500/10 text-green-400' 
                      : 'bg-red-500/10 text-red-400'}`}
                  >
                    {result.passed ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        Passed
                      </>
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5" />
                        Failed
                      </>
                    )}
                  </span>
                </div>
                {result.executionTime > 0 && (
                  <div className="mt-2 text-xs text-gray-400 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {result.executionTime.toFixed(3)}s
                    </span>
                    <span className="flex items-center gap-1">
                      <Database className="w-3.5 h-3.5" />
                      {result.memory.toFixed(2)}KB
                    </span>
                  </div>
                )}
              </div>
            );
          }

          // For visible test cases, show full details
          return (
            <div key={index} className="bg-[#1e1e1e] rounded-lg border border-[#333333] overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-[#333333] bg-[#2d2d2d]">
                <span className="text-gray-300 font-medium">Test Case {index + 1}</span>
                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm
                  ${result.passed 
                    ? 'bg-green-500/10 text-green-400' 
                    : 'bg-red-500/10 text-red-400'}`}
                >
                  {result.passed ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Passed
                    </>
                  ) : (
                    <>
                      <X className="w-3.5 h-3.5" />
                      Failed
                    </>
                  )}
                </span>
              </div>

              <div className="p-4 space-y-3">
                <div className="bg-[#2d2d2d] p-3 rounded">
                  <div className="text-gray-400 text-xs mb-1.5">Input:</div>
                  <pre className="text-gray-200 font-mono text-sm">{result.input}</pre>
                </div>

                <div className="bg-[#2d2d2d] p-3 rounded">
                  <div className="text-gray-400 text-xs mb-1.5">Expected Output:</div>
                  <pre className="text-gray-200 font-mono text-sm">{result.expectedOutput}</pre>
                </div>

                <div className="bg-[#2d2d2d] p-3 rounded">
                  <div className="text-gray-400 text-xs mb-1.5">Your Output:</div>
                  {result.error ? (
                    <pre className="text-red-400 font-mono text-sm whitespace-pre-wrap bg-[#1e1e1e] p-2 rounded border border-red-500/20">
                      {result.error}
                    </pre>
                  ) : (
                    <>
                      <pre className="text-gray-200 font-mono text-sm">{result.actualOutput}</pre>
                      {!result.passed && (
                        <div className="mt-2 text-xs">
                          <span className="text-red-400">Raw output: </span>
                          <span className="text-gray-300 font-mono">"{result.actualOutput}"</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 pt-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {result.executionTime > 0 ? `${result.executionTime.toFixed(3)}s` : 'N/A'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Database className="w-3.5 h-3.5" />
                      {result.memory > 0 ? `${result.memory.toFixed(2)}KB` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Add reset button to use handleResetCode
  const renderEditorControls = () => {
    // Calculate pagination
    const questionsPerPage = 10;
    const totalPages = Math.ceil(challenges.length / questionsPerPage);
    const currentPage = Math.floor(currentChallenge / questionsPerPage);
    const startIndex = currentPage * questionsPerPage;
    const endIndex = Math.min(startIndex + questionsPerPage, challenges.length);

    return (
      <div className="flex items-center justify-between gap-2">
        {/* Left side controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentChallenge(prev => Math.max(0, prev - 1))}
            disabled={currentChallenge === 0}
            className="p-1.5 rounded hover:bg-[#3c3c3c] text-gray-300 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Show only current page questions */}
          <div className="flex items-center gap-1 max-w-[400px] overflow-x-auto">
            {challenges.slice(startIndex, endIndex).map((_, idx) => {
              const actualIdx = startIndex + idx;
              return (
                <button
                  key={actualIdx}
                  onClick={() => setCurrentChallenge(actualIdx)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs
                    ${currentChallenge === actualIdx 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-[#3c3c3c] text-gray-300 hover:bg-[#4c4c4c]'}
                    ${submissionStatus[challenges[actualIdx]._id] === 'submitted' && 'bg-green-600'}`}
                >
                  {actualIdx + 1}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentChallenge(prev => Math.min(challenges.length - 1, prev + 1))}
            disabled={currentChallenge === challenges.length - 1}
            className="p-1.5 rounded hover:bg-[#3c3c3c] text-gray-300 disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Page indicator */}
          {totalPages > 1 && (
            <span className="text-gray-400 text-sm ml-2">
              Page {currentPage + 1} of {totalPages}
            </span>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetCode}
            className="p-1.5 rounded hover:bg-[#3c3c3c] text-gray-300"
            title="Reset Code"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Editor settings controls */}
          <div className="flex items-center gap-2 border-l border-[#3c3c3c] pl-4">
            <button
              onClick={() => setFontSize(prev => Math.min(prev + 2, 24))}
              className="p-1.5 rounded hover:bg-[#3c3c3c] text-gray-300 text-sm"
              title="Increase Font Size"
            >
              A+
            </button>
            <button
              onClick={() => setFontSize(prev => Math.max(prev - 2, 10))}
              className="p-1.5 rounded hover:bg-[#3c3c3c] text-gray-300 text-sm"
              title="Decrease Font Size"
            >
              A-
            </button>
            
            <button
              onClick={() => setShowLineNumbers(prev => !prev)}
              className={`p-1.5 rounded hover:bg-[#3c3c3c] text-gray-300 ${!showLineNumbers && 'opacity-50'}`}
              title="Toggle Line Numbers"
            >
              #
            </button>
            
            <button
              onClick={() => setWordWrap(prev => !prev)}
              className={`p-1.5 rounded hover:bg-[#3c3c3c] text-gray-300 ${!wordWrap && 'opacity-50'}`}
              title="Toggle Word Wrap"
            >
              ↵
            </button>
            
            <button
              onClick={() => setAutoComplete(prev => !prev)}
              className={`p-1.5 rounded hover:bg-[#3c3c3c] text-gray-300 ${!autoComplete && 'opacity-50'}`}
              title="Toggle Auto Complete"
            >
              <>⌨</>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 4. Add these two functions before the return statement
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    
    if (challenge?._id) {
      const defaultCode = challenge.languageImplementations?.[newLanguage]?.visibleCode || '// Write your code here\n';
      const newAnswers = {
        ...answers,
        [challenge._id]: {
          code: defaultCode,
          language: newLanguage
        }
      };
      setAnswers(newAnswers);
      setEditorValue(defaultCode);
    }
  };

  const renderLanguageDropdown = () => {
    if (!challenge?.allowedLanguages) return null;

    return (
      <select
        value={language}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="bg-[#3c3c3c] text-white text-sm px-2 py-1 rounded border border-[#4c4c4c]"
      >
        <option value="">Select Language</option>
        {challenge.allowedLanguages.map(lang => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
    );
  };

  // Update the editor mount handler to use the refs
  const handleEditorMount = (editor, monaco) => {
    if (language) {
      editor.focus();
      monaco.editor.setModelLanguage(editor.getModel(), language.toLowerCase());
    }
  };

  // Add this function before the return statement
  const handleContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  // Update the render logic to show completed state
  if (isTestSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="bg-white shadow-sm rounded-lg p-8 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Test Completed!</h2>
          <p className="text-gray-600 mb-4">
            You have already submitted all sections of the test.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full" onContextMenu={handleContextMenu}>
      {isLoadingTestId && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
      
      <div className="sticky top-0 z-30 bg-[#1e1e1e] border-b border-[#3c3c3c]">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            {renderEditorControls()}
          </div>

          <div className="flex items-center gap-2">
            {renderLanguageDropdown()}

            <div className="flex items-center gap-1">
              <button
                onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
                className="p-1.5 rounded hover:bg-[#3c3c3c] text-gray-300"
                title="Toggle Theme"
              >
                {theme === 'vs-dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => setShowTestPanel(!showTestPanel)}
                className="p-1.5 rounded hover:bg-[#3c3c3c] text-gray-300"
                title="Toggle Test Panel"
              >
                <Eye className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded hover:bg-[#3c3c3c] text-gray-300"
                title="Toggle Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            <button 
              onClick={() => {
                handleExecuteCode();
              }}
              disabled={isExecuting}
              className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 
                     disabled:opacity-50 flex items-center gap-1 text-xs"
            >
              <Play className="w-3.5 h-3.5" />
              Run {isExecuting ? '...' : ''}
            </button>
            {renderSubmitButton()}
          </div>
        </div>
      </div>

      <div className="h-[calc(100vh-10rem)] flex overflow-hidden">
        <div 
          style={{ width: `${isFullscreen ? 0 : layout.leftPanel}%` }}
          className={`flex flex-col bg-[#1e1e1e] border-r border-[#3c3c3c] transition-all duration-300
            ${isFullscreen ? 'w-0 opacity-0' : 'opacity-100'}`}
        >
          <div className="p-4 text-white space-y-4 overflow-y-auto">
            <h2 className="text-xl font-semibold">{challenge?.title}</h2>
            <div className="text-gray-300">{challenge?.description}</div>
            
            <div className="space-y-4">
              {/* Problem Statement */}
              <div className="bg-[#2d2d2d] p-3 rounded-lg">
                <h3 className="font-medium mb-2">Problem Statement</h3>
                <div className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
                  {challenge?.problemStatement}
                </div>
              </div>

              {/* Constraints */}
              {challenge?.constraints && (
                <div className="bg-[#2d2d2d] p-3 rounded-lg">
                  <h3 className="font-medium mb-2">Constraints</h3>
                  <div className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
                    {challenge.constraints}
                  </div>
                </div>
              )}

              {/* Sample Test Cases */}
              {challenge?.testCases?.filter(test => !test.isHidden)?.length > 0 && (
                <div className="bg-[#2d2d2d] p-3 rounded-lg">
                  <h3 className="font-medium mb-2">Sample Test Cases</h3>
                  <div className="space-y-4">
                    {challenge.testCases
                      .filter(test => !test.isHidden)
                      .slice(0, 2)  // Only take the first 2 test cases
                      .map((test, index) => (
                        <div key={index} className="space-y-2">
                          <div className="text-sm text-gray-400">Test Case {index + 1}</div>
                          <div className="bg-[#363636] p-2 rounded">
                            <div className="text-gray-400 text-xs mb-1">Input:</div>
                            <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
                              {test.input}
                            </pre>
                          </div>
                          <div className="bg-[#363636] p-2 rounded">
                            <div className="text-gray-400 text-xs mb-1">Expected Output:</div>
                            <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
                              {test.output}
                            </pre>
                          </div>
                          {/* Add explanation section */}
                          {test.explanation && (
                            <div className="bg-[#363636] p-2 rounded">
                              <div className="text-gray-400 text-xs mb-1">Explanation:</div>
                              <div className="text-gray-300 text-sm whitespace-pre-wrap">
                                {test.explanation}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Technical Details */}
              <div className="bg-[#2d2d2d] p-3 rounded-lg">
                <h3 className="font-medium mb-2">Technical Details</h3>
                <div className="text-gray-300 text-sm space-y-1">
                  <div>Time Limit: {challenge?.timeLimit || 0} seconds</div>
                  <div>Memory Limit: {challenge?.memoryLimit || 0} MB</div>
                  <div>Difficulty: {challenge?.difficulty || 'Not specified'}</div>
                  <div>Points: {challenge?.marks || 0}</div>
                </div>
              </div>

              {/* Allowed Languages */}
              <div className="bg-[#2d2d2d] p-3 rounded-lg">
                <h3 className="font-medium mb-2">Allowed Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {challenge?.allowedLanguages?.map(lang => (
                    <span 
                      key={lang}
                      className="px-2 py-1 bg-[#3c3c3c] rounded text-sm text-gray-300"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col" onContextMenu={handleContextMenu}>
          <MonacoEditor
            height="100%"
            language={language.toLowerCase()}
            theme={theme}
            value={editorValue}
            onChange={handleEditorChange}
            options={{
              ...editorOptions,
              readOnly: !language,
              domReadOnly: !language,
            }}
            onMount={handleEditorMount}
            wrapperClassName="monaco-editor-wrapper"
            className="monaco-editor"
            onContextMenu={handleContextMenu}
          />
        </div>

        {showTestPanel && (
          <div 
            style={{ width: `${layout.rightPanel}%` }}
            className="bg-[#1e1e1e] border-l border-[#3c3c3c]"
          >
            <div className="h-full overflow-y-auto p-4">
              {renderTestResults()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} // End of CodingSection component