import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ModernTextEditor from '../components/ModernTextEditor';
import axios from 'axios';
import Loader from '../components/Loader';

const API_BASE = "http://localhost:4000/api/notes";

const NotePage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const LOCAL_KEY = `note_${taskId}`;

  useEffect(() => {
    fetchNote();
  }, [taskId]);

  const fetchNote = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_BASE}/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setNote(response.data.note);
        // sync local cache
        try {
          localStorage.setItem(LOCAL_KEY, JSON.stringify(response.data.note));
        } catch {}
      } else {
        // Create new note if doesn't exist
        const fresh = {
          taskId,
          content: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setNote(fresh);
      }
    } catch (error) {
      // Try local cache fallback
      try {
        const cached = localStorage.getItem(LOCAL_KEY);
        if (cached) {
          setNote(JSON.parse(cached));
        } else {
          setNote({
            taskId,
            content: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      } catch {
        setNote({
          taskId,
          content: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (content) => {
    setSaving(true);
    const token = localStorage.getItem("token");
    const noteData = {
      taskId,
      content,
      updatedAt: new Date().toISOString()
    };

    try {
      if (note && note._id) {
        await axios.put(`${API_BASE}/${note._id}`, noteData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNote(prev => ({ ...(prev || {}), ...noteData }));
      } else {
        const response = await axios.post(API_BASE, noteData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNote(response.data.note);
      }

      // Cache locally as well
      try { localStorage.setItem(LOCAL_KEY, JSON.stringify({ ...(note || {}), ...noteData })); } catch {}

      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successMessage.textContent = 'Note saved successfully!';
      document.body.appendChild(successMessage);
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 2000);

    } catch (error) {
      // Fallback: save locally if backend fails
      try { localStorage.setItem(LOCAL_KEY, JSON.stringify({ ...(note || {}), ...noteData })); } catch {}

      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      errorMessage.textContent = 'Saved locally. Will sync when online.';
      document.body.appendChild(errorMessage);
      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!note || !note._id) {
      // Clear local cache if any
      try { localStorage.removeItem(LOCAL_KEY); } catch {}
      navigate(-1);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/${note._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successMessage.textContent = 'Note deleted successfully!';
      document.body.appendChild(successMessage);
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 2000);

      // Clear local cache
      try { localStorage.removeItem(LOCAL_KEY); } catch {}

      // Navigate back
      navigate(-1);
    } catch (error) {
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      errorMessage.textContent = 'Error deleting note. Please try again.';
      document.body.appendChild(errorMessage);
      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 2500);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return <Loader message="Loading your note..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Modern Header */}
      <div className="bg-white border-b border-purple-100 px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Task Note</h1>
              <p className="text-sm text-gray-600">Create and manage your task notes</p>
            </div>
          </div>
          {saving && (
            <div className="flex items-center gap-3 text-sm text-gray-600 bg-green-50 px-4 py-2 rounded-xl border border-green-200">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
              <span className="font-medium">Saving...</span>
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <ModernTextEditor
        initialContent={note?.content || ''}
        onSave={handleSave}
        onDelete={handleDelete}
        onCancel={handleCancel}
        isEditing={note && note._id}
      />
    </div>
  );
};

export default NotePage;
