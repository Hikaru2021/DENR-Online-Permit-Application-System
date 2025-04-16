import { useState, useEffect } from "react";
import { FaEdit, FaTimes } from "react-icons/fa";
import ApplicationModal from "./Modals/ApplicationModal";
import "./CSS/ApplicationList.css";
import { supabase } from "./library/supabaseClient";

function ApplicationList() {
  const [search, setSearch] = useState("");
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form states for new application
  const [newApplication, setNewApplication] = useState({
    title: "",
    type: "",
    description: ""
  });

  // Form states for editing application
  const [editApplication, setEditApplication] = useState({
    id: null,
    title: "",
    type: "",
    description: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

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

  // Handle input change for new application form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewApplication(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle input change for edit application form
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditApplication(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission for new application
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
      
      // Reset form and close modal
      setNewApplication({ title: "", type: "", description: "" });
      setShowAddModal(false);
      
      // Refresh the applications list
      fetchApplications();
      
    } catch (err) {
      setFormError(`Error creating application: ${err.message}`);
      console.error('Error creating application:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit button click
  const handleEditClick = (app) => {
    setEditingApplication(app);
    setEditApplication({
      id: app.id,
      title: app.title || "",
      type: app.type || "",
      description: app.description || ""
    });
    setShowEditModal(true);
  };

  // Handle form submission for edit application
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const { data, error } = await supabase
        .from('applications')
        .update({ 
          title: editApplication.title,
          type: editApplication.type,
          description: editApplication.description
        })
        .eq('id', editApplication.id)
        .select();
      
      if (error) throw error;
      
      console.log('Application updated:', data);
      
      // Reset form and close modal
      setEditApplication({ id: null, title: "", type: "", description: "" });
      setShowEditModal(false);
      setEditingApplication(null);
      
      // Refresh the applications list
      fetchApplications();
      
    } catch (err) {
      setFormError(`Error updating application: ${err.message}`);
      console.error('Error updating application:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter applications based on search input
  const filteredApplications = applications.filter((app) =>
    app.title?.toLowerCase().includes(search.toLowerCase())
  );

  // Handle Apply button click (toggles the modal)
  const handleApplyClick = (app) => {
    if (selectedApplication?.id === app.id) {
      setSelectedApplication(null);
      setTimeout(() => setSelectedApplication(app), 0); // Ensures re-render
    } else {
      setSelectedApplication(app);
    }
  };

  return (
    <div className="content-container">
      {/* Search Bar */}
      <div className="content-search-bar">
        <button
          className="content-add-btn"
          onClick={() => setShowAddModal(true)}
        >
          + Add New Permit
        </button>
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Applications List */}
      <h2 className="content-section-title">
        {filteredApplications.length} Available Applications
      </h2>

      {/* Loading and Error States */}
      {isLoading && <p className="loading-message">Loading applications...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="content-grid">
        {filteredApplications.map((app) => (
          <div key={app.id} className="content-card">
            <h3>
              {app.title}
              <FaEdit 
                className="content-edit-icon" 
                onClick={() => handleEditClick(app)}
              />
            </h3>
            <span className={`content-badge ${app.type?.toLowerCase()}`}>
              {app.type}
            </span>
            <p className="content-description">{app.description}</p>
            <button
              className="content-apply-btn"
              onClick={() => handleApplyClick(app)}
            >
              Apply Now
            </button>
          </div>
        ))}
        
        {!isLoading && filteredApplications.length === 0 && (
          <p className="no-applications">No applications found.</p>
        )}
      </div>

      {/* View Modal */}
      {selectedApplication && (
        <ApplicationModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
        />
      )}
      
      {/* Add Application Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Create New Permit Application</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              {formError && <div className="form-error-message">{formError}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newApplication.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter permit title"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="type">Type</label>
                  <select
                    id="type"
                    name="type"
                    value={newApplication.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select permit type</option>
                    <option value="Permit">Permit</option>
                    <option value="Certificate">Certificate</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={newApplication.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Provide a detailed description"
                    rows={5}
                  />
                </div>
                
                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowAddModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create Application"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Application Modal */}
      {showEditModal && editingApplication && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Edit Permit Application</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              {formError && <div className="form-error-message">{formError}</div>}
              
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
                    placeholder="Enter permit title"
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
                    <option value="">Select permit type</option>
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
                    required
                    placeholder="Provide a detailed description"
                    rows={5}
                  />
                </div>
                
                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowEditModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Updating..." : "Update Application"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplicationList;