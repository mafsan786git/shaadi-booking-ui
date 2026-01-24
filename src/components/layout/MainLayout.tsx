import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const MainLayout = () => {
  return (
    <div className="layout-wrapper">
      <Navbar />
      <main className="layout-content">
        <Outlet />
      </main>
      <Footer />

      <style>{`
        .layout-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--color-background);
        }
        .layout-content {
          flex: 1;
        }
      `}</style>
    </div>
  );
};
