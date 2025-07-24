import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ activeView, setActiveView }) => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getMenuItems = () => {
    const commonItems = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' }
    ];

    if (user?.role === 'admin') {
      return [
        ...commonItems,
        { id: 'users', label: 'User Management', icon: '👥' },
        { id: 'tasks', label: 'Task Management', icon: '📋' },
        { id: 'leaves', label: 'Leave Management', icon: '📅' },
        { id: 'attendance', label: 'Attendance', icon: '⏰' },
        { id: 'worklogs', label: 'Work Logs', icon: '📝' },
        { id: 'analytics', label: 'Analytics', icon: '📈' }
      ];
    } else if (user?.role === 'hr') {
      return [
        ...commonItems,
        { id: 'tasks', label: 'Task Management', icon: '📋' },
        { id: 'leaves', label: 'Leave Management', icon: '📅' },
        { id: 'attendance', label: 'Team Attendance', icon: '⏰' },
        { id: 'worklogs', label: 'Work Logs', icon: '📝' },
        { id: 'analytics', label: 'Analytics', icon: '📈' }
      ];
    } else {
      return [
        ...commonItems,
        { id: 'tasks', label: 'My Tasks', icon: '✅' },
        { id: 'attendance', label: 'My Attendance', icon: '⏰' },
        { id: 'leaves', label: 'My Leaves', icon: '📅' },
        { id: 'worklogs', label: 'Work Logs', icon: '📝' }
      ];
    }
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button 
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {getMenuItems().map(item => (
          <button
            key={item.id}
            className={`sidebar-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => setActiveView(item.id)}
            title={isCollapsed ? item.label : ''}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {!isCollapsed && <span className="sidebar-label">{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;