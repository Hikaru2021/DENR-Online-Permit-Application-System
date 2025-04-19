import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../library/supabaseClient";
import "../CSS/Sidebar.css";
import { FaBars, FaTimes, FaChevronDown, FaChevronUp, FaTachometerAlt, FaUsers, FaClipboardList, FaChartBar, FaCog, FaSignOutAlt, FaFolderOpen, FaList } from "react-icons/fa";

const Sidebar = () => {
  const [isApplicationsOpen, setIsApplicationsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout failed:", error.message);
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
    if (!isSidebarCollapsed) {
      setIsApplicationsOpen(false);
    }
  };

  return (
    <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isSidebarCollapsed ? <FaBars /> : <FaTimes />}
      </button>

      <div className="sidebar-header">
        <img src="/Logo1.png" alt="DENR GreenCertify" className="sidebar-logo" />
        {!isSidebarCollapsed && (
          <>
            <h2 className="sidebar-title">DENR</h2>
            <h2 className="sidebar-title">GREENCERTIFY</h2>
          </>
        )}
      </div>

      <div className="sidebar-section">
        {!isSidebarCollapsed && <p className="sidebar-section-title">MAIN MENU</p>}
        <ul className="sidebar-menu">
          <li>
            <NavLink to="/Dashboard">
              <FaTachometerAlt className="sidebar-icon" />
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </NavLink>
          </li>

          <li>
            <button
              className={`dropdown-btn ${isApplicationsOpen ? 'open' : ''}`}
              onClick={() => !isSidebarCollapsed && setIsApplicationsOpen(!isApplicationsOpen)}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FaClipboardList className="sidebar-icon" />
                {!isSidebarCollapsed && <span>Applications</span>}
              </div>
              {!isSidebarCollapsed && (
                <FaChevronDown className="dropdown-icon" />
              )}
            </button>
            {isApplicationsOpen && !isSidebarCollapsed && (
              <ul className={`dropdown-menu ${isApplicationsOpen ? 'open' : ''}`}>
                <li className="dropdown-title">Application Categories</li>
                <li>
                  <NavLink to="/ListOfApplications">
                    <FaList className="sidebar-icon" />
                    <span>List of Applications</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/MyApplication">
                    <FaFolderOpen className="sidebar-icon" />
                    <span>My Applications</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </div>

      <div className="sidebar-section">
        {!isSidebarCollapsed && <p className="sidebar-section-title">MANAGE</p>}
        <ul className="sidebar-menu">
          <li>
            <NavLink to="/User">
              <FaUsers className="sidebar-icon" />
              {!isSidebarCollapsed && <span>Users</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/ApplicationList">
              <FaClipboardList className="sidebar-icon" />
              {!isSidebarCollapsed && <span>Application List</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/Reports">
              <FaChartBar className="sidebar-icon" />
              {!isSidebarCollapsed && <span>Reports</span>}
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="sidebar-section">
        {!isSidebarCollapsed && <p className="sidebar-section-title">ACCOUNT</p>}
        <ul className="sidebar-menu">
          <li>
            <NavLink to="/Settings">
              <FaCog className="sidebar-icon" />
              {!isSidebarCollapsed && <span>Settings</span>}
            </NavLink>
          </li>
          <li>
            <button onClick={handleLogout} className="logout-link">
              <FaSignOutAlt className="sidebar-icon" />
              {!isSidebarCollapsed && <span>Log out</span>}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
