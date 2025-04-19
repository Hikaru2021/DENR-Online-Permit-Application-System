import { useState, useCallback } from "react";
import { FaTimes, FaCloudUploadAlt } from "react-icons/fa";
import { supabase } from "../library/supabaseClient";
import "../CSS/ApplicationSubmissionList.css";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useDropzone } from 'react-dropzone';
import { convert } from 'html-to-text';

const EditApplicationModal = ({ isOpen, onClose, onApplicationUpdated, application }) => {
  const [editedApplication, setEditedApplication] = useState({
    title: application?.title || "",
    type: application?.type || "",
    description: application?.description || "",
    guidelinesFile: null,
    applicationFormFile: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Update form when application prop changes
  useState(() => {
    if (application) {
      setEditedApplication({
        title: application.title || "",
        type: application.type || "",
        description: application.description || "",
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
    setEditedApplication(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDescriptionChange = (content) => {
    setEditedApplication(prev => ({
      ...prev,
      description: content
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
      // Convert HTML to plain text
      const plainTextDescription = convert(editedApplication.description, {
        wordwrap: false,
        preserveNewlines: true
      });

      const { data, error } = await supabase
        .from('applications')
        .update({
          title: editedApplication.title,
          type: editedApplication.type,
          description: plainTextDescription
        })
        .eq('id', application.id)
        .select();
      
      if (error) throw error;
      
      // Handle file uploads if needed
      if (editedApplication.guidelinesFile || editedApplication.applicationFormFile) {
        // Implement file upload logic here
      }
      
      onApplicationUpdated(data[0]);
      onClose();
      
    } catch (err) {
      setFormError(`Error updating application: ${err.message}`);
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
              <label>Upload Guidelines</label>
              <div {...getGuidelinesRootProps()} className="file-upload-area">
                <input {...getGuidelinesInputProps()} />
                <FaCloudUploadAlt className="upload-icon" />
                <p>Drag & drop guidelines file here, or click to select</p>
                <span className="file-info">
                  {editedApplication.guidelinesFile ? (
                    editedApplication.guidelinesFile.name
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
                    editedApplication.applicationFormFile.name
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