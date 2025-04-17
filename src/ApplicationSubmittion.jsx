import { useState } from "react";
import "./CSS/ApplicationSubmittion.css";
import { FaSearch, FaEye, FaDownload, FaChevronDown } from "react-icons/fa";

const ApplicationSubmittion = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data for demonstration
  const mockApplications = [
    {
      id: "APP001",
      title: "Building Permit Application",
      created_at: "2023-05-15T10:30:00",
      status: "Pending"
    },
    {
      id: "APP002",
      title: "Environmental Impact Assessment",
      created_at: "2023-05-14T14:20:00",
      status: "Approved"
    },
    {
      id: "APP003",
      title: "Waste Management Permit",
      created_at: "2023-05-13T09:15:00",
      status: "Denied"
    },
    {
      id: "APP004",
      title: "Water Usage Certificate",
      created_at: "2023-05-12T16:45:00",
      status: "On Review"
    },
    {
      id: "APP005",
      title: "Air Quality Permit",
      created_at: "2023-05-11T11:30:00",
      status: "Approved"
    },
    {
      id: "APP006",
      title: "Forestry Permit",
      created_at: "2023-05-10T09:20:00",
      status: "Pending"
    },
    {
      id: "APP007",
      title: "Mining License",
      created_at: "2023-05-09T15:40:00",
      status: "On Review"
    }
  ];

  const applicationsPerPage = 5;
  const indexOfLastApplication = currentPage * applicationsPerPage;
  const indexOfFirstApplication = indexOfLastApplication - applicationsPerPage;
  const currentApplications = mockApplications.slice(indexOfFirstApplication, indexOfLastApplication);
  const totalPages = Math.ceil(mockApplications.length / applicationsPerPage);

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

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowViewModal(true);
  };

  const handleDownload = (application) => {
    // Mock download functionality
    console.log("Downloading application:", application);
    alert(`Downloading application: ${application.title}`);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const filteredApplications = mockApplications.filter(
    (application) => {
      const matchesSearch = 
        (application.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (application.id || "").toString().includes(search);
      
      const matchesStatus = 
        statusFilter === "all" || 
        application.status.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    }
  );

  return (
    <div className="application-container">

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
        
        <div className="status-filter">
          <label htmlFor="status-filter">Status:</label>
          <div className="select-wrapper">
            <select 
              id="status-filter" 
              value={statusFilter} 
              onChange={handleStatusFilterChange}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="on review">On Review</option>
              <option value="approved">Approved</option>
              <option value="denied">Denied</option>
            </select>
            <FaChevronDown className="select-icon" />
          </div>
        </div>
      </div>

      <div className="application-table">
        <table>
          <thead>
            <tr>
              <th>Application ID</th>
              <th>Title</th>
              <th>Submission Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application) => (
                <tr key={application.id}>
                  <td>{application.id}</td>
                  <td>{application.title || "N/A"}</td>
                  <td>
                    {new Date(application.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        application.status ? application.status.toLowerCase().replace(" ", "-") : "pending"
                      }`}
                    >
                      {application.status || "Pending"}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button
                      className="view-btn"
                      onClick={() => handleViewDetails(application)}
                    >
                      <FaEye /> View
                    </button>
                    <button
                      className="download-btn"
                      onClick={() => handleDownload(application)}
                    >
                      <FaDownload /> Download
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">
                  No applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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

      {/* View Application Modal */}
      {showViewModal && selectedApplication && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Application Details</h2>
              <button
                className="modal-close"
                onClick={() => setShowViewModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-group">
                <label>Application ID:</label>
                <span>{selectedApplication.id}</span>
              </div>
              <div className="detail-group">
                <label>Title:</label>
                <span>{selectedApplication.title}</span>
              </div>
              <div className="detail-group">
                <label>Submission Date:</label>
                <span>
                  {new Date(selectedApplication.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="detail-group">
                <label>Status:</label>
                <span className={`status-badge ${selectedApplication.status?.toLowerCase().replace(" ", "-")}`}>
                  {selectedApplication.status || "Pending"}
                </span>
              </div>
              <div className="detail-group">
                <label>Description:</label>
                <span>This is a sample description for the application. In a real implementation, this would contain details about the application.</span>
              </div>
              <div className="detail-group">
                <label>Documents:</label>
                <div className="document-list">
                  <div className="document-item">
                    <span>Application Form.pdf</span>
                    <button className="download-btn-small">
                      <FaDownload /> Download
                    </button>
                  </div>
                  <div className="document-item">
                    <span>Supporting Documents.zip</span>
                    <button className="download-btn-small">
                      <FaDownload /> Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationSubmittion;
