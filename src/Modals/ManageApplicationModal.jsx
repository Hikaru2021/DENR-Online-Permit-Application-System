import { useState } from 'react';
import { FaTimes, FaCheck, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';
import { supabase } from '../library/supabaseClient';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../CSS/ApplicationSubmissionList.css';

const ManageApplicationModal = ({ isOpen, onClose, application, onUpdateStatus }) => {
  const [status, setStatus] = useState(application?.status || '');
  const [comment, setComment] = useState('');
  const [revisionInstructions, setRevisionInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Rich text editor configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet'
  ];

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    // Reset revision instructions if status is not "Needs Revision"
    if (e.target.value !== 'Needs Revision') {
      setRevisionInstructions('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (!status) {
        throw new Error('Please select a status');
      }

      if (status === 'Needs Revision' && !revisionInstructions.trim()) {
        throw new Error('Please provide revision instructions');
      }

      if (!comment.trim()) {
        throw new Error('Please provide a comment');
      }

      const statusUpdate = {
        status,
        comment: {
          message: comment,
          timestamp: new Date().toISOString(),
          isOfficial: true
        }
      };

      if (status === 'Needs Revision') {
        statusUpdate.revisionInstructions = revisionInstructions;
      }

      await onUpdateStatus(statusUpdate);
      onClose();
    } catch (err) {
      setFormError(err.message);
      console.error('Error updating application status:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Manage Application</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {formError && <div className="form-error">{formError}</div>}

          <form onSubmit={handleSubmit} className="application-form">
            <div className="form-group">
              <label htmlFor="applicationId">Application ID</label>
              <input
                type="text"
                id="applicationId"
                value={application?.referenceNumber || ''}
                readOnly
                className="form-input readonly"
              />
            </div>

            <div className="form-group">
              <label htmlFor="currentStatus">Current Status</label>
              <input
                type="text"
                id="currentStatus"
                value={application?.status || ''}
                readOnly
                className="form-input readonly"
              />
            </div>

            <div className="form-group">
              <label htmlFor="newStatus">Update Status</label>
              <select
                id="newStatus"
                value={status}
                onChange={handleStatusChange}
                required
                className="form-input"
              >
                <option value="">Select new status</option>
                <option value="Document Verification">Document Verification</option>
                <option value="Under Review">Under Review</option>
                <option value="Needs Revision">Needs Revision</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {status === 'Needs Revision' && (
              <div className="form-group">
                <label htmlFor="revisionInstructions">Revision Instructions</label>
                <div className="rich-text-editor">
                  <ReactQuill
                    theme="snow"
                    value={revisionInstructions}
                    onChange={setRevisionInstructions}
                    modules={modules}
                    formats={formats}
                    placeholder="Provide detailed instructions for revision"
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="comment">Official Comment</label>
              <div className="rich-text-editor">
                <ReactQuill
                  theme="snow"
                  value={comment}
                  onChange={setComment}
                  modules={modules}
                  formats={formats}
                  placeholder="Add an official comment about this status update"
                />
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
            className={`submit-button ${status === 'Rejected' ? 'reject' : ''}`}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Status"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageApplicationModal; 