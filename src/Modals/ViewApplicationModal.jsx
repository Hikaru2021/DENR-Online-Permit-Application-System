import { useState, useEffect } from "react";
import { FaTimes, FaDownload, FaFileAlt } from "react-icons/fa";
import { supabase } from "../library/supabaseClient";
import "../CSS/ApplicationSubmissionList.css";

const ViewApplicationModal = ({ isOpen, onClose, application, onStartApplication }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState({
    guidelines: null,
    applicationForm: null
  });

  useEffect(() => {
    if (application) {
      fetchFiles();
    }
  }, [application]);

  const fetchFiles = async () => {
    if (!application) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch guidelines file
      const { data: guidelinesData, error: guidelinesError } = await supabase.storage
        .from('applications')
        .download(`${application.id}/guidelines.pdf`);
      
      if (guidelinesError && guidelinesError.message !== 'The resource was not found') {
        throw guidelinesError;
      }

      // Fetch application form file
      const { data: formData, error: formError } = await supabase.storage
        .from('applications')
        .download(`${application.id}/application-form.pdf`);
      
      if (formError && formError.message !== 'The resource was not found') {
        throw formError;
      }

      setFiles({
        guidelines: guidelinesData || null,
        applicationForm: formData || null
      });
    } catch (err) {
      setError(`Error fetching files: ${err.message}`);
      console.error('Error fetching files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (fileType) => {
    if (!application) return;
    
    try {
      const { data, error } = await supabase.storage
        .from('applications')
        .download(`${application.id}/${fileType}.pdf`);
      
      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${application.title}-${fileType}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Error downloading ${fileType}: ${err.message}`);
      console.error(`Error downloading ${fileType}:`, err);
    }
  };

  if (!isOpen || !application) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-title-section">
            <h2>{application.title}</h2>
            <span className="content-badge">{application.type}</span>
          </div>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="modal-section">
            <h3>Description</h3>
            <div 
              className="details-description" 
              dangerouslySetInnerHTML={{ __html: application.description }} 
            />
          </div>

          <div className="modal-section">
            <h3>Downloadable Files</h3>
            <div className="download-section">
              <div className="file-item">
                <FaFileAlt className="file-icon" />
                <span className="file-name">Guidelines</span>
                <button 
                  className="download-button"
                  onClick={() => handleDownload('guidelines')}
                  disabled={!files.guidelines || isLoading}
                >
                  <FaDownload /> Download
                </button>
              </div>
              
              <div className="file-item">
                <FaFileAlt className="file-icon" />
                <span className="file-name">Application Form</span>
                <button 
                  className="download-button"
                  onClick={() => handleDownload('application-form')}
                  disabled={!files.applicationForm || isLoading}
                >
                  <FaDownload /> Download
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            className="modal-button secondary"
            onClick={onClose}
          >
            Close
          </button>
          <button 
            className="modal-button primary"
            onClick={() => {
              onStartApplication(application);
              onClose();
            }}
          >
            Start Application
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewApplicationModal; 