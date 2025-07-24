import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import WorkLog from '../models/WorkLog.js';
import connectDB from '../config/database.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    await WorkLog.deleteMany({});

    console.log('Cleared existing data');

    // Create Admin User
    const admin = await User.create({
      firstName: 'John',
      lastName: 'Admin',
      email: 'admin@nexoptima.com',
      password: 'admin123',
      role: 'admin',
      employeeId: 'EMP001',
      department: 'Administration',
      position: 'System Administrator'
    });

    // Create HR Manager
    const hrManager = await User.create({
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'hr@nexoptima.com',
      password: 'hr1234',
      role: 'hr',
      employeeId: 'EMP002',
      department: 'Human Resources',
      position: 'HR Manager'
    });

    // Create Employees
    const employees = await User.create([
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike@nexoptima.com',
        password: 'employee123',
        role: 'employee',
        employeeId: 'EMP003',
        department: 'Development',
        position: 'Frontend Developer',
        manager: hrManager._id
      },
      {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily@nexoptima.com',
        password: 'employee123',
        role: 'employee',
        employeeId: 'EMP004',
        department: 'Development',
        position: 'Backend Developer',
        manager: hrManager._id
      },
      {
        firstName: 'David',
        lastName: 'Brown',
        email: 'david@nexoptima.com',
        password: 'employee123',
        role: 'employee',
        employeeId: 'EMP005',
        department: 'Design',
        position: 'UI/UX Designer',
        manager: hrManager._id
      },
      {
        firstName: 'Lisa',
        lastName: 'Garcia',
        email: 'lisa@nexoptima.com',
        password: 'employee123',
        role: 'employee',
        employeeId: 'EMP006',
        department: 'Marketing',
        position: 'Marketing Specialist',
        manager: hrManager._id
      }
    ]);

    console.log('Created users');

    // Create Sample Tasks
    const tasks = await Task.create([
      {
        title: 'Implement User Authentication',
        description: 'Create JWT-based authentication system with role-based access control',
        assignedTo: employees[0]._id,
        assignedBy: hrManager._id,
        project: 'NexOptima EMS',
        priority: 'high',
        status: 'in-progress',
        startDate: new Date('2024-01-15'),
        dueDate: new Date('2024-01-25'),
        estimatedHours: 40
      },
      {
        title: 'Design Dashboard UI',
        description: 'Create responsive dashboard designs for different user roles',
        assignedTo: employees[2]._id,
        assignedBy: hrManager._id,
        project: 'NexOptima EMS',
        priority: 'medium',
        status: 'completed',
        startDate: new Date('2024-01-10'),
        dueDate: new Date('2024-01-20'),
        estimatedHours: 30,
        actualHours: 28,
        completedAt: new Date('2024-01-19')
      },
      {
        title: 'Database Schema Design',
        description: 'Design and implement MongoDB schemas for all entities',
        assignedTo: employees[1]._id,
        assignedBy: admin._id,
        project: 'NexOptima EMS',
        priority: 'high',
        status: 'completed',
        startDate: new Date('2024-01-08'),
        dueDate: new Date('2024-01-18'),
        estimatedHours: 35,
        actualHours: 32,
        completedAt: new Date('2024-01-17')
      },
      {
        title: 'Marketing Campaign Analysis',
        description: 'Analyze current marketing campaigns and prepare performance report',
        assignedTo: employees[3]._id,
        assignedBy: hrManager._id,
        project: 'Q1 Marketing Review',
        priority: 'medium',
        status: 'pending',
        startDate: new Date('2024-01-20'),
        dueDate: new Date('2024-01-30'),
        estimatedHours: 25
      }
    ]);

    console.log('Created tasks');

    // Create Sample Attendance Records
    const attendanceRecords = [];
    const today = new Date();
    
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      for (const employee of employees) {
        if (Math.random() > 0.1) { // 90% attendance rate
          const checkInTime = new Date(date);
          checkInTime.setHours(9 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
          
          const checkOutTime = new Date(checkInTime);
          checkOutTime.setHours(checkInTime.getHours() + 8 + Math.floor(Math.random() * 2));
          
          attendanceRecords.push({
            user: employee._id,
            date: new Date(date.setHours(0, 0, 0, 0)),
            checkIn: checkInTime,
            checkOut: checkOutTime,
            status: 'present',
            workingHours: (checkOutTime - checkInTime) / (1000 * 60 * 60)
          });
        }
      }
    }

    await Attendance.create(attendanceRecords);
    console.log('Created attendance records');

    // Create Sample Leave Applications
    await Leave.create([
      {
        user: employees[0]._id,
        leaveType: 'vacation',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-03'),
        totalDays: 3,
        reason: 'Family vacation',
        status: 'approved',
        approvedBy: hrManager._id,
        approvedAt: new Date()
      },
      {
        user: employees[1]._id,
        leaveType: 'sick',
        startDate: new Date('2024-01-28'),
        endDate: new Date('2024-01-29'),
        totalDays: 2,
        reason: 'Flu symptoms',
        status: 'pending'
      }
    ]);

    console.log('Created leave applications');

    // Create Sample Work Logs
    const workLogs = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      for (const employee of employees.slice(0, 2)) {
        workLogs.push({
          user: employee._id,
          date: new Date(date.setHours(0, 0, 0, 0)),
          tasksCompleted: [{
            task: tasks[0]._id,
            hoursWorked: 6 + Math.floor(Math.random() * 3),
            description: 'Worked on authentication module implementation'
          }],
          blockers: 'None',
          achievements: 'Completed user registration flow',
          tomorrowsPlan: 'Work on login functionality',
          totalHours: 8,
          productivity: 'high'
        });
      }
    }

    await WorkLog.create(workLogs);
    console.log('Created work logs');

    console.log('\n=== SEED DATA CREATED SUCCESSFULLY ===');
    console.log('\nLogin Credentials:');
    console.log('Admin: admin@nexoptima.com / admin123');
    console.log('HR Manager: hr@nexoptima.com / hr123');
    console.log('Employee 1: mike@nexoptima.com / employee123');
    console.log('Employee 2: emily@nexoptima.com / employee123');
    console.log('Employee 3: david@nexoptima.com / employee123');
    console.log('Employee 4: lisa@nexoptima.com / employee123');
    console.log('\n=====================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();