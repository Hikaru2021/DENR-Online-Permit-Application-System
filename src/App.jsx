import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./LandingPage";
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import User from "./User";
import Layout from "./Layout";
import MyApplication from "./MyApplication";
import Reports from "./Reports";
import ApplicationList from "./ApplicationList";
import ApplicationTracking from "./ApplicationTracking";
import Settings from "./Components/Settings";
import ApplicationCatalog from "./ApplicationCatalog";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes without layout */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes with layout */}
        <Route path="/" element={<Layout />}>
          <Route path="Dashboard" element={<Dashboard />} />
          <Route path="ApplicationCatalog" element={<ApplicationCatalog />} />
          <Route path="MyApplication" element={<MyApplication />} />
          <Route path="User" element={<User />} />
          <Route path="ApplicationList" element={<ApplicationList />} />
          <Route path="Reports" element={<Reports />} />
          <Route path="Settings" element={<Settings />} />
          <Route path="application/:id" element={<ApplicationTracking />} />
          
          {/* Redirect to Dashboard if no route matches */}
          <Route path="*" element={<Navigate to="/Dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
