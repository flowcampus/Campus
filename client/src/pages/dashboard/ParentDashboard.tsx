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
  Tab,
  Tabs,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Grade,
  Assignment,
  Event,
  Payment,
  Person,
  TrendingUp,
  CalendarToday,
  CheckCircle,
  Warning,
  Info,
  School,
  Message,
  AttachMoney,
} from '@mui/icons-material';
import { Line, Bar } from 'react-chartjs-2';
import { useAppSelector, useAppDispatch } from '../../store/hooks';

interface Child {
  id: string;
  name: string;
  class: string;
  grade: string;
  attendance: number;
  gpa: number;
  avatar?: string;
}

const ParentDashboard: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [selectedChild, setSelectedChild] = useState(0);
  const [children, setChildren] = useState<Child[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      class: 'Grade 10A',
      grade: 'A-',
      attendance: 95,
      gpa: 3.7,
      avatar: '',
    },
    {
      id: '2',
      name: 'Michael Johnson',
      class: 'Grade 8B',
      grade: 'B+',
      attendance: 88,
      gpa: 3.3,
      avatar: '',
    },
  ]);

  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      childName: 'Sarah',
      title: 'Grade Updated',
      subtitle: 'Mathematics Test - A (95/100)',
      time: '2 hours ago',
      type: 'grade',
      priority: 'success',
    },
    {
      id: 2,
      childName: 'Michael',
      title: 'Attendance Alert',
      subtitle: 'Absent from Physics class',
      time: '1 day ago',
      type: 'attendance',
      priority: 'warning',
    },
    {
      id: 3,
      childName: 'Sarah',
      title: 'Fee Payment Due',
      subtitle: 'Monthly tuition fee - $500',
      time: '2 days ago',
      type: 'payment',
      priority: 'error',
    },
  ]);

  const [upcomingEvents, setUpcomingEvents] = useState([
    {
      id: 1,
      title: 'Parent-Teacher Meeting',
      date: 'Friday, 3:00 PM',
      child: 'Sarah',
      type: 'meeting',
    },
    {
      id: 2,
      title: 'Science Fair',
      date: 'Next Monday, 2:00 PM',
      child: 'Both',
      type: 'event',
    },
    {
      id: 3,
      title: 'Fee Payment Deadline',
      date: 'Next Wednesday',
      child: 'Both',
      type: 'payment',
    },
  ]);

  const currentChild = children[selectedChild];

  // Mock data for charts
  const performanceData = {
    labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
    datasets: [
      {
        label: `${currentChild.name} - GPA`,
        data: [3.2, 3.4, 3.6, 3.5, 3.7, 3.7],
        borderColor: theme.palette.primary.main,
        backgroundColor: `${theme.palette.primary.main}20`,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const attendanceData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Attendance %',
        data: [100, 95, 90, 95],
        backgroundColor: theme.palette.success.main,
      },
    ],
  };

  const quickActions = [
    { label: 'View Grades', icon: <Grade />, color: 'primary', path: '/grades' },
    { label: 'Check Attendance', icon: <CheckCircle />, color: 'success', path: '/attendance' },
    { label: 'Pay Fees', icon: <Payment />, color: 'warning', path: '/fees' },
    { label: 'Message Teacher', icon: <Message />, color: 'info', path: '/messages' },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.firstName}! 👨‍👩‍👧‍👦
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Stay updated with your children's academic progress and school activities.
        </Typography>
      </Box>

      {/* Child Selector */}
      <Box sx={{ mb: 4 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Select Child</InputLabel>
          <Select
            value={selectedChild}
            label="Select Child"
            onChange={(e) => setSelectedChild(Number(e.target.value))}
          >
            {children.map((child, index) => (
              <MenuItem key={child.id} value={index}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 24, height: 24 }}>
                    {child.name.charAt(0)}
                  </Avatar>
                  {child.name} - {child.class}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Important Alerts */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Alert severity="warning" icon={<AttachMoney />}>
            <Typography variant="subtitle2">Fee Payment Due</Typography>
            <Typography variant="body2">Monthly tuition fee of $500 is due by March 15th</Typography>
          </Alert>
        </Grid>
        <Grid item xs={12} md={6}>
          <Alert severity="info" icon={<CalendarToday />}>
            <Typography variant="subtitle2">Parent-Teacher Meeting</Typography>
            <Typography variant="body2">Scheduled for Friday at 3:00 PM with Ms. Smith</Typography>
          </Alert>
        </Grid>
      </Grid>

      {/* Stats Cards for Selected Child */}
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
                    {currentChild.gpa}
                  </Typography>
                  <Typography color="text.secondary">
                    Current GPA
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(currentChild.gpa / 4) * 100} 
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
                    {currentChild.attendance}%
                  </Typography>
                  <Typography color="text.secondary">
                    Attendance
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={currentChild.attendance} 
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
                    2
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
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <School />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div">
                    {currentChild.class}
                  </Typography>
                  <Typography color="text.secondary">
                    Current Class
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Quick Actions */}
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

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              <List>
                {recentActivities.slice(0, 3).map((activity) => (
                  <ListItem key={activity.id} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: activity.priority === 'success' ? 'success.main' : 
                                   activity.priority === 'warning' ? 'warning.main' : 'error.main',
                          width: 32,
                          height: 32,
                        }}
                      >
                        {activity.type === 'grade' ? <Grade /> : 
                         activity.type === 'attendance' ? <CheckCircle /> : <Payment />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">{activity.title}</Typography>
                          <Chip label={activity.childName} size="small" variant="outlined" />
                        </Box>
                      }
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

        {/* Upcoming Events */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Events & Deadlines
              </Typography>
              <List>
                {upcomingEvents.map((event) => (
                  <ListItem key={event.id}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {event.type === 'meeting' ? <Person /> : 
                         event.type === 'payment' ? <Payment /> : <Event />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">{event.title}</Typography>
                          <Chip label={event.child} size="small" variant="outlined" />
                        </Box>
                      }
                      secondary={event.date}
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
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {currentChild.name}'s Academic Performance
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
                        max: 4,
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
                Monthly Attendance
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
      </Grid>
    </Box>
  );
};

export default ParentDashboard;
