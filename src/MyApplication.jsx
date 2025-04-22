import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaFilter, FaSort, FaChartLine, FaDownload, FaTrash, FaTimes, FaClock, FaEye } from "react-icons/fa";
import "./CSS/MyApplication.css"; 
import "./CSS/SharedTable.css";
import { supabase } from "./library/supabaseClient";
import ApplicationTracking from './ApplicationTracking';

function MyApplication() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editApplication, setEditApplication] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Mock data for demonstration
  const mockApplications = [
    {
      id: 1,
      title: "Building Permit",
      type: "Permit",
      status: "Pending",
      submissionDate: "2023-06-15",
      lastUpdated: "2023-06-15",
      referenceNumber: "REF-2023-001",
      description: "Application for a new commercial building construction permit.",
      attachments: ["building_plan.pdf", "site_plan.pdf"],
      comments: "Awaiting review by the zoning department."
    },
    {
      id: 2,
      title: "Environmental Compliance Certificate",
      type: "Certificate",
      status: "On Review",
      submissionDate: "2023-06-10",
      lastUpdated: "2023-06-12",
      referenceNumber: "REF-2023-002",
      description: "Application for environmental compliance certification for manufacturing facility.",
      attachments: ["environmental_assessment.pdf", "impact_study.pdf"],
      comments: "Under review by environmental assessment team."
    },
    {
      id: 3,
      title: "Business Permit",
      type: "Permit",
      status: "Approved",
      submissionDate: "2023-05-20",
      lastUpdated: "2023-05-25",
      referenceNumber: "REF-2023-003",
      description: "Application for a new business permit for retail establishment.",
      attachments: ["business_registration.pdf", "tax_clearance.pdf"],
      comments: "Application approved. Permit valid for one year."
    },
    {
      id: 4,
      title: "Waste Management Permit",
      type: "Permit",
      status: "Denied",
      submissionDate: "2023-05-05",
      lastUpdated: "2023-05-10",
      referenceNumber: "REF-2023-004",
      description: "Application for waste management permit for industrial facility.",
      attachments: ["waste_management_plan.pdf", "facility_layout.pdf"],
      comments: "Application denied due to incomplete waste management plan. Please resubmit with updated documentation."
    }
  ];

  // Fetch user's applications
  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      try {
        // In a real application, you would fetch from Supabase
        // const { data, error } = await supabase
        //   .from('applications')
        //   .select('*')
        //   .eq('user_id', currentUser.id);
        
        // if (error) throw error;
        
        // For now, use mock data
        setTimeout(() => {
          setApplications(mockApplications);
          setFilteredApplications(mockApplications);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        setError(`Error fetching applications: ${err.message}`);
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Filter and sort applications when filters change
  useEffect(() => {
    let result = [...applications];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(app => 
        app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(app => app.status === statusFilter);
    }
    
    // Apply sorting
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate));
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.submissionDate) - new Date(b.submissionDate));
    } else if (sortBy === "status") {
      const statusOrder = { "Pending": 0, "On Review": 1, "Approved": 2, "Denied": 3 };
      result.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    }
    
    setFilteredApplications(result);
  }, [applications, searchTerm, statusFilter, sortBy]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
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

  // Get sort icon class
  const getSortIconClass = (field) => {
    if (sortBy !== field) return "sort-icon";
    return `sort-icon ${sortOrder}`;
  };

  // Update view details handler to use navigation
  const handleViewDetails = (application) => {
    navigate(`/application/${application.id}`);
  };

  // Edit application
  const handleEditApplication = (application) => {
    setEditApplication({...application});
    setShowEditModal(true);
  };

  // Delete application
  const handleDeleteApplication = async (id) => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      try {
        // In a real application, you would delete from Supabase
        // const { error } = await supabase
        //   .from('applications')
        //   .delete()
        //   .eq('id', id);
        
        // if (error) throw error;
        
        // For now, just update the state
        setApplications(applications.filter(app => app.id !== id));
      } catch (err) {
        setError(`Error deleting application: ${err.message}`);
      }
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      // In a real application, you would update in Supabase
      // const { error } = await supabase
      //   .from('applications')
      //   .update({
      //     title: editApplication.title,
      //     description: editApplication.description
      //   })
      //   .eq('id', editApplication.id);
      
      // if (error) throw error;
      
      // For now, just update the state
      setApplications(applications.map(app => 
        app.id === editApplication.id ? {...editApplication, lastUpdated: new Date().toISOString().split('T')[0]} : app
      ));
      
      setShowEditModal(false);
    } catch (err) {
      setFormError(`Error updating application: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit form input change
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditApplication(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending":
        return "status-pending";
      case "On Review":
        return "status-review";
      case "Approved":
        return "status-approved";
      case "Denied":
        return "status-denied";
      default:
        return "";
    }
  };

  // Add function to get action text based on status
  const getActionText = (status) => {
    switch (status) {
      case "Pending":
        return "Track";
      case "On Review":
        return "Track";
      case "Approved":
        return "View";
      case "Denied":
        return "View";
      default:
        return "Track";
    }
  };

  // Format date with time
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApplications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  return (
    <div className="my-application-container">
      <div className="application-list-header">
        <h1 className="application-list-title">My Applications</h1>
        <p className="application-list-subtitle">Track and manage your permit applications</p>
      </div>
      
      <div className="my-application-content">
        <div className="my-application-filters">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          <div className="filter-container">
            <div className="filter-group">
              <label htmlFor="status-filter">Status:</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="filter-select"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="On Review">On Review</option>
                <option value="Approved">Approved</option>
                <option value="Denied">Denied</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="sort-by">Sort By:</label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="filter-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your applications...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button className="retry-button" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="empty-state">
            <p>No applications found. {searchTerm || statusFilter !== "all" ? "Try adjusting your filters." : ""}</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="shared-table">
                <thead>
                  <tr>
                    <th>Reference #</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Submission Date</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((application) => (
                    <tr key={application.id}>
                      <td>{application.referenceNumber}</td>
                      <td>{application.title}</td>
                      <td>{application.type}</td>
                      <td>
                        <span className={`status-badge ${application.status.toLowerCase().replace(' ', '-')}`}>
                          {application.status}
                        </span>
                      </td>
                      <td>{formatDate(application.submissionDate)}</td>
                      <td>{formatDate(application.lastUpdated)}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className={`action-button ${application.status === "Approved" || application.status === "Denied" ? 'view-button' : 'track-button'}`}
                            onClick={() => handleViewDetails(application)}
                            title={`${getActionText(application.status)} Application`}
                          >
                            {application.status === "Approved" || application.status === "Denied" ? <FaEye /> : <FaChartLine />}
                          </button>
                          {application.status !== "Approved" && application.status !== "Denied" && (
                            <button 
                              className="action-button delete-button" 
                              onClick={() => handleDeleteApplication(application.id)}
                              title="Delete Application"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-button"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  ❮ Prev
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
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next ❯
                </button>
              </div>
            )}
          </>
        )}

        {/* Edit Application Modal */}
        {showEditModal && editApplication && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <h2>Edit Application</h2>
                <button className="modal-close" onClick={() => setShowEditModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                {formError && <div className="form-error">{formError}</div>}
                <form onSubmit={handleEditSubmit}>
                  <div className="form-group">
                    <label htmlFor="edit-title">Title</label>
                    <input
                      type="text"
                      id="edit-title"
                      name="title"
                      value={editApplication.title}
                      onChange={handleEditInputChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="edit-description">Description</label>
                    <textarea
                      id="edit-description"
                      name="description"
                      value={editApplication.description}
                      onChange={handleEditInputChange}
                      required
                      className="form-textarea"
                      rows={5}
                    />
                  </div>
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="cancel-button"
                      onClick={() => setShowEditModal(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="submit-button"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
        </div>
    );
}

export default MyApplication;