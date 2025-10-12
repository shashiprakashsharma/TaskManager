import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Outlet, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './pages/Dashboard';
import CompletePage from './pages/CompletePage';
import PendingPage from './pages/PendingPage';
import Profile from './components/Profile';
import NotePage from './pages/NotePage';
import CodingPage from './pages/CodingPage';
import DSAList from './pages/DSAList';
import KanbanPage from './pages/KanbanPage';
import TimeTrackerPage from './pages/TimeTrackerPage';



const App = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  });

  // Force LTR direction on app load
  React.useEffect(() => {
    document.documentElement.setAttribute('dir', 'ltr');
    document.body.setAttribute('dir', 'ltr');
    document.documentElement.style.direction = 'ltr';
    document.body.style.direction = 'ltr';
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const handleAuthSubmit = (data) => {
    const user = {
      email: data.email,
      name: data.name || 'User',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'User')}&background=random`
    };
    setCurrentUser(user);
    navigate('/', { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    navigate('/login', { replace: true });
  };

  // 🔒 Protected wrapper
  const ProtectedLayout = () => (

      <Layout user={currentUser} onLogout={handleLogout}>
        <Outlet />
      </Layout>
    );

  return (
    <ThemeProvider>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Login onSubmit={handleAuthSubmit} onSwitchMode={() => navigate('/signup')} />
            </div>
          }
        />
        <Route
          path="/signup"
          element={
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <SignUp onSubmit={handleAuthSubmit} onSwitchMode={() => navigate('/login')} />
            </div>
          }
        />

        {/* Standalone routes (without Layout) */}
        <Route path="/note/:taskId" element={currentUser ? <NotePage /> : <Navigate to='/login' replace />}/>
        <Route path="/coding/:questionId" element={currentUser ? <CodingPage /> : <Navigate to='/login' replace />}/>
        <Route path="/dsa" element={currentUser ? <DSAList /> : <Navigate to='/login' replace />}/>

        <Route element={currentUser ? <ProtectedLayout/> : <Navigate to='/login' replace />}>
        <Route path="/" element={<Dashboard />}/>
        <Route path="/pending" element={<PendingPage/>}/>
        <Route path="/complete" element={<CompletePage/>}/> 
        <Route path="/kanban" element={<KanbanPage/>}/>
        <Route path="/time-tracker" element={<TimeTrackerPage/>}/>
        <Route path="/profile" element={<Profile user={currentUser} setCurrentUser={setCurrentUser} onLogout={handleLogout}/>}/>
        </Route>

        <Route path='*' element={<Navigate to={currentUser ? '/' : '/login'} replace />}/>
      </Routes>
    </ThemeProvider>
  );
};

export default App;
