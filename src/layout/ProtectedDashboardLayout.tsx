import React from 'react';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import DashboardLayout from './DashboardLayout';

interface ProtectedDashboardLayoutProps {
  children: React.ReactNode;
}

/** Dashboard shell — only accessible when logged in. */
const ProtectedDashboardLayout: React.FC<ProtectedDashboardLayoutProps> = ({ children }) => (
  <ProtectedRoute>
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

export default ProtectedDashboardLayout;
