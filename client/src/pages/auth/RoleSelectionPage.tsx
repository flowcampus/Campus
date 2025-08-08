import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Container,
  Avatar,
  Fade,
  useTheme,
  alpha,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as StudentIcon,
  FamilyRestroom as ParentIcon,
  Public as GuestIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface RoleOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  route: string;
}

const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roleOptions: RoleOption[] = [
    {
      id: 'student',
      title: '👨‍🎓 Student',
      description: 'Access your classes, assignments, grades, and school activities',
      icon: <StudentIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.main,
      route: '/auth/login/student',
    },
    {
      id: 'parent',
      title: '👨‍👩‍👧 Parent',
      description: 'Monitor your child\'s progress, fees, attendance, and communicate with teachers',
      icon: <ParentIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.secondary.main,
      route: '/auth/login/parent',
    },
    {
      id: 'school',
      title: '🏫 School Staff',
      description: 'Manage school operations, students, teachers, and administrative tasks',
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.success.main,
      route: '/auth/login/school',
    },
    {
      id: 'guest',
      title: '🌍 Guest',
      description: 'Explore demo features and learn about our school management system',
      icon: <GuestIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.info.main,
      route: '/auth/login/guest',
    },
  ];

  const handleRoleSelect = (role: RoleOption) => {
    setSelectedRole(role.id);
    setTimeout(() => {
      navigate(role.route);
    }, 300);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
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
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            Welcome to Campus
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
          >
            Choose your role to access the appropriate features and dashboard
          </Typography>
        </motion.div>
      </Box>

      <Grid container spacing={3} justifyContent="center">
        {roleOptions.map((role, index) => (
          <Grid item xs={12} sm={6} md={3} key={role.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: selectedRole === role.id ? 'scale(0.95)' : 'scale(1)',
                  boxShadow: selectedRole === role.id 
                    ? `0 8px 32px ${alpha(role.color, 0.3)}`
                    : theme.shadows[2],
                  border: selectedRole === role.id 
                    ? `2px solid ${role.color}`
                    : '2px solid transparent',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 40px ${alpha(role.color, 0.2)}`,
                    border: `2px solid ${alpha(role.color, 0.5)}`,
                  },
                }}
                onClick={() => handleRoleSelect(role)}
              >
                <CardContent
                  sx={{
                    textAlign: 'center',
                    p: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 3,
                      bgcolor: alpha(role.color, 0.1),
                      color: role.color,
                      border: `3px solid ${alpha(role.color, 0.2)}`,
                    }}
                  >
                    {role.icon}
                  </Avatar>
                  
                  <Typography
                    variant="h5"
                    component="h2"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      color: role.color,
                      mb: 2,
                    }}
                  >
                    {role.title}
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.6,
                      minHeight: 60,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
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

      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Need help choosing? Contact our support team
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/contact')}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1,
            }}
          >
            Get Help
          </Button>
        </motion.div>
      </Box>
    </Container>
  );
};

export default RoleSelectionPage;
