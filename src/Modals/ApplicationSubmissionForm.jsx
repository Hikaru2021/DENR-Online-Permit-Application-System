import { useState, useCallback } from "react";
import { FaTimes, FaCloudUploadAlt, FaInfoCircle, FaFileAlt, FaMoneyBillWave, FaListUl } from "react-icons/fa";
import { useDropzone } from "react-dropzone";
import { supabase } from "../library/supabaseClient";
import "../CSS/ApplicationSubmissionList.css";

const ApplicationSubmissionForm = ({ isOpen, onClose, application }) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    contact_number: "",
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

  const validateStep2 = () => {
    if (!formData.full_name.trim()) {
      setFormError('Full name is required');
      return false;
    }
    if (!formData.contact_number.trim()) {
      setFormError('Contact number is required');
      return false;
    }
    if (!formData.address.trim()) {
      setFormError('Address is required');
      return false;
    }
    if (!formData.purpose.trim()) {
      setFormError('Purpose is required');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setFormError(null);

    if (activeStep === 2) {
      if (!validateStep2()) {
        return;
      }
    }

    setActiveStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setFormError(null);
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only process submit if we're on the final step
    if (activeStep !== 4) {
      handleNextStep();
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      // Get the current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!user) throw new Error('You must be logged in to submit an application');

      // Insert into user_applications table
      const { data: applicationData, error: applicationError } = await supabase
        .from('user_applications')
        .insert([{
          user_id: user.id, // Use the authenticated user's ID
          application_id: application.id,
          status: 1, // Initial status (Submitted)
          full_name: formData.full_name,
          contact_number: formData.contact_number,
          address: formData.address,
          purpose: formData.purpose
        }])
        .select();

      if (applicationError) throw applicationError;

      // TODO: Document upload functionality will be implemented later
      if (uploadedFiles.length > 0) {
        console.log('Files ready for future upload:', uploadedFiles.map(f => f.name));
      }

      // Close the form after successful submission
      onClose();
    } catch (err) {
      setFormError(err.message);
      console.error('Error submitting application:', err);
    } finally {
      setIsSubmitting(false);
    }
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

          <div className="content-section">
            <div className="section-header">
              <FaInfoCircle className="section-icon" />
              <h3>{application.title}</h3>
            </div>
            <div className="section-content">
              <div className="description-content">
                {application.description}
              </div>
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
                        <span className="fee-amount">₱{application.application_fee}</span>
                      </div>
                      <div className="fee-row">
                        <div className="fee-info">
                          <span className="fee-label">Processing Fee</span>
                          <span className="fee-description">Additional processing and handling charges</span>
                        </div>
                        <span className="fee-amount">₱{application.processing_fee}</span>
                      </div>
                      <div className="fee-total-row">
                        <span className="total-label">Total Amount</span>
                        <span className="total-amount">
                          ₱{parseFloat(application.application_fee) + parseFloat(application.processing_fee)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="form-step">
                <div className="content-section">
                  <div className="section-header">
                    <FaInfoCircle className="section-icon" />
                    <h3>Personal Information</h3>
                  </div>
                  <div className="section-content">
                    <div className="form-group">
                      <label htmlFor="full_name">Full Name</label>
                      <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your full name"
                        className="form-input"
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
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="contact_number">Contact Number</label>
                      <input
                        type="tel"
                        id="contact_number"
                        name="contact_number"
                        value={formData.contact_number}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your contact number"
                        className="form-input"
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
                        className="form-input"
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
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="form-step">
                <div className="content-section">
                  <div className="section-header">
                    <FaCloudUploadAlt className="section-icon" />
                    <h3>Document Upload</h3>
                  </div>
                  <div className="section-content">
                    <div className="upload-section">
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
                          <h5>Uploaded Files</h5>
                          <div className="files-grid">
                            {uploadedFiles.map((file, index) => (
                              <div key={index} className="file-card">
                                <FaFileAlt className="file-icon" />
                                <div className="file-details">
                                  <span className="file-name">{file.name}</span>
                                  <span className="file-size">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div className="form-step">
                <div className="content-section">
                  <div className="section-header">
                    <FaInfoCircle className="section-icon" />
                    <h3>Application Review</h3>
                  </div>
                  <div className="section-content">
                    <div className="review-grid">
                      <div className="review-card">
                        <h4>Personal Information</h4>
                        <div className="review-item">
                          <span className="review-label">Name:</span>
                          <span className="review-value">{formData.full_name}</span>
                        </div>
                        <div className="review-item">
                          <span className="review-label">Email:</span>
                          <span className="review-value">{formData.email}</span>
                        </div>
                        <div className="review-item">
                          <span className="review-label">Contact:</span>
                          <span className="review-value">{formData.contact_number}</span>
                        </div>
                        <div className="review-item">
                          <span className="review-label">Address:</span>
                          <span className="review-value">{formData.address}</span>
                        </div>
                        <div className="review-item">
                          <span className="review-label">Purpose:</span>
                          <span className="review-value">{formData.purpose}</span>
                        </div>
                      </div>

                      <div className="review-card">
                        <h4>Uploaded Documents</h4>
                        <div className="files-grid">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="file-card">
                              <FaFileAlt className="file-icon" />
                              <div className="file-details">
                                <span className="file-name">{file.name}</span>
                                <span className="file-size">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="review-card">
                        <h4>Fees Summary</h4>
                        <div className="fees-container">
                          <div className="fee-row">
                            <div className="fee-info">
                              <span className="fee-label">Application Fee</span>
                            </div>
                            <span className="fee-amount">₱{application.application_fee}</span>
                          </div>
                          <div className="fee-row">
                            <div className="fee-info">
                              <span className="fee-label">Processing Fee</span>
                            </div>
                            <span className="fee-amount">₱{application.processing_fee}</span>
                          </div>
                          <div className="fee-total-row">
                            <span className="total-label">Total Amount</span>
                            <span className="total-amount">
                              ₱{parseFloat(application.application_fee) + parseFloat(application.processing_fee)}
                            </span>
                          </div>
                        </div>
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
                  className="modal-button secondary"
                  onClick={handlePrevStep}
                  disabled={isSubmitting}
                >
                  Previous
                </button>
              )}

              {activeStep < 4 ? (
                <button
                  type="button"
                  className="modal-button primary"
                  onClick={handleNextStep}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Next"}
                </button>
              ) : (
                <button
                  type="button"
                  className="modal-button primary"
                  onClick={handleSubmit}
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