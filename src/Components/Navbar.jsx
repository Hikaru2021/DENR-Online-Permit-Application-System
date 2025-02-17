// Navbar.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from '../library/supabaseClient'; // Import the initialized client
import "../CSS/Navbar.css"; // External CSS file for styling

const Navbar = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);

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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error fetching user:", error.message);
        } else if (data && data.user) {
          const { user } = data; // The user object
          const { data: userData, error: userError } = await supabase
            .from("user") // Assuming your user table is called "user"
            .select("full_name, email")
            .eq("id", user.id)
            .single();

          if (userError) {
            console.error("Error fetching user details:", userError.message);
          } else {
            setUser(userData);
          }
        } else {
          console.log("No user found.");
        }
      } catch (err) {
        console.error("Error in fetching user data:", err.message);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">{getPageTitle()}</h1>
        <p className="navbar-subtitle">September 12, 2024</p>
      </div>

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
