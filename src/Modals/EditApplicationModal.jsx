import { useState, useCallback, useEffect } from "react";
import { FaTimes, FaCloudUploadAlt, FaPlus, FaTrash } from "react-icons/fa";
import { supabase } from "../library/supabaseClient";
import "../CSS/ApplicationSubmissionList.css";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useDropzone } from 'react-dropzone';
import { convert } from 'html-to-text';

const EditApplicationModal = ({ isOpen, onClose, onApplicationUpdated, application }) => {
  const [editedApplication, setEditedApplication] = useState({
    id: null,
    application_date: null,
    title: "",
    type: "",
    description: "",
    application_fee: "0",
    processing_fee: "0",
    requirements: [],
    guidelinesFile: null,
    applicationFormFile: null
  });

  const [newRequirement, setNewRequirement] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({
    guidelines: 0,
    applicationForm: 0
  });

  // Update form when application prop changes
  useEffect(() => {
    if (application) {
      console.log('Received application data:', application); // Debug log
      setEditedApplication({
        id: application.id,
        application_date: application.application_date,
        title: application.title || "",
        type: application.type || "",
        description: application.description || "",
        application_fee: application.application_fee ? application.application_fee.toString() : "0",
        processing_fee: application.processing_fee ? application.processing_fee.toString() : "0",
        requirements: application.requirements || [],
        guidelinesFile: null,
        applicationFormFile: null
      });
    }
  }, [application]);

  // Rich text editor modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  // Rich text editor formats
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // For fee fields, ensure we store as string but validate as number
    if (name === 'application_fee' || name === 'processing_fee') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setEditedApplication(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setEditedApplication(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDescriptionChange = (content) => {
    setEditedApplication(prev => ({
      ...prev,
      description: content
    }));
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setEditedApplication(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement("");
    }
  };

  const handleRemoveRequirement = (index) => {
    setEditedApplication(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  // Guidelines file upload
  const onGuidelinesDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setEditedApplication(prev => ({
        ...prev,
        guidelinesFile: file
      }));
      setUploadProgress(prev => ({
        ...prev,
        guidelines: 0
      }));
    }
  }, []);

  const { getRootProps: getGuidelinesRootProps, getInputProps: getGuidelinesInputProps } = useDropzone({
    onDrop: onGuidelinesDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  // Application form file upload
  const onApplicationFormDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setEditedApplication(prev => ({
        ...prev,
        applicationFormFile: file
      }));
      setUploadProgress(prev => ({
        ...prev,
        applicationForm: 0
      }));
    }
  }, []);

  const { getRootProps: getApplicationFormRootProps, getInputProps: getApplicationFormInputProps } = useDropzone({
    onDrop: onApplicationFormDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!application?.id) return;

    setIsSubmitting(true);
    setFormError(null);
    
    try {
      // Validate required fields
      if (!editedApplication.title || !editedApplication.type || !editedApplication.description) {
        throw new Error('Please fill in all required fields');
      }

      // Validate fees
      const appFee = parseFloat(editedApplication.application_fee);
      const procFee = parseFloat(editedApplication.processing_fee);
      if (isNaN(appFee) || isNaN(procFee) || appFee < 0 || procFee < 0) {
        throw new Error('Please enter valid fees');
      }

      // Convert HTML to plain text
      const plainTextDescription = convert(editedApplication.description, {
        wordwrap: false,
        preserveNewlines: true
      });

      // Prepare update data
      const updateData = {
        title: editedApplication.title,
        type: editedApplication.type,
        description: plainTextDescription,
        application_fee: editedApplication.application_fee,
        processing_fee: editedApplication.processing_fee,
        requirements: editedApplication.requirements || [] // Ensure requirements is always an array
      };

      console.log('Updating with data:', updateData); // Debug log

      const { data, error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', application.id)
        .select();
      
      if (error) throw error;

      // Add file metadata to the response object
      const completeApplicationData = {
        ...data[0],
        files: {
          guidelines: editedApplication.guidelinesFile ? {
            name: editedApplication.guidelinesFile.name,
            type: editedApplication.guidelinesFile.type,
            size: editedApplication.guidelinesFile.size
          } : null,
          applicationForm: editedApplication.applicationFormFile ? {
            name: editedApplication.applicationFormFile.name,
            type: editedApplication.applicationFormFile.type,
            size: editedApplication.applicationFormFile.size
          } : null
        }
      };
      
      onApplicationUpdated(completeApplicationData);
      onClose();
      
    } catch (err) {
      setFormError(err.message);
      console.error('Error updating application:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Edit Application</h2>
          <div className="application-meta">
            <span className="application-id">ID: {editedApplication.id}</span>
            <span className="application-date">
              Created: {editedApplication.application_date ? new Date(editedApplication.application_date).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body">
          {formError && <div className="form-error">{formError}</div>}
          
          <form onSubmit={handleSubmit} className="application-form">
            <div className="form-group">
              <label htmlFor="edit-title">Title</label>
              <input
                type="text"
                id="edit-title"
                name="title"
                value={editedApplication.title}
                onChange={handleInputChange}
                required
                placeholder="Enter application title"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="edit-type">Type</label>
              <select
                id="edit-type"
                name="type"
                value={editedApplication.type}
                onChange={handleInputChange}
                required
                className="form-input"
              >
                <option value="">Select application type</option>
                <option value="Permit">Permit</option>
                <option value="Certificate">Certificate</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="edit-description">Description</label>
              <div className="rich-text-editor">
                <ReactQuill
                  theme="snow"
                  value={editedApplication.description}
                  onChange={handleDescriptionChange}
                  modules={modules}
                  formats={formats}
                  placeholder="Provide a detailed description"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="edit-applicationFee">Application Fee (₱)</label>
              <input
                type="number"
                id="edit-application_fee"
                name="application_fee"
                value={editedApplication.application_fee}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                placeholder="Enter application fee"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-processingFee">Processing Fee (₱)</label>
              <input
                type="number"
                id="edit-processing_fee"
                name="processing_fee"
                value={editedApplication.processing_fee}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                placeholder="Enter processing fee"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Requirements</label>
              <div className="requirements-container">
                <div className="requirement-input-group">
                  <input
                    type="text"
                    className="form-input"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Enter a requirement"
                  />
                  <button
                    type="button"
                    className="add-requirement-button"
                    onClick={handleAddRequirement}
                    disabled={!newRequirement.trim()}
                  >
                    <FaPlus />
                  </button>
                </div>
                <div className="requirements-list">
                  {editedApplication.requirements.map((requirement, index) => (
                    <div key={index} className="requirement-item">
                      <span>{requirement}</span>
                      <button
                        type="button"
                        className="remove-requirement-button"
                        onClick={() => handleRemoveRequirement(index)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Upload Guidelines</label>
              <div {...getGuidelinesRootProps()} className="file-upload-area">
                <input {...getGuidelinesInputProps()} />
                <FaCloudUploadAlt className="upload-icon" />
                <p>Drag & drop guidelines file here, or click to select</p>
                <span className="file-info">
                  {editedApplication.guidelinesFile ? (
                    <>
                      {editedApplication.guidelinesFile.name}
                      {uploadProgress.guidelines > 0 && uploadProgress.guidelines < 100 && (
                        <div className="upload-progress">
                          <div 
                            className="progress-bar" 
                            style={{ width: `${uploadProgress.guidelines}%` }}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    "Supported formats: PDF, DOC, DOCX"
                  )}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label>Upload Application Form</label>
              <div {...getApplicationFormRootProps()} className="file-upload-area">
                <input {...getApplicationFormInputProps()} />
                <FaCloudUploadAlt className="upload-icon" />
                <p>Drag & drop application form here, or click to select</p>
                <span className="file-info">
                  {editedApplication.applicationFormFile ? (
                    <>
                      {editedApplication.applicationFormFile.name}
                      {uploadProgress.applicationForm > 0 && uploadProgress.applicationForm < 100 && (
                        <div className="upload-progress">
                          <div 
                            className="progress-bar" 
                            style={{ width: `${uploadProgress.applicationForm}%` }}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    "Supported formats: PDF, DOC, DOCX"
                  )}
                </span>
              </div>
            </div>
          </form>
        </div>
        
        <div className="modal-footer">
          <button
            type="button"
            className="cancel-button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="submit-button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditApplicationModal; 