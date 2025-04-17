import { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaPlus, FaEye, FaDownload, FaSort, FaTimes, FaEdit } from "react-icons/fa";
import "./CSS/ListOfApplications.css";
import { supabase } from "./library/supabaseClient";
import AddApplicationModal from "./Modals/AddApplicationModal";

function ListOfApplications() {
  const [search, setSearch] = useState("");
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editApplication, setEditApplication] = useState(null);

  // Fetch applications from Supabase
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
  
  useEffect(() => {
    fetchApplications();
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Handle type filter change
  const handleTypeFilterChange = (e) => {
    setTypeFilter(e.target.value);
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

  // Handle application added
  const handleApplicationAdded = () => {
    fetchApplications();
  };

  // Handle edit click
  const handleEditClick = (e, application) => {
    e.stopPropagation(); // Prevent card click event
    setEditApplication(application);
    setShowEditModal(true);
  };

  // Handle edit input change
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditApplication(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle edit submit
  const handleEditSubmit = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .update({
          title: editApplication.title || null,
          type: editApplication.type || null,
          description: editApplication.description || null
        })
        .eq('id', editApplication.id)
        .select('id, title, type, description, application_date');
      
      if (error) throw error;
      
      setApplications(prev => 
        prev.map(app => app.id === editApplication.id ? data[0] : app)
      );
      setShowEditModal(false);
      setEditApplication(null);
    } catch (err) {
      console.error('Error updating application:', err);
      alert('Error updating application. Please try again.');
    }
  };

  // Filter and sort applications
  const filteredAndSortedApplications = applications
    .filter(app => {
      const matchesSearch = app.title.toLowerCase().includes(search.toLowerCase()) ||
                         app.description.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || app.type === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === "date") {
        comparison = new Date(a.created_at || 0) - new Date(b.created_at || 0);
      } else if (sortBy === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === "type") {
        comparison = a.type.localeCompare(b.type);
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });

  // Handle application click
  const handleApplicationClick = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  // Handle download
  const handleDownload = async (filePath, fileName) => {
    try {
      const { data, error } = await supabase.storage
        .from('applications')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Error downloading file. Please try again.');
    }
  };

  return (
    <div className="content-container">
      <div className="content-filters">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search applications..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <div className="filter-container">
          <div className="filter-group">
            <label>Type:</label>
            <select
              className="filter-select"
              value={typeFilter}
              onChange={handleTypeFilterChange}
            >
              <option value="all">All Types</option>
              <option value="Permit">Permit</option>
              <option value="Certificate">Certificate</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Sort by:</label>
            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="date">Date</option>
              <option value="title">Title</option>
              <option value="type">Type</option>
            </select>
            <button 
              className="sort-order-btn"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              title={sortOrder === "asc" ? "Ascending" : "Descending"}
            >
              <FaSort className={sortOrder === "asc" ? "asc" : ""} />
            </button>
          </div>
          <button className="content-add-btn" onClick={() => setShowAddModal(true)}>
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
          <button className="retry-button" onClick={fetchApplications}>Retry</button>
        </div>
      ) : filteredAndSortedApplications.length === 0 ? (
        <div className="empty-state">
          <p>No applications found. Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="applications-count">
            {filteredAndSortedApplications.length} available applications
          </div>
          <div className="content-grid">
            {filteredAndSortedApplications.map((application) => (
              <div
                key={application.id}
                className="content-card"
                onClick={() => handleApplicationClick(application)}
              >
                <button 
                  className="edit-button-icon"
                  onClick={(e) => handleEditClick(e, application)}
                  title="Edit Application"
                >
                  <FaEdit />
                </button>
                <div className="card-header">
                  <h3 className="card-title">{application.title}</h3>
                </div>
                <div className="card-type-container">
                  <span className="card-type">{application.type}</span>
                </div>
                <div className="card-description">{application.description}</div>
                <div className="card-actions">
                  <button className="apply-button">Apply Now</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* View Application Modal */}
      {showModal && selectedApplication && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title-section">
                <h2>{selectedApplication.title}</h2>
                <span className="content-badge">{selectedApplication.type}</span>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <h3>Description</h3>
                <div className="details-description" dangerouslySetInnerHTML={{ __html: selectedApplication.description }} />
              </div>
              <div className="download-section">
                <h3>Downloadable Files</h3>
                <div className="download-buttons">
                  <button 
                    className="download-button"
                    onClick={() => handleDownload('guidelines.pdf', 'Guidelines.pdf')}
                  >
                    <FaDownload /> Guidelines
                  </button>
                  <button 
                    className="download-button"
                    onClick={() => handleDownload('application-form.pdf', 'Application Form.pdf')}
                  >
                    <FaDownload /> Application Form
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-button" onClick={() => setShowModal(false)}>Close</button>
              <button className="modal-button primary">Start Application</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Application Modal */}
      <AddApplicationModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onApplicationAdded={handleApplicationAdded}
      />

      {/* Edit Application Modal */}
      {showEditModal && editApplication && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Application</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <form className="add-form">
                <div className="form-group">
                  <label htmlFor="edit-title">Title</label>
                  <input
                    type="text"
                    id="edit-title"
                    name="title"
                    value={editApplication.title}
                    onChange={handleEditInputChange}
                    placeholder="Enter application title"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-type">Type</label>
                  <select
                    id="edit-type"
                    name="type"
                    value={editApplication.type}
                    onChange={handleEditInputChange}
                    required
                  >
                    <option value="Permit">Permit</option>
                    <option value="Certificate">Certificate</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="edit-description">Description</label>
                  <textarea
                    id="edit-description"
                    name="description"
                    value={editApplication.description}
                    onChange={handleEditInputChange}
                    placeholder="Enter application description"
                    rows="5"
                    required
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="modal-button" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="modal-button primary" onClick={handleEditSubmit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListOfApplications; 