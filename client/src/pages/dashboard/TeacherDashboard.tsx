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
} from '@mui/material';
import {
  Class,
  Assignment,
  Grade,
  People,
  Schedule,
  TrendingUp,
  Add,
  Edit,
  Visibility,
  CalendarToday,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { Line, Bar } from 'react-chartjs-2';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchTeacherById } from '../../store/slices/teacherSlice';
import { fetchClassesBySchool } from '../../store/slices/classSlice';

const TeacherDashboard: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentTeacher } = useAppSelector((state) => state.teachers);
  const { classes } = useAppSelector((state) => state.classes);

  const [todaySchedule, setTodaySchedule] = useState([
    { time: '08:00 - 09:00', subject: 'Mathematics', class: 'Grade 10A', room: 'Room 201' },
    { time: '09:00 - 10:00', subject: 'Physics', class: 'Grade 11B', room: 'Lab 1' },
    { time: '11:00 - 12:00', subject: 'Mathematics', class: 'Grade 9C', room: 'Room 203' },
    { time: '14:00 - 15:00', subject: 'Physics', class: 'Grade 12A', room: 'Lab 2' },
  ]);

  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      title: 'Attendance marked',
      subtitle: 'Grade 10A - Mathematics',
      time: '30 minutes ago',
      type: 'attendance',
      status: 'completed',
    },
    {
      id: 2,
      title: 'Grades submitted',
      subtitle: 'Grade 11B - Physics Quiz',
      time: '2 hours ago',
      type: 'grades',
      status: 'completed',
    },
    {
      id: 3,
      title: 'Assignment created',
      subtitle: 'Grade 9C - Algebra Problems',
      time: '1 day ago',
      type: 'assignment',
      status: 'pending',
    },
  ]);

  useEffect(() => {
    if (user?.id) {
      // Fetch teacher details and classes
      dispatch(fetchTeacherById(user.id));
      if (user.schoolId) {
        dispatch(fetchClassesBySchool({ schoolId: user.schoolId }));
      }
    }
  }, [dispatch, user]);

  // Mock data for charts
  const attendanceData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      {
        label: 'Attendance Rate (%)',
        data: [95, 88, 92, 85, 90],
        backgroundColor: theme.palette.success.main,
        borderColor: theme.palette.success.main,
        borderWidth: 2,
      },
    ],
  };

  const gradeDistributionData = {
    labels: ['A', 'B', 'C', 'D', 'F'],
    datasets: [
      {
        label: 'Grade Distribution',
        data: [12, 25, 18, 8, 3],
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
    { label: 'Mark Attendance', icon: <Assignment />, color: 'primary', path: '/attendance' },
    { label: 'Enter Grades', icon: <Grade />, color: 'success', path: '/grades' },
    { label: 'Create Assignment', icon: <Add />, color: 'secondary', path: '/assignments' },
    { label: 'View Students', icon: <People />, color: 'info', path: '/students' },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Good morning, {user?.firstName}! 📚
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          You have {todaySchedule.length} classes scheduled for today.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <Class />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {classes.length}
                  </Typography>
                  <Typography color="text.secondary">
                    My Classes
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
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <People />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    156
                  </Typography>
                  <Typography color="text.secondary">
                    Total Students
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
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <Assignment />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    12
                  </Typography>
                  <Typography color="text.secondary">
                    Pending Grades
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
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    89%
                  </Typography>
                  <Typography color="text.secondary">
                    Avg Attendance
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
                <Typography variant="h6">Today's Schedule</Typography>
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
                          <Schedule />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2">{item.subject}</Typography>
                            <Chip label={item.class} size="small" variant="outlined" />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {item.time} • {item.room}
                            </Typography>
                          </Box>
                        }
                      />
                      <Button size="small" startIcon={<Assignment />}>
                        Mark Attendance
                      </Button>
                    </ListItem>
                    {index < todaySchedule.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
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
                        py: 2,
                        flexDirection: 'column',
                        gap: 1,
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

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              <List>
                {recentActivities.map((activity, index) => (
                  <ListItem key={activity.id} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: activity.status === 'completed' ? 'success.main' : 'warning.main',
                          width: 32,
                          height: 32,
                        }}
                      >
                        {activity.status === 'completed' ? <CheckCircle /> : <Warning />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {activity.subtitle}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {activity.time}
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

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weekly Attendance Rate
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar 
                  data={attendanceData}
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

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Grade Distribution (Latest Test)
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar 
                  data={gradeDistributionData}
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
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeacherDashboard;
