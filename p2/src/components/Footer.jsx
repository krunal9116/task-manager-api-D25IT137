export default function Footer({ name, contactInfo }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-info">
            <h3 className="footer-title">Let's Connect</h3>
            <p className="footer-description">
              I'm always open to discussing frontend engineering roles, collaborative projects, or mentoring opportunities.
            </p>
          </div>
          <div className="footer-links">
            <a 
              href={`mailto:${contactInfo.email}`} 
              className="footer-link-btn" 
              id="footer-email-btn"
            >
              ✉️ {contactInfo.email}
            </a>
            <div className="footer-socials">
              <a 
                href={contactInfo.github} 
                target="_blank" 
                rel="noreferrer" 
                className="social-icon-link"
                id="footer-github-link"
              >
                GitHub
              </a>
              <a 
                href={contactInfo.linkedin} 
                target="_blank" 
                rel="noreferrer" 
                className="social-icon-link"
                id="footer-linkedin-link"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="copyright-text">
            © {currentYear} {name}. All Rights Reserved. Built with React & Vite.
          </p>
        </div>
      </div>
    </footer>
  );
}
