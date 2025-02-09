import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';
import { useAuth } from '../../hooks/auth/useAuth';
import { toast } from 'react-toastify';

const LoginForm = ({ onLoginSuccess }) => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Get the full redirect URL from localStorage
      const redirectUrl = localStorage.getItem('redirectAfterLogin');
      console.log('Redirect URL from localStorage:', redirectUrl);
      
      if (redirectUrl) {
        localStorage.removeItem('redirectAfterLogin');
        
        // Don't redirect if the stored URL is the login page
        if (redirectUrl === '/login' || redirectUrl === 'http://localhost:3000/login' || redirectUrl === 'https://eval8.ai/login') {
          console.log('Skipping redirect to login page');
          navigate('/');
          return;
        }
        
        try {
          // Handle both full URLs and paths
          let finalPath;
          if (redirectUrl.startsWith('http')) {
            const url = new URL(redirectUrl);
            finalPath = url.pathname + url.search;
          } else {
            finalPath = redirectUrl;
          }

          console.log('Final redirect path:', finalPath);
          
          // Check if it's a shared test URL
          if (finalPath.includes('/test/shared/')) {
            console.log('Redirecting to shared test:', finalPath);
            navigate(finalPath);
          } else {
            console.log('Not a shared test URL, navigating to home');
            navigate('/');
          }
        } catch (error) {
          console.error('Error parsing redirect URL:', error);
          navigate('/');
        }
      } else {
        console.log('No redirect URL found, navigating to home');
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await login({
        login: formData.emailOrUsername,
        password: formData.password
      });
      
      if (result?.user) {
        toast.success('Successfully logged in!');
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.response?.data?.message || error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <h2>Welcome Back</h2>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="emailOrUsername">Email or Username:</label>
          <input
            type="text"
            id="emailOrUsername"
            name="emailOrUsername"
            value={formData.emailOrUsername}
            onChange={handleChange}
            required
            placeholder="Enter your email or username"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
            disabled={loading}
          />
        </div>

        <div className="forgot-password">
          <a href="/forgot-password">Forgot Password?</a>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="terms">
        Don't have an account? <a href="/register">Sign up</a>
      </div>
    </div>
  );
};

export default LoginForm; 