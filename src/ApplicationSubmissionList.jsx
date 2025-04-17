import { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaSort, FaPlus, FaTimes } from "react-icons/fa";
import "./CSS/ApplicationSubmissionList.css";
import { supabase } from "./library/supabaseClient";
import AddApplicationModal from "./Modals/AddApplicationModal";

function ApplicationSubmissionList() {
  const [search, setSearch] = useState("");
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  
  // Form states for new application
  const [newApplication, setNewApplication] = useState({
    title: "",
    type: "",
    description: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*');
        
      if (error) {
        throw error;
      }
      
      setApplications(data || []);
    } catch (err) {
      setError(`Error fetching applications: ${err.message}`);
      console.error('Error fetching applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewApplication(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const { data, error } = await supabase
        .from('applications')
        .insert([
          { 
            title: newApplication.title,
            type: newApplication.type,
            description: newApplication.description
          }
        ])
        .select();
      
      if (error) throw error;
      
      console.log('Application created:', data);
      
      setNewApplication({ title: "", type: "", description: "" });
      setShowAddModal(false);
      fetchApplications();
      
    } catch (err) {
      setFormError(`Error creating application: ${err.message}`);
      console.error('Error creating application:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const getStatusBadgeClass = (type) => {
    switch (type?.toLowerCase()) {
      case "permit":
        return "status-permit";
      case "certificate":
        return "status-certificate";
      default:
        return "";
    }
  };

  const filteredApplications = applications.filter((app) =>
    app.title?.toLowerCase().includes(search.toLowerCase())
  );

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

  const closeApplicationModal = () => {
    setShowApplicationModal(false);
    setSelectedApplication(null);
  };

  return (
    <div className="submission-container">
      <div className="submission-header">
        <h1>Application Submissions</h1>
        <p>View and manage all submitted applications</p>
      </div>

      <div className="submission-filters">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search applications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-container">
          <div className="filter-group">
            <label htmlFor="status-filter">Type:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="permit">Permits</option>
              <option value="certificate">Certificates</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-by">Sort By:</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={handleSortChange}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name</option>
            </select>
          </div>

          <button
            className="submit-button"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus /> Add New Application
          </button>
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
          <button className="retry-button" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      ) : (
        <div className="applications-grid">
          {filteredApplications.length > 0 ? (
            filteredApplications.map((application) => (
              <div key={application.id} className="application-card">
                <div className="card-body">
                  <h3 className="card-title">{application.title}</h3>
                  <div className="card-type">
                    <span className={`status-badge ${getStatusBadgeClass(application.type)}`}>
                      {application.type}
                    </span>
                  </div>
                  <p className="card-description">{application.description}</p>
                  <button
                    className="apply-button"
                    onClick={() => handleViewDetails(application)}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              No applications found. {search ? "Try adjusting your search." : ""}
            </div>
          )}
        </div>
      )}

      {/* Application Details Modal */}
      {showApplicationModal && selectedApplication && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>{selectedApplication.title}</h2>
              <button className="modal-close" onClick={closeApplicationModal}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="details-section">
                <h3>Description</h3>
                <p className="details-description">{selectedApplication.description}</p>
              </div>
              <div className="details-section">
                <h3>Requirements</h3>
                <ul className="details-list">
                  <li>Valid ID</li>
                  <li>Proof of Address</li>
                  <li>Previous Permits (if applicable)</li>
                  <li>Business Registration (for business permits)</li>
                </ul>
              </div>
              <div className="details-section">
                <h3>Processing Time</h3>
                <p className="details-value">Estimated processing time: 5-7 business days</p>
              </div>
              <div className="details-section">
                <h3>Fees</h3>
                <div className="details-grid">
                  <div className="details-item">
                    <span className="details-label">Application Fee</span>
                    <span className="details-value">₱500.00</span>
                  </div>
                  <div className="details-item">
                    <span className="details-label">Processing Fee</span>
                    <span className="details-value">₱1,000.00</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={closeApplicationModal}>
                Close
              </button>
              <button className="submit-button">
                Proceed to Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Application Modal */}
      <AddApplicationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onApplicationAdded={fetchApplications}
      />
    </div>
  );
}

export default ApplicationSubmissionList; 