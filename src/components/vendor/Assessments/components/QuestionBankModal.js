import React, { useState, useEffect, useCallback } from 'react';
import { X, Search } from 'lucide-react';
import { questionBankService } from '../../../../services/questionBank.service';
import { toast } from 'react-hot-toast';

const QuestionBankModal = ({ onClose, onSelect, type, existingQuestions = [] }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const fetchQuestions = useCallback(async () => {
    try {
      const response = await questionBankService.searchQuestions({
        type: type,
        search: searchQuery
      });
      // Filter out questions that are already in the test
      const filteredQuestions = type === 'mcq' 
        ? response.mcqs.filter(q => !existingQuestions.some(eq => eq._id === q._id))
        : response.codingChallenges.filter(q => !existingQuestions.some(eq => eq._id === q._id));
      setQuestions(filteredQuestions);
    } catch (error) {
      toast.error('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  }, [type, searchQuery, existingQuestions]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSubmit = () => {
    onSelect(selectedQuestions);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Select Questions</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Questions List */}
          <div className="overflow-y-auto max-h-[50vh] space-y-4">
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : questions.length === 0 ? (
              <div className="text-center py-4">No questions found</div>
            ) : (
              questions.map((question) => (
                <div
                  key={question._id}
                  className={`p-4 border rounded-lg cursor-pointer ${
                    selectedQuestions.includes(question) ? 'border-emerald-500 bg-emerald-50' : ''
                  }`}
                  onClick={() => {
                    if (selectedQuestions.includes(question)) {
                      setSelectedQuestions(prev => prev.filter(q => q._id !== question._id));
                    } else {
                      setSelectedQuestions(prev => [...prev, question]);
                    }
                  }}
                >
                  <h3 className="font-medium">
                    {type === 'mcq' ? question.question : question.title}
                  </h3>
                  <div className="text-sm text-gray-500 mt-2">
                    {question.marks} marks • {question.difficulty}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
            >
              Add Selected ({selectedQuestions.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionBankModal; 