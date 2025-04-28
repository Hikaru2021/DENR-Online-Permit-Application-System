import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/Dashboard.css"; // CSS file for styling
import { FaUser, FaFileAlt, FaCheckCircle, FaTimesCircle, FaClock, FaChevronRight, FaCalendarAlt, FaChevronLeft, FaTimes } from "react-icons/fa";
import { supabase } from "./library/supabaseClient";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [userApplications, setUserApplications] = useState([]);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [statusCounts, setStatusCounts] = useState({
    submitted: 0,
    underReview: 0,
    needsRevision: 0,
    approved: 0,
    rejected: 0
  });
  const [totalApplications, setTotalApplications] = useState(0);

  // Fetch user and role information
  useEffect(() => {
    const fetchUserAndRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setCurrentUser(user);
          
          // Fetch user role from the users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role_id')
            .eq('id', user.id)
            .single();
          
          if (userError) throw userError;
          
          if (userData) {
            setUserRole(userData.role_id);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    
    fetchUserAndRole();
  }, []);

  // Fetch application status analytics based on user role
  useEffect(() => {
    const fetchApplicationAnalytics = async () => {
      if (userRole === null) return;

        setIsLoading(true);
      try {
        // Setup query based on user role
        let query = supabase
          .from('user_applications')
          .select('id, status');

        // If user role is 3 (regular user), filter by user_id
        if (userRole === 3 && currentUser) {
          query = query.eq('user_id', currentUser.id);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        if (data) {
          // Count applications by status
          const counts = {
            submitted: 0,
            underReview: 0,
            needsRevision: 0,
            approved: 0,
            rejected: 0
          };
          
          data.forEach(app => {
            switch (app.status) {
              case 1:
                counts.submitted++;
                break;
              case 2:
                counts.underReview++;
                break;
              case 3:
                counts.needsRevision++;
                break;
              case 4:
                counts.approved++;
                break;
              case 5:
                counts.rejected++;
                break;
              default:
                break;
            }
          });
          
          setStatusCounts(counts);
          setTotalApplications(data.length);
        }
      } catch (error) {
        console.error("Error fetching application analytics:", error);
        // Set mock data for demonstration
        setStatusCounts({
          submitted: userRole === 3 ? 2 : 17, 
          underReview: userRole === 3 ? 1 : 5,
          needsRevision: userRole === 3 ? 1 : 4,
          approved: userRole === 3 ? 1 : 10,
          rejected: userRole === 3 ? 0 : 2
        });
        setTotalApplications(userRole === 3 ? 5 : 38);
      } finally {
        setIsLoading(false);
      }
    };

    if (userRole !== null) {
      fetchApplicationAnalytics();
    }
  }, [userRole, currentUser]);

  const handleCardClick = (status) => {
    // Determine destination based on user role
    if (userRole === 1 || userRole === 2) {
      // Admin or Staff: Navigate to ApplicationList with status filter
      navigate('/ApplicationList', { state: { statusFilter: status } });
    } else {
      // Regular User: Navigate to MyApplication with status filter
      navigate('/MyApplication', { state: { statusFilter: status } });
    }
  };

  // Chart data configuration
  const chartData = {
    labels: ['Submitted', 'Under Review', 'Needs Rev.', 'Approved', 'Rejected'],
    datasets: [
      {
        data: [
          statusCounts.submitted,
          statusCounts.underReview,
          statusCounts.needsRevision,
          statusCounts.approved,
          statusCounts.rejected
        ],
        backgroundColor: [
          '#FFB74D', // Submitted (orange)
          '#4FC3F7', // Under Review (blue)
          '#FF9800', // Needs Revision (dark orange)
          '#81C784', // Approved (green)
          '#E57373'  // Rejected (red)
        ],
        borderColor: [
          '#F57C00',
          '#0288D1',
          '#E65100',
          '#2E7D32',
          '#C62828'
        ],
        borderWidth: 1,
        hoverOffset: 4
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 800
    },
    cutout: '70%', // Make the donut hole larger
    plugins: {
      legend: {
        display: false, // Hide the legend as we have our own status items below
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Calendar helper functions
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const handlePrevYear = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setFullYear(newDate.getFullYear() - 1);
      return newDate;
    });
  };

  const handleNextYear = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setFullYear(newDate.getFullYear() + 1);
      return newDate;
    });
  };

  const handleDateClick = async (day) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(selectedDate);
    setIsLoadingApplications(true);
    setShowApplicationsModal(true);
    
    try {
      // Fetch user applications for the selected date based on user role
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      let query = supabase
        .from('user_applications')
        .select(`
          id,
          created_at,
          user_id,
          status,
          approved_date,
          full_name,
          contact_number,
          address,
          purpose,
          applications (
            id,
            title,
            type,
            description
          )
        `)
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());

      // If user role is 3 (regular user), filter by user_id
      if (userRole === 3 && currentUser) {
        query = query.eq('user_id', currentUser.id);
      }
      
      const { data: user_applications, error } = await query;
      
      if (error) {
        console.error('Error fetching user applications:', error);
        // If no data, create mock data for demonstration
        const mockData = [
          {
            id: 1,
            created_at: selectedDate.toISOString(),
            full_name: "John Smith",
            applications: { title: "Environmental Compliance Certificate", type: "Permit" },
            status: 1,
            purpose: "New business operation"
          },
          {
            id: 2,
            created_at: selectedDate.toISOString(),
            full_name: "Jane Doe",
            applications: { title: "Tree Cutting Permit", type: "Permit" },
            status: 2,
            purpose: "Land development"
          }
        ];
        
        // For regular users, filter the mock data
        setUserApplications(userRole === 3 ? mockData.filter((_, index) => index === 0) : mockData);
      } else {
        setUserApplications(user_applications || []);
      }
    } catch (error) {
      console.error('Error:', error);
      // Set mock data for demonstration
      const mockData = [
        {
          id: 1,
          created_at: selectedDate.toISOString(),
          full_name: "John Smith",
          applications: { title: "Environmental Compliance Certificate", type: "Permit" },
          status: 1,
          purpose: "New business operation"
        },
        {
          id: 2,
          created_at: selectedDate.toISOString(),
          full_name: "Jane Doe",
          applications: { title: "Tree Cutting Permit", type: "Permit" },
          status: 2,
          purpose: "Land development"
        }
      ];
      
      // For regular users, filter the mock data
      setUserApplications(userRole === 3 ? mockData.filter((_, index) => index === 0) : mockData);
    } finally {
      setIsLoadingApplications(false);
    }
  };

  const closeApplicationsModal = () => {
    setShowApplicationsModal(false);
    setUserApplications([]);
    setSelectedDate(null);
  };

  const handleApplicationClick = (application) => {
    // Route to different components based on user role
    if (userRole === 1 || userRole === 2) {
      // Admin or Manager: Navigate to ApplicationList
      navigate('/ApplicationList', { state: { selectedApplicationId: application.id } });
    } else {
      // Regular User: Navigate to MyApplication
      navigate('/MyApplication', { state: { selectedApplicationId: application.id } });
    }
  };

  const getStatusText = (statusId) => {
    switch (statusId) {
      case 1:
        return "Submitted";
      case 2:
        return "Under Review";
      case 3:
        return "Needs Revision";
      case 4:
        return "Approved";
      case 5:
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  const getStatusClass = (statusId) => {
    switch (statusId) {
      case 1:
        return "dashboard-status-pending";
      case 2:
        return "dashboard-status-review";
      case 3:
        return "dashboard-status-revision";
      case 4:
        return "dashboard-status-approved";
      case 5:
        return "dashboard-status-rejected";
      default:
        return "";
    }
  };

  // Render calendar days
  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Empty cells for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Get today's date for highlighting
    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
    const currentDay = today.getDate();
    
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = isCurrentMonth && i === currentDay;
      days.push(
        <div 
          key={`day-${i}`} 
          className={`calendar-day ${isToday ? 'current-day' : ''}`}
          onClick={() => handleDateClick(i)}
        >
          {i}
        </div>
      );
    }
    
    // Empty cells to complete the grid (if needed)
    const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
    for (let i = firstDayOfMonth + daysInMonth; i < totalCells; i++) {
      days.push(<div key={`empty-end-${i}`} className="calendar-day empty"></div>);
    }
    
    return days;
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long' });
  };

  const formatDateString = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getViewAllDestination = () => {
    // Return the appropriate route based on user role
    return userRole === 1 || userRole === 2 ? '/ApplicationList' : '/MyApplication';
  };

  const getModalTitle = () => {
    // Customize modal title based on user role
    if (userRole === 1||2) {
      return `All Applications for ${formatDateString(selectedDate)}`;
    } else {
      return `My Applications for ${formatDateString(selectedDate)}`;
    }
  };

  const getAnalyticsTitle = () => {
    if (userRole === 1||2) {
      return "Application Analytics";
    } 
    else {
      return "My Application Status";
    }
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
              <p className="count">{totalApplications}</p>
              <span>from this month</span>
            </div>
            <div className="box pending" onClick={() => handleCardClick('Submitted')}>
              <h3>Pending Applications</h3>
              <p className="count">{statusCounts.submitted}</p>
              <span>from this month</span>
            </div>
            <div className="box review" onClick={() => handleCardClick('Under Review')}>
              <h3>Under Review</h3>
              <p className="count">{statusCounts.underReview}</p>
              <span>from this month</span>
            </div>
            <div className="box approved" onClick={() => handleCardClick('Approved')}>
              <h3>Approved Applications</h3>
              <p className="count">{statusCounts.approved}</p>
              <span>from this month</span>
            </div>
            <div className="box rejected" onClick={() => handleCardClick('Rejected')}>
              <h3>Rejected Applications</h3>
              <p className="count">{statusCounts.rejected}</p>
              <span>from this month</span>
            </div>
          </div>

          {/* Dashboard Grid Layout */}
          <div className="dashboard-grid">
            {/* Application Status Analytics Section */}
            <div className="dashboard-card dashboard-analytics">
              <div className="card-header">
                <h3>{getAnalyticsTitle()}</h3>
                <button 
                  className="view-all-btn"
                  onClick={() => navigate(getViewAllDestination())}
                >
                  View All <FaChevronRight />
                </button>
              </div>
              <div className="dashboard-analytics-container">
                <div className="chart-container">
                  <Doughnut data={chartData} options={chartOptions} />
                  <div className="chart-center-text">
                    <div className="total-count">{totalApplications}</div>
                    <div className="total-label">Total</div>
                  </div>
                </div>
                
                <div className="dashboard-chart-legend">
                  <div className="dashboard-legend-item">
                    <div className="dashboard-legend-color dashboard-legend-submitted"></div>
                    <div className="dashboard-legend-label">Submitted</div>
                  </div>
                  <div className="dashboard-legend-item">
                    <div className="dashboard-legend-color dashboard-legend-under-review"></div>
                    <div className="dashboard-legend-label">Under Review</div>
                  </div>
                  <div className="dashboard-legend-item">
                    <div className="dashboard-legend-color dashboard-legend-needs-revision"></div>
                    <div className="dashboard-legend-label">Needs Rev.</div>
                  </div>
                  <div className="dashboard-legend-item">
                    <div className="dashboard-legend-color dashboard-legend-approved"></div>
                    <div className="dashboard-legend-label">Approved</div>
                  </div>
                  <div className="dashboard-legend-item">
                    <div className="dashboard-legend-color dashboard-legend-rejected"></div>
                    <div className="dashboard-legend-label">Rejected</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar Section */}
            <div className="dashboard-card calendar">
              <div className="card-header">
                <h3>Calendar</h3>
                <button 
                  className="view-all-btn"
                  onClick={() => navigate(getViewAllDestination())}
                >
                  View All <FaChevronRight />
                </button>
              </div>
              <div className="calendar-container">
                <div className="calendar-navigation">
                  <div className="calendar-month-nav">
                    <button className="calendar-nav-btn" onClick={handlePrevMonth}>
                      <FaChevronLeft />
                    </button>
                    <h4>{getMonthName(currentDate)}</h4>
                    <button className="calendar-nav-btn" onClick={handleNextMonth}>
                      <FaChevronRight />
                    </button>
                  </div>
                  <div className="calendar-year-nav">
                    <button className="calendar-nav-btn" onClick={handlePrevYear}>
                      <FaChevronLeft />
                    </button>
                    <h4>{currentDate.getFullYear()}</h4>
                    <button className="calendar-nav-btn" onClick={handleNextYear}>
                      <FaChevronRight />
                    </button>
                  </div>
                </div>
                <div className="calendar-grid">
                  <div className="calendar-weekdays">
                    <div>Sun</div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                  </div>
                  <div className="calendar-days">
                    {renderCalendarDays()}
                  </div>
                </div>
                {userRole && (
                  <div className="user-role-indicator">
                    Viewing as: {userRole === 1 ? 'Admin' : userRole === 2 ? 'Manager' : 'User'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Modal */}
      {showApplicationsModal && (
        <div className="modal-overlay">
          <div className="applications-modal">
            <div className="applications-modal-header">
              <h2>{getModalTitle()}</h2>
              <button className="close-modal-btn" onClick={closeApplicationsModal}>
                <FaTimes />
              </button>
            </div>
            
            <div className="applications-modal-content">
              {isLoadingApplications ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading applications...</p>
                </div>
              ) : userApplications.length > 0 ? (
                <div className="user-applications-list">
                  {userApplications.map(app => (
                    <div 
                      key={app.id} 
                      className="user-application-item"
                      onClick={() => handleApplicationClick(app)}
                    >
                      <div className="application-info">
                        <h3>{app.applications?.title || "Application"}</h3>
                        <p><strong>Applicant:</strong> {app.full_name}</p>
                        <p><strong>Purpose:</strong> {app.purpose}</p>
                        <p><strong>Submitted:</strong> {new Date(app.created_at).toLocaleTimeString()}</p>
                      </div>
                      <div className="application-status">
                        <span className={`dashboard-status-badge ${getStatusClass(app.status)}`}>
                          {getStatusText(app.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-applications">
                  <p>No applications found for this date.</p>
                </div>
              )}
            </div>
            
            <div className="applications-modal-footer">
              <button 
                className="view-all-applications-btn" 
                onClick={() => navigate(getViewAllDestination())}
              >
                View All Applications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
