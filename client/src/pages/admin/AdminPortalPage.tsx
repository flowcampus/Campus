import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  MenuItem,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  AdminPanelSettings,
  Security,
  SupervisorAccount,
  Support,
  AttachMoney,
  Palette,
  AccountBalance,
  Link as LinkIcon,
  Timer,
  Warning,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { adminLogin, clearError } from '../../store/slices/authSlice';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Admin password should be minimum 8 characters')
    .required('Password is required'),
  adminRole: yup
    .string()
    .required('Admin role is required'),
  adminKey: yup
    .string()
    .when('loginMethod', {
      is: 'credentials',
      then: (schema) => schema.required('Admin key is required'),
      otherwise: (schema) => schema,
    }),
});

const adminRoles = [
  {
    value: 'super_admin',
    label: 'Super Admin',
    description: 'Full system access - Everything',
    icon: <SupervisorAccount />,
    color: '#d32f2f',
    permissions: ['All permissions', 'User management', 'System configuration', 'Data access'],
  },
  {
    value: 'support_admin',
    label: 'Support Admin',
    description: 'User issues, password resets',
    icon: <Support />,
    color: '#1976d2',
    permissions: ['User support', 'Password resets', 'Issue resolution', 'Read access'],
  },
  {
    value: 'sales_admin',
    label: 'Sales Admin',
    description: 'School plans, account upgrades',
    icon: <AttachMoney />,
    color: '#388e3c',
    permissions: ['View school plans', 'Account upgrades', 'Sales analytics', 'Customer data'],
  },
  {
    value: 'content_admin',
    label: 'Content Admin',
    description: 'Translations, themes, branding',
    icon: <Palette />,
    color: '#f57c00',
    permissions: ['Content management', 'Translations', 'Theme customization', 'Branding'],
  },
  {
    value: 'finance_admin',
    label: 'Finance Admin',
    description: 'View transactions, no account deletion',
    icon: <AccountBalance />,
    color: '#7b1fa2',
    permissions: ['Transaction viewing', 'Financial reports', 'Billing data', 'No deletion rights'],
  },
];

const AdminPortalPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'credentials' | 'magic_link'>('credentials');
  const [showRoleDetails, setShowRoleDetails] = useState(false);
  const [selectedRoleDetails, setSelectedRoleDetails] = useState<any>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      adminRole: '',
      adminKey: '',
      loginMethod: 'credentials',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (loginMethod === 'magic_link') {
        // Handle magic link generation
        handleMagicLinkRequest();
      } else {
        dispatch(adminLogin({
          email: values.email,
          password: values.password,
          adminKey: values.adminKey,
          adminRole: values.adminRole,
        }));
      }
    },
  });

  const handleMagicLinkRequest = () => {
    // In real implementation, this would send a magic link
    setMagicLinkSent(true);
    setTimeout(() => setMagicLinkSent(false), 10000);
  };

  const handleRoleSelect = (role: any) => {
    formik.setFieldValue('adminRole', role.value);
    setSelectedRoleDetails(role);
    setShowRoleDetails(true);
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4, bgcolor: '#0a0a0a' }}>
      <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', px: 2 }}>
        {/* Security Warning */}
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 4, 
            bgcolor: 'rgba(255, 152, 0, 0.1)', 
            border: '1px solid rgba(255, 152, 0, 0.3)',
            '& .MuiAlert-icon': { color: '#ff9800' }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Security sx={{ mr: 1 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              SECURE ADMIN PORTAL - Authorized Personnel Only
            </Typography>
          </Box>
        </Alert>

        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <AdminPanelSettings sx={{ color: '#ff5722' }} />
            Admin Portal
          </Typography>
          <Typography variant="body1" sx={{ color: 'grey.400' }}>
            Campus School Management System Administration
          </Typography>
        </Box>

        <Card elevation={8} sx={{ bgcolor: 'grey.900', border: '1px solid rgba(255, 87, 34, 0.3)' }}>
          <CardContent sx={{ p: 4 }}>
            {/* Login Method Selection */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#fff', fontWeight: 600 }}>
                Authentication Method
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant={loginMethod === 'credentials' ? 'contained' : 'outlined'}
                  onClick={() => setLoginMethod('credentials')}
                  sx={{ flex: 1, py: 1.5 }}
                >
                  <Lock sx={{ mr: 1 }} />
                  Credentials + Key
                </Button>
                <Button
                  variant={loginMethod === 'magic_link' ? 'contained' : 'outlined'}
                  onClick={() => setLoginMethod('magic_link')}
                  sx={{ flex: 1, py: 1.5 }}
                >
                  <LinkIcon sx={{ mr: 1 }} />
                  Magic Link
                </Button>
              </Box>
            </Box>

            <Box component="form" onSubmit={formik.handleSubmit}>
              {/* Error Alert */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
                  {error}
                </Alert>
              )}

              {/* Magic Link Success */}
              {magicLinkSent && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Timer sx={{ mr: 1 }} />
                    Magic link sent! Check your email. Link expires in 10 minutes.
                  </Box>
                </Alert>
              )}

              {/* Admin Role Selection */}
              <TextField
                fullWidth
                select
                id="adminRole"
                name="adminRole"
                label="Admin Role"
                value={formik.values.adminRole}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.adminRole && Boolean(formik.errors.adminRole)}
                helperText={formik.touched.adminRole && formik.errors.adminRole}
                sx={{ 
                  mb: 3,
                  '& .MuiInputLabel-root': { color: 'grey.300' },
                  '& .MuiOutlinedInput-root': { 
                    color: '#fff',
                    '& fieldset': { borderColor: 'grey.600' },
                    '&:hover fieldset': { borderColor: 'grey.400' },
                  },
                }}
              >
                {adminRoles.map((role) => (
                  <MenuItem 
                    key={role.value} 
                    value={role.value}
                    onClick={() => handleRoleSelect(role)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: role.color, width: 32, height: 32 }}>
                        {role.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {role.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {role.description}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              {/* Email */}
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Admin Email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: 'grey.400' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  mb: 3,
                  '& .MuiInputLabel-root': { color: 'grey.300' },
                  '& .MuiOutlinedInput-root': { 
                    color: '#fff',
                    '& fieldset': { borderColor: 'grey.600' },
                    '&:hover fieldset': { borderColor: 'grey.400' },
                  },
                }}
              />

              {loginMethod === 'credentials' && (
                <>
                  {/* Password */}
                  <TextField
                    fullWidth
                    id="password"
                    name="password"
                    label="Admin Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: 'grey.400' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      mb: 3,
                      '& .MuiInputLabel-root': { color: 'grey.300' },
                      '& .MuiOutlinedInput-root': { 
                        color: '#fff',
                        '& fieldset': { borderColor: 'grey.600' },
                        '&:hover fieldset': { borderColor: 'grey.400' },
                      },
                    }}
                  />

                  {/* Admin Key */}
                  <TextField
                    fullWidth
                    id="adminKey"
                    name="adminKey"
                    label="Admin Security Key"
                    type={showAdminKey ? 'text' : 'password'}
                    value={formik.values.adminKey}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.adminKey && Boolean(formik.errors.adminKey)}
                    helperText={formik.touched.adminKey && formik.errors.adminKey}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Security sx={{ color: 'grey.400' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowAdminKey(!showAdminKey)} edge="end">
                            {showAdminKey ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      mb: 3,
                      '& .MuiInputLabel-root': { color: 'grey.300' },
                      '& .MuiOutlinedInput-root': { 
                        color: '#fff',
                        '& fieldset': { borderColor: 'grey.600' },
                        '&:hover fieldset': { borderColor: 'grey.400' },
                      },
                    }}
                  />
                </>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  bgcolor: '#ff5722',
                  '&:hover': {
                    bgcolor: '#e64a19',
                  },
                }}
              >
                {loading ? 'Authenticating...' : 
                 loginMethod === 'magic_link' ? 'Send Magic Link' : 'Access Admin Portal'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Role Details Dialog */}
        <Dialog 
          open={showRoleDetails} 
          onClose={() => setShowRoleDetails(false)}
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: { bgcolor: 'grey.900', color: '#fff' }
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {selectedRoleDetails && (
              <>
                <Avatar sx={{ bgcolor: selectedRoleDetails.color }}>
                  {selectedRoleDetails.icon}
                </Avatar>
                {selectedRoleDetails.label} Permissions
              </>
            )}
          </DialogTitle>
          <DialogContent>
            {selectedRoleDetails && (
              <>
                <Typography variant="body1" sx={{ mb: 3, color: 'grey.300' }}>
                  {selectedRoleDetails.description}
                </Typography>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Access Permissions:
                </Typography>
                <List dense>
                  {selectedRoleDetails.permissions.map((permission: string, index: number) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Chip size="small" label="✓" sx={{ bgcolor: selectedRoleDetails.color }} />
                      </ListItemIcon>
                      <ListItemText primary={permission} />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowRoleDetails(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Security Footer */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'grey.500' }}>
            🔒 All admin activities are logged and monitored for security purposes
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminPortalPage;
