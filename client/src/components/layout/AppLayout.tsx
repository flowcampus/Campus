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
  ListItemButton,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useTheme,
  useMediaQuery,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  School,
  People,
  Class,
  Assignment,
  Grade,
  Payment,
  Announcement,
  Event,
  Message,
  Notifications,
  Settings,
  Logout,
  AccountCircle,
  ChevronLeft,
  Home,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { toggleSidebar, toggleTheme } from '../../store/slices/uiSlice';

const drawerWidth = 280;

interface NavItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  roles?: string[];
  badge?: number;
}

const AppLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const { user, profile } = useAppSelector((state) => state.auth);
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const { unreadCount } = useAppSelector((state) => state.notifications);
  const { unreadCount: messageCount } = useAppSelector((state) => state.messages);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Navigation items based on user role
  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    ];

    const userRole = profile?.role || user?.role;
    
    if (userRole === 'admin' || userRole === 'principal' || userRole === 'school_admin') {
      baseItems.push(
        { text: 'Schools', icon: <School />, path: '/schools' },
        { text: 'Students', icon: <People />, path: '/students' },
        { text: 'Teachers', icon: <People />, path: '/teachers' },
        { text: 'Classes', icon: <Class />, path: '/classes' },
        { text: 'Attendance', icon: <Assignment />, path: '/attendance' },
        { text: 'Grades', icon: <Grade />, path: '/grades' },
        { text: 'Fees', icon: <Payment />, path: '/fees' },
        { text: 'Announcements', icon: <Announcement />, path: '/announcements' },
        { text: 'Events', icon: <Event />, path: '/events' },
      );
    } else if (userRole === 'teacher') {
      baseItems.push(
        { text: 'My Classes', icon: <Class />, path: '/classes' },
        { text: 'Attendance', icon: <Assignment />, path: '/attendance' },
        { text: 'Grades', icon: <Grade />, path: '/grades' },
        { text: 'Students', icon: <People />, path: '/students' },
      );
    } else if (userRole === 'student') {
      baseItems.push(
        { text: 'My Grades', icon: <Grade />, path: '/grades' },
        { text: 'Attendance', icon: <Assignment />, path: '/attendance' },
        { text: 'Fees', icon: <Payment />, path: '/fees' },
        { text: 'Events', icon: <Event />, path: '/events' },
      );
    } else if (userRole === 'parent') {
      baseItems.push(
        { text: 'Children', icon: <People />, path: '/children' },
        { text: 'Grades', icon: <Grade />, path: '/grades' },
        { text: 'Attendance', icon: <Assignment />, path: '/attendance' },
        { text: 'Fees', icon: <Payment />, path: '/fees' },
        { text: 'Events', icon: <Event />, path: '/events' },
      );
    }

    // Common items for all roles
    baseItems.push(
      { text: 'Messages', icon: <Message />, path: '/messages', badge: messageCount },
      { text: 'Notifications', icon: <Notifications />, path: '/notifications', badge: unreadCount },
    );

    return baseItems;
  };

  const handleDrawerToggle = () => {
    dispatch(toggleSidebar());
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout() as any);
    handleProfileMenuClose();
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      dispatch(toggleSidebar());
    }
  };

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [
      { label: 'Home', path: '/dashboard' },
    ];

    pathSegments.forEach((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({ label, path });
    });

    return breadcrumbs;
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <School color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" noWrap component="div" color="primary">
            Campus
          </Typography>
          {!isMobile && (
            <IconButton onClick={handleDrawerToggle} sx={{ ml: 'auto' }}>
              <ChevronLeft />
            </IconButton>
          )}
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {getNavItems().map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname.startsWith(item.path)}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavigation('/settings')}>
            <ListItemIcon>
              <Settings />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { md: sidebarOpen ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }}>
            <Breadcrumbs
              aria-label="breadcrumb"
              sx={{ color: 'inherit' }}
              separator="›"
            >
              {getBreadcrumbs().map((crumb, index) => (
                <Link
                  key={index}
                  color="inherit"
                  href={crumb.path}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(crumb.path);
                  }}
                  sx={{
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  {index === 0 && <Home sx={{ mr: 0.5, fontSize: 16 }} />}
                  {crumb.label}
                </Link>
              ))}
            </Breadcrumbs>
          </Box>

          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar
              src={user?.avatar}
              alt={user?.firstName}
              sx={{ width: 32, height: 32 }}
            >
              {user?.firstName?.charAt(0)}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'persistent'}
          open={sidebarOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>

      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem onClick={() => { handleNavigation('/profile'); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => { dispatch(toggleTheme()); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Toggle Theme
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AppLayout;
