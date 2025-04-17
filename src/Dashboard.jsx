import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/Dashboard.css"; // CSS file for styling
import { FaUser, FaFileAlt, FaCheckCircle, FaTimesCircle, FaClock, FaBell } from "react-icons/fa";

function Dashboard() {
  const navigate = useNavigate();
  const [recentActivities, setRecentActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Mock data for recent activities
  useEffect(() => {
    // In a real application, this would fetch from an API
    const mockActivities = [
      {
        id: 1,
        type: "application_submitted",
        user: "John Doe",
        details: "Submitted a new Environmental Permit application",
        timestamp: "2023-06-15T10:30:00",
        status: "pending"
      },
      {
        id: 2,
        type: "application_approved",
        user: "Jane Smith",
        details: "Approved a Building Permit application",
        timestamp: "2023-06-14T15:45:00",
        status: "approved"
      },
      {
        id: 3,
        type: "application_rejected",
        user: "Robert Johnson",
        details: "Rejected a Land Use Permit application",
        timestamp: "2023-06-14T11:20:00",
        status: "rejected"
      },
      {
        id: 4,
        type: "application_review",
        user: "Emily Davis",
        details: "Started review of a Water Permit application",
        timestamp: "2023-06-13T09:15:00",
        status: "review"
      },
      {
        id: 5,
        type: "user_registered",
        user: "System",
        details: "New user registered: Michael Wilson",
        timestamp: "2023-06-12T16:30:00",
        status: "info"
      }
    ];

    const mockNotifications = [
      {
        id: 1,
        message: "You have 3 applications pending review",
        timestamp: "2023-06-15T08:00:00",
        read: false
      },
      {
        id: 2,
        message: "System maintenance scheduled for June 20th",
        timestamp: "2023-06-14T14:30:00",
        read: false
      },
      {
        id: 3,
        message: "New feature: Application templates now available",
        timestamp: "2023-06-13T10:15:00",
        read: true
      }
    ];

    setRecentActivities(mockActivities);
    setNotifications(mockNotifications);
  }, []);

  const handleCardClick = (status) => {
    navigate('/ApplicationSubmittion', { state: { statusFilter: status } });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "application_submitted":
        return <FaFileAlt className="activity-icon submitted" />;
      case "application_approved":
        return <FaCheckCircle className="activity-icon approved" />;
      case "application_rejected":
        return <FaTimesCircle className="activity-icon rejected" />;
      case "application_review":
        return <FaClock className="activity-icon review" />;
      case "user_registered":
        return <FaUser className="activity-icon info" />;
      default:
        return <FaBell className="activity-icon" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-body">
          {/* Application Status Cards */}
          <div className="dashboard-boxes">
            <div className="box total" onClick={() => handleCardClick('all')}>
              <h3>Total Application</h3>
              <p className="count">29</p>
              <span>from this month</span>
            </div>
            <div className="box pending" onClick={() => handleCardClick('Pending')}>
              <h3>Pending Application</h3>
              <p className="count">17</p>
              <span>from this month</span>
            </div>
            <div className="box review" onClick={() => handleCardClick('On Review')}>
              <h3>For Review</h3>
              <p className="count">5</p>
              <span>from this month</span>
            </div>
            <div className="box approved" onClick={() => handleCardClick('Approved')}>
              <h3>Approved Application</h3>
              <p className="count">10</p>
              <span>from this month</span>
            </div>
            <div className="box rejected" onClick={() => handleCardClick('Denied')}>
              <h3>Rejected Application</h3>
              <p className="count">2</p>
              <span>from this month</span>
            </div>
          </div>

          {/* Dashboard Grid Layout */}
          <div className="dashboard-grid">
            {/* Recent Activity Section */}
            <div className="dashboard-card recent-activity">
              <div className="card-header">
                <h3>Recent Activity</h3>
                <button className="view-all-btn">View All</button>
              </div>
              <div className="activity-list">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon-container">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="activity-details">
                      <p className="activity-text">
                        <span className="activity-user">{activity.user}</span> {activity.details}
                      </p>
                      <p className="activity-time">{formatTimestamp(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications Section */}
            <div className="dashboard-card notifications">
              <div className="card-header">
                <h3>Notifications</h3>
                <button className="view-all-btn">View All</button>
              </div>
              <div className="notification-list">
                {notifications.map(notification => (
                  <div key={notification.id} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
                    <div className="notification-content">
                      <p>{notification.message}</p>
                      <p className="notification-time">{formatTimestamp(notification.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats Section */}
            <div className="dashboard-card quick-stats">
              <div className="card-header">
                <h3>Quick Stats</h3>
              </div>
              <div className="stats-grid">
                <div className="stat-item">
                  <h4>Average Processing Time</h4>
                  <p className="stat-value">3.2 days</p>
                </div>
                <div className="stat-item">
                  <h4>Completion Rate</h4>
                  <p className="stat-value">87%</p>
                </div>
                <div className="stat-item">
                  <h4>Active Users</h4>
                  <p className="stat-value">24</p>
                </div>
                <div className="stat-item">
                  <h4>Documents Uploaded</h4>
                  <p className="stat-value">156</p>
                </div>
              </div>
            </div>

            {/* Upcoming Deadlines Section */}
            <div className="dashboard-card deadlines">
              <div className="card-header">
                <h3>Upcoming Deadlines</h3>
                <button className="view-all-btn">View All</button>
              </div>
              <div className="deadline-list">
                <div className="deadline-item">
                  <div className="deadline-date">
                    <span className="day">15</span>
                    <span className="month">Jun</span>
                  </div>
                  <div className="deadline-details">
                    <h4>Environmental Impact Assessment</h4>
                    <p>Due for 3 applications</p>
                  </div>
                </div>
                <div className="deadline-item">
                  <div className="deadline-date">
                    <span className="day">20</span>
                    <span className="month">Jun</span>
                  </div>
                  <div className="deadline-details">
                    <h4>Building Permit Renewal</h4>
                    <p>Due for 5 applications</p>
                  </div>
                </div>
                <div className="deadline-item">
                  <div className="deadline-date">
                    <span className="day">25</span>
                    <span className="month">Jun</span>
                  </div>
                  <div className="deadline-details">
                    <h4>Water Usage Permit</h4>
                    <p>Due for 2 applications</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
