import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  Copy, 
  Download, 
  Settings,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const CodeEditor = ({ 
  initialCode = '', 
  language = 'javascript',
  onRun,
  onLanguageChange,
  testResults = null,
  isRunning = false
}) => {
  const [code, setCode] = useState(initialCode);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [customTestCase, setCustomTestCase] = useState('');
  const [customExpectedOutput, setCustomExpectedOutput] = useState('');
  const textareaRef = useRef(null);

  const languages = [
    { value: 'javascript', label: 'JavaScript', extension: '.js' },
    { value: 'python', label: 'Python', extension: '.py' },
    { value: 'java', label: 'Java', extension: '.java' },
    { value: 'cpp', label: 'C++', extension: '.cpp' },
    { value: 'c', label: 'C', extension: '.c' },
    { value: 'csharp', label: 'C#', extension: '.cs' }
  ];

  const defaultCode = {
    javascript: `function solution(input) {
    // Your code here
    return result;
}`,
    python: `def solution(input):
    # Your code here
    return result`,
    java: `public class Solution {
    public static void main(String[] args) {
        // Your code here
    }
}`,
    cpp: `#include <iostream>
using namespace std;

int main() {
    // Your code here
    return 0;
}`,
    c: `#include <stdio.h>

int main() {
    // Your code here
    return 0;
}`,
    csharp: `using System;

class Solution {
    static void Main() {
        // Your code here
    }
}`
  };

  useEffect(() => {
    if (selectedLanguage !== language) {
      setSelectedLanguage(language);
      setCode(defaultCode[language] || '');
    }
  }, [language]);

  const handleLanguageChange = (newLanguage) => {
    setSelectedLanguage(newLanguage);
    setCode(defaultCode[newLanguage] || '');
    onLanguageChange?.(newLanguage);
  };

  const handleRun = () => {
    onRun?.(code, selectedLanguage, customTestCase);
  };

  const handleReset = () => {
    setCode(defaultCode[selectedLanguage] || '');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  const getLanguageIcon = (lang) => {
    const icons = {
      javascript: '🟨',
      python: '🐍',
      java: '☕',
      cpp: '⚡',
      c: '🔧',
      csharp: '💎'
    };
    return icons[lang] || '📝';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
        <div className="flex items-center gap-4">
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
          >
            {languages.map(lang => (
              <option key={lang.value} value={lang.value}>
                {getLanguageIcon(lang.value)} {lang.label}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-600">
            {getLanguageIcon(selectedLanguage)} {languages.find(l => l.value === selectedLanguage)?.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            title="Copy Code"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            title="Reset Code"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-96 p-4 font-mono text-sm border-0 focus:outline-none resize-none"
          style={{
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            lineHeight: '1.5',
            tabSize: 2
          }}
          placeholder="Write your code here..."
        />
        <div className="absolute top-4 right-4 text-xs text-gray-400">
          {code.split('\n').length} lines
        </div>
      </div>

      {/* Custom Test Case */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Custom Test Case</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Input</label>
            <textarea
              value={customTestCase}
              onChange={(e) => setCustomTestCase(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm font-mono"
              rows="3"
              placeholder="Enter test input..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Expected Output</label>
            <textarea
              value={customExpectedOutput}
              onChange={(e) => setCustomExpectedOutput(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm font-mono"
              rows="3"
              placeholder="Enter expected output..."
            />
          </div>
        </div>
      </div>

      {/* Run Button */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Running...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Run Code
            </>
          )}
        </button>
      </div>

      {/* Test Results */}
      {testResults && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Test Results</h3>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.passed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {result.passed ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium">
                    Test Case {index + 1} {result.passed ? 'Passed' : 'Failed'}
                  </span>
                  {result.time && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {result.time}ms
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div><strong>Input:</strong> {result.input}</div>
                  <div><strong>Expected:</strong> {result.expected}</div>
                  <div><strong>Output:</strong> {result.output}</div>
                  {!result.passed && result.error && (
                    <div className="text-red-600"><strong>Error:</strong> {result.error}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;






















