import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { supabase } from '../library/supabaseClient';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../CSS/ApplicationSubmissionList.css';

const ManageApplicationModal = ({ isOpen, onClose, application, onUpdateStatus }) => {
  const [status, setStatus] = useState('');
  const [comment, setComment] = useState('');
  const [revisionInstructions, setRevisionInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [userApplication, setUserApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  // Status name mapping
  const statusNames = {
    1: 'Submitted',
    2: 'Under Review',
    3: 'Needs Revision',
    4: 'Approved',
    5: 'Rejected'
  };

  // Get status name helper function
  const getStatusName = (statusId) => {
    return statusNames[statusId] || 'Unknown';
  };

  useEffect(() => {
    if (isOpen && application?.id) {
      fetchUserApplication();
    }
  }, [isOpen, application]);

  const fetchUserApplication = async () => {
    setLoading(true);
    try {
      // Fetch the user application record
      const { data, error } = await supabase
        .from('user_applications')
        .select('*')
        .eq('application_id', application.id)
        .single();

      if (error) {
        console.error('Error fetching user application:', error);
        throw error;
      }
      
      if (data) {
        console.log('User application data:', data);
        setUserApplication(data);
        
        if (data.status) {
          // Set the status dropdown to the current status
          setStatus(data.status.toString());
        } else {
          console.warn('Status field is missing or null in user_application record');
          setStatus('');
        }
      } else {
        console.warn('No user application found for application ID:', application.id);
      }
    } catch (err) {
      console.error('Error fetching user application:', err);
    } finally {
      setLoading(false);
    }
  };

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
    // Reset revision instructions if status is not "Needs Revision" (status 3)
    if (e.target.value !== '3') {
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

      if (status === '3' && !revisionInstructions.trim()) {
        throw new Error('Please provide revision instructions');
      }

      if (!comment.trim()) {
        throw new Error('Please provide a comment');
      }

      // Convert status to integer for database
      const numericStatus = parseInt(status, 10);

      if (!userApplication) {
        throw new Error('User application not found');
      }

      // Prepare update data
      const updateData = { 
        status: numericStatus 
      };
      
      // Set approved_date if status is Approved (4)
      if (numericStatus === 4) {
        updateData.approved_date = new Date().toISOString();
      }

      // Update the user_applications table
      const { data, error } = await supabase
        .from('user_applications')
        .update(updateData)
        .eq('id', userApplication.id)
        .select();

      if (error) throw error;

      console.log('Status updated successfully:', data);

      // Create status update object for the parent component
      const statusUpdate = {
        status: getStatusName(numericStatus),
        statusId: numericStatus,
        comment: {
          message: comment,
          timestamp: new Date().toISOString(),
          isOfficial: true
        }
      };

      if (status === '3') {
        statusUpdate.revisionInstructions = revisionInstructions;
      }

      // Call the onUpdateStatus prop to update the UI
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
          {loading ? (
            <div className="loading-indicator">Loading application data...</div>
          ) : (
            <>
              {formError && <div className="form-error">{formError}</div>}

              <form onSubmit={handleSubmit} className="application-form">
                <div className="form-group">
                  <label htmlFor="currentStatus">Current Status</label>
                  <input
                    type="text"
                    id="currentStatus"
                    value={userApplication?.status ? getStatusName(userApplication.status) : 'No status set'}
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
                    <option value="1">Submitted</option>
                    <option value="2">Under Review</option>
                    <option value="3">Needs Revision</option>
                    <option value="4">Approved</option>
                    <option value="5">Rejected</option>
                  </select>
                </div>

                {status === '3' && (
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
            </>
          )}
        </div>

        <div className="modal-footer">
          <button 
            type="button"
            className="cancel-button"
            onClick={onClose}
            disabled={isSubmitting || loading}
          >
            Cancel
          </button>
          <button 
            type="button"
            className={`submit-button ${status === '5' ? 'reject' : ''}`}
            onClick={handleSubmit}
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? "Updating..." : "Update Status"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageApplicationModal; 