import React, { useState } from 'react';
import './CSS/Authorization.css';
import { FaUser, FaKey } from "react-icons/fa";
import { MdEmail } from "react-icons/md";


function Authorization() {

  const[action, setAction] = useState('');

  const registerLink = () => {
    setAction('active');
    console.log('Register clicked, state:', action); /*this was added*/
};

const loginLink = () => {
    setAction('');
    console.log('Login clicked, state:', action); /*this was added*/
}
  return (
      <div className={`wrapper ${action}`}> 
        <div className='form-box login'>
          <form action=''>
          {/*<img src="./Logo1.png" alt="Example" />*/}
            <h1>Login</h1>
            <div className='input-box'>
              <input type="email" placeholder='Email' required/>
              <FaUser className='icon'/>
            </div>
            <div className='input-box'>
              <input type="password" placeholder='Password' required/>
              <FaKey className='icon'/>
            </div>
            <div className='remember-forgot'>
              <label>
                <input type ='checkbox'/>
                Remember me 
              </label>
              <a href='#'>
                  Forgot Password?
              </a>
            </div>
            <button type='submit'>Login</button>
            <div className="register-link">
              <p>Don't have an account? <a href='#' onClick={registerLink}>Register</a></p>
            </div>
          </form>
        </div>
        <div className='form-box register'>
          <form action=''>
            <h1>Register</h1>
            <div className='input-box'>
              <input type="FullName" placeholder='Name' required/>
              <FaUser className='icon'/>
            </div>
            <div className='input-box'>
              <input type="email" placeholder='Email' required/>
              <MdEmail className='icon'/>
            </div>
            <div className='input-box'>
              <input type="password" placeholder='Password' required/>
              <FaKey className='icon'/>
            </div>
            <div className='remember-forgot'>
              <label>
                <input type ='checkbox'/>
                I agree to the terms & conditions
              </label>
            </div>
            <button type='submit'>Register</button>
            <div className="register-link">
              <p>Already have an account? <a href='#' onClick={loginLink}>Login</a></p>
            </div>
          </form>
        </div>
      </div>
  );
}

export default Authorization;
