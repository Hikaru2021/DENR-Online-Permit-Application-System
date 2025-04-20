import { useState, useCallback } from "react";
import { FaTimes, FaCloudUploadAlt } from "react-icons/fa";
import { supabase } from "../library/supabaseClient";
import "../CSS/ApplicationSubmissionList.css";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useDropzone } from 'react-dropzone';
import { convert } from 'html-to-text';

const AddApplicationModal = ({ isOpen, onClose, onApplicationAdded }) => {
  const [newApplication, setNewApplication] = useState({
    title: "",
    type: "",
    description: "",
    guidelinesFile: null,
    applicationFormFile: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({
    guidelines: 0,
    applicationForm: 0
  });

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
    setNewApplication(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDescriptionChange = (content) => {
    setNewApplication(prev => ({
      ...prev,
      description: content
    }));
  };

  // Guidelines file upload
  const onGuidelinesDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setNewApplication(prev => ({
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
      setNewApplication(prev => ({
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

  const uploadFile = async (file, applicationId, documentType) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${applicationId}/${documentType}.${fileExt}`;
      const filePath = `applications/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('applications')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            setUploadProgress(prev => ({
              ...prev,
              [documentType]: percent
            }));
          }
        });

      if (uploadError) throw uploadError;

      // Insert document record in documents table
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert([{
          application_id: applicationId,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          document_type: documentType
        }])
        .select();

      if (docError) throw docError;

      return docData[0];
    } catch (err) {
      console.error(`Error uploading ${documentType}:`, err);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      // Validate required fields
      if (!newApplication.title || !newApplication.type || !newApplication.description) {
        throw new Error('Please fill in all required fields');
      }

      if (!newApplication.guidelinesFile || !newApplication.applicationFormFile) {
        throw new Error('Please upload both guidelines and application form files');
      }

      // Convert HTML to plain text
      const plainTextDescription = convert(newApplication.description, {
        wordwrap: false,
        preserveNewlines: true
      });

      // Insert application record
      const { data: applicationData, error: applicationError } = await supabase
        .from('applications')
        .insert([{
          title: newApplication.title,
          type: newApplication.type,
          description: plainTextDescription
        }])
        .select();

      if (applicationError) throw applicationError;

      const applicationId = applicationData[0].id;

      // Upload both files
      const [guidelinesDoc, applicationFormDoc] = await Promise.all([
        uploadFile(newApplication.guidelinesFile, applicationId, 'guidelines'),
        uploadFile(newApplication.applicationFormFile, applicationId, 'application_form')
      ]);

      // Combine all data
      const newApplicationData = {
        ...applicationData[0],
        documents: [guidelinesDoc, applicationFormDoc]
      };

      onApplicationAdded(newApplicationData);
      onClose();
    } catch (err) {
      setFormError(err.message);
      console.error('Error submitting application:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Create New Application</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {formError && <div className="form-error">{formError}</div>}

          <form onSubmit={handleSubmit} className="application-form">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newApplication.title}
                onChange={handleInputChange}
                required
                placeholder="Enter application title"
                className="form-input"
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
                className="form-input"
              >
                <option value="">Select application type</option>
                <option value="Permit">Permit</option>
                <option value="Certificate">Certificate</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <div className="rich-text-editor">
                <ReactQuill
                  theme="snow"
                  value={newApplication.description}
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
                  {newApplication.guidelinesFile ? (
                    <>
                      {newApplication.guidelinesFile.name}
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
                  {newApplication.applicationFormFile ? (
                    <>
                      {newApplication.applicationFormFile.name}
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
            {isSubmitting ? "Creating..." : "Create Application"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddApplicationModal; 