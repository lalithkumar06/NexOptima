import express from 'express';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import WorkLog from '../models/WorkLog.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';

const router = express.Router();

// Get dashboard stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const currentDate = new Date();
    const startOfCurrentMonth = startOfMonth(currentDate);
    const endOfCurrentMonth = endOfMonth(currentDate);

    let stats = {};

    if (userRole === 'employee') {
      // Employee dashboard stats
      const myTasks = await Task.find({ assignedTo: userId });
      const myAttendance = await Attendance.find({
        user: userId,
        date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth }
      });
      const myLeaves = await Leave.find({
        user: userId,
        status: { $in: ['approved', 'pending'] }
      });

      stats = {
        totalTasks: myTasks.length,
        completedTasks: myTasks.filter(task => task.status === 'completed').length,
        pendingTasks: myTasks.filter(task => task.status === 'pending').length,
        inProgressTasks: myTasks.filter(task => task.status === 'in-progress').length,
        attendanceDays: myAttendance.length,
        totalLeaves: myLeaves.length,
        pendingLeaves: myLeaves.filter(leave => leave.status === 'pending').length
      };
    } else {
      // Admin/HR dashboard stats
      const totalUsers = await User.countDocuments({ isActive: true });
      const totalTasks = await Task.countDocuments();
      const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
      const todayAttendance = await Attendance.countDocuments({
        date: { $gte: new Date().setHours(0, 0, 0, 0) }
      });

      stats = {
        totalEmployees: totalUsers,
        totalTasks: totalTasks,
        pendingLeaves: pendingLeaves,
        todayAttendance: todayAttendance,
        completedTasks: await Task.countDocuments({ status: 'completed' }),
        inProgressTasks: await Task.countDocuments({ status: 'in-progress' })
      };
    }

    res.json(stats);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get productivity analytics
router.get('/analytics', authenticate, authorize('admin', 'hr'), async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfCurrentMonth = startOfMonth(currentDate);
    const endOfCurrentMonth = endOfMonth(currentDate);

    // Task completion rates
    const taskStats = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Attendance trends
    const attendanceStats = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Department wise task distribution
    const departmentStats = await Task.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $group: {
          _id: '$employee.department',
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      taskStats,
      attendanceStats,
      departmentStats
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;