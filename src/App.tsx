import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthPage } from './pages/auth/AuthPage';
import { LandingPage } from './pages/public/LandingPage';
import { HallListingPage } from './pages/public/HallListingPage';
import { HallDetailsPage } from './pages/public/HallDetailsPage';
import { MainLayout } from './components/layout/MainLayout';
import { ProfilePage } from './pages/common/ProfilePage';
import { DashboardPage } from './pages/common/DashboardPage';
import { HallAvailabilityPage } from './pages/owner/HallAvailabilityPage';

import { useEffect } from 'react';
import { useAuthStore } from './context/useAuthStore';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <Toaster position="top-right" />
      <div className="app-layout">
        <Routes>
          {/* Main Layout containing Navbar & Footer for all routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/halls" element={<HallListingPage />} />
            <Route path="/halls/:id" element={<HallDetailsPage />} />
            <Route path="/auth" element={<AuthPage />} />

            // ...

            // Inside Routes:
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/owner/hall/:hallId/availability" element={<HallAvailabilityPage />} />
            {/* Redirect legacy specific routes to dashboard if needed, or just remove them. Removing them for cleaner URL enforcement. */}
          </Route>
        </Routes>
      </div>

      <style>{`
        .app-layout {
          min-height: 100vh;
          background-color: var(--color-background);
        }
      `}</style>
    </Router>
  )
}

export default App
