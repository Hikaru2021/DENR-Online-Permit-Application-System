import React, { useState } from "react";
import "./CSS/Reports.css"; 
import { FaSearch, FaDownload, FaChevronDown, FaFilePdf, FaFileExcel, FaFileCsv, FaChartBar, FaChartPie, FaChartLine } from "react-icons/fa";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

function Reports() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [reportType, setReportType] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [activeTab, setActiveTab] = useState("table"); // "table", "charts", "analytics"
  
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
    applicationsByMonth: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Applications',
          data: [65, 59, 80, 81, 56, 55],
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(255, 159, 64, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    },
    
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
    
    // Line chart data - Processing time trends
    processingTimeTrends: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Average Processing Time (days)',
          data: [12, 19, 15, 17, 14, 13],
          fill: false,
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.1,
        },
      ],
    },
    
    // Bar chart data - Permit types
    permitTypes: {
      labels: ['Building', 'Environmental', 'Water', 'Air', 'Waste', 'Forestry'],
      datasets: [
        {
          label: 'Permits Issued',
          data: [120, 190, 80, 60, 40, 30],
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(255, 159, 64, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    },
  };

  const reportsPerPage = 5;
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
          <h3 className="chart-title">Applications by Month</h3>
          <div className="chart-wrapper">
            <Bar 
              data={chartData.applicationsByMonth} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </div>
        </div>
        
        <div className="chart-card">
          <h3 className="chart-title">Applications by Status</h3>
          <div className="chart-wrapper">
            <Pie 
              data={chartData.applicationsByStatus} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
      
      <div className="chart-row">
        <div className="chart-card">
          <h3 className="chart-title">Processing Time Trends</h3>
          <div className="chart-wrapper">
            <Line 
              data={chartData.processingTimeTrends} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </div>
        </div>
        
        <div className="chart-card">
          <h3 className="chart-title">Permits by Type</h3>
          <div className="chart-wrapper">
            <Bar 
              data={chartData.permitTypes} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="analytics-container">
      <div className="analytics-card">
        <h3 className="analytics-title">Key Performance Indicators</h3>
        <div className="kpi-grid">
          <div className="kpi-item">
            <div className="kpi-value">1,245</div>
            <div className="kpi-label">Total Applications</div>
            <div className="kpi-trend positive">+12.5% from last month</div>
          </div>
          <div className="kpi-item">
            <div className="kpi-value">87%</div>
            <div className="kpi-label">Approval Rate</div>
            <div className="kpi-trend positive">+3.2% from last month</div>
          </div>
          <div className="kpi-item">
            <div className="kpi-value">14.3</div>
            <div className="kpi-label">Avg. Processing Time (days)</div>
            <div className="kpi-trend negative">+1.2 days from last month</div>
          </div>
          <div className="kpi-item">
            <div className="kpi-value">92%</div>
            <div className="kpi-label">Customer Satisfaction</div>
            <div className="kpi-trend positive">+2.1% from last month</div>
          </div>
        </div>
      </div>
      
      <div className="analytics-card">
        <h3 className="analytics-title">Regional Distribution</h3>
        <div className="region-stats">
          <div className="region-item">
            <div className="region-name">North Region</div>
            <div className="region-bar">
              <div className="region-progress" style={{width: '65%'}}></div>
            </div>
            <div className="region-value">65%</div>
          </div>
          <div className="region-item">
            <div className="region-name">South Region</div>
            <div className="region-bar">
              <div className="region-progress" style={{width: '45%'}}></div>
            </div>
            <div className="region-value">45%</div>
          </div>
          <div className="region-item">
            <div className="region-name">East Region</div>
            <div className="region-bar">
              <div className="region-progress" style={{width: '78%'}}></div>
            </div>
            <div className="region-value">78%</div>
          </div>
          <div className="region-item">
            <div className="region-name">West Region</div>
            <div className="region-bar">
              <div className="region-progress" style={{width: '52%'}}></div>
            </div>
            <div className="region-value">52%</div>
          </div>
        </div>
      </div>
      
      <div className="analytics-card">
        <h3 className="analytics-title">Recent Activity</h3>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-time">2 hours ago</div>
            <div className="activity-desc">New application submitted: Building Permit #BP-2023-089</div>
          </div>
          <div className="activity-item">
            <div className="activity-time">5 hours ago</div>
            <div className="activity-desc">Application approved: Environmental Impact Assessment #EIA-2023-045</div>
          </div>
          <div className="activity-item">
            <div className="activity-time">1 day ago</div>
            <div className="activity-desc">Application denied: Water Usage Certificate #WUC-2023-112</div>
          </div>
          <div className="activity-item">
            <div className="activity-time">2 days ago</div>
            <div className="activity-desc">New application submitted: Air Quality Permit #AQP-2023-067</div>
          </div>
          <div className="activity-item">
            <div className="activity-time">3 days ago</div>
            <div className="activity-desc">Application approved: Waste Management Permit #WMP-2023-023</div>
          </div>
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
      
      <div className="filters-container">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by ID or title"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <div className="filter-item">
            <label htmlFor="report-type">Report Type:</label>
            <div className="select-wrapper">
              <select 
                id="report-type" 
                value={reportType} 
                onChange={handleReportTypeChange}
              >
                <option value="all">All Types</option>
                <option value="summary">Summary</option>
                <option value="statistics">Statistics</option>
                <option value="environmental">Environmental</option>
                <option value="status">Status</option>
                <option value="compliance">Compliance</option>
                <option value="financial">Financial</option>
                <option value="distribution">Distribution</option>
              </select>
              <FaChevronDown className="select-icon" />
            </div>
          </div>
          
          <div className="filter-item">
            <label htmlFor="date-range">Date Range:</label>
            <div className="select-wrapper">
              <select 
                id="date-range" 
                value={dateRange} 
                onChange={handleDateRangeChange}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <FaChevronDown className="select-icon" />
            </div>
          </div>
        </div>
      </div>

      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'table' ? 'active' : ''}`}
          onClick={() => setActiveTab('table')}
        >
          <FaChartBar /> Reports Table
        </button>
        <button 
          className={`tab-btn ${activeTab === 'charts' ? 'active' : ''}`}
          onClick={() => setActiveTab('charts')}
        >
          <FaChartPie /> Charts
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <FaChartLine /> Analytics
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'table' && renderTable()}
        {activeTab === 'charts' && renderCharts()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>

      {activeTab === 'table' && (
        <div className="pagination">
          <button
            className="prev-btn"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            ❮ Prev
          </button>
          <span className="page-info">Page {currentPage} of {totalPages}</span>
          <button
            className="next-btn"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next ❯
          </button>
        </div>
      )}
        </div>
    );
}

export default Reports;