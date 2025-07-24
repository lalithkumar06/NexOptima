import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI } from '../../services/api';
import StatsCard from './StatsCard';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatsCards = () => {
    if (user?.role === 'employee') {
      return [
        { title: 'Total Tasks', value: stats.totalTasks || 0, color: '#2563eb', icon: '📋' },
        { title: 'Completed Tasks', value: stats.completedTasks || 0, color: '#059669', icon: '✅' },
        { title: 'Pending Tasks', value: stats.pendingTasks || 0, color: '#ea580c', icon: '⏳' },
        { title: 'In Progress', value: stats.inProgressTasks || 0, color: '#7c3aed', icon: '🔄' },
        { title: 'Attendance Days', value: stats.attendanceDays || 0, color: '#0891b2', icon: '📅' },
        { title: 'Total Leaves', value: stats.totalLeaves || 0, color: '#dc2626', icon: '🏖️' }
      ];
    } else {
      return [
        { title: 'Total Employees', value: stats.totalEmployees || 0, color: '#2563eb', icon: '👥' },
        { title: 'Total Tasks', value: stats.totalTasks || 0, color: '#7c3aed', icon: '📋' },
        { title: 'Completed Tasks', value: stats.completedTasks || 0, color: '#059669', icon: '✅' },
        { title: 'In Progress Tasks', value: stats.inProgressTasks || 0, color: '#ea580c', icon: '🔄' },
        { title: 'Today\'s Attendance', value: stats.todayAttendance || 0, color: '#0891b2', icon: '⏰' },
        { title: 'Pending Leaves', value: stats.pendingLeaves || 0, color: '#dc2626', icon: '📅' }
      ];
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Loading Dashboard...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.firstName}!</h1>
        <p>Here's what's happening with your work today.</p>
      </div>

      <div className="stats-grid">
        {getStatsCards().map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="dashboard-quick-actions">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          {user?.role === 'employee' ? (
            <>
              <div className="quick-action-card">
                <span className="action-icon">⏰</span>
                <h3>Mark Attendance</h3>
                <p>Check in/out for today</p>
              </div>
              <div className="quick-action-card">
                <span className="action-icon">📝</span>
                <h3>Submit Work Log</h3>
                <p>Log today's work progress</p>
              </div>
              <div className="quick-action-card">
                <span className="action-icon">📅</span>
                <h3>Apply for Leave</h3>
                <p>Request time off</p>
              </div>
            </>
          ) : (
            <>
              <div className="quick-action-card">
                <span className="action-icon">📋</span>
                <h3>Assign Task</h3>
                <p>Create new task assignment</p>
              </div>
              <div className="quick-action-card">
                <span className="action-icon">✅</span>
                <h3>Review Leaves</h3>
                <p>Approve pending requests</p>
              </div>
              <div className="quick-action-card">
                <span className="action-icon">👥</span>
                <h3>Team Overview</h3>
                <p>Check team productivity</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;