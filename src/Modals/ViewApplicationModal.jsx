import { FaTimes, FaFileAlt, FaMoneyBillWave, FaListUl, FaInfoCircle } from "react-icons/fa";
import DOMPurify from 'dompurify';
import "../CSS/ApplicationSubmissionList.css";

const ViewApplicationModal = ({ isOpen, onClose, application, onStartApplication }) => {
  if (!isOpen || !application) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  // Sanitize and prepare description content
  const sanitizedDescription = application.description ? DOMPurify.sanitize(application.description) : '';

  return (
    <div className="modal-overlay">
      <div className="modal-container view-application-modal">
        {/* Header Section */}
        <div className="modal-header">
          <div className="modal-title-section">
            <h2>{application.title}</h2>
            <div className="header-meta">
              <span className="application-type-badge">{application.type}</span>
              <span className="application-id">ID: {application.id}</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body">
          {/* Description Section */}
          <div className="content-section">
            <div className="section-header">
              <FaInfoCircle className="section-icon" />
              <h3>Description</h3>
            </div>
            <div 
              className="section-content description-content"
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
          </div>

          {/* Requirements Section */}
          <div className="content-section">
            <div className="section-header">
              <FaListUl className="section-icon" />
              <h3>Requirements</h3>
            </div>
            <div className="section-content">
              <div className="requirements-grid">
                {application.requirements && application.requirements.map((requirement, index) => (
                  <div key={index} className="requirement-card">
                    <div className="requirement-number">{index + 1}</div>
                    <div className="requirement-text">{requirement}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fees Section */}
          <div className="content-section">
            <div className="section-header">
              <FaMoneyBillWave className="section-icon" />
              <h3>Fees Breakdown</h3>
            </div>
            <div className="section-content">
              <div className="fees-container">
                <div className="fee-row">
                  <div className="fee-info">
                    <span className="fee-label">Application Fee</span>
                    <span className="fee-description">One-time payment for application processing</span>
                  </div>
                  <span className="fee-amount">{formatCurrency(application.application_fee)}</span>
                </div>
                <div className="fee-row">
                  <div className="fee-info">
                    <span className="fee-label">Processing Fee</span>
                    <span className="fee-description">Additional processing and handling charges</span>
                  </div>
                  <span className="fee-amount">{formatCurrency(application.processing_fee)}</span>
                </div>
                <div className="fee-total-row">
                  <span className="total-label">Total Amount</span>
                  <span className="total-amount">
                    {formatCurrency(
                      parseFloat(application.application_fee) + 
                      parseFloat(application.processing_fee)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Section */}
        <div className="modal-footer">
          <button 
            className="modal-button secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="modal-button primary"
            onClick={() => {
              onStartApplication(application);
              onClose();
            }}
          >
            Start Application Process
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewApplicationModal; 