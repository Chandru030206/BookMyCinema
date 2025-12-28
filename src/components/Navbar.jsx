import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useBooking();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowUserMenu(false);
  }, [location]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <Link to="/" className="nav-logo">
          <i className="fas fa-film"></i>
          <span>BookMyCinema</span>
        </Link>

        <ul className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <li>
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              Home
            </Link>
          </li>
          <li>
            <a href="/#movies" className="nav-link">Movies</a>
          </li>
          <li>
            <a href="/#theaters" className="nav-link">Theaters</a>
          </li>
          <li>
            <Link to="#" className="nav-link">My Bookings</Link>
          </li>
        </ul>

        <div className="nav-actions">
          <div className="nav-search">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {user ? (
            <div className="nav-user-menu">
              <button 
                className="nav-profile"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <i className="fas fa-user"></i>
                <span className="user-name">{user.name?.split(' ')[0]}</span>
              </button>
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <i className="fas fa-user-circle"></i>
                    <div>
                      <span className="name">{user.name}</span>
                      <span className="email">{user.email}</span>
                    </div>
                  </div>
                  <Link to="#" className="dropdown-item">
                    <i className="fas fa-ticket-alt"></i>
                    My Bookings
                  </Link>
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="nav-auth-btn">
              <i className="fas fa-sign-in-alt"></i>
              <span>Login</span>
            </Link>
          )}
          <div 
            className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
