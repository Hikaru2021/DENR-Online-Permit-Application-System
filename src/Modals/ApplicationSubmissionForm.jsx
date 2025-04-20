import { useState, useCallback } from "react";
import { FaTimes, FaCloudUploadAlt, FaInfoCircle, FaFileAlt, FaMoneyBillWave } from "react-icons/fa";
import { useDropzone } from "react-dropzone";
import "../CSS/ApplicationSubmissionList.css";

const ApplicationSubmissionForm = ({ isOpen, onClose, application }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
    address: "",
    purpose: "",
    documents: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      // TODO: Implement submission logic
      console.log('Form data:', formData);
      console.log('Uploaded files:', uploadedFiles);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onClose();
    } catch (err) {
      setFormError(`Error submitting application: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = () => {
    setActiveStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setActiveStep(prev => prev - 1);
  };

  if (!isOpen || !application) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container application-submission-form">
        <div className="modal-header">
          <div className="modal-title-section">
            <h2>Application Submission</h2>
            <span className="content-badge">{application.type}</span>
          </div>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {formError && (
            <div className="form-error">
              <FaInfoCircle /> {formError}
            </div>
          )}

          <div className="application-info">
            <h3>{application.title}</h3>
            <div className="description-section">
              <h4>Description</h4>
              <p>{application.description}</p>
            </div>
          </div>

          <div className="steps-indicator">
            <div className={`step ${activeStep >= 1 ? 'active' : ''}`}>
              <span>1</span>
              <p>Requirements</p>
            </div>
            <div className={`step ${activeStep >= 2 ? 'active' : ''}`}>
              <span>2</span>
              <p>Personal Info</p>
            </div>
            <div className={`step ${activeStep >= 3 ? 'active' : ''}`}>
              <span>3</span>
              <p>Documents</p>
            </div>
            <div className={`step ${activeStep >= 4 ? 'active' : ''}`}>
              <span>4</span>
              <p>Review</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="submission-form">
            {activeStep === 1 && (
              <div className="form-step">
                <div className="requirements-section">
                  <h4>Requirements</h4>
                  <ul className="requirements-list">
                    <li>Valid ID (Government-issued)</li>
                    <li>Proof of Address</li>
                    <li>Business Permit (if applicable)</li>
                    <li>Environmental Compliance Certificate</li>
                    <li>Other supporting documents</li>
                  </ul>
                </div>

                <div className="fees-section">
                  <h4>Processing Fees</h4>
                  <div className="fee-item">
                    <FaMoneyBillWave className="fee-icon" />
                    <div className="fee-details">
                      <span className="fee-label">Application Fee</span>
                      <span className="fee-amount">₱1,000.00</span>
                    </div>
                  </div>
                  <div className="fee-item">
                    <FaMoneyBillWave className="fee-icon" />
                    <div className="fee-details">
                      <span className="fee-label">Processing Fee</span>
                      <span className="fee-amount">₱500.00</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="form-step">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contactNumber">Contact Number</label>
                  <input
                    type="tel"
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your contact number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your complete address"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="purpose">Purpose of Application</label>
                  <textarea
                    id="purpose"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    required
                    placeholder="Describe the purpose of your application"
                    rows="3"
                  />
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="form-step">
                <div className="upload-section">
                  <h4>Upload Required Documents</h4>
                  <div 
                    {...getRootProps()} 
                    className={`upload-area ${isDragActive ? 'active' : ''}`}
                  >
                    <input {...getInputProps()} />
                    <FaCloudUploadAlt className="upload-icon" />
                    <p>Drag & drop files here, or click to select files</p>
                    <span className="file-info">
                      Supported formats: PDF, DOC, DOCX, JPG, PNG
                      <br />
                      Maximum file size: 5MB
                    </span>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="uploaded-files">
                      <h5>Uploaded Files:</h5>
                      <ul>
                        {uploadedFiles.map((file, index) => (
                          <li key={index}>
                            <FaFileAlt className="file-icon" />
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div className="form-step">
                <div className="review-section">
                  <h4>Review Your Application</h4>
                  <div className="review-content">
                    <div className="review-item">
                      <h5>Personal Information</h5>
                      <p><strong>Name:</strong> {formData.fullName}</p>
                      <p><strong>Email:</strong> {formData.email}</p>
                      <p><strong>Contact:</strong> {formData.contactNumber}</p>
                      <p><strong>Address:</strong> {formData.address}</p>
                      <p><strong>Purpose:</strong> {formData.purpose}</p>
                    </div>

                    <div className="review-item">
                      <h5>Uploaded Documents</h5>
                      <ul>
                        {uploadedFiles.map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="review-item">
                      <h5>Fees Summary</h5>
                      <div className="fee-summary">
                        <p>Application Fee: ₱1,000.00</p>
                        <p>Processing Fee: ₱500.00</p>
                        <p className="total-fee">Total: ₱1,500.00</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="form-navigation">
              {activeStep > 1 && (
                <button
                  type="button"
                  className="nav-button prev"
                  onClick={handlePrevStep}
                  disabled={isSubmitting}
                >
                  Previous
                </button>
              )}

              {activeStep < 4 ? (
                <button
                  type="button"
                  className="nav-button next"
                  onClick={handleNextStep}
                  disabled={isSubmitting}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSubmissionForm; 
 
 
 