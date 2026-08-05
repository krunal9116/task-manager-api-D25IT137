import { useState } from 'react';

export default function Contact({ contactInfo }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [showTooltip, setShowTooltip] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    // Simulate API call success
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 4000);
  };

  const charCount = formData.message.length;
  const maxChars = 500;

  return (
    <section id="contact" className="contact-page-section">
      <div className="section-header">
        <h2 className="section-title">Get In Touch</h2>
        <div className="section-divider"></div>
      </div>

      <div className="contact-layout">
        {/* Contact Form Column */}
        <div className="contact-form-container">
          <div className="form-header">
            <h3>Send a Message</h3>
            <button 
              type="button" 
              className="tooltip-toggle-btn"
              onClick={() => setShowTooltip(!showTooltip)}
              title="Click for contact guidance"
            >
              ❓ Needs help?
            </button>
          </div>

          {/* Visibility-controlled Tooltip Element */}
          {showTooltip && (
            <div className="contact-guidance-tooltip">
              <h4>📬 Message Guidelines</h4>
              <p>Please enter your name, a valid email address, and a detailed description of your project or query. I typically respond within 24-48 business hours.</p>
              <button 
                type="button" 
                className="tooltip-close-btn"
                onClick={() => setShowTooltip(false)}
              >
                Got it
              </button>
            </div>
          )}

          {isSubmitted ? (
            <div className="submission-success-alert">
              <span className="success-icon">✨</span>
              <div className="success-content">
                <h4>Message Sent Successfully!</h4>
                <p>Thank you, {formData.name || 'there'}. I have received your message and will get back to you shortly at {formData.email}.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="form-name">Name</label>
                <input 
                  type="text" 
                  id="form-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your Full Name"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="form-email">Email Address</label>
                <input 
                  type="email" 
                  id="form-email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@company.com"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <div className="label-with-count">
                  <label htmlFor="form-message">Message</label>
                  <span className={`char-counter ${charCount > maxChars ? 'limit-exceeded' : ''}`}>
                    {charCount} / {maxChars} characters
                  </span>
                </div>
                <textarea 
                  id="form-message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Describe your project, ideas, or questions here..."
                  required
                  maxLength={maxChars}
                  rows={5}
                  className="form-textarea"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary submit-btn"
                disabled={charCount > maxChars || !formData.name || !formData.email || !formData.message}
              >
                Send Message ⚡
              </button>
            </form>
          )}
        </div>

        {/* Real-time Live Preview Column */}
        <div className="contact-preview-container">
          <h3>Live Preview</h3>
          <p className="preview-instructions">Watch your message compile in real time below.</p>
          
          <div className="preview-card">
            <div className="preview-card-header">
              <span className="preview-badge">Live Compilation</span>
              <span className="preview-indicator-dot"></span>
            </div>
            
            <div className="preview-card-body">
              <div className="preview-field">
                <span className="preview-label">SENDER:</span>
                <span className="preview-value">
                  {formData.name ? formData.name : <span className="preview-placeholder">Awaiting input...</span>}
                </span>
              </div>

              <div className="preview-field">
                <span className="preview-label">REPLY-TO:</span>
                <span className="preview-value">
                  {formData.email ? formData.email : <span className="preview-placeholder">Awaiting input...</span>}
                </span>
              </div>

              <div className="preview-field message-field">
                <span className="preview-label">TRANSMISSION:</span>
                <div className="preview-message-body">
                  {formData.message ? formData.message : <span className="preview-placeholder">Start typing your message to see it render here...</span>}
                </div>
              </div>
            </div>
            
            <div className="preview-card-footer">
              <span>STATUS: READY TO SEND</span>
              <span>CHARS: {charCount}</span>
            </div>
          </div>

          <div className="quick-connect-info">
            <h4>Alternative Channels</h4>
            <p>If you prefer direct communication, you can write directly to:</p>
            <a href={`mailto:${contactInfo.email}`} className="direct-email-link">
              ✉️ {contactInfo.email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
