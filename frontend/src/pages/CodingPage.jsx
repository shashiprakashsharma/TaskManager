import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuestionById } from '../data/dsaQuestions';
import CodeEditor from '../components/CodeEditor';
import { 
  ArrowLeft, 
  Lightbulb, 
  CheckCircle, 
  Clock,
  Target,
  Bookmark,
  Share2
} from 'lucide-react';
import Loader from '../components/Loader';

const CodingPage = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    if (questionId) {
      const foundQuestion = getQuestionById(questionId);
      setQuestion(foundQuestion);
    }
  }, [questionId]);

  const handleRunCode = async (code, language, customInput) => {
    setIsRunning(true);
    setTestResults(null);

    // Simulate code execution
    setTimeout(() => {
      const results = question.testCases.map((testCase, index) => {
        // This is a mock implementation - in real app, you'd send to backend
        const passed = Math.random() > 0.3; // 70% pass rate for demo
        return {
          input: testCase.input,
          expected: testCase.output,
          output: passed ? testCase.output : 'Wrong Answer',
          passed,
          time: Math.floor(Math.random() * 100) + 10,
          error: passed ? null : 'Logic error in your solution'
        };
      });

      // Add custom test case if provided
      if (customInput) {
        results.push({
          input: customInput,
          expected: 'Custom test case',
          output: 'Custom output',
          passed: true,
          time: 15,
          error: null
        });
      }

      setTestResults(results);
      setIsRunning(false);
    }, 2000);
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

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

  if (!question) {
    return <Loader message="Loading coding environment..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-purple-100 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {question.id}. {question.title}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(question.difficulty)}`}>
                  {getDifficultyIcon(question.difficulty)} {question.difficulty}
                </span>
                <span className="text-sm text-gray-600">
                  {question.testCases.length} test cases
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              <Bookmark className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Problem Description */}
          <div className="space-y-6">
            {/* Problem Description */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Problem Description</h2>
              <p className="text-gray-700 leading-relaxed mb-6">{question.description}</p>
              
              {/* Examples */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Examples</h3>
                <div className="space-y-4">
                  {question.examples.map((example, index) => (
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
                  {question.constraints.map((constraint, index) => (
                    <li key={index} className="text-sm">{constraint}</li>
                  ))}
                </ul>
              </div>

              {/* Hints */}
              <div>
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3 hover:text-purple-600 transition-colors"
                >
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Hints
                  {showHints ? ' (Click to hide)' : ' (Click to show)'}
                </button>
                {showHints && (
                  <div className="space-y-2">
                    {question.hints.map((hint, index) => (
                      <div key={index} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <p className="text-sm text-gray-700">{hint}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Test Cases */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Test Cases
              </h3>
              <div className="space-y-3">
                {question.testCases.map((testCase, index) => (
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

          {/* Right Panel - Code Editor */}
          <div>
            <CodeEditor
              language={selectedLanguage}
              onRun={handleRunCode}
              onLanguageChange={handleLanguageChange}
              testResults={testResults}
              isRunning={isRunning}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingPage;


