import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  useTheme,
  IconButton,
} from '@mui/material';
import { School, Brightness4, Brightness7 } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleTheme } from '../../store/slices/uiSlice';

interface RoleSelectionLayoutProps {
  children: React.ReactNode;
}

const RoleSelectionLayout: React.FC<RoleSelectionLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { theme: currentTheme } = useAppSelector((state) => state.ui);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
      }}
    >
      {/* Theme Toggle */}
      <IconButton
        onClick={() => dispatch(toggleTheme())}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          color: 'white',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
        }}
      >
        {currentTheme === 'dark' ? <Brightness7 /> : <Brightness4 />}
      </IconButton>

      <Container 
        maxWidth={false}
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, sm: 3, md: 4, lg: 6 },
          py: { xs: 2, sm: 3, md: 4 },
          maxWidth: { xs: '100%', sm: '600px', md: '800px', lg: '1000px', xl: '1200px' },
          mx: 'auto',
        }}
      >
        <Paper
          elevation={24}
          sx={{
            p: { xs: 3, sm: 4, md: 6, lg: 8 },
            borderRadius: { xs: 2, sm: 3, md: 4 },
            background: theme.palette.mode === 'dark' 
              ? 'rgba(18, 18, 18, 0.95)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'}`,
            width: '100%',
            maxWidth: { xs: '100%', sm: '500px', md: '700px', lg: '800px', xl: '900px' },
            mx: 'auto',
            overflow: 'visible',
            position: 'relative',
          }}
        >
          {/* Logo and Title */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: { xs: 4, sm: 5, md: 6 },
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: { xs: 70, sm: 90, md: 100, lg: 110 },
                height: { xs: 70, sm: 90, md: 100, lg: 110 },
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: { xs: 3, sm: 4, md: 5 },
                boxShadow: theme.shadows[8],
              }}
            >
              <School
                sx={{
                  fontSize: { xs: 36, sm: 45, md: 50, lg: 55 },
                  color: 'white',
                }}
              />
            </Box>

            <Typography
              variant="h3"
              component="h1"
              align="center"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem', lg: '3.25rem' },
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: { xs: 1, sm: 2 },
                lineHeight: 1.2,
              }}
            >
              Campus
            </Typography>

            <Typography
              variant="h6"
              align="center"
              color="text.secondary"
              sx={{
                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                fontWeight: 500,
                maxWidth: { xs: '100%', sm: '400px', md: '500px' },
                lineHeight: 1.5,
              }}
            >
              Complete School Management System
            </Typography>
          </Box>

          {/* Content */}
          {children}

          {/* Footer */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © 2024 Campus. All rights reserved.
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Powered by FlowPlatform
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RoleSelectionLayout;
