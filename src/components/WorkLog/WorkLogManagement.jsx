import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { workLogsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import './WorkLogManagement.css';

const WorkLogManagement = () => {
  const { user } = useAuth();
  const [workLogs, setWorkLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newWorkLog, setNewWorkLog] = useState({
    date: new Date().toISOString().split('T')[0],
    tasksCompleted: [{ task: '', hoursWorked: '', description: '' }],
    blockers: '',
    achievements: '',
    tomorrowsPlan: '',
    totalHours: '',
    productivity: 'medium'
  });

  useEffect(() => {
    if(user) fetchWorkLogs();
  }, [selectedDate]);

  const fetchWorkLogs = async () => {
    try {
      const currentDate = new Date(selectedDate);
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      const response = user?.role === 'employee'
        ? await workLogsAPI.getMyLogs(month, year)
        : await workLogsAPI.getTeamLogs(selectedDate);
      
      setWorkLogs(response.data);
    } catch (error) {
      toast.error('Failed to fetch work logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWorkLog = async (e) => {
    e.preventDefault();
    try {
      await workLogsAPI.create(newWorkLog);
      toast.success('Work log submitted successfully');
      setShowSubmitForm(false);
      setNewWorkLog({
        date: new Date().toISOString().split('T')[0],
        tasksCompleted: [{ task: '', hoursWorked: '', description: '' }],
        blockers: '',
        achievements: '',
        tomorrowsPlan: '',
        totalHours: '',
        productivity: 'medium'
      });
      fetchWorkLogs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit work log');
    }
  };

  const addTaskCompleted = () => {
    setNewWorkLog({
      ...newWorkLog,
      tasksCompleted: [...newWorkLog.tasksCompleted, { task: '', hoursWorked: '', description: '' }]
    });
  };

  const removeTaskCompleted = (index) => {
    const updatedTasks = newWorkLog.tasksCompleted.filter((_, i) => i !== index);
    setNewWorkLog({ ...newWorkLog, tasksCompleted: updatedTasks });
  };

  const updateTaskCompleted = (index, field, value) => {
    const updatedTasks = newWorkLog.tasksCompleted.map((task, i) => 
      i === index ? { ...task, [field]: value } : task
    );
    setNewWorkLog({ ...newWorkLog, tasksCompleted: updatedTasks });
  };

  const getProductivityColor = (productivity) => {
    const colors = {
      'low': '#ef4444',
      'medium': '#f59e0b',
      'high': '#10b981'
    };
    return colors[productivity] || '#6b7280';
  };

  if (loading) {
    return <div className="loading">Loading work logs...</div>;
  }

  return (
    <div className="worklog-management">
      <div className="worklog-header">
        <h1>{user.role === 'employee' ? 'My Work Logs' : 'Team Work Logs'}</h1>
        <div className="worklog-actions">
          {user.role !== 'employee' && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-input"
            />
          )}
          {user.role === 'employee' && (
            <button 
              className="btn btn-primary"
              onClick={() => setShowSubmitForm(true)}
            >
              Submit Work Log
            </button>
          )}
        </div>
      </div>

      {showSubmitForm && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <div className="modal-header">
              <h2>Submit Daily Work Log</h2>
              <button 
                className="close-btn"
                onClick={() => setShowSubmitForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitWorkLog} className="modal-body">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={newWorkLog.date}
                  onChange={(e) => setNewWorkLog({...newWorkLog, date: e.target.value})}
                  required
                />
              </div>

              <div className="tasks-section">
                <div className="section-header">
                  <h3>Tasks Completed</h3>
                  <button type="button" className="btn btn-secondary" onClick={addTaskCompleted}>
                    Add Task
                  </button>
                </div>
                {newWorkLog.tasksCompleted.map((task, index) => (
                  <div key={index} className="task-item">
                    <div className="task-inputs">
                      <div className="form-group">
                        <label>Task ID (Optional)</label>
                        <input
                          type="text"
                          value={task.task}
                          onChange={(e) => updateTaskCompleted(index, 'task', e.target.value)}
                          placeholder="Task ID or reference"
                        />
                      </div>
                      <div className="form-group">
                        <label>Hours Worked</label>
                        <input
                          type="number"
                          step="0.5"
                          value={task.hoursWorked}
                          onChange={(e) => updateTaskCompleted(index, 'hoursWorked', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={task.description}
                        onChange={(e) => updateTaskCompleted(index, 'description', e.target.value)}
                        placeholder="Describe what you worked on..."
                        required
                      />
                    </div>
                    {newWorkLog.tasksCompleted.length > 1 && (
                      <button 
                        type="button" 
                        className="remove-task-btn"
                        onClick={() => removeTaskCompleted(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label>Blockers</label>
                <textarea
                  value={newWorkLog.blockers}
                  onChange={(e) => setNewWorkLog({...newWorkLog, blockers: e.target.value})}
                  placeholder="Any blockers or challenges faced..."
                />
              </div>

              <div className="form-group">
                <label>Achievements</label>
                <textarea
                  value={newWorkLog.achievements}
                  onChange={(e) => setNewWorkLog({...newWorkLog, achievements: e.target.value})}
                  placeholder="Key achievements or milestones..."
                />
              </div>

              <div className="form-group">
                <label>Tomorrow's Plan</label>
                <textarea
                  value={newWorkLog.tomorrowsPlan}
                  onChange={(e) => setNewWorkLog({...newWorkLog, tomorrowsPlan: e.target.value})}
                  placeholder="What do you plan to work on tomorrow..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Total Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newWorkLog.totalHours}
                    onChange={(e) => setNewWorkLog({...newWorkLog, totalHours: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Productivity Level</label>
                  <select
                    value={newWorkLog.productivity}
                    onChange={(e) => setNewWorkLog({...newWorkLog, productivity: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSubmitForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Work Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="worklogs-grid">
        {workLogs.map(log => (
          <div key={log._id} className="worklog-card">
            <div className="worklog-card-header">
              <div className="worklog-date">
                {new Date(log.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="worklog-meta">
                <span className="total-hours">{log.totalHours}h</span>
                <span 
                  className="productivity-badge"
                  style={{ backgroundColor: getProductivityColor(log.productivity) }}
                >
                  {log.productivity}
                </span>
              </div>
            </div>
            
            <div className="worklog-card-body">
              {user.role !== 'employee' && (
                <div className="worklog-employee">
                  <strong>Employee:</strong> {log.user.firstName} {log.user.lastName} ({log.user.employeeId})
                </div>
              )}

              <div className="worklog-section">
                <h4>Tasks Completed</h4>
                {log.tasksCompleted.map((task, index) => (
                  <div key={index} className="task-completed">
                    <div className="task-header">
                      <span className="task-hours">{task.hoursWorked}h</span>
                      {task.task && <span className="task-id">#{task.task}</span>}
                    </div>
                    <p>{task.description}</p>
                  </div>
                ))}
              </div>

              {log.achievements && (
                <div className="worklog-section">
                  <h4>Achievements</h4>
                  <p>{log.achievements}</p>
                </div>
              )}

              {log.blockers && (
                <div className="worklog-section">
                  <h4>Blockers</h4>
                  <p>{log.blockers}</p>
                </div>
              )}

              {log.tomorrowsPlan && (
                <div className="worklog-section">
                  <h4>Tomorrow's Plan</h4>
                  <p>{log.tomorrowsPlan}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {workLogs.length === 0 && (
        <div className="empty-state">
          <h3>No work logs found</h3>
          <p>
            {user.role === 'employee' 
              ? 'You haven\'t submitted any work logs yet.'
              : 'No work logs found for the selected date.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkLogManagement;