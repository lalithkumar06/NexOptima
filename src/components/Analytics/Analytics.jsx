import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI } from '../../services/api';
import { toast } from 'react-toastify';
import './Analytics.css';

const Analytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'hr') {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const response = await dashboardAPI.getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role === 'employee') {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to access analytics.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h1>Analytics & Reports</h1>
        <p>Comprehensive insights into team productivity and performance</p>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h2>Task Status Distribution</h2>
          <div className="chart-container">
            {analytics.taskStats && analytics.taskStats.length > 0 ? (
              <div className="pie-chart-simple">
                {analytics.taskStats.map((stat, index) => (
                  <div key={stat._id} className="stat-item">
                    <div className="stat-bar">
                      <div 
                        className="stat-fill"
                        style={{ 
                          width: `${(stat.count / analytics.taskStats.reduce((sum, s) => sum + s.count, 0)) * 100}%`,
                          backgroundColor: getStatusColor(stat._id)
                        }}
                      />
                    </div>
                    <div className="stat-label">
                      <span className="stat-name">{stat._id}</span>
                      <span className="stat-count">{stat.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">No task data available</div>
            )}
          </div>
        </div>

        <div className="analytics-card">
          <h2>Daily Attendance Trends</h2>
          <div className="chart-container">
            {analytics.attendanceStats && analytics.attendanceStats.length > 0 ? (
              <div className="line-chart-simple">
                {analytics.attendanceStats.map((stat, index) => (
                  <div key={stat._id} className="attendance-day">
                    <div className="day-bar">
                      <div 
                        className="day-fill"
                        style={{ 
                          height: `${(stat.count / Math.max(...analytics.attendanceStats.map(s => s.count))) * 100}%`
                        }}
                      />
                    </div>
                    <div className="day-label">
                      {new Date(stat._id).getDate()}
                    </div>
                    <div className="day-count">{stat.count}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">No attendance data available</div>
            )}
          </div>
        </div>

        <div className="analytics-card full-width">
          <h2>Department Performance</h2>
          <div className="chart-container">
            {analytics.departmentStats && analytics.departmentStats.length > 0 ? (
              <div className="department-stats">
                {analytics.departmentStats.map((dept, index) => (
                  <div key={dept._id} className="department-item">
                    <div className="department-header">
                      <h3>{dept._id}</h3>
                      <div className="department-metrics">
                        <span className="metric">
                          <strong>Total Tasks:</strong> {dept.totalTasks}
                        </span>
                        <span className="metric">
                          <strong>Completed:</strong> {dept.completedTasks}
                        </span>
                        <span className="metric">
                          <strong>Completion Rate:</strong> {((dept.completedTasks / dept.totalTasks) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${(dept.completedTasks / dept.totalTasks) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">No department data available</div>
            )}
          </div>
        </div>

        <div className="analytics-card">
          <h2>Key Metrics</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-value">
                {analytics.taskStats ? 
                  analytics.taskStats.reduce((sum, stat) => sum + stat.count, 0) : 0
                }
              </div>
              <div className="metric-label">Total Tasks</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">
                {analytics.taskStats ? 
                  (analytics.taskStats.find(s => s._id === 'completed')?.count || 0) : 0
                }
              </div>
              <div className="metric-label">Completed Tasks</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">
                {analytics.attendanceStats ? 
                  analytics.attendanceStats.reduce((sum, stat) => sum + stat.count, 0) : 0
                }
              </div>
              <div className="metric-label">Total Attendance</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">
                {analytics.departmentStats ? analytics.departmentStats.length : 0}
              </div>
              <div className="metric-label">Active Departments</div>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <h2>Performance Insights</h2>
          <div className="insights-list">
            <div className="insight-item">
              <div className="insight-icon">📈</div>
              <div className="insight-content">
                <h4>Task Completion Rate</h4>
                <p>
                  {analytics.taskStats && analytics.taskStats.length > 0 ? 
                    `${(((analytics.taskStats.find(s => s._id === 'completed')?.count || 0) / 
                    analytics.taskStats.reduce((sum, s) => sum + s.count, 0)) * 100).toFixed(1)}% of tasks completed` :
                    'No task data available'
                  }
                </p>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon">👥</div>
              <div className="insight-content">
                <h4>Team Productivity</h4>
                <p>
                  {analytics.departmentStats && analytics.departmentStats.length > 0 ?
                    `${analytics.departmentStats.length} departments actively working on projects` :
                    'No department data available'
                  }
                </p>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon">⏰</div>
              <div className="insight-content">
                <h4>Attendance Trends</h4>
                <p>
                  {analytics.attendanceStats && analytics.attendanceStats.length > 0 ?
                    `Average ${(analytics.attendanceStats.reduce((sum, s) => sum + s.count, 0) / analytics.attendanceStats.length).toFixed(1)} employees per day` :
                    'No attendance data available'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  const colors = {
    'pending': '#f59e0b',
    'in-progress': '#3b82f6',
    'completed': '#10b981',
    'on-hold': '#6b7280'
  };
  return colors[status] || '#6b7280';
};

export default Analytics;