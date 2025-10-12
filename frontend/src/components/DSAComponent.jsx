import React, { useState } from 'react';
import { 
  Code, 
  ChevronRight, 
  ChevronDown,
  Lightbulb,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dsaQuestions } from '../data/dsaQuestions';

const DSAComponent = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return '🟢';
      case 'medium':
        return '🟡';
      case 'hard':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-purple-100">
      {/* Header */}
      <button
        onClick={() => navigate('/dsa')}
        className="w-full p-4 flex items-center justify-between hover:bg-purple-50 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Code className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-800">DSA Practice</h3>
            <p className="text-xs text-gray-600">Open problem library</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-500" />
      </button>

      {/* Expanded Content (unused when header navigates) */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-green-50 p-2 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {dsaQuestions.filter(q => q.difficulty === 'Easy').length}
              </div>
              <div className="text-xs text-green-600">Easy</div>
            </div>
            <div className="bg-yellow-50 p-2 rounded-lg">
              <div className="text-lg font-bold text-yellow-600">
                {dsaQuestions.filter(q => q.difficulty === 'Medium').length}
              </div>
              <div className="text-xs text-yellow-600">Medium</div>
            </div>
            <div className="bg-red-50 p-2 rounded-lg">
              <div className="text-lg font-bold text-red-600">
                {dsaQuestions.filter(q => q.difficulty === 'Hard').length}
              </div>
              <div className="text-xs text-red-600">Hard</div>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {dsaQuestions.map((question) => (
              <button
                key={question.id}
                onClick={() => setSelectedQuestion(question)}
                className="w-full p-3 text-left bg-gray-50 hover:bg-purple-50 rounded-lg transition-colors border border-gray-200 hover:border-purple-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">
                      {question.id}. {question.title}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                      {getDifficultyIcon(question.difficulty)} {question.difficulty}
                    </span>
                  </div>
                  <Target className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {question.description}
                </p>
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200">
              Random Question
            </button>
            <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              View All
            </button>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Code className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {selectedQuestion.id}. {selectedQuestion.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedQuestion.difficulty)}`}>
                        {getDifficultyIcon(selectedQuestion.difficulty)} {selectedQuestion.difficulty}
                      </span>
                      <span className="text-sm text-gray-600">
                        {selectedQuestion.testCases.length} test cases
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedQuestion(null)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Problem Description</h3>
                <p className="text-gray-700 leading-relaxed">{selectedQuestion.description}</p>
              </div>

              {/* Examples */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Examples</h3>
                <div className="space-y-4">
                  {selectedQuestion.examples.map((example, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Input</h4>
                          <pre className="text-sm bg-white p-2 rounded border font-mono text-gray-800">
                            {example.input}
                          </pre>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Output</h4>
                          <pre className="text-sm bg-white p-2 rounded border font-mono text-gray-800">
                            {example.output}
                          </pre>
                        </div>
                      </div>
                      {example.explanation && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Explanation</h4>
                          <p className="text-sm text-gray-600">{example.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Constraints */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Constraints</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {selectedQuestion.constraints.map((constraint, index) => (
                    <li key={index} className="text-sm">{constraint}</li>
                  ))}
                </ul>
              </div>

              {/* Hints */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Hints
                </h3>
                <div className="space-y-2">
                  {selectedQuestion.hints.map((hint, index) => (
                    <div key={index} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      <p className="text-sm text-gray-700">{hint}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Test Cases */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Test Cases
                </h3>
                <div className="space-y-2">
                  {selectedQuestion.testCases.map((testCase, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <h4 className="text-xs font-medium text-gray-600 mb-1">Input</h4>
                          <pre className="text-xs bg-white p-2 rounded border font-mono text-gray-800">
                            {testCase.input}
                          </pre>
                        </div>
                        <div>
                          <h4 className="text-xs font-medium text-gray-600 mb-1">Expected Output</h4>
                          <pre className="text-xs bg-white p-2 rounded border font-mono text-gray-800">
                            {testCase.output}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setSelectedQuestion(null);
                    navigate(`/coding/${selectedQuestion.id}`);
                  }}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 font-medium shadow-lg"
                >
                  Start Coding
                </button>
                <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                  Bookmark
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DSAComponent;
