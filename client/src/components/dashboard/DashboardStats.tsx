import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  TrendingUp,
  People,
  School,
  Assignment,
  Grade,
} from '@mui/icons-material';
import { responsivePatterns, animations } from '../../styles/responsive';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card
      sx={{
        ...responsivePatterns.cardBase,
        height: '100%',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
        ...animations.slideInUp,
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: color,
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
            }}
          >
            {icon}
          </Avatar>
          {trend && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: trend.isPositive ? 'success.main' : 'error.main',
              }}
            >
              <TrendingUp
                sx={{
                  fontSize: 16,
                  transform: trend.isPositive ? 'none' : 'rotate(180deg)',
                }}
              />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {trend.value}%
              </Typography>
            </Box>
          )}
        </Box>

        <Typography
          variant="h4"
          component="div"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '2rem' },
            mb: 1,
            color: 'text.primary',
          }}
        >
          {value}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            fontWeight: 500,
          }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

interface DashboardStatsProps {
  stats?: {
    totalStudents?: number;
    totalTeachers?: number;
    totalClasses?: number;
    totalAssignments?: number;
    averageGrade?: number;
  };
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const theme = useTheme();

  const defaultStats = {
    totalStudents: stats?.totalStudents || 1250,
    totalTeachers: stats?.totalTeachers || 85,
    totalClasses: stats?.totalClasses || 42,
    totalAssignments: stats?.totalAssignments || 156,
    averageGrade: stats?.averageGrade || 87.5,
  };

  const statCards: StatCardProps[] = [
    {
      title: 'Total Students',
      value: defaultStats.totalStudents.toLocaleString(),
      icon: <People sx={{ fontSize: { xs: 20, sm: 24 } }} />,
      color: theme.palette.primary.main,
      trend: { value: 12, isPositive: true },
    },
    {
      title: 'Total Teachers',
      value: defaultStats.totalTeachers,
      icon: <School sx={{ fontSize: { xs: 20, sm: 24 } }} />,
      color: theme.palette.secondary.main,
      trend: { value: 5, isPositive: true },
    },
    {
      title: 'Active Classes',
      value: defaultStats.totalClasses,
      icon: <Assignment sx={{ fontSize: { xs: 20, sm: 24 } }} />,
      color: theme.palette.success.main,
      trend: { value: 8, isPositive: true },
    },
    {
      title: 'Assignments',
      value: defaultStats.totalAssignments,
      icon: <Assignment sx={{ fontSize: { xs: 20, sm: 24 } }} />,
      color: theme.palette.warning.main,
      trend: { value: 3, isPositive: false },
    },
    {
      title: 'Average Grade',
      value: `${defaultStats.averageGrade}%`,
      icon: <Grade sx={{ fontSize: { xs: 20, sm: 24 } }} />,
      color: theme.palette.info.main,
      trend: { value: 2, isPositive: true },
    },
  ];

  return (
    <Box sx={{ mb: { xs: 3, sm: 4 } }}>
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{
          fontWeight: 600,
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
          mb: { xs: 2, sm: 3 },
        }}
      >
        Overview
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={2.4} key={stat.title}>
            <Box sx={{ ...animations.fadeIn, animationDelay: `${index * 0.1}s` }}>
              <StatCard {...stat} />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardStats;
