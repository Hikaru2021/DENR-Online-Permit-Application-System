import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../library/supabaseClient";
import "../CSS/Sidebar.css";
import { FaChevronDown, FaTachometerAlt, FaUsers, FaClipboardList, FaChartBar, FaSignOutAlt, FaFolderOpen, FaList, FaUser, FaBook } from "react-icons/fa";

const Sidebar = () => {
  const [isApplicationsOpen, setIsApplicationsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getUserProfile();
  }, []);

  const getUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUserProfile({
          email: user.email,
          ...profile
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

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

  const handleProfileClick = () => {
    navigate('/Settings');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src="/Logo1.png" alt="DENR GreenCertify" className="sidebar-logo" />
        <h2 className="sidebar-title">DENR</h2>
        <h2 className="sidebar-title">GREENCERTIFY</h2>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-section-title">MAIN MENU</p>
        <ul className="sidebar-menu">
          <li>
            <NavLink to="/Dashboard">
              <FaTachometerAlt className="sidebar-icon" />
              <span>Dashboard</span>
            </NavLink>
          </li>

          <li>
            <button
              className={`dropdown-btn ${isApplicationsOpen ? 'open' : ''}`}
              onClick={() => setIsApplicationsOpen(!isApplicationsOpen)}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FaClipboardList className="sidebar-icon" />
                <span>Applications</span>
              </div>
              <FaChevronDown className="dropdown-icon" />
            </button>
            {isApplicationsOpen && (
              <ul className={`dropdown-menu ${isApplicationsOpen ? 'open' : ''}`}>
                <li>
                  <NavLink to="/ApplicationCatalog">
                    <FaBook className="sidebar-icon" />
                    <span>Application Catalog</span>
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
        <p className="sidebar-section-title">MANAGE</p>
        <ul className="sidebar-menu">
          <li>
            <NavLink to="/User">
              <FaUsers className="sidebar-icon" />
              <span>Users</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/ApplicationList">
              <FaClipboardList className="sidebar-icon" />
              <span>Application List</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/Reports">
              <FaChartBar className="sidebar-icon" />
              <span>Reports</span>
            </NavLink>
          </li>
        </ul>
      </div>

      {/* User Profile Section at Bottom */}
      <div className="sidebar-profile">
        <div className="profile-info" onClick={handleProfileClick}>
          <div className="profile-avatar">
            <FaUser className="avatar-icon" />
          </div>
          <div className="profile-details">
            <p className="profile-name">{userProfile?.full_name || 'User'}</p>
            <p className="profile-email">{userProfile?.email || 'user@example.com'}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-button">
          <FaSignOutAlt />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
