import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthPage } from './pages/auth/AuthPage';
import { LandingPage } from './pages/public/LandingPage';
import { HallListingPage } from './pages/public/HallListingPage';
import { HallDetailsPage } from './pages/public/HallDetailsPage';
import { PublicLayout } from './components/layout/PublicLayout';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <div className="app-layout">
        <Routes>
          {/* Public Routes with Navbar & Footer */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/halls" element={<HallListingPage />} />
            <Route path="/halls/:id" element={<HallDetailsPage />} />
            <Route path="/auth" element={<AuthPage />} />
          </Route>

          {/* Placeholder for Dashboard - will be protected later */}
          <Route path="/dashboard" element={
            <div className="container" style={{ padding: '2rem' }}>
              <h1>Dashboard Placeholder</h1>
              <p>You are logged in!</p>
            </div>
          } />
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
