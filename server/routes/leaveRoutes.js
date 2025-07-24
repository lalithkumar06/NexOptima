import express from 'express';
import Leave from '../models/Leave.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply for leave
router.post('/', authenticate, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const leave = await Leave.create({
      user: req.user.id,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays,
      reason
    });

    res.status(201).json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user leaves
router.get('/my-leaves', authenticate, async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user.id })
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(leaves);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get pending leaves (HR/Admin)
router.get('/pending', authenticate, authorize('admin', 'hr'), async (req, res) => {
  try {
    const leaves = await Leave.find({ status: 'pending' })
      .populate('user', 'firstName lastName employeeId department')
      .sort({ createdAt: -1 });
    
    res.json(leaves);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Approve/Reject leave
router.put('/:id/status', authenticate, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    leave.status = status;
    leave.approvedBy = req.user.id;
    leave.approvedAt = new Date();
    
    if (status === 'rejected' && rejectionReason) {
      leave.rejectionReason = rejectionReason;
    }

    await leave.save();
    
    const updatedLeave = await Leave.findById(leave._id)
      .populate('user', 'firstName lastName employeeId')
      .populate('approvedBy', 'firstName lastName');

    res.json(updatedLeave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;