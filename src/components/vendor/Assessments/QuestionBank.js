import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../layout/Layout';
import { Card, CardContent } from '../../common/Card';
import { questionBankService } from '../../../services/questionBank.service';
import { toast } from 'react-hot-toast';
import AddQuestionModal from './components/AddQuestionModal';
import { 
  Search, Filter, Plus, Edit2, Trash2,
  Code, FileText, Award, Book, Upload
} from 'lucide-react';
import SampleDataDownload from './components/SampleDataDownload';

const QuestionBank = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [questions, setQuestions] = useState({ mcqs: [], codingChallenges: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    category: '',
    difficulty: '',
    tags: []
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { id: 'all', name: 'All Questions', count: 0, icon: Book },
    { id: 'mcq', name: 'MCQ Questions', count: 0, icon: FileText },
    { id: 'coding', name: 'Coding Challenges', count: 0, icon: Code }
  ];

  // Wrap fetchQuestions in useCallback to prevent infinite loops
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await questionBankService.searchQuestions({
        type: filters.type,
        category: filters.category,
        difficulty: filters.difficulty,
        tags: filters.tags.join(','),
        search: searchQuery
      });
      setQuestions(response);
    } catch (error) {
      toast.error('Failed to fetch questions');
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleImportFile = async (type, file) => {
    try {
      const service = type === 'mcq' 
        ? questionBankService.importMCQsFromFile 
        : questionBankService.importCodingChallengesFromFile;
      
      await service(file);
      toast.success(`Successfully imported ${type.toUpperCase()} questions`);
      fetchQuestions();
    } catch (error) {
      toast.error(`Failed to import ${type} questions`);
      console.error('Import error:', error);
    }
  };

  const handleAddQuestion = async (questionData) => {
    try {
      const service = questionData.type === 'mcq' 
        ? questionBankService.addMCQs 
        : questionBankService.addCodingChallenges;
      
      await service(questionData);
      toast.success('Question added successfully');
      fetchQuestions();
      setIsAddModalOpen(false);
    } catch (error) {
      toast.error('Failed to add question');
      console.error('Add question error:', error);
    }
  };

  const handleDeleteQuestion = async (questionId, type) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      const service = type === 'mcq' 
        ? questionBankService.deleteMCQ 
        : questionBankService.deleteCodingChallenge;
      
      await service(questionId);
      toast.success('Question deleted successfully');
      fetchQuestions();
    } catch (error) {
      toast.error('Failed to delete question');
      console.error('Delete error:', error);
    }
  };

  const handleEditQuestion = async (questionData) => {
    try {
      if (questionData.type === 'mcq') {
        // Validate MCQ data before sending
        const { isValid, errors, formattedData } = questionBankService.validateMCQData(questionData);
        
        if (!isValid) {
          toast.error(errors[0]); // Show first error
          return;
        }
        
        await questionBankService.updateMCQ(editingQuestion._id, formattedData);
      } else {
        await questionBankService.updateCodingChallenge(editingQuestion._id, questionData);
      }

      toast.success('Question updated successfully');
      fetchQuestions();
      setIsEditModalOpen(false);
      setEditingQuestion(null);
    } catch (error) {
      toast.error(error.message || 'Failed to update question');
      console.error('Update error:', error);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const ImportButtons = () => (
    <div className="flex gap-2">
      <label className="px-4 py-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
        <input
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => handleImportFile('mcq', e.target.files[0])}
        />
        <Upload className="h-4 w-4 inline mr-2" />
        Import MCQs
      </label>
      <label className="px-4 py-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
        <input
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => handleImportFile('coding', e.target.files[0])}
        />
        <Upload className="h-4 w-4 inline mr-2" />
        Import Coding Challenges
      </label>
    </div>
  );

  const renderQuestionCard = (question) => {
    const questionType = question.hasOwnProperty('question') || question.type === 'mcq' ? 'mcq' : 'coding';

    return (
      <Card key={question._id} className="hover:shadow-md transition-all">
        <CardContent className="p-6">
          {/* Question content */}
          <div className="space-y-4">
            {/* Question Header */}
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${questionType === 'mcq' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                    {questionType.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${question.difficulty === 'hard' ? 'bg-red-50 text-red-600' : 
                      question.difficulty === 'medium' ? 'bg-amber-50 text-amber-600' : 
                      'bg-green-50 text-green-600'}`}>
                    {question.difficulty}
                  </span>
                </div>
                <h3 className="font-medium text-gray-800 text-lg">
                  {questionType === 'mcq' ? question.question : question.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  className="p-2 hover:bg-gray-50 rounded-lg"
                  onClick={() => {
                    setEditingQuestion({
                      ...question,
                      type: questionType,
                      _id: question._id
                    });
                    setIsEditModalOpen(true);
                  }}
                >
                  <Edit2 className="h-4 w-4 text-gray-400" />
                </button>
                <button 
                  className="p-2 hover:bg-gray-50 rounded-lg text-red-400"
                  onClick={() => handleDeleteQuestion(question._id, questionType)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Question Details */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-500">Marks</div>
                <div className="font-medium flex items-center gap-2 mt-1">
                  <Award className="h-4 w-4 text-gray-400" />
                  {question.marks}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Category</div>
                <div className="font-medium flex items-center gap-2 mt-1">
                  <Book className="h-4 w-4 text-gray-400" />
                  {question.category}
                </div>
              </div>
            </div>

            {/* Tags */}
            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {question.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">Question Bank</h1>
          <div className="flex gap-4">
            <ImportButtons />
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </button>
          </div>
        </div>

        {/* Sample Data Download Section */}
        <SampleDataDownload />

        {/* Main content */}
        <div className="grid grid-cols-4 gap-6">
          {/* Categories sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-gray-800 mb-3">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                        selectedCategory === category.id
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <category.icon className="h-4 w-4 inline mr-2" />
                      {category.name}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Questions list */}
          <div className="col-span-3 space-y-4">
            {/* Search and filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search questions..."
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none"
                    />
                  </div>
                  <button 
                    onClick={() => setShowFilters(prev => !prev)} 
                    className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </button>
                </div>
              </CardContent>
            </Card>

            {showFilters && (
              <div className="mt-4 p-4 border rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  >
                    <option value="all">All</option>
                    <option value="mcq">MCQ</option>
                    <option value="coding">Coding</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  >
                    <option value="">All</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
            )}

            {/* Questions */}
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="space-y-4">
                {questions.mcqs.map(renderQuestionCard)}
                {questions.codingChallenges.map(renderQuestionCard)}
              </div>
            )}
          </div>
        </div>

        {/* Add Question Modal */}
        {isAddModalOpen && (
          <AddQuestionModal
            onClose={() => setIsAddModalOpen(false)}
            onSubmit={handleAddQuestion}
          />
        )}

        {/* Edit Question Modal */}
        {isEditModalOpen && editingQuestion && (
          <AddQuestionModal
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingQuestion(null);
            }}
            onSubmit={handleEditQuestion}
            initialData={editingQuestion}
            isEditing={true}
          />
        )}
      </div>
    </Layout>
  );
};

export default QuestionBank; 