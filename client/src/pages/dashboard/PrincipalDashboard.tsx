import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  LinearProgress,
  IconButton,
  Divider,
  useTheme,
  Alert,
} from '@mui/material';
import {
  School,
  People,
  TrendingUp,
  Payment,
  Notifications,
  MoreVert,
  Add,
  Analytics,
  Campaign,
  Assignment,
  Grade,
  CheckCircle,
  Warning,
  Event,
  Class,
} from '@mui/icons-material';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchSchoolById } from '../../store/slices/schoolSlice';
import { fetchStudentsBySchool } from '../../store/slices/studentSlice';
import { fetchTeachersBySchool } from '../../store/slices/teacherSlice';

const PrincipalDashboard: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentSchool } = useAppSelector((state) => state.schools);
  const { students } = useAppSelector((state) => state.students);
  const { teachers } = useAppSelector((state) => state.teachers);

  const [schoolStats, setSchoolStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    attendanceRate: 0,
    feeCollection: 0,
    pendingApprovals: 0,
  });

  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      title: 'New Teacher Application',
      subtitle: 'John Smith - Mathematics Teacher',
      time: '2 hours ago',
      type: 'application',
      priority: 'high',
    },
    {
      id: 2,
      title: 'Fee Payment Received',
      subtitle: 'Grade 10A - 15 students paid',
      time: '4 hours ago',
      type: 'payment',
      priority: 'success',
    },
    {
      id: 3,
      title: 'Low Attendance Alert',
      subtitle: 'Grade 8B - 65% attendance today',
      time: '6 hours ago',
      type: 'attendance',
      priority: 'warning',
    },
    {
      id: 4,
      title: 'Parent Meeting Request',
      subtitle: 'Mrs. Johnson - Sarah\'s performance',
      time: '1 day ago',
      type: 'meeting',
      priority: 'medium',
    },
  ]);

  const [upcomingEvents, setUpcomingEvents] = useState([
    {
      id: 1,
      title: 'Staff Meeting',
      date: 'Today, 4:00 PM',
      type: 'meeting',
      attendees: 25,
    },
    {
      id: 2,
      title: 'Parent-Teacher Conference',
      date: 'Friday, 2:00 PM',
      type: 'conference',
      attendees: 150,
    },
    {
      id: 3,
      title: 'Science Fair',
      date: 'Next Monday',
      type: 'event',
      attendees: 300,
    },
  ]);

  useEffect(() => {
    if (user?.schoolId) {
      dispatch(fetchSchoolById(user.schoolId));
      dispatch(fetchStudentsBySchool({ schoolId: user.schoolId }));
      dispatch(fetchTeachersBySchool({ schoolId: user.schoolId }));
    }
  }, [dispatch, user]);

  // Mock data for charts
  const enrollmentData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Student Enrollment',
        data: [450, 465, 480, 475, 490, 500],
        borderColor: theme.palette.primary.main,
        backgroundColor: `${theme.palette.primary.main}20`,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const gradeDistributionData = {
    labels: ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
    datasets: [
      {
        label: 'Students per Grade',
        data: [75, 80, 72, 68, 65, 70, 60],
        backgroundColor: theme.palette.secondary.main,
      },
    ],
  };

  const performanceData = {
    labels: ['Excellent', 'Good', 'Average', 'Below Average', 'Poor'],
    datasets: [
      {
        data: [25, 35, 25, 10, 5],
        backgroundColor: [
          theme.palette.success.main,
          theme.palette.info.main,
          theme.palette.warning.main,
          theme.palette.error.light,
          theme.palette.error.main,
        ],
      },
    ],
  };

  const quickActions = [
    { label: 'Add Student', icon: <Add />, color: 'primary', path: '/students/add' },
    { label: 'Hire Teacher', icon: <People />, color: 'success', path: '/teachers/add' },
    { label: 'Send Notice', icon: <Campaign />, color: 'secondary', path: '/announcements/add' },
    { label: 'View Reports', icon: <Analytics />, color: 'info', path: '/reports' },
    { label: 'Manage Fees', icon: <Payment />, color: 'warning', path: '/fees' },
    { label: 'Schedule Event', icon: <Event />, color: 'error', path: '/events/add' },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Good morning, Principal {user?.lastName}! 🏫
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Here's your school overview for {currentSchool?.name || 'your school'}.
        </Typography>
      </Box>

      {/* Important Alerts */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Alert severity="warning" icon={<Warning />}>
            <Typography variant="subtitle2">Low Attendance Alert</Typography>
            <Typography variant="body2">Grade 8B has 65% attendance today</Typography>
          </Alert>
        </Grid>
        <Grid item xs={12} md={4}>
          <Alert severity="info" icon={<Notifications />}>
            <Typography variant="subtitle2">Staff Meeting Today</Typography>
            <Typography variant="body2">4:00 PM in the conference room</Typography>
          </Alert>
        </Grid>
        <Grid item xs={12} md={4}>
          <Alert severity="success" icon={<CheckCircle />}>
            <Typography variant="subtitle2">Fee Collection Update</Typography>
            <Typography variant="body2">85% of monthly fees collected</Typography>
          </Alert>
        </Grid>
      </Grid>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <People />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {students.length || 500}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Students
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={85} 
                sx={{ height: 6, borderRadius: 3 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                +5% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <School />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {teachers.length || 35}
                  </Typography>
                  <Typography color="text.secondary">
                    Teaching Staff
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={92} 
                color="success"
                sx={{ height: 6, borderRadius: 3 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                2 new hires this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <Payment />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    85%
                  </Typography>
                  <Typography color="text.secondary">
                    Fee Collection
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={85} 
                color="warning"
                sx={{ height: 6, borderRadius: 3 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                $42,500 collected this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    92%
                  </Typography>
                  <Typography color="text.secondary">
                    Avg Attendance
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={92} 
                color="info"
                sx={{ height: 6, borderRadius: 3 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                +3% from last week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Student Enrollment Trend</Typography>
                <IconButton>
                  <MoreVert />
                </IconButton>
              </Box>
              <Box sx={{ height: 300 }}>
                <Line 
                  data={enrollmentData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Academic Performance
              </Typography>
              <Box sx={{ height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Doughnut 
                  data={performanceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions and Activities */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {quickActions.map((action, index) => (
                  <Grid item xs={6} key={index}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={action.icon}
                      sx={{
                        py: 1.5,
                        flexDirection: 'column',
                        gap: 0.5,
                        borderColor: `${action.color}.main`,
                        color: `${action.color}.main`,
                        '&:hover': {
                          backgroundColor: `${action.color}.main`,
                          color: 'white',
                        },
                      }}
                    >
                      {action.label}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              <List>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar 
                          sx={{ 
                            bgcolor: activity.priority === 'high' ? 'error.main' : 
                                     activity.priority === 'success' ? 'success.main' : 
                                     activity.priority === 'warning' ? 'warning.main' : 'info.main',
                          }}
                        >
                          {activity.type === 'application' ? <People /> : 
                           activity.type === 'payment' ? <Payment /> : 
                           activity.type === 'attendance' ? <Assignment /> : <Event />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {activity.subtitle}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Chip 
                                label={activity.time} 
                                size="small" 
                                variant="outlined"
                              />
                              <Chip 
                                label={activity.priority} 
                                size="small" 
                                color={
                                  activity.priority === 'high' ? 'error' : 
                                  activity.priority === 'success' ? 'success' : 
                                  activity.priority === 'warning' ? 'warning' : 'default'
                                }
                              />
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PrincipalDashboard;
