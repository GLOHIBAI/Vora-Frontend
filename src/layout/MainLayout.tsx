import React from 'react';
import { Box, AppBar, Toolbar, Typography, Container, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', color: 'text.primary' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                fontWeight: 700,
                color: 'primary.main',
                textDecoration: 'none',
                flexGrow: 1,
              }}
            >
              VORA
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button component={RouterLink} to="/" color="inherit">
                Dashboard
              </Button>
              <Button component={RouterLink} to="/settings" color="inherit">
                Settings
              </Button>
              <Button variant="contained" disableElevation>
                Connect Wallet
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, py: 4, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>

      <Box component="footer" sx={{ py: 3, borderTop: '1px solid', borderColor: 'divider', mt: 'auto' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Vora Scaling Project. Built for performance.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
