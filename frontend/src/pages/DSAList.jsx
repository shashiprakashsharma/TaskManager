import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dsaQuestions } from '../data/dsaQuestions';
import { ArrowLeft, Search, Filter, Grid, List as ListIcon } from 'lucide-react';

const DSAList = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [layout, setLayout] = useState('list');
  const [topic, setTopic] = useState('All Topics');

  const topics = useMemo(() => {
    const set = new Set();
    dsaQuestions.forEach(q => set.add(q.topic || 'General'));
    return ['All Topics', ...Array.from(set)];
  }, []);

  const filtered = useMemo(() => {
    return dsaQuestions.filter(q => {
      const matchesQuery = query.trim() === '' ||
        q.title.toLowerCase().includes(query.toLowerCase()) ||
        (q.description || '').toLowerCase().includes(query.toLowerCase());
      const matchesTopic = topic === 'All Topics' || (q.topic || 'General') === topic;
      return matchesQuery && matchesTopic;
    });
  }, [query, topic]);

  const difficultyColor = (d) => {
    const diff = (d || '').toLowerCase();
    if (diff === 'easy') return 'text-green-600 bg-green-100';
    if (diff === 'medium') return 'text-yellow-600 bg-yellow-100';
    if (diff === 'hard') return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-purple-100 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">DSA Practice Library</h1>
              <p className="text-sm text-gray-600">Choose a problem to start coding</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setLayout('list')}
              className={`p-2 rounded-lg border ${layout==='list' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-purple-200 hover:bg-purple-50'}`}
              title="List view"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayout('grid')}
              className={`p-2 rounded-lg border ${layout==='grid' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-purple-200 hover:bg-purple-50'}`}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-4 md:p-5">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 border rounded-lg border-purple-200">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search questions"
                className="flex-1 outline-none text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 border rounded-lg border-purple-200">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="text-sm outline-none"
                >
                  {topics.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* List */}
        {layout === 'list' ? (
          <div className="mt-4 space-y-3">
            {filtered.map((q) => (
              <button
                key={q.id}
                onClick={() => navigate(`/coding/${q.id}`)}
                className="w-full text-left bg-white rounded-xl p-4 border border-purple-100 hover:border-purple-200 hover:bg-purple-50/40 transition-colors shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-800 font-medium">{q.id}. {q.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${difficultyColor(q.difficulty)}`}>
                      {q.difficulty || 'Unknown'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{q.topic || 'General'}</span>
                </div>
                <p className="text-xs text-gray-600 mt-2 line-clamp-2">{q.description}</p>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-10 bg-white rounded-xl border border-purple-100">No questions found.</div>
            )}
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((q) => (
              <button
                key={q.id}
                onClick={() => navigate(`/coding/${q.id}`)}
                className="text-left bg-white rounded-xl p-4 border border-purple-100 hover:border-purple-200 hover:bg-purple-50/40 transition-colors shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-800 font-semibold">{q.id}. {q.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${difficultyColor(q.difficulty)}`}>
                    {q.difficulty || 'Unknown'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-3">{q.description}</p>
                <div className="text-xs text-gray-400 mt-3">{q.topic || 'General'}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DSAList;

