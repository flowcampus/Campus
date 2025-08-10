import express from 'express';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// Student Dashboard
router.get('/student', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const schoolId = req.user?.schoolId;

    // Mock student dashboard data
    const dashboardData = {
      user: req.user,
      stats: {
        totalClasses: 8,
        todayClasses: 3,
        pendingAssignments: 5,
        upcomingExams: 2,
      },
      recentClasses: [
        { id: 1, name: 'Mathematics', time: '09:00 AM', teacher: 'Mr. Johnson' },
        { id: 2, name: 'English', time: '11:00 AM', teacher: 'Mrs. Smith' },
        { id: 3, name: 'Science', time: '02:00 PM', teacher: 'Dr. Brown' },
      ],
      assignments: [
        { id: 1, subject: 'Mathematics', title: 'Algebra Problems', dueDate: '2024-01-15', status: 'pending' },
        { id: 2, subject: 'English', title: 'Essay Writing', dueDate: '2024-01-18', status: 'submitted' },
      ],
      announcements: [
        { id: 1, title: 'School Sports Day', date: '2024-01-20', type: 'event' },
        { id: 2, title: 'Parent-Teacher Meeting', date: '2024-01-25', type: 'meeting' },
      ],
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({ error: 'Failed to load student dashboard' });
  }
});

// Parent Dashboard
router.get('/parent', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // Mock parent dashboard data
    const dashboardData = {
      user: req.user,
      children: [
        {
          id: 1,
          name: 'John Doe',
          class: 'Grade 5A',
          school: 'Campus Demo School',
          attendance: 95,
          grades: { average: 85, trend: 'up' },
        },
      ],
      stats: {
        totalChildren: 1,
        schoolEvents: 3,
        unreadMessages: 2,
        upcomingMeetings: 1,
      },
      recentActivity: [
        { type: 'grade', message: 'John scored 90% in Mathematics test', date: '2024-01-10' },
        { type: 'attendance', message: 'John was present today', date: '2024-01-10' },
      ],
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Parent dashboard error:', error);
    res.status(500).json({ error: 'Failed to load parent dashboard' });
  }
});

// Guest Dashboard
router.get('/guest', async (req, res) => {
  try {
    // Mock guest dashboard data - no auth required
    const dashboardData = {
      demoMode: true,
      school: {
        name: 'Campus Demo School',
        location: 'Lagos, Nigeria',
        students: 1250,
        teachers: 85,
        classes: 45,
      },
      features: [
        { name: 'Student Management', description: 'Track student progress and attendance' },
        { name: 'Class Scheduling', description: 'Manage timetables and class assignments' },
        { name: 'Grade Management', description: 'Record and analyze student performance' },
        { name: 'Communication', description: 'Connect parents, teachers, and students' },
      ],
      sampleData: {
        students: [
          { name: 'Alice Johnson', class: 'Grade 5A', attendance: 95 },
          { name: 'Bob Smith', class: 'Grade 4B', attendance: 88 },
        ],
        classes: [
          { name: 'Mathematics', teacher: 'Mr. Wilson', students: 28 },
          { name: 'English', teacher: 'Mrs. Davis', students: 30 },
        ],
      },
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Guest dashboard error:', error);
    res.status(500).json({ error: 'Failed to load guest dashboard' });
  }
});

// School Staff Dashboard
router.get('/school', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const schoolId = req.user?.schoolId;
    const role = req.user?.schoolRole || req.user?.role;

    // Mock school dashboard data
    const dashboardData = {
      user: req.user,
      school: {
        name: 'Campus Demo School',
        code: 'CAMPUS_DEMO',
        students: 1250,
        teachers: 85,
        classes: 45,
      },
      stats: {
        totalStudents: 1250,
        totalTeachers: 85,
        totalClasses: 45,
        attendanceToday: 92,
      },
      recentActivity: [
        { type: 'enrollment', message: 'New student enrolled: Sarah Wilson', date: '2024-01-10' },
        { type: 'grade', message: 'Grade reports submitted for Grade 5', date: '2024-01-09' },
      ],
      quickActions: [
        { name: 'Add Student', icon: 'person_add', path: '/students/add' },
        { name: 'Create Class', icon: 'class', path: '/classes/add' },
        { name: 'Send Announcement', icon: 'announcement', path: '/announcements/add' },
      ],
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('School dashboard error:', error);
    res.status(500).json({ error: 'Failed to load school dashboard' });
  }
});

// Admin Dashboard
router.get('/admin', requireAuth, async (req, res) => {
  try {
    const adminRole = req.user?.adminRole;
    
    if (!adminRole) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Mock admin dashboard data
    const dashboardData = {
      user: req.user,
      adminRole,
      stats: {
        totalSchools: 150,
        totalStudents: 45000,
        totalTeachers: 3200,
        activeSubscriptions: 142,
      },
      recentActivity: [
        { type: 'school', message: 'New school registered: Excellence Academy', date: '2024-01-10' },
        { type: 'subscription', message: 'Premium subscription activated for Royal High', date: '2024-01-09' },
      ],
      systemHealth: {
        status: 'healthy',
        uptime: '99.9%',
        responseTime: '120ms',
      },
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to load admin dashboard' });
  }
});

export default router;
