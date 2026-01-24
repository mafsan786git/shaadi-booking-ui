import { Link } from 'react-router-dom';

export const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer-content">
                <div className="footer-section">
                    <h3 className="footer-brand">ShaadiBooking</h3>
                    <p className="footer-desc">
                        Find the perfect venue for your special day.
                        Directly connect with hall owners.
                    </p>
                </div>

                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <div className="footer-links">
                        <Link to="/">Home</Link>
                        <Link to="/halls">Browse Halls</Link>
                        <Link to="/auth">Login / Register</Link>
                    </div>
                </div>

                <div className="footer-section">
                    <h4>Contact</h4>
                    <p>Support: support@shaadibooking.com</p>
                    <p>Helpline: +91 98765 43210</p>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} ShaadiBooking. All rights reserved.</p>
                </div>
            </div>

            <style>{`
        .footer {
          background-color: var(--color-surface);
          border-top: 1px solid var(--color-border);
          padding-top: 3rem;
          margin-top: auto; /* Push to bottom */
        }
        .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          padding-bottom: 3rem;
        }
        .footer-brand {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-primary);
          margin-bottom: 1rem;
        }
        .footer-desc {
          color: var(--color-text-muted);
          line-height: 1.6;
        }
        .footer-section h4 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--color-text-main);
        }
        .footer-links {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .footer-links a {
          color: var(--color-text-muted);
          transition: color 0.2s;
        }
        .footer-links a:hover {
          color: var(--color-primary);
        }
        .footer-bottom {
          border-top: 1px solid var(--color-border);
          padding: 1.5rem 0;
          text-align: center;
          color: var(--color-text-muted);
          font-size: 0.9rem;
        }
      `}</style>
        </footer>
    );
};
