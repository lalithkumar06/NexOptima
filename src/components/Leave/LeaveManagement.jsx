import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { leaveAPI } from '../../services/api';
import { toast } from 'react-toastify';
import './LeaveManagement.css';

const LeaveManagement = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [newLeave, setNewLeave] = useState({
    leaveType: 'vacation',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = user.role === 'employee'
        ? await leaveAPI.getMyLeaves()
        : await leaveAPI.getPendingLeaves();
      setLeaves(response.data);
    } catch (error) {
      toast.error('Failed to fetch leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      await leaveAPI.apply(newLeave);
      toast.success('Leave application submitted successfully');
      setShowApplyForm(false);
      setNewLeave({
        leaveType: 'vacation',
        startDate: '',
        endDate: '',
        reason: ''
      });
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to apply for leave');
    }
  };

  const handleLeaveAction = async (leaveId, status, rejectionReason = '') => {
    try {
      await leaveAPI.updateStatus(leaveId, status, rejectionReason);
      toast.success(`Leave ${status} successfully`);
      fetchLeaves();
    } catch (error) {
      toast.error(`Failed to ${status} leave`);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'pending': 'badge-warning',
      'approved': 'badge-success',
      'rejected': 'badge-danger'
    };
    return `badge ${statusClasses[status] || 'badge-secondary'}`;
  };

  const getLeaveTypeColor = (type) => {
    const colors = {
      'sick': '#ef4444',
      'vacation': '#10b981',
      'personal': '#6366f1',
      'emergency': '#f59e0b',
      'maternity': '#ec4899',
      'paternity': '#8b5cf6'
    };
    return colors[type] || '#6b7280';
  };

  if (loading) {
    return <div className="loading">Loading leaves...</div>;
  }

  return (
    <div className="leave-management">
      <div className="leave-header">
        <h1>{user.role === 'employee' ? 'My Leaves' : 'Leave Management'}</h1>
        {user.role === 'employee' && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowApplyForm(true)}
          >
            Apply for Leave
          </button>
        )}
      </div>

      {showApplyForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Apply for Leave</h2>
              <button 
                className="close-btn"
                onClick={() => setShowApplyForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleApplyLeave} className="modal-body">
              <div className="form-group">
                <label>Leave Type</label>
                <select
                  value={newLeave.leaveType}
                  onChange={(e) => setNewLeave({...newLeave, leaveType: e.target.value})}
                  required
                >
                  <option value="vacation">Vacation</option>
                  <option value="sick">Sick Leave</option>
                  <option value="personal">Personal</option>
                  <option value="emergency">Emergency</option>
                  <option value="maternity">Maternity</option>
                  <option value="paternity">Paternity</option>
                </select>
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={newLeave.startDate}
                  onChange={(e) => setNewLeave({...newLeave, startDate: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={newLeave.endDate}
                  onChange={(e) => setNewLeave({...newLeave, endDate: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Reason</label>
                <textarea
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})}
                  placeholder="Please provide a reason for your leave..."
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowApplyForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="leaves-grid">
        {leaves.map(leave => (
          <div key={leave._id} className="leave-card">
            <div className="leave-card-header">
              <div className="leave-type" style={{ backgroundColor: getLeaveTypeColor(leave.leaveType) }}>
                {leave.leaveType}
              </div>
              <span className={getStatusBadge(leave.status)}>
                {leave.status}
              </span>
            </div>
            <div className="leave-card-body">
              <div className="leave-dates">
                <div className="date-item">
                  <strong>From:</strong> {new Date(leave.startDate).toLocaleDateString()}
                </div>
                <div className="date-item">
                  <strong>To:</strong> {new Date(leave.endDate).toLocaleDateString()}
                </div>
                <div className="date-item">
                  <strong>Duration:</strong> {leave.totalDays} day(s)
                </div>
              </div>
              <div className="leave-reason">
                <strong>Reason:</strong>
                <p>{leave.reason}</p>
              </div>
              {user.role !== 'employee' && (
                <div className="leave-employee">
                  <strong>Employee:</strong> {leave.user.firstName} {leave.user.lastName} ({leave.user.employeeId})
                </div>
              )}
              {leave.rejectionReason && (
                <div className="rejection-reason">
                  <strong>Rejection Reason:</strong>
                  <p>{leave.rejectionReason}</p>
                </div>
              )}
            </div>
            {(user.role === 'admin' || user.role === 'hr') && leave.status === 'pending' && (
              <div className="leave-card-footer">
                <button 
                  className="btn btn-success"
                  onClick={() => handleLeaveAction(leave._id, 'approved')}
                >
                  Approve
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => {
                    const reason = prompt('Please provide a reason for rejection:');
                    if (reason) {
                      handleLeaveAction(leave._id, 'rejected', reason);
                    }
                  }}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {leaves.length === 0 && (
        <div className="empty-state">
          <h3>No leave applications found</h3>
          <p>
            {user.role === 'employee' 
              ? 'You haven\'t applied for any leaves yet.'
              : 'No pending leave applications to review.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;