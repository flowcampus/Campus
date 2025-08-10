import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as StudentIcon,
  SupervisorAccount as ParentIcon,
  Public as GuestIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import RoleSelectionLayout from '../../components/layout/RoleSelectionLayout';

interface Role {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
}

const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [selectedRole, setSelectedRole] = useState<string>('');

  const roleOptions: Role[] = [
    {
      id: 'student',
      title: 'Student',
      description: 'Access your classes, assignments, grades, and school activities',
      icon: <StudentIcon sx={{ fontSize: { xs: 40, sm: 48, md: 56 } }} />,
      color: theme.palette.primary.main,
      path: '/auth/login/student',
    },
    {
      id: 'parent',
      title: 'Parent',
      description: 'Monitor your child\'s progress, communicate with teachers, and stay updated',
      icon: <ParentIcon sx={{ fontSize: { xs: 40, sm: 48, md: 56 } }} />,
      color: theme.palette.secondary.main,
      path: '/auth/login/parent',
    },
    {
      id: 'school',
      title: 'School Staff',
      description: 'Manage students, classes, grades, and school administration',
      icon: <SchoolIcon sx={{ fontSize: { xs: 40, sm: 48, md: 56 } }} />,
      color: theme.palette.success.main,
      path: '/auth/login/school',
    },
    {
      id: 'guest',
      title: 'Guest',
      description: 'Explore our platform with demo data and limited access',
      icon: <GuestIcon sx={{ fontSize: { xs: 40, sm: 48, md: 56 } }} />,
      color: theme.palette.info.main,
      path: '/auth/login/guest',
    },
  ];

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role.id);
    setTimeout(() => {
      navigate(role.path);
    }, 300);
  };

  return (
    <RoleSelectionLayout>
      {/* Welcome Section */}
      <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 5, md: 6 } }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '3.5rem' },
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: { xs: 2, sm: 3 },
              lineHeight: 1.2,
            }}
          >
            Welcome to Campus
          </Typography>
          
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
              fontWeight: 400,
              lineHeight: 1.6,
              maxWidth: { xs: '100%', sm: '500px', md: '600px', lg: '700px' },
              mx: 'auto',
              px: { xs: 2, sm: 3 },
            }}
          >
            Choose your role to access the appropriate features and dashboard
          </Typography>
        </motion.div>
      </Box>

      {/* Role Selection Grid */}
      <Grid 
        container 
        spacing={{ xs: 2, sm: 3, md: 4 }} 
        sx={{ 
          mb: { xs: 4, sm: 5, md: 6 }, 
          justifyContent: 'center',
          maxWidth: { xs: '100%', sm: '600px', md: '800px', lg: '1000px' },
          mx: 'auto',
        }}
      >
        {roleOptions.map((role, index) => (
          <Grid 
            item 
            xs={12} 
            sm={6} 
            md={6} 
            lg={3} 
            key={role.id}
            sx={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              style={{ width: '100%', maxWidth: isMobile ? '100%' : isTablet ? '280px' : '250px' }}
            >
              <Card
                onClick={() => handleRoleSelect(role)}
                sx={{
                  cursor: 'pointer',
                  height: '100%',
                  width: '100%',
                  minHeight: { xs: 200, sm: 220, md: 240, lg: 260 },
                  transition: 'all 0.3s ease-in-out',
                  transform: selectedRole === role.id ? 'scale(1.02)' : 'scale(1)',
                  border: selectedRole === role.id ? `3px solid ${role.color}` : '2px solid transparent',
                  boxShadow: selectedRole === role.id 
                    ? `0 8px 32px ${alpha(role.color, 0.3)}`
                    : theme.shadows[2],
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 16px 48px ${alpha(role.color, 0.25)}`,
                    border: `3px solid ${role.color}`,
                  },
                }}
              >
                <CardContent
                  sx={{
                    textAlign: 'center',
                    p: { xs: 3, sm: 4, md: 5 },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: { xs: 2, sm: 2.5, md: 3 },
                  }}
                >
                  <Box sx={{ color: role.color }}>
                    {role.icon}
                  </Box>
                  
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: '1.25rem', sm: '1.375rem', md: '1.5rem' },
                      color: role.color,
                      lineHeight: 1.3,
                    }}
                  >
                    {role.title}
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.5,
                      fontSize: { xs: '0.875rem', sm: '0.9rem', md: '1rem' },
                      textAlign: 'center',
                      px: { xs: 1, sm: 2 },
                    }}
                  >
                    {role.description}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Registration Section */}
      <Box sx={{ textAlign: 'center', mt: { xs: 4, sm: 5, md: 6 } }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              mb: { xs: 3, sm: 4 },
              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
              fontWeight: 500,
            }}
          >
            Don't have an account yet?
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 3, md: 4 },
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            maxWidth: { xs: '100%', sm: '600px', md: '800px' },
            mx: 'auto',
          }}>
            <Button
              variant="contained"
              onClick={() => navigate('/auth/register/student')}
              sx={{
                minWidth: { xs: '100%', sm: '160px', md: '180px' },
                py: { xs: 1.5, sm: 1.75, md: 2 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              Register as Student
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => navigate('/auth/register/parent')}
              sx={{
                minWidth: { xs: '100%', sm: '160px', md: '180px' },
                py: { xs: 1.5, sm: 1.75, md: 2 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              Register as Parent
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => navigate('/auth/register/school')}
              sx={{
                minWidth: { xs: '100%', sm: '160px', md: '180px' },
                py: { xs: 1.5, sm: 1.75, md: 2 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              Register School
            </Button>
          </Box>
        </motion.div>
      </Box>
    </RoleSelectionLayout>
  );
};

export default RoleSelectionPage;
