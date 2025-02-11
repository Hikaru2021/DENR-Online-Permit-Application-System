import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/LandingPage.css';

function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landingpage-body">
            <div className="MainBody">
                {/* Header Section */}
                <header>
                    <div className="header-container">
                        {/* Logo Section */}
                        <div className="logo-container">
                            <img src={'./Logo1.png'} alt="Logo" />
                            <div className="logo-text">
                                <h1>DENR</h1>
                                <h1>CERTIFY</h1>
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <nav className="nav-menu">
                            <ul className="nav-links">
                                <li><button className="nav-item">Home</button></li>
                                <li><button className="nav-item">About</button></li>
                                <li><button className="nav-item">Contact Us</button></li>
                            </ul>
                        </nav>

                        {/* Authentication Buttons */}
                        <div className="auth-buttons">
                            <button className="login-btn" onClick={() => navigate('/Authorization')}>Log In</button>
                            <button className="signup-btn">Sign Up</button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="main-container">
                    <h1 className="one">Permitting Solutions</h1>
                    <h1 className="two">for a</h1>
                    <h1 className="three">Sustainable Environment</h1>
                </main>
            </div>
        </div>
    );
}

export default LandingPage;
