import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './CSS/Authorization.css';
import { FaUser, FaKey } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

function Authorization() {
  const [action, setAction] = useState('');
  const navigate = useNavigate();

  const registerLink = () => {
    setAction('active');
    console.log('Register clicked, new state: active');
  };

  const loginLink = () => {
    setAction('');
    console.log('Login clicked, new state: inactive');
  };

  return (
    <div className='authorization-body'>
      <div className={`wrapper ${action}`}> 
        {/* Login Form */}
        <div className='form-box login'>
          <form action=''>
            {/* Logo */}
            {/* <img src="./Logo1.png" alt="Example" /> */}
            <h1>Login</h1>
            <div className='input-box'>
              <input type="email" placeholder='Email' required />
              <FaUser className='icon' />
            </div>
            <div className='input-box'>
              <input type="password" placeholder='Password' required />
              <FaKey className='icon' />
            </div>
            <div className='remember-forgot'>
              <label>
                <input type='checkbox' /> Remember me 
              </label>
              <Link to="#">Forgot Password?</Link>
            </div>
            <button type='button' onClick={() => navigate('/Dashboard')}>Login</button>
            <div className="register-link">
              <p>Don't have an account? <Link to="#" onClick={registerLink}>Register</Link></p>
            </div>
          </form>
        </div>

        {/* Register Form */}
        <div className='form-box register'>
          <form action=''>
            <h1>Register</h1>
            <div className='input-box'>
              <input type="text" placeholder='Full Name' required />
              <FaUser className='icon' />
            </div>
            <div className='input-box'>
              <input type="email" placeholder='Email' required />
              <MdEmail className='icon' />
            </div>
            <div className='input-box'>
              <input type="password" placeholder='Password' required />
              <FaKey className='icon' />
            </div>
            <div className='remember-forgot'>
              <label>
                <input type='checkbox' /> I agree to the terms & conditions
              </label>
            </div>
            <button type='submit'>Register</button>
            <div className="register-link">
              <p>Already have an account? <Link to="#" onClick={loginLink}>Login</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Authorization;
