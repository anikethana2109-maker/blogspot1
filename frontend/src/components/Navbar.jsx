import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Menu, X, Sun, Moon, PenLine, LogOut, User, Settings, Home, LogIn
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

  const isActive = (path) => location.pathname === path ? 'navbar-link active' : 'navbar-link';

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">Luminex</Link>

        <button
          className="navbar-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className={`navbar-nav ${mobileOpen ? 'open' : ''}`}>
          <Link to="/" className={isActive('/')}>
            <Home size={15} style={{ display:'inline', marginRight:'0.3rem', verticalAlign:'middle' }} />
            Home
          </Link>

          {user && (
            <Link to="/create" className={isActive('/create')}>
              <PenLine size={15} style={{ display:'inline', marginRight:'0.3rem', verticalAlign:'middle' }} />
              Write
            </Link>
          )}

          {!user ? (
            <>
              <Link to="/login" className={isActive('/login')}>
                <LogIn size={15} style={{ display:'inline', marginRight:'0.3rem', verticalAlign:'middle' }} />
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          ) : (
            <div className="navbar-user-menu" ref={dropdownRef}>
              <div
                className="navbar-avatar"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                title={user.name}
              >
                {getInitial(user.name)}
              </div>

              {dropdownOpen && (
                <div className="navbar-dropdown">
                  <div style={{ padding: '0.5rem 0.875rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.25rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                  </div>
                  <Link to={`/profile/${user.id}`} className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <User size={14} style={{ display:'inline', marginRight:'0.45rem', verticalAlign:'middle' }} />
                    Profile
                  </Link>
                  <Link to="/create" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <PenLine size={14} style={{ display:'inline', marginRight:'0.45rem', verticalAlign:'middle' }} />
                    Write Post
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <Settings size={14} style={{ display:'inline', marginRight:'0.45rem', verticalAlign:'middle' }} />
                      Admin Dashboard
                    </Link>
                  )}
                  <div className="navbar-dropdown-divider" />
                  <button className="navbar-dropdown-item" onClick={handleLogout} style={{ color: 'var(--color-error)' }}>
                    <LogOut size={14} style={{ display:'inline', marginRight:'0.45rem', verticalAlign:'middle' }} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Theme toggle button */}
          <button
            className="navbar-theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
