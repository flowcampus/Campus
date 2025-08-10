import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import ParentDashboard from './ParentDashboard';
import PrincipalDashboard from './PrincipalDashboard';

import { Box, Typography, Grid, Card, CardContent, useTheme, useMediaQuery } from '@mui/material';
import DashboardStats from '../../components/dashboard/DashboardStats';
import { useAppSelector } from '../../store/hooks';
import { responsivePatterns, animations } from '../../styles/responsive';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAppSelector((state) => state.auth);

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (!user) {
    return <AdminDashboard />;
  }

  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'parent':
      return <ParentDashboard />;
    case 'principal':
      return <PrincipalDashboard />;
    case 'school_admin':
      return <AdminDashboard />;
    case 'super_admin':
      return <AdminDashboard />;
    default:
      return <AdminDashboard />;
  }
};

export default Dashboard;
