import React from 'react';
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import ParentDashboard from './ParentDashboard';
import PrincipalDashboard from './PrincipalDashboard';
import GuestDashboard from './GuestDashboard';

import { Box, Typography, Grid, Card, CardContent, useTheme, useMediaQuery } from '@mui/material';
import DashboardStats from '../../components/dashboard/DashboardStats';
import { useAppSelector } from '../../store/hooks';
import { responsivePatterns, animations } from '../../styles/responsive';
import type { RootState } from '../../store/store';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, profile } = useAppSelector((state: RootState) => state.auth);
  
  const userRole = profile?.role || user?.role;

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (!user) {
    return <AdminDashboard />;
  }

  switch (userRole) {
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
    case 'guest':
      return <GuestDashboard />;
    default:
      return <AdminDashboard />;
  }
};

export default Dashboard;
