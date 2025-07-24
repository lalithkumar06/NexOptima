import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login/Login';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import TaskManagement from './components/Tasks/TaskManagement';
import AttendanceManagement from './components/Attendance/AttendanceManagement';
import LeaveManagement from './components/Leave/LeaveManagement';
import WorkLogManagement from './components/WorkLog/WorkLogManagement';
import UserManagement from './components/Users/UserManagement';
import Analytics from './components/Analytics/Analytics';
import { useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <TaskManagement />;
      case 'attendance':
        return <AttendanceManagement />;
      case 'leaves':
        return <LeaveManagement />;
      case 'worklogs':
        return <WorkLogManagement />;
      case 'users':
        return <UserManagement />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <Navbar />
      <div className="app-layout">
        <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />
        <main className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
          {renderView()}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Router>
    </AuthProvider>
  );
}

export default App;