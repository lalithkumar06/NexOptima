import express from 'express';
import Attendance from '../models/Attendance.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { startOfDay, endOfDay } from 'date-fns';

const router = express.Router();

// Mark attendance
router.post('/checkin', authenticate, async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = startOfDay(today);
    
    const existingAttendance = await Attendance.findOne({
      user: req.user.id,
      date: {
        $gte: startOfToday,
        $lte: endOfDay(today)
      }
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const attendance = await Attendance.create({
      user: req.user.id,
      date: startOfToday,
      checkIn: today,
      status: 'present'
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Check out
router.post('/checkout', authenticate, async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = startOfDay(today);
    
    const attendance = await Attendance.findOne({
      user: req.user.id,
      date: {
        $gte: startOfToday,
        $lte: endOfDay(today)
      }
    });

    if (!attendance) {
      return res.status(400).json({ message: 'No check-in found for today' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    const workingHours = (today - attendance.checkIn) / (1000 * 60 * 60);
    
    attendance.checkOut = today;
    attendance.workingHours = workingHours;
    await attendance.save();

    res.json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user attendance
router.get('/my-attendance', authenticate, async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendance = await Attendance.find({
      user: req.user.id,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });

    res.json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get team attendance (HR/Admin)
router.get('/team', authenticate, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const startOfTargetDate = startOfDay(targetDate);
    const endOfTargetDate = endOfDay(targetDate);

    const attendance = await Attendance.find({
      date: {
        $gte: startOfTargetDate,
        $lte: endOfTargetDate
      }
    }).populate('user', 'firstName lastName employeeId department');

    res.json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;