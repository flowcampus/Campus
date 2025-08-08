import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Avatar,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  Alert,
  LinearProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  Schedule as LateIcon,
  EventBusy as ExcusedIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { markAttendance, fetchAttendanceByClass } from '../../store/slices/attendanceSlice';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  avatar?: string;
  attendanceStatus?: 'present' | 'absent' | 'late' | 'excused';
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

const AttendancePage: React.FC = () => {
  const dispatch = useDispatch();
  const { attendance, loading, error } = useSelector((state: RootState) => state.attendance);
  const { classes } = useSelector((state: RootState) => state.classes);
  const { user } = useSelector((state: RootState) => state.auth);

  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  // Mock students data - in real app, this would come from API
  const mockStudents: Student[] = [
    { id: '1', firstName: 'John', lastName: 'Doe', studentId: 'STU001' },
    { id: '2', firstName: 'Jane', lastName: 'Smith', studentId: 'STU002' },
    { id: '3', firstName: 'Mike', lastName: 'Johnson', studentId: 'STU003' },
    { id: '4', firstName: 'Sarah', lastName: 'Williams', studentId: 'STU004' },
    { id: '5', firstName: 'David', lastName: 'Brown', studentId: 'STU005' },
  ];

  useEffect(() => {
    if (selectedClass) {
      setStudents(mockStudents);
      // Initialize attendance data
      const initialData: Record<string, string> = {};
      mockStudents.forEach(student => {
        initialData[student.id] = 'present';
      });
      setAttendanceData(initialData);
    }
  }, [selectedClass]);

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    try {
      const attendanceRecords = Object.entries(attendanceData).map(([studentId, status]) => ({
        studentId,
        classId: selectedClass,
        date: selectedDate,
        status,
      }));

      await dispatch(markAttendance(attendanceRecords));
      // Show success message
    } catch (error) {
      console.error('Error saving attendance:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <PresentIcon color="success" />;
      case 'absent':
        return <AbsentIcon color="error" />;
      case 'late':
        return <LateIcon color="warning" />;
      case 'excused':
        return <ExcusedIcon color="info" />;
      default:
        return <PresentIcon color="success" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'error';
      case 'late':
        return 'warning';
      case 'excused':
        return 'info';
      default:
        return 'success';
    }
  };

  const calculateAttendanceStats = () => {
    const total = students.length;
    const present = Object.values(attendanceData).filter(status => status === 'present').length;
    const absent = Object.values(attendanceData).filter(status => status === 'absent').length;
    const late = Object.values(attendanceData).filter(status => status === 'late').length;
    const excused = Object.values(attendanceData).filter(status => status === 'excused').length;
    
    return { total, present, absent, late, excused };
  };

  const stats = calculateAttendanceStats();
  const attendanceRate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

  const filteredStudents = students.filter(student =>
    student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Attendance Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and manage student attendance records
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AssessmentIcon />}
          onClick={() => setShowSummary(true)}
          size="large"
        >
          View Reports
        </Button>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Mark Attendance" />
          <Tab label="Attendance History" />
          <Tab label="Statistics" />
        </Tabs>
      </Card>

      {/* Tab Content */}
      {selectedTab === 0 && (
        <>
          {/* Class and Date Selection */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Select Class</InputLabel>
                    <Select
                      value={selectedClass}
                      label="Select Class"
                      onChange={(e) => setSelectedClass(e.target.value)}
                    >
                      {classes.map(classItem => (
                        <MenuItem key={classItem.id} value={classItem.id}>
                          {classItem.name} - {classItem.level}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveAttendance}
                    disabled={!selectedClass || loading}
                    size="large"
                  >
                    Save
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Attendance Stats */}
          {selectedClass && (
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <GroupIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{stats.total}</Typography>
                        <Typography variant="body2" color="text.secondary">
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
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                        <PresentIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{stats.present}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Present
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                        <AbsentIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{stats.absent}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Absent
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                        <TrendingUpIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{attendanceRate}%</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Attendance Rate
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Student Attendance List */}
          {selectedClass && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Mark Attendance - {new Date(selectedDate).toLocaleDateString()}
                </Typography>
                <List>
                  {filteredStudents.map((student, index) => (
                    <ListItem key={student.id} divider={index < filteredStudents.length - 1}>
                      <ListItemAvatar>
                        <Avatar>
                          {student.firstName[0]}{student.lastName[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${student.firstName} ${student.lastName}`}
                        secondary={`Student ID: ${student.studentId}`}
                      />
                      <ListItemSecondaryAction>
                        <Box display="flex" gap={1}>
                          {['present', 'absent', 'late', 'excused'].map(status => (
                            <Button
                              key={status}
                              variant={attendanceData[student.id] === status ? 'contained' : 'outlined'}
                              color={getStatusColor(status) as any}
                              size="small"
                              startIcon={getStatusIcon(status)}
                              onClick={() => handleAttendanceChange(student.id, status)}
                              sx={{ minWidth: 100 }}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Button>
                          ))}
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Attendance History Tab */}
      {selectedTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Attendance History
            </Typography>
            <Typography color="text.secondary">
              Attendance history functionality coming soon...
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Statistics Tab */}
      {selectedTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Attendance Statistics
            </Typography>
            <Typography color="text.secondary">
              Detailed attendance statistics and analytics coming soon...
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default AttendancePage;
