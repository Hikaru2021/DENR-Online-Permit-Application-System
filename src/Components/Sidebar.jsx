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
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout failed:", error.message);
    } else {
      navigate("/");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
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
            <NavLink to="/Dashboard" className={({ isActive }) => isActive ? "active" : ""}>
              <FaTachometerAlt className="sidebar-icon" />
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </NavLink>
          </li>

          <li className="dropdown">
            <button
              className={`dropdown-btn ${isApplicationsOpen ? "open" : ""}`}
              onClick={() => setIsApplicationsOpen(!isApplicationsOpen)}
            >
              <FaClipboardList className="sidebar-icon" />
              {!isSidebarCollapsed && (
                <>
                  <span>Applications</span>
                  {isApplicationsOpen ? <FaChevronUp className="dropdown-icon" /> : <FaChevronDown className="dropdown-icon" />}
                </>
              )}
            </button>
            {isApplicationsOpen && !isSidebarCollapsed && (
              <ul className="dropdown-menu">
                <li className="dropdown-title">Application Categories</li>
                <li>
                  <NavLink to="/ListOfApplications" className={({ isActive }) => isActive ? "active" : ""}>
                    <FaList className="dropdown-icon" />
                    <span>List of Applications</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/MyApplication" className={({ isActive }) => isActive ? "active" : ""}>
                    <FaFolderOpen className="dropdown-icon" />
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
            <NavLink to="/User" className={({ isActive }) => isActive ? "active" : ""}>
              <FaUsers className="sidebar-icon" />
              {!isSidebarCollapsed && <span>Users</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/ApplicationList" className={({ isActive }) => isActive ? "active" : ""}>
              <FaClipboardList className="sidebar-icon" />
              {!isSidebarCollapsed && <span>Application List</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/Reports" className={({ isActive }) => isActive ? "active" : ""}>
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
            <NavLink to="/Settings" className={({ isActive }) => isActive ? "active" : ""}>
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
