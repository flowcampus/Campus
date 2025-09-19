import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Divider,
  Badge,
  Tooltip,
  Alert,
  Collapse,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Class as ClassIcon,
  Assignment as AssignmentIcon,
  Grade as GradeIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Logout,
  ChevronLeft,
  Home,
  Warning as WarningIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
} from '@mui/icons-material';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { signOut } from '../../store/slices/supabaseAuthSlice';
import { useNotifications } from '../../hooks/useRealtime';
import ErrorBoundary from '../common/ErrorBoundary';
import LoadingSpinner from '../common/LoadingSpinner';

const drawerWidth = 280;
const mobileDrawerWidth = 260;

interface NavItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  roles?: string[];
  badge?: number;
  disabled?: boolean;
}

const ResponsiveDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { user, profile, loading: authLoading } = useAppSelector((state) => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);

  // Real-time notifications
  const { notifications, unreadCount } = useNotifications(user?.id || '');

  // Network status monitoring
  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineAlert(false);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems: NavItem[] = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Schools', icon: <SchoolIcon />, path: '/schools', roles: ['super_admin', 'school_admin'] },
    { text: 'Students', icon: <PeopleIcon />, path: '/students' },
    { text: 'Teachers', icon: <PeopleIcon />, path: '/teachers', roles: ['super_admin', 'school_admin', 'principal'] },
    { text: 'Classes', icon: <ClassIcon />, path: '/classes' },
    { text: 'Attendance', icon: <AssignmentIcon />, path: '/attendance' },
    { text: 'Grades', icon: <GradeIcon />, path: '/grades' },
    { text: 'Fees', icon: <AssignmentIcon />, path: '/fees', roles: ['super_admin', 'school_admin', 'teacher'] },
    { text: 'Announcements', icon: <NotificationsIcon />, path: '/announcements' },
    { text: 'Events', icon: <AssignmentIcon />, path: '/events' },
    { text: 'Messages', icon: <AssignmentIcon />, path: '/messages' },
    { text: 'Reports', icon: <AssignmentIcon />, path: '/reports', roles: ['super_admin', 'school_admin', 'principal'] },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(profile?.role || '') || item.roles.includes(user?.profile?.role || '')
  );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await dispatch(signOut()).unwrap();
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    handleProfileMenuClose();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Show loading state during auth initialization
  if (authLoading) {
    return (
      <LoadingSpinner message="Initializing Campus..." size="large" fullScreen />
    );
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: 1,
          borderColor: 'divider',
          minHeight: 64,
        }}
      >
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: { xs: 32, sm: 40 },
            height: { xs: 32, sm: 40 },
          }}
        >
          <SchoolIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
        </Avatar>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1rem', sm: '1.25rem' },
            color: 'primary.main',
          }}
        >
          Campus
        </Typography>
      </Box>

      {/* Navigation Items */}
      <List sx={{ flex: 1, py: 1 }}>
        {filteredNavItems.map((item) => (
          <ListItem
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            sx={{
              cursor: 'pointer',
              mx: 1,
              borderRadius: 1,
              mb: 0.5,
              minHeight: { xs: 44, sm: 48 },
              opacity: item.disabled ? 0.5 : 1,
              pointerEvents: item.disabled ? 'none' : 'auto',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: { xs: 40, sm: 56 } }}>
              {item.badge ? (
                <Badge badgeContent={item.badge} color="error">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontSize: { xs: '0.875rem', sm: '1rem' },
                fontWeight: 500,
              }}
            />
          </ListItem>
        ))}
      </List>

      {/* User Info Section */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        {/* Network Status */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 2,
            p: 1,
            borderRadius: 1,
            bgcolor: isOnline ? 'success.light' : 'error.light',
            color: isOnline ? 'success.contrastText' : 'error.contrastText',
          }}
        >
          {isOnline ? <WifiIcon fontSize="small" /> : <WifiOffIcon fontSize="small" />}
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {isOnline ? 'Online' : 'Offline'}
          </Typography>
        </Box>
        
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 1,
            borderRadius: 1,
            bgcolor: 'action.hover',
          }}
        >
          <Avatar
            sx={{
              width: { xs: 32, sm: 40 },
              height: { xs: 32, sm: 40 },
              bgcolor: 'secondary.main',
            }}
          >
            {profile?.first_name?.[0]}{profile?.last_name?.[0]}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {profile?.first_name} {profile?.last_name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.625rem', sm: '0.75rem' },
                textTransform: 'capitalize',
              }}
            >
              {profile?.role}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <ErrorBoundary>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Offline Alert */}
        <Collapse in={showOfflineAlert}>
          <Alert
            severity="warning"
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 9999,
              borderRadius: 0,
            }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => setShowOfflineAlert(false)}
              >
                Dismiss
              </Button>
            }
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WifiOffIcon />
              You're currently offline. Some features may be limited.
            </Box>
          </Alert>
        </Collapse>

      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 56, sm: 64 },
            px: { xs: 2, sm: 3 },
          }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              fontWeight: 600,
            }}
          >
            {profile?.school_id ? `${profile.schools?.name || 'School'} Dashboard` : 'Campus Dashboard'}
          </Typography>

          {/* Network Status Indicator */}
          <Tooltip title={isOnline ? 'Connected' : 'Offline'}>
            <IconButton color="inherit" sx={{ mr: 1 }}>
              {isOnline ? (
                <WifiIcon color="success" />
              ) : (
                <WifiOffIcon color="error" />
              )}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" sx={{ mr: 1 }}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Profile Menu */}
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleProfileMenuOpen}
              color="inherit"
              sx={{ p: 0.5 }}
            >
              <Avatar
                sx={{
                  width: { xs: 32, sm: 40 },
                  height: { xs: 32, sm: 40 },
                  bgcolor: 'primary.main',
                }}
                src={profile?.avatar_url}
              >
                {profile?.first_name?.[0]}{profile?.last_name?.[0]}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 200,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {profile?.first_name} {profile?.last_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {profile?.email}
          </Typography>
        </Box>
        <MenuItem onClick={() => navigate('/profile')}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => navigate('/settings')}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{
          width: { md: drawerWidth },
          flexShrink: { md: 0 },
        }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: mobileDrawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: 1,
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }} />
        
        {/* Offline Warning */}
        {!isOnline && (
          <Alert
            severity="warning"
            sx={{ m: 2, mb: 0 }}
            icon={<WifiOffIcon />}
          >
            You're currently offline. Some features may not work properly.
          </Alert>
        )}
        
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            maxWidth: '100%',
          }}
        >
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </Box>
      </Box>
    </Box>
    </ErrorBoundary>
  );
};

export default ResponsiveDashboard;
