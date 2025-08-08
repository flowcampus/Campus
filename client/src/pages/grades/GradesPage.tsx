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
  Alert,
  Tabs,
  Tab,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Grade as GradeIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  Save as SaveIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { RootState } from '../../store/store';
import { recordGrade, fetchGradesByStudent } from '../../store/slices/gradeSlice';

interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  assessmentType: string;
  score: number;
  maxScore: number;
  percentage: number;
  grade: string;
  remarks?: string;
  date: string;
  term: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  class: string;
  avatar?: string;
}

const validationSchema = Yup.object({
  studentId: Yup.string().required('Student is required'),
  subject: Yup.string().required('Subject is required'),
  assessmentType: Yup.string().required('Assessment type is required'),
  score: Yup.number().min(0, 'Score must be positive').required('Score is required'),
  maxScore: Yup.number().min(1, 'Max score must be at least 1').required('Max score is required'),
  term: Yup.string().required('Term is required'),
  remarks: Yup.string(),
});

const GradesPage: React.FC = () => {
  const dispatch = useDispatch();
  const { grades, loading, error } = useSelector((state: RootState) => state.grades);
  const { user } = useSelector((state: RootState) => state.auth);

  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('current');

  // Mock data - in real app, this would come from API
  const mockStudents: Student[] = [
    { id: '1', firstName: 'John', lastName: 'Doe', studentId: 'STU001', class: 'Grade 10A' },
    { id: '2', firstName: 'Jane', lastName: 'Smith', studentId: 'STU002', class: 'Grade 10A' },
    { id: '3', firstName: 'Mike', lastName: 'Johnson', studentId: 'STU003', class: 'Grade 10B' },
    { id: '4', firstName: 'Sarah', lastName: 'Williams', studentId: 'STU004', class: 'Grade 10B' },
  ];

  const mockGrades: Grade[] = [
    {
      id: '1',
      studentId: '1',
      studentName: 'John Doe',
      subject: 'Mathematics',
      assessmentType: 'Test',
      score: 85,
      maxScore: 100,
      percentage: 85,
      grade: 'B+',
      remarks: 'Good performance',
      date: '2024-01-15',
      term: 'Term 1',
    },
    {
      id: '2',
      studentId: '2',
      studentName: 'Jane Smith',
      subject: 'English',
      assessmentType: 'Assignment',
      score: 92,
      maxScore: 100,
      percentage: 92,
      grade: 'A-',
      remarks: 'Excellent work',
      date: '2024-01-16',
      term: 'Term 1',
    },
  ];

  const subjects = ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology'];
  const assessmentTypes = ['Test', 'Assignment', 'Quiz', 'Project', 'Exam', 'Presentation'];
  const terms = ['Term 1', 'Term 2', 'Term 3'];

  const formik = useFormik({
    initialValues: {
      studentId: '',
      subject: '',
      assessmentType: '',
      score: 0,
      maxScore: 100,
      term: 'Term 1',
      remarks: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const percentage = (values.score / values.maxScore) * 100;
        const grade = calculateGrade(percentage);
        
        const gradeData = {
          ...values,
          percentage,
          grade,
          date: new Date().toISOString().split('T')[0],
        };

        if (editingGrade) {
          // Update grade logic would go here
          console.log('Update grade:', gradeData);
        } else {
          await dispatch(recordGrade(gradeData));
        }
        resetForm();
        setOpenDialog(false);
        setEditingGrade(null);
      } catch (error) {
        console.error('Error saving grade:', error);
      }
    },
  });

  const calculateGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'A-';
    if (percentage >= 75) return 'B+';
    if (percentage >= 70) return 'B';
    if (percentage >= 65) return 'B-';
    if (percentage >= 60) return 'C+';
    if (percentage >= 55) return 'C';
    if (percentage >= 50) return 'C-';
    if (percentage >= 45) return 'D+';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  const getGradeColor = (grade: string) => {
    if (['A+', 'A', 'A-'].includes(grade)) return 'success';
    if (['B+', 'B', 'B-'].includes(grade)) return 'info';
    if (['C+', 'C', 'C-'].includes(grade)) return 'warning';
    return 'error';
  };

  const handleEdit = (grade: Grade) => {
    setEditingGrade(grade);
    formik.setValues({
      studentId: grade.studentId,
      subject: grade.subject,
      assessmentType: grade.assessmentType,
      score: grade.score,
      maxScore: grade.maxScore,
      term: grade.term,
      remarks: grade.remarks || '',
    });
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setEditingGrade(null);
    formik.resetForm();
    setOpenDialog(true);
  };

  const filteredGrades = mockGrades.filter(grade => {
    const matchesSearch = 
      grade.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grade.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grade.assessmentType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSubject = selectedSubject === 'all' || grade.subject === selectedSubject;
    const matchesTerm = selectedTerm === 'current' || grade.term === selectedTerm;
    
    return matchesSearch && matchesSubject && matchesTerm;
  });

  const calculateStats = () => {
    const totalGrades = filteredGrades.length;
    const averageScore = totalGrades > 0 
      ? filteredGrades.reduce((sum, grade) => sum + grade.percentage, 0) / totalGrades 
      : 0;
    const highestScore = totalGrades > 0 
      ? Math.max(...filteredGrades.map(grade => grade.percentage)) 
      : 0;
    const passingGrades = filteredGrades.filter(grade => grade.percentage >= 50).length;
    const passingRate = totalGrades > 0 ? (passingGrades / totalGrades) * 100 : 0;

    return {
      totalGrades,
      averageScore: Math.round(averageScore),
      highestScore: Math.round(highestScore),
      passingRate: Math.round(passingRate),
    };
  };

  const stats = calculateStats();

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Grades Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Record and manage student grades and assessments
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          size="large"
        >
          Add Grade
        </Button>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All Grades" />
          <Tab label="Grade Entry" />
          <Tab label="Reports" />
        </Tabs>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <GradeIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.totalGrades}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Grades
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
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.averageScore}%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Score
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
                  <AssessmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.highestScore}%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Highest Score
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
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <SchoolIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{stats.passingRate}%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Passing Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {selectedTab === 0 && (
        <>
          {/* Search and Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    placeholder="Search grades..."
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
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Subject</InputLabel>
                    <Select
                      value={selectedSubject}
                      label="Subject"
                      onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                      <MenuItem value="all">All Subjects</MenuItem>
                      {subjects.map(subject => (
                        <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Term</InputLabel>
                    <Select
                      value={selectedTerm}
                      label="Term"
                      onChange={(e) => setSelectedTerm(e.target.value)}
                    >
                      <MenuItem value="current">Current Term</MenuItem>
                      {terms.map(term => (
                        <MenuItem key={term} value={term}>{term}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Grades Table */}
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Assessment</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Term</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography>Loading...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : filteredGrades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography color="text.secondary">
                          No grades found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredGrades.map((grade) => (
                      <TableRow key={grade.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                              {grade.studentName.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                            <Typography variant="body2">
                              {grade.studentName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {grade.subject}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {grade.assessmentType}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              {grade.score}/{grade.maxScore}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={grade.percentage}
                              sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {grade.percentage}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={grade.grade}
                            color={getGradeColor(grade.grade) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(grade.date).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {grade.term}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(grade)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </>
      )}

      {/* Grade Entry Tab */}
      {selectedTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Grade Entry
            </Typography>
            <Typography color="text.secondary">
              Bulk grade entry functionality coming soon...
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Reports Tab */}
      {selectedTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Grade Reports
            </Typography>
            <Typography color="text.secondary">
              Detailed grade reports and analytics coming soon...
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingGrade ? 'Edit Grade' : 'Add New Grade'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Student</InputLabel>
                  <Select
                    name="studentId"
                    value={formik.values.studentId}
                    label="Student"
                    onChange={formik.handleChange}
                    error={formik.touched.studentId && Boolean(formik.errors.studentId)}
                  >
                    {mockStudents.map(student => (
                      <MenuItem key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} ({student.studentId})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    name="subject"
                    value={formik.values.subject}
                    label="Subject"
                    onChange={formik.handleChange}
                    error={formik.touched.subject && Boolean(formik.errors.subject)}
                  >
                    {subjects.map(subject => (
                      <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Assessment Type</InputLabel>
                  <Select
                    name="assessmentType"
                    value={formik.values.assessmentType}
                    label="Assessment Type"
                    onChange={formik.handleChange}
                    error={formik.touched.assessmentType && Boolean(formik.errors.assessmentType)}
                  >
                    {assessmentTypes.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Term</InputLabel>
                  <Select
                    name="term"
                    value={formik.values.term}
                    label="Term"
                    onChange={formik.handleChange}
                    error={formik.touched.term && Boolean(formik.errors.term)}
                  >
                    {terms.map(term => (
                      <MenuItem key={term} value={term}>{term}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="score"
                  label="Score"
                  type="number"
                  value={formik.values.score}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.score && Boolean(formik.errors.score)}
                  helperText={formik.touched.score && formik.errors.score}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="maxScore"
                  label="Max Score"
                  type="number"
                  value={formik.values.maxScore}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.maxScore && Boolean(formik.errors.maxScore)}
                  helperText={formik.touched.maxScore && formik.errors.maxScore}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="remarks"
                  label="Remarks (Optional)"
                  multiline
                  rows={3}
                  value={formik.values.remarks}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.remarks && Boolean(formik.errors.remarks)}
                  helperText={formik.touched.remarks && formik.errors.remarks}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default GradesPage;
