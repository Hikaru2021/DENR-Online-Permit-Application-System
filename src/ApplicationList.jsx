import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaFilter, FaSort, FaEye, FaChartLine, FaTrash, FaDownload, FaCalendarAlt, FaFile, FaIdCard, FaUser, FaMapMarkerAlt, FaEnvelope, FaPhone, FaFileAlt, FaClipboardList, FaMoneyBillWave, FaInfoCircle, FaTags, FaClock, FaFileContract } from "react-icons/fa";
import "./CSS/ApplicationList.css";
import "./CSS/SharedTable.css";
import ApplicationSubmissionForm from "./Modals/ApplicationSubmissionForm";
import { supabase } from "./library/supabaseClient";
import JSZip from 'jszip';

// Supabase storage constants
const STORAGE_BUCKET = 'guidelines';

function ApplicationList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(location.state?.statusFilter || "all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [applicationTypes, setApplicationTypes] = useState([]);
  const [downloadingDocId, setDownloadingDocId] = useState(null);
  const [documents, setDocuments] = useState({});
  const [isDownloadingAllDocs, setIsDownloadingAllDocs] = useState(false);

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

  // Fetch document details
  const fetchDocuments = async (userAppId) => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_submissions', userAppId);

      if (error) throw error;

      if (data && data.length > 0) {
        return data;
      }
      return [];
    } catch (err) {
      console.error('Error fetching documents:', err);
      return [];
    }
  };

  // Fetch all user applications
  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const { data: user_applications, error } = await supabase
        .from('user_applications')
        .select(`
          id,
          created_at,
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
            description,
            application_fee,
            processing_fee
          ),
          users (
            id,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our component's expected format
      const transformedApplications = user_applications.map(app => ({
        id: app.id,
        application_id: `APP-${app.id.toString().padStart(6, '0')}`,
        applicant_name: app.full_name,
        title: app.applications.title,
        type: app.applications.type,
        submitted_at: app.created_at,
        status: getStatusName(app.status),
        statusId: app.status,
        description: app.applications.description,
        notes: "",
        // User details
        fullName: app.full_name,
        email: app.users?.email,
        contactNumber: app.contact_number,
        address: app.address,
        purpose: app.purpose,
        // Fees
        fees: {
          application: app.applications.application_fee || 0,
          processing: app.applications.processing_fee || 0,
          total: (app.applications.application_fee || 0) + (app.applications.processing_fee || 0)
        }
      }));

      setApplications(transformedApplications);
      
      // Extract unique application types
      const types = [...new Set(transformedApplications.map(app => app.type))];
      setApplicationTypes(types);
      
      setError(null);
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

  // Update status filter when location state changes
  useEffect(() => {
    if (location.state?.statusFilter) {
      setStatusFilter(location.state.statusFilter);
    }
  }, [location.state]);

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

  // Handle type filter change
  const handleTypeFilterChange = (e) => {
    setTypeFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Filter and sort applications
  const filteredAndSortedApplications = applications
    .filter(app => {
      // Search filter
      const matchesSearch = 
        app.title.toLowerCase().includes(search.toLowerCase()) ||
        app.applicant_name.toLowerCase().includes(search.toLowerCase()) ||
        app.application_id.toLowerCase().includes(search.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      
      // Type filter
      const matchesType = typeFilter === "all" || app.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch(sortBy) {
        case "newest":
          comparison = new Date(b.submitted_at) - new Date(a.submitted_at);
          break;
        case "oldest":
          comparison = new Date(a.submitted_at) - new Date(b.submitted_at);
          break;
        case "applicant":
          comparison = a.applicant_name.localeCompare(b.applicant_name);
          break;
        case "status":
          comparison = a.statusId - b.statusId;
          break;
        default:
          comparison = b.id - a.id; // Default sort by ID descending
      }
      
      return comparison;
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
  const handleViewApplication = async (application) => {
    try {
      const docs = await fetchDocuments(application.id);
      if (docs && docs.length > 0) {
        setDocuments({ ...documents, [application.id]: docs });
      }
      setSelectedApplication(application);
      setShowViewModal(true);
    } catch (err) {
      console.error('Error retrieving documents for viewing:', err);
    }
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

  // Handle download application (all documents as ZIP)
  const handleDownloadApplication = async (application) => {
    try {
      setIsDownloadingAllDocs(true);
      
      // Fetch documents for this application
      const docs = await fetchDocuments(application.id);
      
      if (!docs || docs.length === 0) {
        alert('No documents available for this application');
        return;
      }
      
      // Create new ZIP file
      const zip = new JSZip();
      
      // Download each file and add to ZIP
      const downloadPromises = docs.map(async (doc) => {
        try {
          // Extract the filepath from the document
          let filePath = doc.file_link;
          
          // If it's a public URL, extract just the path part
          if (filePath.includes('https://')) {
            const pathRegex = new RegExp(`${STORAGE_BUCKET}/(.+)`, 'i');
            const match = filePath.match(pathRegex);
            if (match && match[1]) {
              filePath = match[1];
            } else {
              throw new Error('Invalid file path format');
            }
          }
          
          // Download the file from storage
          const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .download(filePath);
            
          if (error) throw error;
          
          // Add file to zip
          zip.file(doc.file_name || `document_${doc.id}.pdf`, data);
          return true;
        } catch (err) {
          console.error(`Error downloading document ${doc.id}:`, err);
          return false;
        }
      });
      
      // Wait for all downloads to complete
      await Promise.all(downloadPromises);
      
      // Generate ZIP file
      const zipContent = await zip.generateAsync({ type: 'blob' });
      
      // Create download link for the zip
      const url = URL.createObjectURL(zipContent);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${application.application_id}_documents.zip`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      console.error('Error downloading all documents:', err);
      alert(`Error downloading documents: ${err.message}`);
    } finally {
      setIsDownloadingAllDocs(false);
    }
  };

  // Handle download specific document
  const handleDownloadDocument = async (document) => {
    try {
      setDownloadingDocId(document.id);
      
      // Extract the filepath from the document
      let filePath = document.file_link;
      
      // If it's a public URL, extract just the path part
      if (filePath.includes('https://')) {
        // Extract the path portion after the bucket name
        const pathRegex = new RegExp(`${STORAGE_BUCKET}/(.+)`, 'i');
        const match = filePath.match(pathRegex);
        if (match && match[1]) {
          filePath = match[1];
        } else {
          throw new Error('Invalid file path format');
        }
      }
      
      // Download the file from storage
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .download(filePath);
        
      if (error) throw error;
      
      // Create a download link for the file
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.file_name || 'download';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      console.error('Error downloading document:', err);
      alert(`Error downloading document: ${err.message}`);
    } finally {
      setDownloadingDocId(null);
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Submitted":
        return "status-badge pending";
      case "Under Review":
        return "status-badge in-review";
      case "Needs Revision":
        return "status-badge revision";
      case "Approved":
        return "status-badge approved";
      case "Rejected":
        return "status-badge rejected";
      default:
        return "status-badge";
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

  // Handle start application
  const handleStartApplication = (application) => {
    setSelectedApplication(application);
    setShowSubmissionForm(true);
  };

  // Handle application submitted
  const handleApplicationSubmitted = (submittedData) => {
    // Create a new application object with the submitted data
    const newApplication = {
      id: applications.length + 1,
      application_id: `APP-${new Date().getFullYear()}-${String(applications.length + 1).padStart(3, '0')}`,
      applicant_name: submittedData.fullName,
      title: selectedApplication.title,
      type: selectedApplication.type,
      submitted_at: new Date().toISOString(),
      status: "pending",
      description: selectedApplication.description,
      notes: "New application submitted",
      // User submitted details
      fullName: submittedData.fullName,
      email: submittedData.email,
      contactNumber: submittedData.contactNumber,
      address: submittedData.address,
      purpose: submittedData.purpose,
      documents: submittedData.documents,
      fees: {
        application: 1000,
        processing: 500,
        total: 1500
      }
    };

    // Add the new application to the list
    setApplications(prev => [...prev, newApplication]);
    setShowSubmissionForm(false);
    setSelectedApplication(null);
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
          <div className="filter-item">
            <label>Status:</label>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="all">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Needs Revision">Needs Revision</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          
          <div className="filter-item">
            <label>Type:</label>
            <select
              className="filter-select"
              value={typeFilter}
              onChange={handleTypeFilterChange}
            >
              <option value="all">All Types</option>
              {applicationTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-item">
            <label>Sort By:</label>
            <select
              className="filter-select"
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="applicant">Applicant Name</option>
              <option value="status">Status</option>
            </select>
          </div>
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
            <table className="shared-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Applicant</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-state">No applications found</td>
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
                        <span className={`status-badge ${application.status.toLowerCase().replace(' ', '-')}`}>
                          {application.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-button view-button" 
                            onClick={() => handleViewApplication(application)}
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button 
                            className="action-button track-button" 
                            onClick={() => handleTrackApplication(application)}
                            title="Track Application"
                          >
                            <FaChartLine />
                          </button>
                          <button 
                            className="action-button download-button" 
                            onClick={() => handleDownloadApplication(application)}
                            title="Download All Documents"
                            disabled={isDownloadingAllDocs}
                          >
                            <FaDownload />
                          </button>
                          <button
                            className="action-button delete-button" 
                            onClick={() => handleDeleteApplication(application.id)}
                            title="Delete Application"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Fixed pagination container */}
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
                    // If 5 or fewer pages, show all page numbers
                    for (let i = 1; i <= Math.max(1, totalPages); i++) {
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
        </>
      )}

      {/* View Application Modal with enhanced UI */}
      {showViewModal && selectedApplication && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Application Details</h2>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <h3><FaIdCard /> Application ID</h3>
                <p>{selectedApplication.application_id}</p>
              </div>
              <div className="modal-section">
                <h3><FaUser /> Applicant Information</h3>
                <p><strong>Name:</strong> {selectedApplication.fullName}</p>
                <p><strong>Email:</strong> {selectedApplication.email}</p>
                <p><strong>Contact:</strong> {selectedApplication.contactNumber}</p>
                <p><strong>Address:</strong> {selectedApplication.address}</p>
                <p><strong>Purpose:</strong> {selectedApplication.purpose}</p>
              </div>
              <div className="modal-section">
                <h3><FaFileContract /> Application Type</h3>
                <p>{selectedApplication.title} ({selectedApplication.type})</p>
              </div>
              <div className="modal-section">
                <h3><FaTags /> Status</h3>
                <span className={getStatusBadgeClass(selectedApplication.status)}>
                  {selectedApplication.status}
                </span>
              </div>
              
              {/* Document download section */}
              <div className="modal-section">
                <h3><FaFileAlt /> Documents</h3>
                {documents[selectedApplication.id] && documents[selectedApplication.id].length > 0 ? (
                  <ul className="documents-list">
                    {documents[selectedApplication.id].map(doc => (
                      <li key={doc.id} className="document-item">
                        <div className="document-info">
                          <FaFile className="document-icon" />
                          <span className="document-name">{doc.file_name}</span>
                        </div>
                        <button 
                          className="download-document-btn"
                          onClick={() => handleDownloadDocument(doc)}
                          disabled={downloadingDocId === doc.id}
                        >
                          {downloadingDocId === doc.id ? 'Downloading...' : <FaDownload />}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-documents">No documents available for this application</p>
                )}
              </div>
              
              <div className="modal-section">
                <h3><FaMoneyBillWave /> Fees</h3>
                <div className="fees-details">
                  <p><strong>Application Fee:</strong> <span>₱{Number(selectedApplication.fees?.application || 0).toLocaleString()}</span></p>
                  <p><strong>Processing Fee:</strong> <span>₱{Number(selectedApplication.fees?.processing || 0).toLocaleString()}</span></p>
                  <p><strong>Total:</strong> <span>₱{(Number(selectedApplication.fees?.application || 0) + Number(selectedApplication.fees?.processing || 0)).toLocaleString()}</span></p>
                </div>
              </div>
              <div className="modal-section">
                <h3><FaClock /> Submitted Date</h3>
                <p>{new Date(selectedApplication.submitted_at).toLocaleString()}</p>
              </div>
              {selectedApplication.notes && (
                <div className="modal-section">
                  <h3><FaInfoCircle /> Notes</h3>
                  <p>{selectedApplication.notes}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="modal-button" onClick={() => setShowViewModal(false)}>Close</button>
              <button
                className="modal-button primary"
                onClick={() => {
                  setShowViewModal(false);
                  handleTrackApplication(selectedApplication);
                }}
              >
                <FaChartLine /> Track Application
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
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Needs Revision">Needs Revision</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
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

      {/* Application Submission Form */}
      {showSubmissionForm && selectedApplication && (
        <ApplicationSubmissionForm
          isOpen={showSubmissionForm}
          onClose={() => {
            setShowSubmissionForm(false);
            setSelectedApplication(null);
          }}
          application={selectedApplication}
          onApplicationSubmitted={handleApplicationSubmitted}
        />
      )}
    </div>
  );
}

export default ApplicationList;