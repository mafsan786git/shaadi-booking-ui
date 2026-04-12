import { useLocation } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export const Footer = () => {
    const location = useLocation();

    // Hide footer on authentication pages to keep a clean form UI
    if (location.pathname.startsWith('/auth')) {
        return null;
    }

    return (
        <footer className="footer">
            <div className="container footer-content">
                <div className="footer-contact">
                    <div className="contact-item">
                        <MapPin size={18} />
                        <span>123 Wedding Venue Street, Celebration City, IN 400001</span>
                    </div>
                    <div className="contact-item">
                        <Phone size={18} />
                        <span>+91 98765 43210</span>
                    </div>
                    <div className="contact-item">
                        <Mail size={18} />
                        <span>support@shaadibooking.com</span>
                    </div>
                    <div className="contact-item">
                        <Clock size={18} />
                        <span>Mon - Sat: 9:00 AM - 8:00 PM</span>
                    </div>
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
          padding-top: 2.5rem;
          margin-top: auto; /* Push to bottom */
        }
        .footer-content {
          padding-bottom: 2rem;
        }
        .footer-contact {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          row-gap: 1.5rem;
          column-gap: 2rem;
          width: 100%;
        }
        .contact-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          color: var(--color-text-muted);
          font-size: 0.95rem;
          line-height: 1.5;
          transition: color 0.2s ease, transform 0.2s ease;
          cursor: default;
        }
        .contact-item:hover {
          color: var(--color-text-main);
          transform: translateY(-1px);
        }
        .contact-item svg {
          color: var(--color-primary);
          flex-shrink: 0;
          margin-top: 0.15rem; /* Optical alignment with text */
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
