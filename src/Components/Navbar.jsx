import React from "react";
import { useLocation } from "react-router-dom";
import "../CSS/Navbar.css"; // External CSS file for styling

const Navbar = () => {
    const location = useLocation(); // Get the current route

  // Function to determine the page title based on the route
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/users":
        return "Users";
      case "/applications":
        return "Applications";
      case "/settings":
        return "Settings";
      default:
        return "Page Not Found";
    }
  };
  return (
    <div className="navbar">
      {/* Left - Page Title */}
      <div className="navbar-left">
      <h1 className="navbar-title">{getPageTitle()}</h1>
        <p className="navbar-subtitle">September 12, 2024</p>
      </div>

      {/* Right - Profile Section */}
      <div className="navbar-right">
        <div className="avatar"></div>
        <div className="admin-info">
          <p className="admin-name">DENR Admin</p>
          <p className="admin-email">DENRAdmin@gmail.com</p>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
