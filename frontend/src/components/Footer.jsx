export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-logo">✦ Luminex</div>
        <p>A modern platform for sharing ideas, stories, and insights.</p>
        <p style={{ marginTop: 'var(--space-sm)', opacity: 0.6 }}>
          © {new Date().getFullYear()} Luminex Blog. Built with React & Express.
        </p>
      </div>
    </footer>
  );
}
