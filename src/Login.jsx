import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import { supabase } from './library/supabaseClient';
import './CSS/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setShowSuccessModal(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setError('Invalid email or password');
        setIsLoading(false);
        setShowSuccessModal(false);
        return;
      }

      // Show loading for 1 second before showing checkmark
      setTimeout(() => {
        setIsLoading(false);
        // Navigate after showing checkmark for 1.5 seconds
        setTimeout(() => {
          navigate('/Dashboard');
        }, 1500);
      }, 1000);

    } catch (error) {
      setError('An error occurred during login');
      setIsLoading(false);
      setShowSuccessModal(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button 
          className="back-button"
          onClick={() => navigate('/')}
        >
          <FaArrowLeft />
        </button>
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Please login to your account</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {location.state?.message && (
          <div className="success-message">{location.state.message}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className={`auth-submit-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Success Modal */}
      <div className={`success-modal ${showSuccessModal ? 'show' : ''}`}>
        <div className="success-modal-content">
          {isLoading ? (
            <div className="loading-circle"></div>
          ) : (
            <div className={`success-checkmark ${!isLoading ? 'show' : ''}`}>
              <svg viewBox="0 0 52 52">
                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
          )}
          <div className="success-modal-text">
            {isLoading ? 'Logging in...' : 'Successfully logged in!'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 