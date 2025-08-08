import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import ParentDashboard from './ParentDashboard';
import PrincipalDashboard from './PrincipalDashboard';

const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

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
