import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useEffect } from 'react';
import { useAppDispatch } from './store/hooks';
import { initializeAuth } from './store/slices/supabaseAuthSlice';

// Layouts and route guards
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import AuthLayout from './components/layout/AuthLayout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import RoleSelectionPage from './pages/auth/RoleSelectionPage';
import StudentLoginPage from './pages/auth/StudentLoginPage';
import ParentLoginPage from './pages/auth/ParentLoginPage';
import SchoolLoginPage from './pages/auth/SchoolLoginPage';
import GuestLoginPage from './pages/auth/GuestLoginPage';
import AdminPortalPage from './pages/admin/AdminPortalPage';
import MagicLogin from './pages/admin/MagicLogin';
import StudentRegisterPage from './pages/auth/StudentRegisterPage';
import ParentRegisterPage from './pages/auth/ParentRegisterPage';
import SchoolStaffRegisterPage from './pages/auth/SchoolStaffRegisterPage';
import SchoolCreationWizard from './pages/auth/SchoolCreationWizard';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import OtpLoginPage from './pages/auth/OtpLoginPage';

// Core pages (wrappers for full pages already created)
import Dashboard from './pages/dashboard/Dashboard';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import ParentDashboard from './pages/dashboard/ParentDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import PrincipalDashboard from './pages/dashboard/PrincipalDashboard';
import ResponsiveDashboard from './components/layout/ResponsiveDashboard';
import GuestDashboard from './pages/dashboard/GuestDashboard';
import Teachers from './pages/teachers/Teachers';
import Classes from './pages/classes/Classes';
import Attendance from './pages/attendance/Attendance';
import Grades from './pages/grades/Grades';
import Fees from './pages/fees/Fees';
import Students from './pages/students/Students';
import Subjects from './pages/subjects/Subjects';
import Announcements from './pages/announcements/Announcements';
import Events from './pages/events/Events';
import Messages from './pages/messages/Messages';
import Profile from './pages/profile/Profile';
import Reports from './pages/reports/Reports';
import Settings from './pages/settings/Settings';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize Supabase auth on app start
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Routes>
        {/* Public auth routes */}
        <Route element={<AuthLayout />}> 
          <Route path="/auth/role-selection" element={<RoleSelectionPage />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/login/student" element={<StudentLoginPage />} />
          <Route path="/auth/login/parent" element={<ParentLoginPage />} />
          <Route path="/auth/login/school" element={<SchoolLoginPage />} />
          <Route path="/auth/login/guest" element={<GuestLoginPage />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/register/student" element={<StudentRegisterPage />} />
          <Route path="/auth/register/parent" element={<ParentRegisterPage />} />
          <Route path="/auth/register/school" element={<SchoolStaffRegisterPage />} />
          <Route path="/auth/register/school/create" element={<SchoolCreationWizard />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/otp-login" element={<OtpLoginPage />} />
        </Route>

        {/* Admin Portal - Separate from main auth layout */}
        <Route path="/admin/portal" element={<AdminPortalPage />} />
        <Route path="/admin/magic-login" element={<MagicLogin />} />

        {/* Protected app routes */}
        <Route element={<ProtectedRoute><ResponsiveDashboard /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/dashboard/parent" element={<ParentDashboard />} />
          <Route path="/dashboard/guest" element={<GuestDashboard />} />
          <Route path="/dashboard/school" element={<PrincipalDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/students" element={<Dashboard />} />
          <Route path="/schools" element={<Dashboard />} />
          <Route path="/assignments" element={<Dashboard />} />
          <Route path="/grades" element={<Dashboard />} />
          <Route path="/settings" element={<Dashboard />} />
        </Route>

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/fees" element={<Fees />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/events" element={<Events />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Root and fallback */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Box>
  );
}

export default App;
