import { Link } from 'react-router-dom';
import { Sparkles, Github, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">Luminex</div>
            <p className="footer-tagline">A modern platform for sharing ideas, stories, and insights.</p>
          </div>
          <div className="footer-links">
            <div className="footer-link-group">
              <span className="footer-link-heading">Explore</span>
              <Link to="/" className="footer-link">Home</Link>
              <Link to="/login" className="footer-link">Login</Link>
              <Link to="/register" className="footer-link">Register</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Luminex Blog. Built with React &amp; Express.</p>
        </div>
      </div>
    </footer>
  );
}
