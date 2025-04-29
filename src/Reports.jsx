import React, { useState, useEffect } from "react";
import "./CSS/Reports.css"; 
import { FaSearch, FaDownload, FaChevronDown, FaFilePdf, FaFileExcel, FaFileCsv, FaChartBar, FaChartPie, FaChartLine, FaFileAlt, FaCheckCircle, FaClock, FaSmile, FaArrowUp, FaExclamationTriangle } from "react-icons/fa";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';
import { supabase } from "./library/supabaseClient";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

function Reports() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [reportType, setReportType] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [activeTab, setActiveTab] = useState("analytics");
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState("all");
  const [userApplications, setUserApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [userApplicationCounts, setUserApplicationCounts] = useState({});
  const [userActivityPeriod, setUserActivityPeriod] = useState("monthly");

  useEffect(() => {
    fetchData();
    fetchUserApplications();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0 && userApplications.length > 0) {
      calculateUserApplicationCounts();
    }
  }, [users, userApplications, userActivityPeriod]);

  async function fetchData() {
    try {
      setIsLoading(true);
      
      // Fetch user applications
      let { data: user_applications, error: userError } = await supabase
        .from('user_applications')
        .select('*');
      
      if (userError) throw userError;
      setUserApplications(user_applications || []);

      // Fetch applications
      let { data: applications_data, error: appsError } = await supabase
        .from('applications')
        .select('*');
      
      if (appsError) throw appsError;
      setApplications(applications_data || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchUserApplications() {
    try {
      let { data, error } = await supabase
        .from('user_applications')
        .select('*');
      
      if (error) throw error;
      setUserApplications(data || []);
    } catch (error) {
      console.error('Error fetching user applications:', error);
    }
  }

  async function fetchUsers() {
    try {
      let { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  // Calculate application counts for each user
  const calculateUserApplicationCounts = () => {
    const counts = {};
    const currentDate = new Date();
    
    // Initialize counts for all users
    users.forEach(user => {
      counts[user.id] = {
        count: 0,
        user: user
      };
    });
    
    // Count applications for each user based on selected period
    userApplications.forEach(app => {
      if (app.user_id && counts[app.user_id]) {
        const appDate = new Date(app.created_at);
        let shouldCount = false;

        if (userActivityPeriod === "monthly") {
          // Count applications from the current month
          shouldCount = appDate.getMonth() === currentDate.getMonth() && 
                       appDate.getFullYear() === currentDate.getFullYear();
        } else {
          // Count applications from the current year
          shouldCount = appDate.getFullYear() === currentDate.getFullYear();
        }

        if (shouldCount) {
          counts[app.user_id].count++;
        }
      }
    });
    
    setUserApplicationCounts(counts);
  };

  // Get available years from applications data
  const getAvailableYears = () => {
    const years = new Set();
    let earliestYear = new Date().getFullYear(); // Default to current year
    
    // Find the earliest year in the data
    applications.forEach(app => {
      const appDate = new Date(app.created_at);
      const year = appDate.getFullYear();
      years.add(year);
      if (year < earliestYear) {
        earliestYear = year;
      }
    });
    
    // Add all years from earliest to current
    const currentYear = new Date().getFullYear();
    const allYears = [];
    
    for (let year = currentYear; year >= earliestYear; year--) {
      allYears.push(year);
    }
    
    return allYears;
  };

  // Handle year change
  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  // Process applications data for charts
  const processMonthlyApplications = () => {
    const monthlyData = {};
    
    // Initialize all months with 0
    for (let month = 1; month <= 12; month++) {
      monthlyData[month] = 0;
    }
    
    // Count applications per month for the selected year or all years
    userApplications.forEach(userApp => {
      const appDate = new Date(userApp.created_at);
      if (selectedYear === "all" || appDate.getFullYear() === parseInt(selectedYear)) {
        const month = appDate.getMonth() + 1;
        monthlyData[month]++;
      }
    });
    
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: selectedYear === "all" ? 'Applications (All Years)' : `Applications (${selectedYear})`,
          data: Object.values(monthlyData),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          borderRadius: 4,
          barThickness: 20,
          maxBarThickness: 30,
          minBarLength: 2
        },
      ],
    };
  };

  // Process permit and certificate trends
  const processPermitCertificateTrends = () => {
    const monthlyData = {
      permits: {},
      certificates: {}
    };
    
    // Initialize data structure for each month
    for (let month = 1; month <= 12; month++) {
      monthlyData.permits[month] = 0;
      monthlyData.certificates[month] = 0;
    }
    
    // Count applications by type and month
    userApplications.forEach(userApp => {
      const appDate = new Date(userApp.created_at);
      if (selectedYear === "all" || appDate.getFullYear() === parseInt(selectedYear)) {
        const month = appDate.getMonth() + 1;
        
        // Find the corresponding application to get its type
        const application = applications.find(app => app.id === userApp.application_id);
        if (application) {
          if (application.type?.toLowerCase().includes('permit')) {
            monthlyData.permits[month]++;
          } else if (application.type?.toLowerCase().includes('certificate')) {
            monthlyData.certificates[month]++;
          }
        }
      }
    });
    
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Permits',
          data: Object.values(monthlyData.permits),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Certificates',
          data: Object.values(monthlyData.certificates),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  };

  // Process user applications data for the chart
  const processUserApplicationsByMonth = () => {
    const monthlyData = {};
    
    // Initialize all months with 0
    for (let month = 1; month <= 12; month++) {
      monthlyData[month] = 0;
    }
    
    // Count applications per month for the selected year or all years
    userApplications.forEach(app => {
      const appDate = new Date(app.created_at);
      if (selectedYear === "all" || appDate.getFullYear() === parseInt(selectedYear)) {
        const month = appDate.getMonth() + 1;
        monthlyData[month]++;
      }
    });
    
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: selectedYear === "all" ? 'User Applications (All Years)' : `User Applications (${selectedYear})`,
          data: Object.values(monthlyData),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  };
  
  // Mock data for reports
  const mockReports = [
    {
      id: "REP001",
      title: "Monthly Application Summary",
      type: "Summary",
      date: "2023-05-15",
      format: "PDF",
      size: "2.4 MB"
    },
    {
      id: "REP002",
      title: "Quarterly Permit Statistics",
      type: "Statistics",
      date: "2023-04-10",
      format: "Excel",
      size: "1.8 MB"
    },
    {
      id: "REP003",
      title: "Annual Environmental Impact Report",
      type: "Environmental",
      date: "2023-01-05",
      format: "PDF",
      size: "5.2 MB"
    },
    {
      id: "REP004",
      title: "Weekly Application Status",
      type: "Status",
      date: "2023-05-20",
      format: "CSV",
      size: "0.8 MB"
    },
    {
      id: "REP005",
      title: "Monthly Compliance Report",
      type: "Compliance",
      date: "2023-05-01",
      format: "PDF",
      size: "3.1 MB"
    },
    {
      id: "REP006",
      title: "Quarterly Financial Summary",
      type: "Financial",
      date: "2023-04-15",
      format: "Excel",
      size: "2.7 MB"
    },
    {
      id: "REP007",
      title: "Annual Permit Distribution",
      type: "Distribution",
      date: "2023-01-20",
      format: "PDF",
      size: "4.5 MB"
    }
  ];

  // Mock data for charts
  const chartData = {
    // Bar chart data - Applications by month
    applicationsByMonth: processMonthlyApplications(),
    
    // Pie chart data - Applications by status
    applicationsByStatus: {
      labels: ['Pending', 'On Review', 'Approved', 'Denied'],
      datasets: [
        {
          label: 'Applications by Status',
          data: [30, 25, 35, 10],
          backgroundColor: [
            'rgba(255, 206, 86, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(255, 99, 132, 0.5)',
          ],
          borderColor: [
            'rgba(255, 206, 86, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        },
      ],
    },
    
    // Line chart data - Permit and Certificate trends
    processingTimeTrends: processPermitCertificateTrends(),
    
    // Bar chart data - User applications by month
    userApplicationsByMonth: processUserApplicationsByMonth(),
  };

  // Common chart options for animations
  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
      animateRotate: true,
      animateScale: true,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#ddd',
          borderWidth: 1,
        padding: 10,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
            }
            return label;
          }
        }
      }
    }
  };

  // Specific options for line chart
  const lineChartOptions = {
    ...commonChartOptions,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Applications'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 2
      },
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2
      }
    }
  };

  // Specific options for bar chart
  const barChartOptions = {
    ...commonChartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          stepSize: 1,
          precision: 0
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    elements: {
      bar: {
        borderRadius: 4
      }
    }
  };

  // Specific options for pie chart
  const pieChartOptions = {
    ...commonChartOptions,
    cutout: '0%',
    elements: {
      arc: {
        borderWidth: 2
      }
    }
  };

  const reportsPerPage = 4;
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  
  // Filter reports based on search and report type
  const filteredReports = mockReports.filter(report => {
    const matchesSearch = 
      report.title.toLowerCase().includes(search.toLowerCase()) ||
      report.id.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = 
      reportType === "all" || 
      report.type.toLowerCase() === reportType.toLowerCase();
    
    return matchesSearch && matchesType;
  });
  
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleDownload = (report) => {
    // Mock download functionality
    console.log("Downloading report:", report);
    alert(`Downloading report: ${report.title}`);
  };

  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const getFormatIcon = (format) => {
    switch(format.toLowerCase()) {
      case "pdf":
        return <FaFilePdf className="format-icon pdf" />;
      case "excel":
        return <FaFileExcel className="format-icon excel" />;
      case "csv":
        return <FaFileCsv className="format-icon csv" />;
      default:
        return null;
    }
  };

  const renderTable = () => (
    <div className="reports-table">
      <table>
        <thead>
          <tr>
            <th>Report ID</th>
            <th>Title</th>
            <th>Type</th>
            <th>Date</th>
            <th>Format</th>
            <th>Size</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentReports.length > 0 ? (
            currentReports.map((report) => (
              <tr key={report.id}>
                <td>{report.id}</td>
                <td>{report.title}</td>
                <td>{report.type}</td>
                <td>{new Date(report.date).toLocaleDateString()}</td>
                <td className="format-cell">
                  {getFormatIcon(report.format)}
                  <span>{report.format}</span>
                </td>
                <td>{report.size}</td>
                <td>
                  <button
                    className="download-btn"
                    onClick={() => handleDownload(report)}
                  >
                    <FaDownload /> Download
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="no-data">
                No reports found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderCharts = () => (
    <div className="charts-container">
      <div className="chart-row">
        <div className="chart-card">
          <div className="chart-header">
          <h3 className="chart-title">Applications by Month</h3>
            <div className="year-selector">
              <label htmlFor="year-select">Year: </label>
              <select 
                id="year-select" 
                value={selectedYear} 
                onChange={handleYearChange}
                className="year-dropdown"
              >
                <option value="all">All Years</option>
                {getAvailableYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="chart-wrapper">
            {isLoading ? (
              <div className="loading-spinner">Loading...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
            <Bar 
              data={chartData.applicationsByMonth} 
                options={barChartOptions}
              />
            )}
          </div>
        </div>
        
        <div className="chart-card">
          <h3 className="chart-title">Applications by Status</h3>
          <div className="chart-wrapper">
            <Pie 
              data={chartData.applicationsByStatus} 
              options={pieChartOptions}
            />
          </div>
        </div>
      </div>
      
      <div className="chart-row">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Permit & Certificate Trends</h3>
            <div className="year-selector">
              <label htmlFor="year-select-2">Year: </label>
              <select 
                id="year-select-2" 
                value={selectedYear} 
                onChange={handleYearChange}
                className="year-dropdown"
              >
                <option value="all">All Years</option>
                {getAvailableYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="chart-wrapper">
            {isLoading ? (
              <div className="loading-spinner">Loading...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
            <Line 
              data={chartData.processingTimeTrends} 
                options={lineChartOptions}
              />
            )}
          </div>
        </div>
        
        <div className="user-activity-section">
          <div className="section-header">
            <h3 className="section-title">User Activity</h3>
            <div className="period-selector">
              <select 
                value={userActivityPeriod} 
                onChange={(e) => setUserActivityPeriod(e.target.value)}
                className="period-dropdown"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div className="user-cards-container">
            {isLoading ? (
              <div className="loading-spinner">Loading user data...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              Object.values(userApplicationCounts)
                .sort((a, b) => b.count - a.count)
                .map((userData, index) => (
                  <div key={userData.user.id} className="user-card">
                    <div className="user-profile">
                      {userData.user.profile_link ? (
                        <img 
                          src={userData.user.profile_link} 
                          alt={userData.user.user_name || "User"} 
                          className="user-avatar"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/50?text=User";
                          }}
                        />
                      ) : (
                        <div className="user-avatar-placeholder">
                          {userData.user.user_name ? userData.user.user_name.charAt(0).toUpperCase() : "U"}
                        </div>
                      )}
                      <div className="user-info">
                        <div className="user-name">{userData.user.user_name || "Unknown User"}</div>
                        <div className="user-email">{userData.user.email || "No email"}</div>
                      </div>
                    </div>
                    <div className="user-stats">
                      <div className="application-count">
                        <span className="count-value">{userData.count}</span>
                        <span className="count-label">Applications {userActivityPeriod === "monthly" ? "this month" : "this year"}</span>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="analytics-container">
      {/* Permit Application Overview */}
      <div className="analytics-section">
        <h3 className="section-title">Application Overview</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">
              <FaFileAlt />
            </div>
            <div className="metric-content">
              <div className="metric-value">{userApplications.length}</div>
              <div className="metric-label">Total Applications</div>
              <div className="metric-trend positive">
                <FaArrowUp /> 8.3% from last month
              </div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">
              <FaCheckCircle />
            </div>
            <div className="metric-content">
              <div className="metric-value">76%</div>
              <div className="metric-label">Approval Rate</div>
              <div className="metric-trend positive">
                <FaArrowUp /> 2.1% from last month
              </div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">
              <FaClock />
            </div>
            <div className="metric-content">
              <div className="metric-value">18.5</div>
              <div className="metric-label">Avg. Processing Time (days)</div>
              <div className="metric-trend negative">
                <FaArrowUp /> 1.5 days from last month
              </div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">
              <FaExclamationTriangle />
            </div>
            <div className="metric-content">
              <div className="metric-value">24%</div>
              <div className="metric-label">Pending Applications</div>
              <div className="metric-trend negative">
                <FaArrowUp /> 3.2% from last month
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Permit Types Distribution */}
      <div className="analytics-section">
        <h3 className="section-title">Permit Types Distribution</h3>
        <div className="chart-wrapper">
          <Pie 
            data={{
              labels: ['Environmental Compliance', 'Waste Management', 'Air Quality', 'Water Usage', 'Land Use', 'Other'],
              datasets: [{
                data: [35, 25, 15, 12, 8, 5],
                backgroundColor: [
                  'rgba(75, 192, 192, 0.7)',
                  'rgba(54, 162, 235, 0.7)',
                  'rgba(255, 206, 86, 0.7)',
                  'rgba(153, 102, 255, 0.7)',
                  'rgba(255, 159, 64, 0.7)',
                  'rgba(201, 203, 207, 0.7)'
                ],
                borderColor: [
                  'rgba(75, 192, 192, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)',
                  'rgba(201, 203, 207, 1)'
                ],
                borderWidth: 1
              }]
            }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                  position: 'right',
                  labels: {
                    padding: 20,
                    font: {
                      size: 12
                    }
                  }
                }
              }
              }}
            />
          </div>
        </div>
        
      {/* Application Status Timeline */}
      <div className="analytics-section">
        <h3 className="section-title">Application Status Timeline</h3>
          <div className="chart-wrapper">
          <Line 
            data={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              datasets: [
                {
                  label: 'Pending',
                  data: [12, 19, 15, 17, 22, 24, 28, 25, 23, 20, 18, 15],
                  borderColor: 'rgba(255, 206, 86, 1)',
                  backgroundColor: 'rgba(255, 206, 86, 0.2)',
                  tension: 0.4,
                  fill: true
                },
                {
                  label: 'Under Review',
                  data: [8, 12, 11, 14, 16, 18, 15, 17, 19, 16, 14, 12],
                  borderColor: 'rgba(54, 162, 235, 1)',
                  backgroundColor: 'rgba(54, 162, 235, 0.2)',
                  tension: 0.4,
                  fill: true
                },
                {
                  label: 'Approved',
                  data: [15, 18, 20, 22, 25, 28, 30, 32, 35, 38, 40, 42],
                  borderColor: 'rgba(75, 192, 192, 1)',
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  tension: 0.4,
                  fill: true
                },
                {
                  label: 'Denied',
                  data: [3, 4, 5, 4, 6, 5, 4, 3, 4, 5, 4, 3],
                  borderColor: 'rgba(255, 99, 132, 1)',
                  backgroundColor: 'rgba(255, 99, 132, 0.2)',
                  tension: 0.4,
                  fill: true
                }
              ]
            }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Number of Applications'
                  }
                }
              },
                plugins: {
                  legend: {
                  position: 'top'
                }
              }
              }}
            />
          </div>
        </div>

      {/* Environmental Compliance Metrics */}
      <div className="analytics-section">
        <h3 className="section-title">Environmental Compliance Metrics</h3>
        <div className="compliance-grid">
          <div className="compliance-card">
            <div className="compliance-header">
              <h4>Air Quality Standards</h4>
              <div className="compliance-score high">92%</div>
      </div>
            <div className="progress-bar">
              <div className="progress" style={{ width: '92%' }}></div>
    </div>
            <div className="compliance-details">
              <div className="detail-item">
                <span className="detail-label">Compliant:</span>
                <span className="detail-value">46/50</span>
          </div>
              <div className="detail-item">
                <span className="detail-label">Non-compliant:</span>
                <span className="detail-value">4/50</span>
          </div>
          </div>
          </div>
          <div className="compliance-card">
            <div className="compliance-header">
              <h4>Water Quality Standards</h4>
              <div className="compliance-score medium">78%</div>
        </div>
            <div className="progress-bar">
              <div className="progress" style={{ width: '78%' }}></div>
      </div>
            <div className="compliance-details">
              <div className="detail-item">
                <span className="detail-label">Compliant:</span>
                <span className="detail-value">39/50</span>
            </div>
              <div className="detail-item">
                <span className="detail-label">Non-compliant:</span>
                <span className="detail-value">11/50</span>
          </div>
            </div>
          </div>
          <div className="compliance-card">
            <div className="compliance-header">
              <h4>Waste Management</h4>
              <div className="compliance-score high">88%</div>
            </div>
            <div className="progress-bar">
              <div className="progress" style={{ width: '88%' }}></div>
          </div>
            <div className="compliance-details">
              <div className="detail-item">
                <span className="detail-label">Compliant:</span>
                <span className="detail-value">44/50</span>
            </div>
              <div className="detail-item">
                <span className="detail-label">Non-compliant:</span>
                <span className="detail-value">6/50</span>
          </div>
        </div>
      </div>
          <div className="compliance-card">
            <div className="compliance-header">
              <h4>Land Use Compliance</h4>
              <div className="compliance-score low">65%</div>
          </div>
            <div className="progress-bar">
              <div className="progress" style={{ width: '65%' }}></div>
          </div>
            <div className="compliance-details">
              <div className="detail-item">
                <span className="detail-label">Compliant:</span>
                <span className="detail-value">32/50</span>
          </div>
              <div className="detail-item">
                <span className="detail-label">Non-compliant:</span>
                <span className="detail-value">18/50</span>
          </div>
          </div>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="analytics-section">
        <h3 className="section-title">Recent Applications</h3>
        <div className="applications-table">
          <table>
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Type</th>
                <th>Applicant</th>
                <th>Date Submitted</th>
                <th>Status</th>
                <th>Processing Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ENV-2023-089</td>
                <td>Environmental Compliance</td>
                <td>ABC Corporation</td>
                <td>May 15, 2023</td>
                <td><span className="status-badge approved">Approved</span></td>
                <td>12 days</td>
              </tr>
              <tr>
                <td>WM-2023-112</td>
                <td>Waste Management</td>
                <td>XYZ Industries</td>
                <td>May 10, 2023</td>
                <td><span className="status-badge pending">Pending</span></td>
                <td>17 days</td>
              </tr>
              <tr>
                <td>AQ-2023-045</td>
                <td>Air Quality</td>
                <td>123 Manufacturing</td>
                <td>May 5, 2023</td>
                <td><span className="status-badge under-review">Under Review</span></td>
                <td>22 days</td>
              </tr>
              <tr>
                <td>WU-2023-078</td>
                <td>Water Usage</td>
                <td>Green Energy Co.</td>
                <td>April 28, 2023</td>
                <td><span className="status-badge denied">Denied</span></td>
                <td>15 days</td>
              </tr>
              <tr>
                <td>LU-2023-023</td>
                <td>Land Use</td>
                <td>City Development</td>
                <td>April 20, 2023</td>
                <td><span className="status-badge approved">Approved</span></td>
                <td>19 days</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="reports-container">
      <div className="application-list-header">
        <h1 className="application-list-title">Reports</h1>
        <p className="application-list-subtitle">View and analyze application statistics and reports</p>
      </div>

      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <FaChartLine /> Analytics
        </button>
        <button 
          className={`tab-btn ${activeTab === 'charts' ? 'active' : ''}`}
          onClick={() => setActiveTab('charts')}
        >
          <FaChartPie /> Charts
        </button>
        <button 
          className={`tab-btn ${activeTab === 'table' ? 'active' : ''}`}
          onClick={() => setActiveTab('table')}
        >
          <FaChartBar /> Reports Table
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'charts' && renderCharts()}
        {activeTab === 'table' && renderTable()}
      </div>

      {activeTab === 'table' && (
        <div className="pagination-container">
          <div className="pagination">
            <button
              className="pagination-button nav-button"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              ❮ Prev
            </button>
            <div className="pagination-pages">
              {(() => {
                const pageNumbers = [];
                
                if (totalPages <= 5) {
                  for (let i = 1; i <= Math.max(1, totalPages); i++) {
                    pageNumbers.push(i);
                  }
                } else {
                  pageNumbers.push(1);
                  
                  if (currentPage <= 3) {
                    pageNumbers.push(2, 3, 4);
                    pageNumbers.push('ellipsis');
                    pageNumbers.push(totalPages);
                  } 
                  else if (currentPage >= totalPages - 2) {
                    pageNumbers.push('ellipsis');
                    pageNumbers.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                  } 
                  else {
                    pageNumbers.push('ellipsis');
                    pageNumbers.push(currentPage - 1, currentPage, currentPage + 1);
                    pageNumbers.push('ellipsis2');
                    pageNumbers.push(totalPages);
                  }
                }
                
                return pageNumbers.map((pageNumber, index) => {
                  if (pageNumber === 'ellipsis' || pageNumber === 'ellipsis2') {
                    return (
                      <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                    );
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      className={`pagination-button ${currentPage === pageNumber ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                });
              })()}
            </div>
            <button
              className="pagination-button nav-button"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next ❯
            </button>
          </div>
        </div>
      )}
        </div>
    );
}

export default Reports;