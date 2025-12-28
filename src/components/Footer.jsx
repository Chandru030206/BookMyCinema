import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <i className="fas fa-film"></i>
              <span>BookMyCinema</span>
            </div>
            <p className="footer-description">
              Your ultimate destination for booking movie tickets. Experience the magic of cinema with the best seats at the best prices.
            </p>
            <div className="social-links">
              <a href="#" className="social-link"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="social-link"><i className="fab fa-twitter"></i></a>
              <a href="#" className="social-link"><i className="fab fa-instagram"></i></a>
              <a href="#" className="social-link"><i className="fab fa-youtube"></i></a>
            </div>
          </div>

          <div className="footer-column">
            <h4>Quick Links</h4>
            <div className="footer-links">
              <Link to="#">About Us</Link>
              <Link to="#">Contact</Link>
              <Link to="#">FAQs</Link>
              <Link to="#">Terms of Service</Link>
              <Link to="#">Privacy Policy</Link>
            </div>
          </div>

          <div className="footer-column">
            <h4>Movies</h4>
            <div className="footer-links">
              <Link to="/">Now Showing</Link>
              <Link to="#">Coming Soon</Link>
              <Link to="#">Premieres</Link>
              <Link to="#">Top Rated</Link>
            </div>
          </div>

          <div className="footer-column">
            <h4>Help & Support</h4>
            <div className="footer-links">
              <Link to="#">Customer Care</Link>
              <Link to="#">Refund Policy</Link>
              <Link to="#">Gift Cards</Link>
              <Link to="#">Corporate Booking</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 BookMyCinema. All rights reserved.</p>
          <p>Made with <i className="fas fa-heart" style={{ color: 'var(--primary-color)' }}></i> for movie lovers</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
