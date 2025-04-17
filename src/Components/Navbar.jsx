import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../library/supabaseClient";
import "../CSS/Navbar.css";
import { FaBell, FaUserCircle, FaCog, FaSignOutAlt } from "react-icons/fa";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentDate, setCurrentDate] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/Dashboard":
        return "Dashboard";
      case "/User":
        return "Users";
      case "/ApplicationList":
        return "Application List";
      case "/Projects":
        return "Projects";
      case "/MyApplication":
        return "My Applications";
      case "/Reports":
        return "Reports";
      case "/Settings":
        return "Settings";
      default:
        return "Page Not Found";
    }
  };

  useEffect(() => {
    // Update the date
    const updateDate = () => {
      const options = { year: "numeric", month: "short", day: "2-digit" };
      setCurrentDate(new Date().toLocaleDateString("en-US", options));
    };

    updateDate();
    const timer = setInterval(updateDate, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error fetching user:", error.message);
          return;
        }

        if (user) {
          const { data: userData, error: userError } = await supabase
            .from("user")
            .select("full_name, email, avatar_url")
            .eq("id", user.id)
            .single();

          if (userError) {
            console.error("Error fetching user details:", userError.message);
          } else {
            setUser(userData);
          }
        }
      } catch (err) {
        console.error("Error in fetching user data:", err.message);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  const handleProfileClick = () => {
    navigate('/Settings');
    setShowProfileMenu(false);
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">{getPageTitle()}</h1>
        <p className="navbar-subtitle">{currentDate}</p>
      </div>

      <div className="navbar-right">
        {/* Notifications */}
        <div className="navbar-notifications">
          <button 
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <FaBell />
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
          </button>
          {showNotifications && (
            <div className="notification-dropdown">
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <div key={index} className="notification-item">
                    {notification.message}
                  </div>
                ))
              ) : (
                <div className="notification-item">No new notifications</div>
              )}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="navbar-profile">
          <button 
            className="profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Profile" className="profile-avatar" />
            ) : (
              <FaUserCircle className="profile-icon" />
            )}
            <div className="admin-info">
              <p className="admin-name">{user?.full_name || "Loading..."}</p>
              <p className="admin-email">{user?.email || ""}</p>
            </div>
          </button>
          {showProfileMenu && (
            <div className="profile-dropdown">
              <button className="profile-menu-item" onClick={handleProfileClick}>
                <FaUserCircle /> Profile
              </button>
              <button className="profile-menu-item" onClick={handleProfileClick}>
                <FaCog /> Settings
              </button>
              <button className="profile-menu-item" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
