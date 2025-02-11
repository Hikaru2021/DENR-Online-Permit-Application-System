import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/LandingPage.css";

function LandingPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("home"); // Track active section

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
                                <li><button className={`nav-item ${activeTab === "home" ? "active" : ""}`} onClick={() => setActiveTab("home")}>Home</button></li>
                                <li><button className={`nav-item ${activeTab === "about" ? "active" : ""}`} onClick={() => setActiveTab("about")}>About</button></li>
                                <li><button className={`nav-item ${activeTab === "contact" ? "active" : ""}`} onClick={() => setActiveTab("contact")}>Contact Us</button></li>
                            </ul>
                        </nav>

                        {/* Authentication Buttons */}
                        <div className="auth-buttons">
                            <button className="login-btn" onClick={() => navigate('/Authorization')}>Log In</button>
                            <button className="signup-btn">Sign Up</button>
                        </div>
                    </div>
                </header>

                {/* Content Section - Transitions Based on Tab */}
                <main className="main-container">
                    <div className={`content ${activeTab === "home" ? "active" : ""}`}>
                        <h1 className="one">Permitting Solutions</h1>
                        <h1 className="two">for a</h1>
                        <h1 className="three">Sustainable Environment</h1>
                    </div>

                    <div className={`content ${activeTab === "about" ? "active" : ""}`}>
                        <h1 className="one">About Us</h1>
                        <p>DENR Certify streamlines the permitting process for environmental sustainability.</p>
                    </div>

                    <div className={`content ${activeTab === "contact" ? "active" : ""}`}>
                        <h1 className="one">Contact Us</h1>
                        <p>Email: support@denrcertify.com</p>
                        <p>Phone: +63 123 456 7890</p>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default LandingPage;
