import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../api';
import ErrorMessage from './ErrorMessage';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const authFn = isLogin ? loginUser : registerUser;
      const res = await authFn({ email, password });
      
      if (res.success) {
        if (res.token) {
          localStorage.setItem('token', res.token);
          window.location.href = '/tasks';
        } else {
          // Registered successfully, switch to login
          setIsLogin(true);
          setEmail('');
          setPassword('');
          setError('Registration successful! Please log in.');
        }
      } else {
        setError(res.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="projects-section">
      <div className="section-header">
        <h2 className="section-title">{isLogin ? 'Login' : 'Register'}</h2>
        <div className="section-divider"></div>
      </div>
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={e => { setEmail(e.target.value); setError(null); }} 
          required 
          className="search-input"
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={e => { setPassword(e.target.value); setError(null); }} 
          required 
          className="search-input"
        />
        {error && <p style={{ color: error.includes('successful') ? 'green' : 'red', margin: 0 }}>{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => { setIsLogin(!isLogin); setError(null); }}>
          {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
        </button>
      </form>
    </section>
  );
}
