import express from 'express';
import WorkLog from '../models/WorkLog.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { startOfDay, endOfDay } from 'date-fns';

const router = express.Router();

// Submit work log
router.post('/', authenticate, async (req, res) => {
  try {
    const { date, tasksCompleted, blockers, achievements, tomorrowsPlan, totalHours, productivity } = req.body;
    
    const logDate = new Date(date);
    const startOfLogDate = startOfDay(logDate);
    
    const existingLog = await WorkLog.findOne({
      user: req.user.id,
      date: {
        $gte: startOfLogDate,
        $lte: endOfDay(logDate)
      }
    });

    if (existingLog) {
      return res.status(400).json({ message: 'Work log already submitted for this date' });
    }

    const workLog = await WorkLog.create({
      user: req.user.id,
      date: startOfLogDate,
      tasksCompleted,
      blockers,
      achievements,
      tomorrowsPlan,
      totalHours,
      productivity
    });

    res.status(201).json(workLog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user work logs
router.get('/my-logs', authenticate, async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const workLogs = await WorkLog.find({
      user: req.user.id,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate('tasksCompleted.task', 'title project')
      .sort({ date: -1 });

    res.json(workLogs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get team work logs (Admin/HR)
router.get('/team', authenticate, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { date, userId } = req.query;
    
    let query = {};
    
    if (date) {
      const targetDate = new Date(date);
      query.date = {
        $gte: startOfDay(targetDate),
        $lte: endOfDay(targetDate)
      };
    }
    
    if (userId) {
      query.user = userId;
    }

    const workLogs = await WorkLog.find(query)
      .populate('user', 'firstName lastName employeeId department')
      .populate('tasksCompleted.task', 'title project')
      .sort({ date: -1 });

    res.json(workLogs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;