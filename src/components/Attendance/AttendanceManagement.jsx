import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { attendanceAPI } from '../../services/api';
import { toast } from 'react-toastify';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './AttendanceManagement.css';

const AttendanceManagement = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todayAttendance, setTodayAttendance] = useState(null);

  useEffect(() => {
    fetchAttendance();
    checkTodayAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    try {
      const month = selectedDate.getMonth() + 1;
      const year = selectedDate.getFullYear();
      
      const response = user.role === 'employee'
        ? await attendanceAPI.getMyAttendance(month, year)
        : await attendanceAPI.getTeamAttendance(selectedDate.toISOString().split('T')[0]);
      
      setAttendance(response.data);
    } catch (error) {
      toast.error('Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const checkTodayAttendance = async () => {
    if (user.role === 'employee') {
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = attendance.find(record => 
        new Date(record.date).toISOString().split('T')[0] === today
      );
      setTodayAttendance(todayRecord);
    }
  };

  const handleCheckIn = async () => {
    try {
      await attendanceAPI.checkIn();
      toast.success('Checked in successfully');
      fetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceAPI.checkOut();
      toast.success('Checked out successfully');
      fetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check out');
    }
  };

  const getTileContent = ({ date, view }) => {
    if (view === 'month' && user.role === 'employee') {
      const dateStr = date.toISOString().split('T')[0];
      const record = attendance.find(att => 
        new Date(att.date).toISOString().split('T')[0] === dateStr
      );
      
      if (record) {
        return (
          <div className={`attendance-indicator ${record.status}`}>
            {record.status === 'present' ? '✓' : record.status === 'late' ? '⚠' : '✗'}
          </div>
        );
      }
    }
    return null;
  };

  if (loading) {
    return <div className="loading">Loading attendance...</div>;
  }

  return (
    <div className="attendance-management">
      <div className="attendance-header">
        <h1>{user.role === 'employee' ? 'My Attendance' : 'Team Attendance'}</h1>
        
        {user.role === 'employee' && (
          <div className="attendance-actions">
            {!todayAttendance ? (
              <button className="btn btn-success" onClick={handleCheckIn}>
                Check In
              </button>
            ) : !todayAttendance.checkOut ? (
              <button className="btn btn-warning" onClick={handleCheckOut}>
                Check Out
              </button>
            ) : (
              <div className="attendance-status">
                <span className="badge badge-success">Completed for today</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="attendance-content">
        {user.role === 'employee' ? (
          <div className="employee-attendance">
            <div className="attendance-calendar">
              <h2>Attendance Calendar</h2>
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileContent={getTileContent}
                className="custom-calendar"
              />
              <div className="calendar-legend">
                <div className="legend-item">
                  <span className="legend-indicator present">✓</span>
                  <span>Present</span>
                </div>
                <div className="legend-item">
                  <span className="legend-indicator late">⚠</span>
                  <span>Late</span>
                </div>
                <div className="legend-item">
                  <span className="legend-indicator absent">✗</span>
                  <span>Absent</span>
                </div>
              </div>
            </div>

            <div className="attendance-summary">
              <h2>Monthly Summary</h2>
              <div className="summary-cards">
                <div className="summary-card">
                  <h3>Total Days</h3>
                  <p>{attendance.length}</p>
                </div>
                <div className="summary-card">
                  <h3>Present</h3>
                  <p>{attendance.filter(a => a.status === 'present').length}</p>
                </div>
                <div className="summary-card">
                  <h3>Late</h3>
                  <p>{attendance.filter(a => a.status === 'late').length}</p>
                </div>
                <div className="summary-card">
                  <h3>Total Hours</h3>
                  <p>{attendance.reduce((sum, a) => sum + (a.workingHours || 0), 0).toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="team-attendance">
            <div className="date-selector">
              <label>Select Date:</label>
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
              />
            </div>

            <div className="attendance-table">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>Department</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Working Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map(record => (
                    <tr key={record._id}>
                      <td>{record.user.firstName} {record.user.lastName}</td>
                      <td>{record.user.employeeId}</td>
                      <td>{record.user.department}</td>
                      <td>{new Date(record.checkIn).toLocaleTimeString()}</td>
                      <td>{record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}</td>
                      <td>{record.workingHours ? record.workingHours.toFixed(1) : '-'}</td>
                      <td>
                        <span className={`badge badge-${record.status === 'present' ? 'success' : record.status === 'late' ? 'warning' : 'danger'}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceManagement;