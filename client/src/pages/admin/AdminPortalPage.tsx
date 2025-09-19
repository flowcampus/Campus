import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  MenuItem,
} from '@mui/material';
import {
  AdminPanelSettings,
  Visibility,
  VisibilityOff,
  Security,
  VpnKey,
  SupervisorAccount,
  Shield,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { adminLogin, generateMagicLink, clearError } from '../../store/slices/authSlice';

const validationSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password should be minimum 6 characters').required('Password is required'),
  adminKey: yup.string().optional(),
  adminRole: yup.string().required('Admin role is required'),
});

const adminRoles = [
  { value: 'super_admin', label: '🔥 Super Administrator', description: 'Full system access' },
  { value: 'support_admin', label: '🛠️ Support Administrator', description: 'Customer support and troubleshooting' },
  { value: 'sales_admin', label: '💼 Sales Administrator', description: 'Sales and subscription management' },
  { value: 'content_admin', label: '📝 Content Administrator', description: 'Content and curriculum management' },
  { value: 'finance_admin', label: '💰 Finance Administrator', description: 'Financial operations and reporting' },
];

const AdminPortalPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [magicLinkRole, setMagicLinkRole] = useState('');
  const [magicLinkGenerated, setMagicLinkGenerated] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      adminKey: '',
      adminRole: '',
    },
    validationSchema,
    onSubmit: (values) => {
      dispatch(adminLogin(values));
    },
  });

  const handleGenerateMagicLink = async () => {
    if (!magicLinkEmail || !magicLinkRole) return;
    
    try {
      await dispatch(generateMagicLink({ 
        email: magicLinkEmail, 
        adminRole: magicLinkRole 
      })).unwrap();
      setMagicLinkGenerated(true);
    } catch (error) {
      console.error('Failed to generate magic link:', error);
    }
  };

  const securityFeatures = [
    { icon: <Security />, text: 'Multi-factor authentication required' },
    { icon: <VpnKey />, text: 'Encrypted admin key verification' },
    { icon: <Shield />, text: 'IP-based access restrictions' },
    { icon: <SupervisorAccount />, text: 'Role-based permission system' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 500 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/auth/role-selection')}
            sx={{ 
              mb: 2, 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            Back to Login
          </Button>
          
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              backdropFilter: 'blur(10px)',
            }}
          >
            <AdminPanelSettings sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: 'white',
              mb: 1,
            }}
          >
            Admin Portal
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Secure administrative access to Campus system
          </Typography>
        </Box>

        <Card elevation={24} sx={{ borderRadius: 3, overflow: 'visible' }}>
          <CardContent sx={{ p: 4 }}>
            {/* Security Notice */}
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Restricted Access:</strong> This portal is for authorized administrators only. 
                All access attempts are logged and monitored.
              </Typography>
            </Alert>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={formik.handleSubmit}>
              <TextField
                fullWidth
                name="email"
                label="Administrator Email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AdminPanelSettings color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                select
                name="adminRole"
                label="Administrator Role"
                value={formik.values.adminRole}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.adminRole && Boolean(formik.errors.adminRole)}
                helperText={formik.touched.adminRole && formik.errors.adminRole}
                sx={{ mb: 3 }}
              >
                {adminRoles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    <Box>
                      <Typography variant="body1">{role.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {role.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VpnKey color="action" />
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
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                name="adminKey"
                label="Admin Key (Optional)"
                value={formik.values.adminKey}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.adminKey && Boolean(formik.errors.adminKey)}
                helperText={formik.touched.adminKey && formik.errors.adminKey || "Required for super admin access"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Security color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 4 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                  },
                }}
              >
                {loading ? 'Authenticating...' : 'Access Admin Portal'}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Chip label="OR" size="small" />
            </Divider>

            {/* Magic Link Section */}
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => setShowMagicLink(!showMagicLink)}
                sx={{ mb: 2 }}
              >
                Generate Magic Link
              </Button>
              
              {showMagicLink && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Generate secure magic link for admin access
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Admin Email"
                        value={magicLinkEmail}
                        onChange={(e) => setMagicLinkEmail(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        size="small"
                        label="Role"
                        value={magicLinkRole}
                        onChange={(e) => setMagicLinkRole(e.target.value)}
                      >
                        {adminRoles.map((role) => (
                          <MenuItem key={role.value} value={role.value}>
                            {role.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </Grid>
                  
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleGenerateMagicLink}
                    disabled={!magicLinkEmail || !magicLinkRole || loading}
                  >
                    Generate Link
                  </Button>
                  
                  {magicLinkGenerated && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      Magic link sent to {magicLinkEmail}
                    </Alert>
                  )}
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Security Features */}
        <Card sx={{ mt: 3, bgcolor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 600 }}>
              Security Features
            </Typography>
            <List dense>
              {securityFeatures.map((feature, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                    {feature.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={feature.text}
                    primaryTypographyProps={{
                      color: 'white',
                      variant: 'body2',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Campus Admin Portal v1.0.0 • Secure Access
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminPortalPage;