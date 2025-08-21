import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material';
import {
  Public,
  ArrowBack,
  School,
  Event,
  Announcement,
  Photo,
  CheckCircle,
  Visibility,
  Schedule,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { guestLogin, clearError } from '../../store/slices/authSlice';

// Mock demo schools - Cameroon focused
const demoSchools = [
  {
    id: 'CAMPUS_DEMO',
    code: 'CAMPUS_DEMO',
    name: 'École Campus Démonstration',
    location: 'Douala, Cameroun',
    type: 'Maternelle - Secondaire',
    students: 850,
    image: '/images/demo-school-1.jpg',
  },
  {
    id: 'EXCELLENCE_ACADEMY',
    code: 'EXCELLENCE_ACADEMY',
    name: 'Collège Excellence Yaoundé',
    location: 'Yaoundé, Cameroun',
    type: 'Primaire & Secondaire',
    students: 650,
    image: '/images/demo-school-2.jpg',
  },
  {
    id: 'BILINGUE_LYCEE',
    code: 'BILINGUE_LYCEE',
    name: 'Lycée Bilingue de Douala',
    location: 'Douala, Cameroun',
    type: 'Secondaire Bilingue',
    students: 920,
    image: '/images/demo-school-3.jpg',
  },
];

const guestFeatures = [
  { icon: <School />, text: 'Browse school information and facilities' },
  { icon: <Event />, text: 'View upcoming events and calendar' },
  { icon: <Announcement />, text: 'Read public announcements' },
  { icon: <Photo />, text: 'Explore school gallery and achievements' },
  { icon: <Visibility />, text: 'Preview dashboard features' },
  { icon: <Schedule />, text: 'See sample timetables and schedules' },
];

const GuestLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);

  const handleGuestLogin = (schoolId?: string) => {
    dispatch(guestLogin(schoolId || ''));
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard/guest');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  return (
    <Box sx={{ minHeight: '100vh', py: 4, bgcolor: 'grey.50' }}>
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', px: 2 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/auth/role-selection')}
            sx={{ mb: 2, alignSelf: 'flex-start' }}
          >
            Back to Role Selection
          </Button>
          
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: 'info.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <Public />
            Guest Access
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Explore our school management system with demo data
          </Typography>
          <Chip 
            label="No registration required" 
            color="success" 
            sx={{ fontSize: '0.9rem', py: 1 }}
          />
        </Box>

        {/* Limited-access banner */}
        <Alert severity="warning" sx={{ mb: 3 }}>
          You are accessing a demo with limited features. Actions are read-only and may reset periodically.
        </Alert>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }} onClose={() => dispatch(clearError())}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Demo Schools */}
          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Choose a Demo School to Explore
            </Typography>
            
            <Grid container spacing={3}>
              {demoSchools.map((school) => (
                <Grid item xs={12} sm={6} key={school.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: selectedSchool === school.id ? '2px solid' : '2px solid transparent',
                      borderColor: selectedSchool === school.id ? 'info.main' : 'transparent',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                    onClick={() => setSelectedSchool(school.id)}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            width: 50,
                            height: 50,
                            bgcolor: 'info.main',
                            mr: 2,
                          }}
                        >
                          <School />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {school.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {school.location}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {school.type}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {school.students.toLocaleString()} Students
                      </Typography>
                      
                      {selectedSchool === school.id && (
                        <Chip
                          icon={<CheckCircle />}
                          label="Selected"
                          color="info"
                          size="small"
                          sx={{ mt: 2 }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Quick Access Button */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => handleGuestLogin(selectedSchool || undefined)}
                disabled={loading}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  bgcolor: 'info.main',
                  '&:hover': {
                    bgcolor: 'info.dark',
                  },
                }}
              >
                {loading ? 'Accessing Demo...' : 'Continue as Guest'}
              </Button>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {selectedSchool ? 'Explore the selected school' : 'Or continue with general demo'}
              </Typography>
            </Box>
          </Grid>

          {/* Features Preview */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: 'fit-content', position: 'sticky', top: 20 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  What You Can Explore
                </Typography>
                
                <List dense>
                  {guestFeatures.map((feature, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 40, color: 'info.main' }}>
                        {feature.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={feature.text}
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: { lineHeight: 1.4 }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>

                <Alert severity="info" sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    <strong>Demo Mode:</strong> All data shown is sample data for demonstration purposes only.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Benefits Section */}
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Why Choose Campus School Management?
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  🚀 Easy to Use
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Intuitive interface designed for schools of all sizes
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'secondary.main' }}>
                  🔒 Secure & Reliable
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enterprise-grade security with 99.9% uptime guarantee
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'success.main' }}>
                  📱 Mobile Ready
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Access from anywhere on any device
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default GuestLoginPage;
