import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "../CSS/Sidebar.css";

const Sidebar = () => {
  const [isApplicationsOpen, setIsApplicationsOpen] = useState(false);

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
            <NavLink to="/dashboard" activeClassName="active">
              <img src="/dashboard.svg" alt="DENR GreenCertify" className="sidebar-icon" />
              <i className="fas fa-tachometer-alt"></i> Dashboard
            </NavLink>
          </li>
          
          {/* Applications Dropdown */}
          <li className="dropdown">
            <button
              className={`dropdown-btn ${isApplicationsOpen ? "open" : ""}`}
              onClick={() => setIsApplicationsOpen(!isApplicationsOpen)}
            >
              <i className="fas fa-file-alt"></i> Applications
              <i className={`fas fa-chevron-${isApplicationsOpen ? "up" : "down"}`}></i>
            </button>
            {isApplicationsOpen && (
              <ul className="dropdown-menu">
                <li className="dropdown-title">Application Categories</li>
                <li>
                  <NavLink to="/applications/list" activeClassName="active">
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
            <NavLink to="/User" activeClassName="active">
              <img src="/users.svg" alt="DENR GreenCertify" className="sidebar-icon" />
              <i className="fas fa-users"></i> Users
            </NavLink>
          </li>
          <li>
            <NavLink to="/application-list" activeClassName="active">
              <img src="/applicationlist.svg" alt="DENR GreenCertify" className="sidebar-icon" /> 
              <i className="fas fa-list"></i> Application List
            </NavLink>
          </li>
          <li>
            <NavLink to="/projects" activeClassName="active">
              <img src="/projects.svg" alt="DENR GreenCertify" className="sidebar-icon" />
              <i className="fas fa-tasks"></i> Projects
            </NavLink>
          </li>
          <li>
            <NavLink to="/reports" activeClassName="active">
              <img src="/reports.svg" alt="DENR GreenCertify" className="sidebar-icon" />
              <i className="fas fa-chart-bar"></i> Reports
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
              <img src="/settings.svg" alt="DENR GreenCertify" className="sidebar-icon" />
              <i className="fas fa-cog"></i> Settings
            </NavLink>
          </li>
          <li>
            <NavLink to="/logout" activeClassName="active">
              <img src="/logout.svg" alt="DENR GreenCertify" className="sidebar-icon" />
              <i className="fas fa-sign-out-alt"></i> Log out
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
