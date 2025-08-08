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
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Payment as PaymentIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { RootState } from '../../store/store';
import { createFeeStructure, recordFeePayment, fetchStudentFeeStatus } from '../../store/slices/feeSlice';

interface FeeStructure {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  description: string;
  isRecurring: boolean;
  academicYear: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  class: string;
  totalFees: number;
  paidAmount: number;
  balance: number;
  status: 'paid' | 'partial' | 'unpaid' | 'overdue';
  lastPaymentDate?: string;
}

interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  date: string;
  feeType: string;
  status: 'completed' | 'pending' | 'failed';
}

const feeValidationSchema = Yup.object({
  name: Yup.string().required('Fee name is required'),
  amount: Yup.number().min(0, 'Amount must be positive').required('Amount is required'),
  dueDate: Yup.date().required('Due date is required'),
  category: Yup.string().required('Category is required'),
  description: Yup.string(),
});

const paymentValidationSchema = Yup.object({
  studentId: Yup.string().required('Student is required'),
  amount: Yup.number().min(1, 'Amount must be greater than 0').required('Amount is required'),
  paymentMethod: Yup.string().required('Payment method is required'),
  feeType: Yup.string().required('Fee type is required'),
});

const FeesPage: React.FC = () => {
  const dispatch = useDispatch();
  const { structures, payments, loading, error } = useSelector((state: RootState) => state.fees);
  const { user } = useSelector((state: RootState) => state.auth);

  // Keep existing variable name in UI
  const feeStructures = structures;

  const [selectedTab, setSelectedTab] = useState(0);
  const [openFeeDialog, setOpenFeeDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeStructure | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');

  // Mock data - in real app, this would come from API
  const mockStudents: Student[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      studentId: 'STU001',
      class: 'Grade 10A',
      totalFees: 50000,
      paidAmount: 30000,
      balance: 20000,
      status: 'partial',
      lastPaymentDate: '2024-01-15',
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      studentId: 'STU002',
      class: 'Grade 10A',
      totalFees: 50000,
      paidAmount: 50000,
      balance: 0,
      status: 'paid',
      lastPaymentDate: '2024-01-10',
    },
    {
      id: '3',
      firstName: 'Mike',
      lastName: 'Johnson',
      studentId: 'STU003',
      class: 'Grade 10B',
      totalFees: 50000,
      paidAmount: 0,
      balance: 50000,
      status: 'unpaid',
    },
  ];

  const mockPayments: Payment[] = [
    {
      id: '1',
      studentId: '1',
      studentName: 'John Doe',
      amount: 30000,
      paymentMethod: 'Bank Transfer',
      transactionId: 'TXN001',
      date: '2024-01-15',
      feeType: 'Tuition Fee',
      status: 'completed',
    },
    {
      id: '2',
      studentId: '2',
      studentName: 'Jane Smith',
      amount: 50000,
      paymentMethod: 'SmartSave',
      transactionId: 'TXN002',
      date: '2024-01-10',
      feeType: 'Tuition Fee',
      status: 'completed',
    },
  ];

  const feeCategories = ['Tuition Fee', 'Exam Fee', 'Library Fee', 'Sports Fee', 'Transport Fee', 'Miscellaneous'];
  const paymentMethods = ['Cash', 'Bank Transfer', 'SmartSave', 'Mobile Money', 'Card Payment'];

  const feeFormik = useFormik({
    initialValues: {
      name: '',
      amount: 0,
      dueDate: '',
      category: '',
      description: '',
      isRecurring: false,
      academicYear: new Date().getFullYear().toString(),
    },
    validationSchema: feeValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editingFee) {
          // Update fee logic would go here
          console.log('Update fee:', values);
        } else {
          await dispatch(createFeeStructure(values));
        }
        resetForm();
        setOpenFeeDialog(false);
        setEditingFee(null);
      } catch (error) {
        console.error('Error saving fee structure:', error);
      }
    },
  });

  const paymentFormik = useFormik({
    initialValues: {
      studentId: '',
      amount: 0,
      paymentMethod: 'cash',
      feeType: '',
      transactionId: '',
      remarks: '',
    },
    validationSchema: paymentValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await dispatch(recordFeePayment({
          ...values,
          date: new Date().toISOString().split('T')[0],
          status: 'completed',
        }));
        resetForm();
        setOpenPaymentDialog(false);
      } catch (error) {
        console.error('Error recording payment:', error);
      }
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'partial':
        return 'warning';
      case 'unpaid':
        return 'error';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon color="success" />;
      case 'partial':
        return <ScheduleIcon color="warning" />;
      case 'unpaid':
        return <WarningIcon color="error" />;
      case 'overdue':
        return <WarningIcon color="error" />;
      default:
        return <ScheduleIcon />;
    }
  };

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    const matchesClass = classFilter === 'all' || student.class === classFilter;
    
    return matchesSearch && matchesStatus && matchesClass;
  });

  const calculateStats = () => {
    const totalStudents = mockStudents.length;
    const totalFeesExpected = mockStudents.reduce((sum, student) => sum + student.totalFees, 0);
    const totalFeesCollected = mockStudents.reduce((sum, student) => sum + student.paidAmount, 0);
    const totalOutstanding = mockStudents.reduce((sum, student) => sum + student.balance, 0);
    const collectionRate = totalFeesExpected > 0 ? (totalFeesCollected / totalFeesExpected) * 100 : 0;

    return {
      totalStudents,
      totalFeesExpected,
      totalFeesCollected,
      totalOutstanding,
      collectionRate: Math.round(collectionRate),
    };
  };

  const stats = calculateStats();

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Fees Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage school fees, payments, and financial records
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<PaymentIcon />}
            onClick={() => setOpenPaymentDialog(true)}
            size="large"
          >
            Record Payment
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenFeeDialog(true)}
            size="large"
          >
            Add Fee Structure
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <AccountBalanceIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">₦{stats.totalFeesExpected.toLocaleString()}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Expected
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
                  <MoneyIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">₦{stats.totalFeesCollected.toLocaleString()}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Collected
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
                  <WarningIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">₦{stats.totalOutstanding.toLocaleString()}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Outstanding
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
                  <Typography variant="h6">{stats.collectionRate}%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Collection Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Student Fees" />
          <Tab label="Payment History" />
          <Tab label="Fee Structures" />
          <Tab label="Reports" />
        </Tabs>
      </Card>

      {/* Student Fees Tab */}
      {selectedTab === 0 && (
        <>
          {/* Search and Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
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
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Status"
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="paid">Paid</MenuItem>
                      <MenuItem value="partial">Partial</MenuItem>
                      <MenuItem value="unpaid">Unpaid</MenuItem>
                      <MenuItem value="overdue">Overdue</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Class</InputLabel>
                    <Select
                      value={classFilter}
                      label="Class"
                      onChange={(e) => setClassFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Classes</MenuItem>
                      <MenuItem value="Grade 10A">Grade 10A</MenuItem>
                      <MenuItem value="Grade 10B">Grade 10B</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Students Fee Status Table */}
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Total Fees</TableCell>
                    <TableCell>Paid Amount</TableCell>
                    <TableCell>Balance</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Payment</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                            {student.firstName[0]}{student.lastName[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">
                              {student.firstName} {student.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {student.studentId}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {student.class}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          ₦{student.totalFees.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            ₦{student.paidAmount.toLocaleString()}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(student.paidAmount / student.totalFees) * 100}
                            sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color={student.balance > 0 ? 'error' : 'success'}>
                          ₦{student.balance.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={student.status}
                          color={getStatusColor(student.status) as any}
                          size="small"
                          icon={getStatusIcon(student.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {student.lastPaymentDate 
                            ? new Date(student.lastPaymentDate).toLocaleDateString()
                            : 'No payment'
                          }
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Print Receipt">
                          <IconButton size="small">
                            <PrintIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Record Payment">
                          <IconButton 
                            size="small"
                            onClick={() => {
                              paymentFormik.setFieldValue('studentId', student.id);
                              setOpenPaymentDialog(true);
                            }}
                          >
                            <PaymentIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </>
      )}

      {/* Payment History Tab */}
      {selectedTab === 1 && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Fee Type</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockPayments.map((payment) => (
                  <TableRow key={payment.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {payment.studentName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        ₦{payment.amount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {payment.paymentMethod}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {payment.transactionId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {payment.feeType}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(payment.date).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payment.status}
                        color={payment.status === 'completed' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Fee Structures Tab */}
      {selectedTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Fee Structures
            </Typography>
            <Typography color="text.secondary">
              Fee structure management functionality coming soon...
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Reports Tab */}
      {selectedTab === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Financial Reports
            </Typography>
            <Typography color="text.secondary">
              Detailed financial reports and analytics coming soon...
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Add Fee Structure Dialog */}
      <Dialog
        open={openFeeDialog}
        onClose={() => setOpenFeeDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={feeFormik.handleSubmit}>
          <DialogTitle>
            {editingFee ? 'Edit Fee Structure' : 'Add Fee Structure'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="name"
                  label="Fee Name"
                  value={feeFormik.values.name}
                  onChange={feeFormik.handleChange}
                  onBlur={feeFormik.handleBlur}
                  error={feeFormik.touched.name && Boolean(feeFormik.errors.name)}
                  helperText={feeFormik.touched.name && feeFormik.errors.name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="amount"
                  label="Amount (₦)"
                  type="number"
                  value={feeFormik.values.amount}
                  onChange={feeFormik.handleChange}
                  onBlur={feeFormik.handleBlur}
                  error={feeFormik.touched.amount && Boolean(feeFormik.errors.amount)}
                  helperText={feeFormik.touched.amount && feeFormik.errors.amount}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={feeFormik.values.category}
                    label="Category"
                    onChange={feeFormik.handleChange}
                    error={feeFormik.touched.category && Boolean(feeFormik.errors.category)}
                  >
                    {feeCategories.map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="dueDate"
                  label="Due Date"
                  type="date"
                  value={feeFormik.values.dueDate}
                  onChange={feeFormik.handleChange}
                  onBlur={feeFormik.handleBlur}
                  error={feeFormik.touched.dueDate && Boolean(feeFormik.errors.dueDate)}
                  helperText={feeFormik.touched.dueDate && feeFormik.errors.dueDate}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="description"
                  label="Description"
                  multiline
                  rows={3}
                  value={feeFormik.values.description}
                  onChange={feeFormik.handleChange}
                  onBlur={feeFormik.handleBlur}
                  error={feeFormik.touched.description && Boolean(feeFormik.errors.description)}
                  helperText={feeFormik.touched.description && feeFormik.errors.description}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenFeeDialog(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={feeFormik.isSubmitting}
            >
              {feeFormik.isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog
        open={openPaymentDialog}
        onClose={() => setOpenPaymentDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={paymentFormik.handleSubmit}>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Student</InputLabel>
                  <Select
                    name="studentId"
                    value={paymentFormik.values.studentId}
                    label="Student"
                    onChange={paymentFormik.handleChange}
                    error={paymentFormik.touched.studentId && Boolean(paymentFormik.errors.studentId)}
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
                <TextField
                  fullWidth
                  name="amount"
                  label="Amount (₦)"
                  type="number"
                  value={paymentFormik.values.amount}
                  onChange={paymentFormik.handleChange}
                  onBlur={paymentFormik.handleBlur}
                  error={paymentFormik.touched.amount && Boolean(paymentFormik.errors.amount)}
                  helperText={paymentFormik.touched.amount && paymentFormik.errors.amount}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    name="paymentMethod"
                    value={paymentFormik.values.paymentMethod}
                    label="Payment Method"
                    onChange={paymentFormik.handleChange}
                    error={paymentFormik.touched.paymentMethod && Boolean(paymentFormik.errors.paymentMethod)}
                  >
                    {paymentMethods.map(method => (
                      <MenuItem key={method} value={method}>{method}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Fee Type</InputLabel>
                  <Select
                    name="feeType"
                    value={paymentFormik.values.feeType}
                    label="Fee Type"
                    onChange={paymentFormik.handleChange}
                    error={paymentFormik.touched.feeType && Boolean(paymentFormik.errors.feeType)}
                  >
                    {feeCategories.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="transactionId"
                  label="Transaction ID (Optional)"
                  value={paymentFormik.values.transactionId}
                  onChange={paymentFormik.handleChange}
                  onBlur={paymentFormik.handleBlur}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="remarks"
                  label="Remarks (Optional)"
                  multiline
                  rows={3}
                  value={paymentFormik.values.remarks}
                  onChange={paymentFormik.handleChange}
                  onBlur={paymentFormik.handleBlur}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPaymentDialog(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={paymentFormik.isSubmitting}
            >
              {paymentFormik.isSubmitting ? 'Recording...' : 'Record Payment'}
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

export default FeesPage;
