import React from 'react';
import { Download, HelpCircle } from 'lucide-react';

const sampleMCQs = [
  {
    "question": "What is the output of console.log(typeof [])?",
    "options": ["array", "object", "undefined", "Array"],
    "correctOptions": [1],
    "answerType": "single",
    "marks": 2,
    "explanation": "In JavaScript, arrays are actually objects. Therefore, typeof [] returns 'object'.",
    "difficulty": "easy",
    "category": "JavaScript",
    "tags": ["javascript", "arrays", "fundamentals"]
  },
  {
    "question": "Which of the following are valid ways to create an array in JavaScript?",
    "options": [
      "let arr = new Array()",
      "let arr = []",
      "let arr = Array.from('hello')",
      "let arr = [1,2,3].slice()"
    ],
    "correctOptions": [0, 1, 2, 3],
    "answerType": "multiple",
    "marks": 3,
    "explanation": "All of these are valid ways to create an array in JavaScript.",
    "difficulty": "medium",
    "category": "JavaScript",
    "tags": ["javascript", "arrays", "initialization"]
  }
];

const sampleCodingChallenges = [
  {
    "title": "Two Sum",
    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    "problemStatement": "Write a function that takes an array of integers and a target sum, and returns the indices of two numbers that add up to the target.",
    "constraints": "2 <= nums.length <= 104\n-109 <= nums[i] <= 109\n-109 <= target <= 109",
    "allowedLanguages": ["javascript", "python"],
    "languageImplementations": {
      "javascript": {
        "visibleCode": "function twoSum(nums, target) {\n  // Write your code here\n}",
        "invisibleCode": "module.exports = { twoSum };"
      },
      "python": {
        "visibleCode": "def two_sum(nums, target):\n    # Write your code here\n    pass",
        "invisibleCode": "if __name__ == '__main__':\n    import json\n    def parse_input(input_str):\n        nums, target = json.loads(input_str)\n        return nums, int(target)\n\n    def format_output(result):\n        return json.dumps(result)"
      }
    },
    "testCases": [
      {
        "input": "[2,7,11,15] 9",
        "output": "[0,1]",
        "isVisible": true,
        "explanation": "nums[0] + nums[1] = 2 + 7 = 9"
      },
      {
        "input": "[3,2,4] 6",
        "output": "[1,2]",
        "isVisible": true,
        "explanation": "nums[1] + nums[2] = 2 + 4 = 6"
      }
    ],
    "marks": 10,
    "timeLimit": 1,
    "memoryLimit": 256,
    "difficulty": "easy",
    "category": "Arrays",
    "tags": ["arrays", "hash-table"]
  },
  {
    "title": "Palindrome Check",
    "description": "Write a function to determine if a string is a palindrome.",
    "problemStatement": "Create a function that returns true if the input string is a palindrome, and false otherwise. A palindrome is a string that reads the same forward and backward.",
    "constraints": "1 <= s.length <= 2 * 105\ns consists only of printable ASCII characters",
    "allowedLanguages": ["javascript", "python"],
    "languageImplementations": {
      "javascript": {
        "visibleCode": "function isPalindrome(s) {\n  // Write your code here\n}",
        "invisibleCode": "module.exports = { isPalindrome };"
      },
      "python": {
        "visibleCode": "def is_palindrome(s):\n    # Write your code here\n    pass",
        "invisibleCode": "if __name__ == '__main__':\n    import json\n    def format_output(result):\n        return json.dumps(result)\n\n    # Read input and call function\n    input_str = input().strip()\n    result = is_palindrome(input_str)\n    print(format_output(result))"
      }
    },
    "testCases": [
      {
        "input": "racecar",
        "output": "true",
        "isVisible": true,
        "explanation": "'racecar' reads the same forwards and backwards"
      },
      {
        "input": "hello",
        "output": "false",
        "isVisible": true,
        "explanation": "'hello' is not a palindrome"
      }
    ],
    "marks": 5,
    "timeLimit": 1,
    "memoryLimit": 256,
    "difficulty": "easy",
    "category": "Strings",
    "tags": ["strings", "two-pointers"]
  }
];

const SampleDataDownload = () => {
  const downloadSampleData = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Sample Data Templates</h3>
        <button
          className="text-gray-400 hover:text-gray-500"
          onClick={() => {
            // Add tooltip or modal with more information
          }}
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">MCQ Questions</h4>
          <p className="text-sm text-gray-500 mb-4">
            Download a sample JSON file with MCQ questions format
          </p>
          <button
            onClick={() => downloadSampleData(sampleMCQs, 'sample_mcqs.json')}
            className="flex items-center text-sm text-emerald-600 hover:text-emerald-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Sample MCQs
          </button>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">Coding Challenges</h4>
          <p className="text-sm text-gray-500 mb-4">
            Download a sample JSON file with coding challenges format
          </p>
          <button
            onClick={() => downloadSampleData(sampleCodingChallenges, 'sample_coding_challenges.json')}
            className="flex items-center text-sm text-emerald-600 hover:text-emerald-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Sample Challenges
          </button>
        </div>
      </div>
    </div>
  );
};

export default SampleDataDownload; 