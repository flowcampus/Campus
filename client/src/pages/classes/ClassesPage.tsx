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
  Pagination,
  Tooltip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Class as ClassIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { RootState } from '../../store/store';
import { fetchClassesBySchool, createClass } from '../../store/slices/classSlice';
import type { Class as ClassModel } from '../../store/slices/classSlice';

// Use the Class model from slice to avoid type drift

const validationSchema = Yup.object({
  name: Yup.string().required('Class name is required'),
  level: Yup.string().required('Level is required'),
  section: Yup.string().required('Section is required'),
  capacity: Yup.number().min(1, 'Capacity must be at least 1').required('Capacity is required'),
  classTeacherId: Yup.string().required('Class teacher is required'),
  room: Yup.string().required('Room number is required'),
  academicYear: Yup.string().required('Academic year is required'),
});

const ClassesPage: React.FC = () => {
  const dispatch = useDispatch();
  const { classes, loading, error } = useSelector((state: RootState) => state.classes);
  const { teachers } = useSelector((state: RootState) => state.teachers);
  const { user } = useSelector((state: RootState) => state.auth);

  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassModel | null>(null);
  const [viewingClass, setViewingClass] = useState<ClassModel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [page, setPage] = useState(1);

  const formik = useFormik({
    initialValues: {
      name: '',
      level: '',
      section: '',
      capacity: 30,
      classTeacherId: '',
      room: '',
      academicYear: new Date().getFullYear().toString(),
      status: 'active' as 'active' | 'inactive',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editingClass) {
          // Update class logic would go here
          console.log('Update class:', values);
        } else {
          await dispatch(createClass({ schoolId: user?.schoolId as string, classData: values }) as any);
        }
        resetForm();
        setOpenDialog(false);
        setEditingClass(null);
      } catch (error) {
        console.error('Error saving class:', error);
      }
    },
  });

  useEffect(() => {
    if (user?.schoolId) {
      dispatch(fetchClassesBySchool({ schoolId: user.schoolId }) as any);
    }
  }, [dispatch, user?.schoolId]);

  const handleEdit = (classItem: ClassModel) => {
    setEditingClass(classItem);
    formik.setValues({
      name: classItem.name,
      level: classItem.level,
      section: classItem.section ?? '',
      capacity: classItem.capacity,
      classTeacherId: classItem.classTeacherId ?? '',
      room: '',
      academicYear: new Date().getFullYear().toString(),
      status: 'active',
    });
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setEditingClass(null);
    formik.resetForm();
    setOpenDialog(true);
  };

  const handleView = (classItem: ClassModel) => {
    setViewingClass(classItem);
    setOpenViewDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingClass(null);
    formik.resetForm();
  };

  const filteredClasses = classes.filter(classItem => {
    const matchesSearch = 
      classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.level.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (classItem.section ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (((classItem.teacherFirstName ?? '') + ' ' + (classItem.teacherLastName ?? ''))
        .toLowerCase()
        .includes(searchQuery.toLowerCase()));
    
    const matchesLevel = levelFilter === 'all' || classItem.level === levelFilter;
    
    return matchesSearch && matchesLevel;
  });

  const levels = [...new Set(classes.map(c => c.level))];
  const totalStudents = classes.reduce((sum, c) => sum + (c.studentCount ?? 0), 0);
  const averageCapacity = classes.length > 0 ? Math.round(classes.reduce((sum, c) => sum + (c.capacity ?? 0), 0) / classes.length) : 0;

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Classes Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage class schedules, assignments, and student groups
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          size="large"
        >
          Add Class
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <ClassIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{classes.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Classes
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
                  <GroupIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{totalStudents}</Typography>
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
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{averageCapacity}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg. Capacity
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
                  <Typography variant="h6">{levels.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Grade Levels
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search classes..."
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
                <InputLabel>Level</InputLabel>
                <Select
                  value={levelFilter}
                  label="Level"
                  onChange={(e) => setLevelFilter(e.target.value)}
                >
                  <MenuItem value="all">All Levels</MenuItem>
                  {levels.map(level => (
                    <MenuItem key={level} value={level}>{level}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Classes Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Class</TableCell>
                <TableCell>Class Teacher</TableCell>
                <TableCell>Students</TableCell>
                <TableCell>Term</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography>Loading...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredClasses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">
                      No classes found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClasses.map((classItem) => (
                  <TableRow key={classItem.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">
                          {classItem.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {classItem.level} - Section {classItem.section}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                          {(classItem.teacherFirstName ?? classItem.teacherLastName ?? '?').charAt(0)}
                        </Avatar>
                        <Typography variant="body2">
                          {`${classItem.teacherFirstName ?? ''} ${classItem.teacherLastName ?? ''}`.trim() || 'Unassigned'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {(classItem.studentCount ?? 0)} / {classItem.capacity}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {classItem.capacity > 0 ? Math.round(((classItem.studentCount ?? 0) / classItem.capacity) * 100) : 0}% full
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {classItem.termName ?? '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleView(classItem)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(classItem)}
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

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingClass ? 'Edit Class' : 'Add New Class'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="name"
                  label="Class Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  name="level"
                  label="Level/Grade"
                  value={formik.values.level}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.level && Boolean(formik.errors.level)}
                  helperText={formik.touched.level && formik.errors.level}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  name="section"
                  label="Section"
                  value={formik.values.section}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.section && Boolean(formik.errors.section)}
                  helperText={formik.touched.section && formik.errors.section}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="capacity"
                  label="Capacity"
                  type="number"
                  value={formik.values.capacity}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.capacity && Boolean(formik.errors.capacity)}
                  helperText={formik.touched.capacity && formik.errors.capacity}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Class Teacher</InputLabel>
                  <Select
                    name="classTeacherId"
                    value={formik.values.classTeacherId}
                    label="Class Teacher"
                    onChange={formik.handleChange}
                    error={formik.touched.classTeacherId && Boolean(formik.errors.classTeacherId)}
                  >
                    {teachers.map(teacher => (
                      <MenuItem key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="room"
                  label="Room Number"
                  value={formik.values.room}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.room && Boolean(formik.errors.room)}
                  helperText={formik.touched.room && formik.errors.room}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="academicYear"
                  label="Academic Year"
                  value={formik.values.academicYear}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.academicYear && Boolean(formik.errors.academicYear)}
                  helperText={formik.touched.academicYear && formik.errors.academicYear}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
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

      {/* View Class Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Class Details: {viewingClass?.name}
        </DialogTitle>
        <DialogContent>
          {viewingClass && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Basic Information
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Level: {viewingClass.level}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Section: {viewingClass.section}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Term: {viewingClass.termName ?? '-'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Class Teacher
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2 }}>
                        {(viewingClass.teacherFirstName ?? viewingClass.teacherLastName ?? '?').charAt(0)}
                      </Avatar>
                      <Typography variant="body1">
                        {`${viewingClass.teacherFirstName ?? ''} ${viewingClass.teacherLastName ?? ''}`.trim() || 'Unassigned'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Subjects
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {(viewingClass.subjects ?? []).map((subject: any) => (
                        <Chip key={subject} label={subject} size="small" />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassesPage;
