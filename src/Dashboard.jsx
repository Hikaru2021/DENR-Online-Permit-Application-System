import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/Dashboard.css"; // CSS file for styling
import { FaUser, FaFileAlt, FaCheckCircle, FaTimesCircle, FaClock, FaChevronRight } from "react-icons/fa";

function Dashboard() {
  const navigate = useNavigate();
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for recent activities
  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      try {
        setIsLoading(true);
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

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        setRecentActivities(mockActivities);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
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
        return <FaFileAlt className="activity-icon" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        return `${diffInMinutes} minutes ago`;
      }
      return `${diffInHours} hours ago`;
    }
    
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="application-list-header">
          <h1 className="application-list-title">Dashboard</h1>
        </div>
        <div className="dashboard-body">
          {/* Application Status Cards */}
          <div className="dashboard-boxes">
            <div className="box total" onClick={() => handleCardClick('all')}>
              <h3>Total Applications</h3>
              <p className="count">29</p>
              <span>from this month</span>
            </div>
            <div className="box pending" onClick={() => handleCardClick('Pending')}>
              <h3>Pending Applications</h3>
              <p className="count">17</p>
              <span>from this month</span>
            </div>
            <div className="box review" onClick={() => handleCardClick('On Review')}>
              <h3>Under Review</h3>
              <p className="count">5</p>
              <span>from this month</span>
            </div>
            <div className="box approved" onClick={() => handleCardClick('Approved')}>
              <h3>Approved Applications</h3>
              <p className="count">10</p>
              <span>from this month</span>
            </div>
            <div className="box rejected" onClick={() => handleCardClick('Denied')}>
              <h3>Rejected Applications</h3>
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
                <button className="view-all-btn">
                  View All <FaChevronRight />
                </button>
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

            {/* Upcoming Deadlines Section */}
            <div className="dashboard-card deadlines">
              <div className="card-header">
                <h3>Upcoming Deadlines</h3>
                <button className="view-all-btn">
                  View All <FaChevronRight />
                </button>
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
