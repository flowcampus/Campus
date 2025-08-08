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
  Grade,
  Assignment,
  Event,
  Payment,
  Schedule,
  TrendingUp,
  CalendarToday,
  CheckCircle,
  Warning,
  Info,
  School,
  Person,
} from '@mui/icons-material';
import { Line, Doughnut } from 'react-chartjs-2';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchStudentById } from '../../store/slices/studentSlice';
import { fetchGradesByStudent } from '../../store/slices/gradeSlice';

const StudentDashboard: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentStudent } = useAppSelector((state) => state.students);
  const { grades } = useAppSelector((state) => state.grades);

  const [todaySchedule, setTodaySchedule] = useState([
    { time: '08:00 - 09:00', subject: 'Mathematics', teacher: 'Mr. Johnson', room: 'Room 201' },
    { time: '09:00 - 10:00', subject: 'English', teacher: 'Ms. Smith', room: 'Room 105' },
    { time: '11:00 - 12:00', subject: 'Physics', teacher: 'Dr. Brown', room: 'Lab 1' },
    { time: '14:00 - 15:00', subject: 'History', teacher: 'Mrs. Davis', room: 'Room 302' },
  ]);

  const [upcomingEvents, setUpcomingEvents] = useState([
    {
      id: 1,
      title: 'Mathematics Test',
      date: 'Tomorrow, 10:00 AM',
      type: 'exam',
      priority: 'high',
    },
    {
      id: 2,
      title: 'Science Fair',
      date: 'Friday, 2:00 PM',
      type: 'event',
      priority: 'medium',
    },
    {
      id: 3,
      title: 'Assignment Due',
      date: 'Monday, 11:59 PM',
      type: 'assignment',
      priority: 'high',
    },
  ]);

  const [recentGrades, setRecentGrades] = useState([
    { subject: 'Mathematics', grade: 'A', score: '95/100', date: '2 days ago' },
    { subject: 'Physics', grade: 'B+', score: '87/100', date: '1 week ago' },
    { subject: 'English', grade: 'A-', score: '92/100', date: '1 week ago' },
  ]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchStudentById(user.id));
      dispatch(fetchGradesByStudent({ studentId: user.id }));
    }
  }, [dispatch, user]);

  // Mock data for charts
  const performanceData = {
    labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
    datasets: [
      {
        label: 'Average Grade (%)',
        data: [85, 88, 92, 89, 94, 91],
        borderColor: theme.palette.primary.main,
        backgroundColor: `${theme.palette.primary.main}20`,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const subjectPerformanceData = {
    labels: ['Mathematics', 'Physics', 'English', 'History', 'Chemistry'],
    datasets: [
      {
        data: [95, 87, 92, 78, 89],
        backgroundColor: [
          theme.palette.success.main,
          theme.palette.info.main,
          theme.palette.primary.main,
          theme.palette.warning.main,
          theme.palette.secondary.main,
        ],
      },
    ],
  };

  const attendanceRate = 92;
  const gpa = 3.7;
  const pendingAssignments = 3;
  const upcomingExams = 2;

  const quickActions = [
    { label: 'View Grades', icon: <Grade />, color: 'primary', path: '/grades' },
    { label: 'Assignments', icon: <Assignment />, color: 'secondary', path: '/assignments' },
    { label: 'Schedule', icon: <Schedule />, color: 'info', path: '/schedule' },
    { label: 'Fees', icon: <Payment />, color: 'warning', path: '/fees' },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.firstName}! 🎓
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          You have {pendingAssignments} pending assignments and {upcomingExams} upcoming exams.
        </Typography>
      </Box>

      {/* Important Alerts */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Alert severity="warning" icon={<Warning />}>
            <Typography variant="subtitle2">Mathematics Test Tomorrow</Typography>
            <Typography variant="body2">Don't forget your calculator and formula sheet!</Typography>
          </Alert>
        </Grid>
        <Grid item xs={12} md={6}>
          <Alert severity="info" icon={<Info />}>
            <Typography variant="subtitle2">Assignment Due Monday</Typography>
            <Typography variant="body2">History essay on World War II - 1500 words</Typography>
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
                  <Grade />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {gpa}
                  </Typography>
                  <Typography color="text.secondary">
                    Current GPA
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(gpa / 4) * 100} 
                sx={{ height: 6, borderRadius: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {attendanceRate}%
                  </Typography>
                  <Typography color="text.secondary">
                    Attendance
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={attendanceRate} 
                color="success"
                sx={{ height: 6, borderRadius: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <Assignment />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {pendingAssignments}
                  </Typography>
                  <Typography color="text.secondary">
                    Pending Tasks
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                  <Event />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {upcomingExams}
                  </Typography>
                  <Typography color="text.secondary">
                    Upcoming Exams
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Today's Schedule */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Today's Classes</Typography>
                <IconButton>
                  <CalendarToday />
                </IconButton>
              </Box>
              <List>
                {todaySchedule.map((item, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <School />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2">{item.subject}</Typography>
                            <Chip label={item.time} size="small" variant="outlined" />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {item.teacher} • {item.room}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < todaySchedule.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Events & Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
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

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Upcoming Events
              </Typography>
              <List>
                {upcomingEvents.map((event) => (
                  <ListItem key={event.id} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: event.priority === 'high' ? 'error.main' : 'info.main',
                          width: 32,
                          height: 32,
                        }}
                      >
                        <Event />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={event.title}
                      secondary={event.date}
                    />
                    <Chip 
                      label={event.priority} 
                      size="small" 
                      color={event.priority === 'high' ? 'error' : 'default'}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts and Recent Grades */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Academic Performance Trend
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line 
                  data={performanceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Grades
              </Typography>
              <List>
                {recentGrades.map((grade, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: grade.grade.startsWith('A') ? 'success.main' : 
                                   grade.grade.startsWith('B') ? 'info.main' : 'warning.main',
                          width: 32,
                          height: 32,
                        }}
                      >
                        <Grade />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">{grade.subject}</Typography>
                          <Chip label={grade.grade} size="small" />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2">{grade.score}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {grade.date}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;
