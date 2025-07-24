import mongoose from 'mongoose';

const workLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  tasksCompleted: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    hoursWorked: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }],
  blockers: {
    type: String
  },
  achievements: {
    type: String
  },
  tomorrowsPlan: {
    type: String
  },
  totalHours: {
    type: Number,
    required: true
  },
  productivity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Ensure one work log per user per day
workLogSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model('WorkLog', workLogSchema);