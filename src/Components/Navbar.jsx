import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import "../CSS/Navbar.css"; // External CSS file for styling

// Initialize Supabase Client
const supabase = createClient(
  "https://your-supabase-url.supabase.co",
  "your-anon-key"
);

const Navbar = () => {
  const location = useLocation(); // Get the current route
  const [user, setUser] = useState(null);

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

  // Fetch user data from Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser(); // Get authenticated user

      if (user) {
        const { data, error } = await supabase
          .from("user") // Table name: public.user
          .select("full_name, email")
          .eq("id", user.id)
          .single(); // Fetch only one record

        if (error) {
          console.error("Error fetching user data:", error.message);
        } else {
          setUser(data);
        }
      }
    };

    fetchUserData();
  }, []);

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
          {user ? (
            <>
              <p className="admin-name">{user.full_name}</p>
              <p className="admin-email">{user.email}</p>
            </>
          ) : (
            <>
              <p className="admin-name">Loading...</p>
              <p className="admin-email"></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
