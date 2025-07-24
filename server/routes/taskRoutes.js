import express from 'express';
import Task from '../models/Task.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Create task (Admin/HR)
router.post('/', authenticate, authorize('admin', 'hr'), async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      assignedBy: req.user.id
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'firstName lastName employeeId')
      .populate('assignedBy', 'firstName lastName');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user tasks
router.get('/my-tasks', authenticate, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id })
      .populate('assignedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all tasks (Admin/HR)
router.get('/', authenticate, authorize('admin', 'hr'), async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'firstName lastName employeeId department')
      .populate('assignedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update task status
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { status, actualHours } = req.body;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only assigned user can update status
    if (task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    task.status = status;
    if (actualHours) task.actualHours = actualHours;
    if (status === 'completed') task.completedAt = new Date();

    await task.save();
    
    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'firstName lastName')
      .populate('assignedBy', 'firstName lastName');

    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Inspect task (Admin/HR)
router.put('/:id/inspect', authenticate, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { inspectionStatus, inspectionNotes } = req.body;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.inspectionStatus = inspectionStatus;
    task.inspectedBy = req.user.id;
    task.inspectionNotes = inspectionNotes;

    await task.save();
    
    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'firstName lastName')
      .populate('inspectedBy', 'firstName lastName');

    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;