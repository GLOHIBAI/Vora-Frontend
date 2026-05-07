import React from 'react';
import { Typography, Grid, Paper, Box, Button, Stack } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SpeedIcon from '@mui/icons-material/Speed';
import AutorenewIcon from '@mui/icons-material/Autorenew';

const Dashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h1" gutterBottom>
        Project Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Welcome to the Vora Scaling Project. This architecture is designed for high reusability and minimal performance overhead.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <SpeedIcon color="primary" />
              <Typography variant="h6">Performance</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Optimized with MUI components and Tailwind utility classes for rapid, lag-free development.
            </Typography>
            <Button variant="outlined" size="small" sx={{ mt: 'auto' }}>
              View Metrics
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <AutorenewIcon color="secondary" />
              <Typography variant="h6">Reusability</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Atomic components in src/components ensure consistency and fast scaling across the project.
            </Typography>
            <Button variant="outlined" color="secondary" size="small" sx={{ mt: 'auto' }}>
              Explore Library
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <DashboardIcon color="action" />
              <Typography variant="h6">Structure</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Clean directory structure separating hooks, layouts, and page-level logic.
            </Typography>
            <Button variant="outlined" color="inherit" size="small" sx={{ mt: 'auto' }}>
              Docs
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
