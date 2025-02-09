import React, { useState } from 'react';
import { X, Code, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SUPPORTED_LANGUAGES = {
  javascript: {
    name: 'JavaScript',
    extension: 'js',
    defaultCode: 'function solution() {\n  // Your code here\n}'
  },
  python: {
    name: 'Python',
    extension: 'py',
    defaultCode: 'def solution():\n    # Your code here\n    pass'
  },
  java: {
    name: 'Java',
    extension: 'java',
    defaultCode: 'public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}'
  },
  cpp: {
    name: 'C++',
    extension: 'cpp',
    defaultCode: '#include <iostream>\n\nint main() {\n    // Your code here\n    return 0;\n}'
  }
};

const AddQuestionModal = ({ onClose, onSubmit, initialData = null, isEditing = false }) => {
  const [questionType, setQuestionType] = useState(initialData?.type || 'mcq');
  const [selectedLanguages, setSelectedLanguages] = useState(['javascript']);
  const [codeImplementations, setCodeImplementations] = useState({
    javascript: {
      visibleCode: SUPPORTED_LANGUAGES.javascript.defaultCode,
      invisibleCode: '// Test cases and helper functions'
    }
  });

  const [formData, setFormData] = useState(initialData || {
    type: 'mcq',
    question: '',
    options: ['', ''],
    correctOptions: [],
    answerType: 'single',
    marks: 1,
    difficulty: 'easy',
    category: '',
    tags: [],
    explanation: '',
    testCases: [
      {
        input: '',
        output: '',
        isHidden: false,
        explanation: ''
      }
    ]
  });

  const handleLanguageToggle = (language) => {
    setSelectedLanguages(prev => {
      if (prev.includes(language)) {
        // Remove language
        const newLanguages = prev.filter(l => l !== language);
        // Remove code implementation
        const newImplementations = { ...codeImplementations };
        delete newImplementations[language];
        setCodeImplementations(newImplementations);
        return newLanguages;
      } else {
        // Add language with default code
        setCodeImplementations(prev => ({
          ...prev,
          [language]: {
            visibleCode: SUPPORTED_LANGUAGES[language].defaultCode,
            invisibleCode: '// Test cases and helper functions'
          }
        }));
        return [...prev, language];
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      if (questionType === 'mcq') {
        // Enhanced validation for MCQ
        const validOptions = formData.options.filter(opt => opt.trim() !== '');
        if (validOptions.length < 2) {
          toast.error('At least two valid options are required');
          return;
        }

        // Convert and validate correctOptions
        const correctOptionsArray = Array.isArray(formData.correctOptions) 
          ? formData.correctOptions 
          : [formData.correctOptions];

        const validCorrectOptions = correctOptionsArray.filter(index => 
          typeof index === 'number' && 
          index >= 0 && 
          index < validOptions.length
        );

        if (validCorrectOptions.length === 0) {
          toast.error('At least one valid correct option is required');
          return;
        }

        const finalData = {
          ...formData,
          type: questionType,
          options: validOptions,
          correctOptions: validCorrectOptions
        };

        onSubmit(finalData);
      } else {
        // Handle coding challenge submission
        const finalData = {
          ...formData,
          type: questionType
        };

        if (questionType === 'coding') {
          finalData.timeLimit = parseInt(formData.timeLimit) || 300;
          finalData.memoryLimit = parseInt(formData.memoryLimit) || 512;
          finalData.allowedLanguages = selectedLanguages;
          finalData.languageImplementations = codeImplementations;
          finalData.testCases = formData.testCases;
        }

        onSubmit(finalData);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to submit question');
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;

    // Update correctOptions if the changed option was empty and was marked as correct
    const newCorrectOptions = formData.correctOptions.filter(i => 
      i !== index || (i === index && value.trim() !== '')
    );

    setFormData({ 
      ...formData, 
      options: newOptions,
      correctOptions: newCorrectOptions
    });
  };

  const handleCorrectOptionChange = (index, checked) => {
    const newCorrectOptions = checked
      ? [...formData.correctOptions, index]
      : formData.correctOptions.filter(i => i !== index);

    setFormData({
      ...formData,
      correctOptions: newCorrectOptions
    });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ''] });
  };

  const handleTestCaseChange = (index, field, value) => {
    const newTestCases = [...formData.testCases];
    newTestCases[index] = {
      ...newTestCases[index],
      [field]: value
    };
    setFormData({ ...formData, testCases: newTestCases });
  };

  const addTestCase = () => {
    setFormData({
      ...formData,
      testCases: [
        ...formData.testCases,
        {
          input: '',
          output: '',
          isHidden: false,
          explanation: ''
        }
      ]
    });
  };

  const removeTestCase = (index) => {
    const newTestCases = formData.testCases.filter((_, i) => i !== index);
    setFormData({ ...formData, testCases: newTestCases });
  };

  const modalTitle = isEditing ? 'Edit Question' : 'Add New Question';
  const submitButtonText = isEditing ? 'Save Changes' : 'Add Question';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">{modalTitle}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question Type Selection */}
            <div className="flex gap-4 mb-6">
              <button
                type="button"
                onClick={() => {
                  setQuestionType('mcq');
                  setFormData({ ...formData, type: 'mcq' });
                }}
                className={`flex-1 py-2 rounded-lg ${
                  questionType === 'mcq' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50'
                }`}
              >
                MCQ Question
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuestionType('coding');
                  setFormData({ ...formData, type: 'coding' });
                }}
                className={`flex-1 py-2 rounded-lg ${
                  questionType === 'coding' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50'
                }`}
              >
                Coding Challenge
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {questionType === 'mcq' ? (
                // MCQ specific fields
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Question</label>
                    <textarea
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      rows="3"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Options</label>
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="flex-1 p-2 border rounded-lg"
                          placeholder={`Option ${index + 1}`}
                          required
                        />
                        <input
                          type="checkbox"
                          checked={formData.correctOptions.includes(index)}
                          onChange={(e) => handleCorrectOptionChange(index, e.target.checked)}
                          disabled={option.trim() === ''} // Disable checkbox for empty options
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addOption}
                      className="text-sm text-emerald-600 hover:text-emerald-700"
                    >
                      + Add Option
                    </button>
                  </div>
                </>
              ) : (
                // Coding challenge specific fields
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      rows="3"
                      required
                      placeholder="Detailed description of the problem"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Problem Statement</label>
                    <textarea
                      value={formData.problemStatement}
                      onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      rows="4"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Constraints</label>
                    <textarea
                      value={formData.constraints}
                      onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      rows="2"
                      required
                      placeholder="e.g., Time complexity, input constraints"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Time Limit (seconds)</label>
                      <input
                        type="number"
                        value={formData.timeLimit}
                        onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
                        className="w-full p-2 border rounded-lg"
                        required
                        min="1"
                        placeholder="300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Memory Limit (MB)</label>
                      <input
                        type="number"
                        value={formData.memoryLimit}
                        onChange={(e) => setFormData({ ...formData, memoryLimit: e.target.value })}
                        className="w-full p-2 border rounded-lg"
                        required
                        min="1"
                        placeholder="512"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Supported Languages</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(SUPPORTED_LANGUAGES).map(([key, lang]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleLanguageToggle(key)}
                          className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${
                            selectedLanguages.includes(key)
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              : 'bg-gray-50 text-gray-600 border-gray-200'
                          } border`}
                        >
                          <Code className="h-4 w-4" />
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedLanguages.map(language => (
                    <div key={language} className="space-y-4">
                      <h3 className="font-medium text-gray-800">
                        {SUPPORTED_LANGUAGES[language].name} Implementation
                      </h3>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Starter Code</label>
                        <textarea
                          value={codeImplementations[language]?.visibleCode}
                          onChange={(e) => setCodeImplementations(prev => ({
                            ...prev,
                            [language]: {
                              ...prev[language],
                              visibleCode: e.target.value
                            }
                          }))}
                          className="w-full p-2 border rounded-lg font-mono text-sm"
                          rows="6"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Hidden Test Code
                          <span className="text-gray-500 text-xs ml-2">(Not visible to students)</span>
                        </label>
                        <textarea
                          value={codeImplementations[language]?.invisibleCode}
                          onChange={(e) => setCodeImplementations(prev => ({
                            ...prev,
                            [language]: {
                              ...prev[language],
                              invisibleCode: e.target.value
                            }
                          }))}
                          className="w-full p-2 border rounded-lg font-mono text-sm"
                          rows="4"
                          required
                        />
                      </div>
                    </div>
                  ))}

                  {/* Test Cases Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium">Test Cases</label>
                      <button
                        type="button"
                        onClick={addTestCase}
                        className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add Test Case
                      </button>
                    </div>

                    {formData.testCases.map((testCase, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-4">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium">
                            {index === 0 ? "Sample Test Case" : `Test Case ${index + 1}`}
                            {index === 0 && (
                              <span className="text-xs text-gray-500 ml-2">
                                (Visible to students)
                              </span>
                            )}
                          </h4>
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => removeTestCase(index)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Input</label>
                            <textarea
                              value={testCase.input}
                              onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                              className="w-full p-2 border rounded-lg font-mono text-sm"
                              rows="3"
                              placeholder="Test case input"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Expected Output</label>
                            <textarea
                              value={testCase.output}
                              onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                              className="w-full p-2 border rounded-lg font-mono text-sm"
                              rows="3"
                              placeholder="Expected output"
                              required
                            />
                          </div>
                        </div>

                        {index > 0 && ( // Only show these options for non-sample test cases
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`hidden-${index}`}
                                checked={testCase.isHidden}
                                onChange={(e) => handleTestCaseChange(index, 'isHidden', e.target.checked)}
                                className="rounded"
                              />
                              <label htmlFor={`hidden-${index}`} className="text-sm text-gray-600">
                                Hidden test case (not visible to students)
                              </label>
                            </div>

                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Explanation</label>
                              <textarea
                                value={testCase.explanation}
                                onChange={(e) => handleTestCaseChange(index, 'explanation', e.target.value)}
                                className="w-full p-2 border rounded-lg text-sm"
                                rows="2"
                                placeholder="Explain what this test case is checking (optional)"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Common fields for both types */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                    required
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Marks</label>
                <input
                  type="number"
                  value={formData.marks}
                  onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded-lg"
                  required
                  min="1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
              >
                {submitButtonText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddQuestionModal; 