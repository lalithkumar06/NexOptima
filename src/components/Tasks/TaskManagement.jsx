import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { tasksAPI } from '../../services/api';
import { toast } from 'react-toastify';
import './TaskManagement.css';

const TaskManagement = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    project: '',
    priority: 'medium',
    startDate: '',
    dueDate: '',
    estimatedHours: ''
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = user.role === 'employee' 
        ? await tasksAPI.getMyTasks()
        : await tasksAPI.getAll();
      setTasks(response.data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await tasksAPI.create(newTask);
      toast.success('Task created successfully');
      setShowCreateForm(false);
      setNewTask({
        title: '',
        description: '',
        assignedTo: '',
        project: '',
        priority: 'medium',
        startDate: '',
        dueDate: '',
        estimatedHours: ''
      });
      fetchTasks();
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleStatusUpdate = async (taskId, status) => {
    try {
      await tasksAPI.updateStatus(taskId, status);
      toast.success('Task status updated');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'pending': 'badge-warning',
      'in-progress': 'badge-info',
      'completed': 'badge-success',
      'on-hold': 'badge-secondary'
    };
    return `badge ${statusClasses[status] || 'badge-secondary'}`;
  };

  const getPriorityBadge = (priority) => {
    const priorityClasses = {
      'low': 'badge-secondary',
      'medium': 'badge-info',
      'high': 'badge-warning',
      'urgent': 'badge-danger'
    };
    return `badge ${priorityClasses[priority] || 'badge-secondary'}`;
  };

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  return (
    <div className="task-management">
      <div className="task-header">
        <h1>{user.role === 'employee' ? 'My Tasks' : 'Task Management'}</h1>
        {(user.role === 'admin' || user.role === 'hr') && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            Create New Task
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Create New Task</h2>
              <button 
                className="close-btn"
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="modal-body">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Assigned To (Employee ID)</label>
                <input
                  type="text"
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Project</label>
                <input
                  type="text"
                  value={newTask.project}
                  onChange={(e) => setNewTask({...newTask, project: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={newTask.startDate}
                  onChange={(e) => setNewTask({...newTask, startDate: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Estimated Hours</label>
                <input
                  type="number"
                  value={newTask.estimatedHours}
                  onChange={(e) => setNewTask({...newTask, estimatedHours: e.target.value})}
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="tasks-grid">
        {tasks.map(task => (
          <div key={task._id} className="task-card">
            <div className="task-card-header">
              <h3>{task.title}</h3>
              <div className="task-badges">
                <span className={getPriorityBadge(task.priority)}>
                  {task.priority}
                </span>
                <span className={getStatusBadge(task.status)}>
                  {task.status}
                </span>
              </div>
            </div>
            <div className="task-card-body">
              <p>{task.description}</p>
              <div className="task-details">
                <div className="task-detail">
                  <strong>Project:</strong> {task.project}
                </div>
                <div className="task-detail">
                  <strong>Due Date:</strong> {new Date(task.dueDate).toLocaleDateString()}
                </div>
                <div className="task-detail">
                  <strong>Estimated Hours:</strong> {task.estimatedHours}
                </div>
                {task.assignedTo && (
                  <div className="task-detail">
                    <strong>Assigned To:</strong> {task.assignedTo.firstName} {task.assignedTo.lastName}
                  </div>
                )}
              </div>
            </div>
            {user.role === 'employee' && task.assignedTo._id === user.id && (
              <div className="task-card-footer">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusUpdate(task._id, e.target.value)}
                  className="status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
            )}
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="empty-state">
          <h3>No tasks found</h3>
          <p>
            {user.role === 'employee' 
              ? 'You have no tasks assigned yet.'
              : 'No tasks have been created yet. Create your first task to get started.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;