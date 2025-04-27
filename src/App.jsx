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
import ErrorPage from "./Components/ErrorPage";
import RoleProtectedRoute from "./Components/RoleProtectedRoute";
import NotFound from "./NotFound";
import AccessDenied from "./Components/AccessDenied";

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
          
          {/* Admin/Manager only routes */}
          <Route path="User" element={
            <RoleProtectedRoute 
              element={<User />} 
              allowedRoles={[1, 2]} 
              errorMessage="Only Admin and Manager roles can access user management"
            />
          } />
          <Route path="ApplicationList" element={
            <RoleProtectedRoute 
              element={<ApplicationList />} 
              allowedRoles={[1, 2]} 
              errorMessage="Only Admin and Manager roles can access the application list"
            />
          } />
          <Route path="Reports" element={
            <RoleProtectedRoute 
              element={<Reports />} 
              allowedRoles={[1, 2]} 
              errorMessage="Only Admin and Manager roles can access reports"
            />
          } />
          
          <Route path="Settings" element={<Settings />} />
          <Route path="application/:id" element={<ApplicationTracking />} />
          
          {/* Error pages */}
          <Route path="forbidden" element={<AccessDenied requiredRoles={[1, 2]} />} />
          <Route path="not-found" element={<ErrorPage statusCode={404} />} />
          
          {/* Redirect to not-found if no route matches within layout */}
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Route>

        {/* Catch-all route outside the layout */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
