import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import "../CSS/Sidebar.css";

// Initialize Supabase Client
const supabase = createClient(
  "https://your-supabase-url.supabase.co",
  "your-anon-key"
);

const Sidebar = () => {
  const [isApplicationsOpen, setIsApplicationsOpen] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  // Logout function
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout failed:", error.message);
    } else {
      navigate("/"); // Redirect to Landing Page
    }
  };

  return (
    <div className="sidebar">
      {/* Logo Section */}
      <div className="sidebar-header">
        <img src="/Logo1.png" alt="DENR GreenCertify" className="sidebar-logo" />
        <div className="sidebar-header">
          <h2 className="sidebar-title">DENR</h2>
          <h2 className="sidebar-title">GREENCERTIFY</h2>
        </div>
      </div>

      {/* Main Menu */}
      <div className="sidebar-section">
        <p className="sidebar-section-title">MAIN MENU</p>
        <ul className="sidebar-menu">
          <li>
            <NavLink to="/Dashboard" activeClassName="active">
              <img src="/dashboard.svg" alt="Dashboard" className="sidebar-icon" />
              Dashboard
            </NavLink>
          </li>

          {/* Applications Dropdown */}
          <li className="dropdown">
            <button
              className={`dropdown-btn ${isApplicationsOpen ? "open" : ""}`}
              onClick={() => setIsApplicationsOpen(!isApplicationsOpen)}
            ><img src="/dashboard.svg" alt="Dashboard" className="sidebar-icon" />
              Applications
              <i className={`fas fa-chevron-${isApplicationsOpen ? "up" : "down"}`}></i>
            </button>
            {isApplicationsOpen && (
              <ul className="dropdown-menu">
                <li className="dropdown-title">Application Categories</li>
                <li>
                  <NavLink to="/ApplicationList" activeClassName="active">
                    <i className="fas fa-list"></i> List of Possible Applications
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/applications/my" activeClassName="active">
                    <i className="fas fa-folder-open"></i> My Applications
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </div>

      {/* Manage Section */}
      <div className="sidebar-section">
        <p className="sidebar-section-title">MANAGE</p>
        <ul className="sidebar-menu">
          <li>
            <NavLink to="/user" activeClassName="active">
              <img src="/users.svg" alt="Users" className="sidebar-icon" />
              Users
            </NavLink>
          </li>
          <li>
            <NavLink to="/ApplicationList" activeClassName="active">
              <img src="/applicationlist.svg" alt="Application List" className="sidebar-icon" />
              Application List
            </NavLink>
          </li>
          <li>
            <NavLink to="/reports" activeClassName="active">
              <img src="/reports.svg" alt="Reports" className="sidebar-icon" />
              Reports
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Account Section */}
      <div className="sidebar-section">
        <p className="sidebar-section-title">ACCOUNT</p>
        <ul className="sidebar-menu">
          <li>
            <NavLink to="/settings" activeClassName="active">
              <img src="/settings.svg" alt="Settings" className="sidebar-icon" />
              Settings
            </NavLink>
          </li>
          <li>
            <NavLink to="/" onClick={handleLogout} activeClassName="active" className="logout-link">
              <img src="/logout.svg" alt="Logout" className="sidebar-icon" />
              Log out
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
