import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaFilter, FaSort, FaEye, FaChartLine, FaTrash, FaDownload } from "react-icons/fa";
import "./CSS/ApplicationList.css";

function ApplicationList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Dummy data for applications
  const dummyApplications = [
    {
      id: 1,
      application_id: "APP-2023-001",
      applicant_name: "John Doe",
      title: "Building Permit",
      type: "Construction",
      submitted_at: "2023-06-15T10:30:00",
      status: "pending",
      description: "Application for a new commercial building construction permit.",
      notes: "Awaiting review by the zoning department."
    },
    {
      id: 2,
      application_id: "APP-2023-002",
      applicant_name: "Jane Smith",
      title: "Environmental Compliance Certificate",
      type: "Environmental",
      submitted_at: "2023-06-10T14:45:00",
      status: "in review",
      description: "Application for environmental compliance certification for manufacturing facility.",
      notes: "Under review by environmental assessment team."
    },
    {
      id: 3,
      application_id: "APP-2023-003",
      applicant_name: "Robert Johnson",
      title: "Business Permit",
      type: "Business",
      submitted_at: "2023-05-20T09:15:00",
      status: "approved",
      description: "Application for a new business permit for retail establishment.",
      notes: "Application approved. Permit valid for one year."
    },
    {
      id: 4,
      application_id: "APP-2023-004",
      applicant_name: "Emily Davis",
      title: "Waste Management Permit",
      type: "Environmental",
      submitted_at: "2023-05-05T11:20:00",
      status: "rejected",
      description: "Application for waste management permit for industrial facility.",
      notes: "Application denied due to incomplete waste management plan. Please resubmit with updated documentation."
    },
    {
      id: 5,
      application_id: "APP-2023-005",
      applicant_name: "Michael Wilson",
      title: "Renovation Permit",
      type: "Construction",
      submitted_at: "2023-07-01T13:10:00",
      status: "pending",
      description: "Application for renovation of an existing residential property.",
      notes: "Awaiting initial review."
    },
    {
      id: 6,
      application_id: "APP-2023-006",
      applicant_name: "Sarah Brown",
      title: "Water Usage Permit",
      type: "Environmental",
      submitted_at: "2023-06-25T15:30:00",
      status: "in review",
      description: "Application for increased water usage permit for agricultural purposes.",
      notes: "Under review by water resources department."
    },
    {
      id: 7,
      application_id: "APP-2023-007",
      applicant_name: "David Miller",
      title: "Signage Permit",
      type: "Business",
      submitted_at: "2023-07-05T10:00:00",
      status: "approved",
      description: "Application for outdoor signage for retail business.",
      notes: "Application approved with standard conditions."
    },
    {
      id: 8,
      application_id: "APP-2023-008",
      applicant_name: "Lisa Anderson",
      title: "Hazardous Materials Permit",
      type: "Environmental",
      submitted_at: "2023-06-20T09:45:00",
      status: "rejected",
      description: "Application for storage of hazardous materials in industrial facility.",
      notes: "Application rejected due to insufficient safety protocols. Please revise and resubmit."
    },
    {
      id: 9,
      application_id: "APP-2023-009",
      applicant_name: "James Taylor",
      title: "Zoning Variance",
      type: "Construction",
      submitted_at: "2023-07-10T14:20:00",
      status: "pending",
      description: "Application for zoning variance to allow mixed-use development.",
      notes: "Awaiting review by planning commission."
    },
    {
      id: 10,
      application_id: "APP-2023-010",
      applicant_name: "Patricia Martinez",
      title: "Air Quality Permit",
      type: "Environmental",
      submitted_at: "2023-06-30T11:15:00",
      status: "in review",
      description: "Application for air quality permit for manufacturing facility.",
      notes: "Under review by environmental protection agency."
    }
  ];

  // Fetch applications (using dummy data)
  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      setTimeout(() => {
        setApplications(dummyApplications);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError(`Error fetching applications: ${err.message}`);
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchApplications();
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Filter and sort applications
  const filteredAndSortedApplications = applications
    .filter(app => {
      const matchesSearch = 
        app.title.toLowerCase().includes(search.toLowerCase()) ||
        app.applicant_name.toLowerCase().includes(search.toLowerCase()) ||
        app.application_id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === "date") {
        comparison = new Date(a.submitted_at) - new Date(b.submitted_at);
      } else if (sortBy === "applicant") {
        comparison = a.applicant_name.localeCompare(b.applicant_name);
      } else if (sortBy === "status") {
        comparison = a.status.localeCompare(b.status);
      } else {
        // Default sort by ID
        comparison = a.application_id.localeCompare(b.application_id);
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedApplications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAndSortedApplications.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle view application
  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowViewModal(true);
  };

  // Handle track application
  const handleTrackApplication = (application) => {
    navigate(`/application/${application.id}`);
  };

  // Handle edit application
  const handleEditApplication = (application) => {
    setSelectedApplication({...application});
    setShowEditModal(true);
  };

  // Handle delete application
  const handleDeleteApplication = async (applicationId) => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      try {
        // Simulate API call delay
        setTimeout(() => {
          setApplications(applications.filter(app => app.id !== applicationId));
        }, 500);
      } catch (err) {
        console.error('Error deleting application:', err);
        alert(`Error deleting application: ${err.message}`);
      }
    }
  };

  // Handle download application
  const handleDownloadApplication = async (application) => {
    try {
      // Simulate download
      alert(`Downloading application: ${application.application_id}`);
    } catch (err) {
      console.error('Error downloading application:', err);
      alert(`Error downloading application: ${err.message}`);
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-badge pending';
      case 'approved':
        return 'status-badge approved';
      case 'rejected':
        return 'status-badge rejected';
      case 'in review':
        return 'status-badge in-review';
      default:
        return 'status-badge';
    }
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    try {
      // Simulate API call delay
      setTimeout(() => {
        setApplications(applications.map(app => 
          app.id === selectedApplication.id ? selectedApplication : app
        ));
        setShowEditModal(false);
      }, 500);
    } catch (err) {
      console.error('Error updating application:', err);
      alert(`Error updating application: ${err.message}`);
    }
  };

  return (
    <div className="application-list-container">
      <div className="application-list-header">
        <h1 className="application-list-title">Application List</h1>
        <p className="application-list-subtitle">Manage and track all submitted applications</p>
      </div>

      <div className="application-list-filters">
        <div className="search-container">
          <FaSearch className="search-icon" />
        <input
          type="text"
            className="search-input"
            placeholder="Search by ID, applicant name, or title..."
          value={search}
            onChange={handleSearchChange}
          />
        </div>
        <div className="filter-container">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in review">In Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading applications...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={fetchApplications}>
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="application-table">
              <thead>
                <tr>
                  <th onClick={() => handleSortChange("id")} className="sortable">
                    ID <FaSort className={sortBy === "id" ? `sort-icon ${sortOrder}` : "sort-icon"} />
                  </th>
                  <th onClick={() => handleSortChange("applicant")} className="sortable">
                    Applicant <FaSort className={sortBy === "applicant" ? `sort-icon ${sortOrder}` : "sort-icon"} />
                  </th>
                  <th onClick={() => handleSortChange("title")} className="sortable">
                    Title <FaSort className={sortBy === "title" ? `sort-icon ${sortOrder}` : "sort-icon"} />
                  </th>
                  <th onClick={() => handleSortChange("type")} className="sortable">
                    Type <FaSort className={sortBy === "type" ? `sort-icon ${sortOrder}` : "sort-icon"} />
                  </th>
                  <th onClick={() => handleSortChange("date")} className="sortable">
                    Submitted Date <FaSort className={sortBy === "date" ? `sort-icon ${sortOrder}` : "sort-icon"} />
                  </th>
                  <th onClick={() => handleSortChange("status")} className="sortable">
                    Status <FaSort className={sortBy === "status" ? `sort-icon ${sortOrder}` : "sort-icon"} />
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">No applications found</td>
                  </tr>
                ) : (
                  currentItems.map((application) => (
                    <tr key={application.id}>
                      <td>{application.application_id}</td>
                      <td>{application.applicant_name}</td>
                      <td>{application.title}</td>
                      <td>{application.type}</td>
                      <td>{new Date(application.submitted_at).toLocaleDateString()}</td>
                      <td>
                        <span className={getStatusBadgeClass(application.status)}>
                          {application.status}
            </span>
                      </td>
                      <td className="action-buttons">
                        <button 
                          className="action-button view" 
                          onClick={() => handleViewApplication(application)}
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button 
                          className="action-button track" 
                          onClick={() => handleTrackApplication(application)}
                          title="Track Application"
                        >
                          <FaChartLine />
                        </button>
                        <button 
                          className="action-button download" 
                          onClick={() => handleDownloadApplication(application)}
                          title="Download Application"
                        >
                          <FaDownload />
                        </button>
            <button
                          className="action-button delete" 
                          onClick={() => handleDeleteApplication(application.id)}
                          title="Delete Application"
            >
                          <FaTrash />
            </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-button" 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button 
                className="pagination-button" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* View Application Modal */}
      {showViewModal && selectedApplication && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Application Details</h2>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <h3>Application ID</h3>
                <p>{selectedApplication.application_id}</p>
              </div>
              <div className="modal-section">
                <h3>Applicant</h3>
                <p>{selectedApplication.applicant_name}</p>
              </div>
              <div className="modal-section">
                <h3>Title</h3>
                <p>{selectedApplication.title}</p>
              </div>
              <div className="modal-section">
                <h3>Type</h3>
                <p>{selectedApplication.type}</p>
              </div>
              <div className="modal-section">
                <h3>Status</h3>
                <span className={getStatusBadgeClass(selectedApplication.status)}>
                  {selectedApplication.status}
                </span>
              </div>
              <div className="modal-section">
                <h3>Submitted Date</h3>
                <p>{new Date(selectedApplication.submitted_at).toLocaleString()}</p>
              </div>
              <div className="modal-section">
                <h3>Description</h3>
                <p>{selectedApplication.description}</p>
                </div>
              {selectedApplication.notes && (
                <div className="modal-section">
                  <h3>Notes</h3>
                  <p>{selectedApplication.notes}</p>
                </div>
              )}
                </div>
            <div className="modal-footer">
              <button className="modal-button" onClick={() => setShowViewModal(false)}>Close</button>
                  <button
                className="modal-button primary" 
                onClick={() => handleDownloadApplication(selectedApplication)}
              >
                Download
                  </button>
                  <button
                className="modal-button primary" 
                onClick={() => {
                  setShowViewModal(false);
                  handleTrackApplication(selectedApplication);
                }}
              >
                Track Application
                  </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Application Modal */}
      {showEditModal && selectedApplication && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Application</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form className="edit-form">
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status" 
                    value={selectedApplication.status} 
                    onChange={(e) => setSelectedApplication({
                      ...selectedApplication,
                      status: e.target.value
                    })}
                  >
                    <option value="pending">Pending</option>
                    <option value="in review">In Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes" 
                    value={selectedApplication.notes || ''} 
                    onChange={(e) => setSelectedApplication({
                      ...selectedApplication,
                      notes: e.target.value
                    })}
                    rows="4"
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="modal-button" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button 
                className="modal-button primary" 
                onClick={handleSaveChanges}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplicationList;