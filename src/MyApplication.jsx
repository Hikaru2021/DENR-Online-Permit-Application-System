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
  const [itemsPerPage] = useState(6);

  // Status mapping function
  const getStatusName = (statusId) => {
    switch (statusId) {
      case 1: return "Submitted";
      case 2: return "Under Review";
      case 3: return "Needs Revision";
      case 4: return "Approved";
      case 5: return "Rejected";
      default: return "Unknown";
    }
  };

  // Fetch user's applications
  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) throw new Error('No authenticated user found');

        const { data: user_applications, error } = await supabase
          .from('user_applications')
          .select(`
            id,
            created_at,
            status,
            applications (
              id,
              title,
              type,
              description
            ),
            full_name,
            contact_number,
            address,
            purpose,
            approved_date
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform the data to match our component's expected format
        const transformedApplications = user_applications.map(app => ({
          id: app.id,
          title: app.applications.title,
          type: app.applications.type,
          status: getStatusName(app.status),
          statusId: app.status,
          submissionDate: new Date(app.created_at).toISOString(),
          lastUpdated: app.approved_date ? new Date(app.approved_date).toISOString() : new Date(app.created_at).toISOString(),
          referenceNumber: `REF-${app.id.toString().padStart(6, '0')}`,
          description: app.applications.description,
          fullName: app.full_name,
          contactNumber: app.contact_number,
          address: app.address,
          purpose: app.purpose
        }));

        setApplications(transformedApplications);
        setFilteredApplications(transformedApplications);
      } catch (err) {
        setError(`Error fetching applications: ${err.message}`);
        console.error('Error fetching applications:', err);
      } finally {
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
        app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.fullName.toLowerCase().includes(searchTerm.toLowerCase())
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
      result.sort((a, b) => a.statusId - b.statusId);
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
        const { error } = await supabase
          .from('user_applications')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
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
      case "Submitted":
        return "status-pending";
      case "Under Review":
        return "status-review";
      case "Needs Revision":
        return "status-revision";
      case "Approved":
        return "status-approved";
      case "Rejected":
        return "status-denied";
      default:
        return "";
    }
  };

  // Add function to get action text based on status
  const getActionText = (status) => {
    switch (status) {
      case "Submitted":
      case "Under Review":
      case "Needs Revision":
        return "Track";
      case "Approved":
      case "Rejected":
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
    // Scroll back to the top of the table when changing pages
    document.querySelector('.table-container')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      document.querySelector('.table-container')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      document.querySelector('.table-container')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Function to generate pagination buttons with ellipsis for many pages
  const renderPaginationButtons = () => {
    const pageNumbers = [];
    
    // Handle the case when there are no pages
    if (totalPages <= 0) {
      return [
        <button
          key={1}
          className="pagination-button active"
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      ];
    }
    
    if (totalPages <= 5) {
      // If 5 or fewer pages, show all page numbers
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // For current pages near the start
      if (currentPage <= 3) {
        pageNumbers.push(2, 3, 4);
        pageNumbers.push('ellipsis');
        pageNumbers.push(totalPages);
      } 
      // For current pages near the end
      else if (currentPage >= totalPages - 2) {
        pageNumbers.push('ellipsis');
        pageNumbers.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } 
      // For current pages in the middle
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
          onClick={() => handlePageChange(pageNumber)}
        >
          {pageNumber}
        </button>
      );
    });
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
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Needs Revision">Needs Revision</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
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
            
            {/* Show pagination in fixed container */}
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
                  {renderPaginationButtons()}
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