import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../library/supabaseClient";
import "../CSS/Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [currentDate, setCurrentDate] = useState("");

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

    updateDate(); // Call once on mount
    const timer = setInterval(updateDate, 1000); // Update every second

    return () => clearInterval(timer); // Cleanup
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
        <p className="navbar-subtitle">{currentDate}</p>
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
