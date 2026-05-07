import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from './layout/MainLayout'
import { CircularProgress, Box } from '@mui/material'

// Lazy load pages for performance
const Dashboard = lazy(() => import('./pages/Dashboard'))

const App = () => {
  return (
    <MainLayout>
      <Suspense fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      }>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/settings" element={<div>Settings Page (Coming Soon)</div>} />
          {/* Add more routes here */}
        </Routes>
      </Suspense>
    </MainLayout>
  )
}

export default App