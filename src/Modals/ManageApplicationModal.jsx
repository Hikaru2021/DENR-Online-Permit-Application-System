import { useState, useEffect } from 'react';
import { FaTimes, FaComments, FaEdit, FaHistory, FaRegClock } from 'react-icons/fa';
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
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  console.log("Application received by modal:", application);

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

  // Get status ID from status name
  const getStatusId = (statusName) => {
    if (!statusName) return null;
    
    // Convert to lowercase for case-insensitive matching
    const normalizedName = statusName.toLowerCase();
    
    for (const [id, name] of Object.entries(statusNames)) {
      if (name.toLowerCase() === normalizedName) {
        return parseInt(id, 10);
      }
    }
    
    return null;
  };

  useEffect(() => {
    if (isOpen && application) {
      fetchUserApplication();
    }
  }, [isOpen, application]);

  const fetchUserApplication = async () => {
    setLoading(true);
    try {
      // Check if we already have the full user application data
      if (application.id) {
        console.log("Fetching user application with ID:", application.id);

        // Set the status dropdown to the current status 
        // Convert string status to numeric id if necessary
        if (application.statusId) {
          setStatus(application.statusId.toString());
        } else if (application.status) {
          const statusId = getStatusId(application.status);
          setStatus(statusId ? statusId.toString() : '');
        } else {
          setStatus('');
        }

        // Store the application directly - it already has all the data we need
        setUserApplication(application);

        // Fetch comments for this application
        await fetchComments(application.id);
      } else {
        console.warn('No valid application ID provided');
      }
    } catch (err) {
      console.error('Error processing application data:', err);
      setFormError('Error loading application data');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (applicationId) => {
    if (!applicationId) return;
    
    setCommentsLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('user_applications_id', applicationId)
        .order('comment_date', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('Comments loaded:', data);
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

      if (!userApplication || !userApplication.id) {
        throw new Error('User application not found or invalid');
      }

      // 1. First, save the comment to the comments table
      const commentData = {
        user_applications_id: userApplication.id,
        official_comment: comment,
        revision_comment: status === '3' ? revisionInstructions : null,
        comment_date: new Date().toISOString()
      };

      const { data: commentResult, error: commentError } = await supabase
        .from('comments')
        .insert(commentData)
        .select();

      if (commentError) {
        throw new Error(`Error saving comment: ${commentError.message}`);
      }

      console.log('Comment saved successfully:', commentResult);

      // 2. Update application status
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

      // 3. Refresh comments list
      await fetchComments(userApplication.id);

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
      
      // Clear form inputs after successful submission
      setComment('');
      setRevisionInstructions('');
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
      <div className="modal-container" style={{ maxWidth: '800px' }}>
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
                  <label>Application ID</label>
                  <input
                    type="text"
                    value={userApplication?.application_id || 'Unknown ID'}
                    readOnly
                    className="form-input readonly"
                  />
                </div>

                <div className="form-group">
                  <label>Applicant Name</label>
                  <input
                    type="text"
                    value={userApplication?.applicant_name || userApplication?.fullName || 'Unknown'}
                    readOnly
                    className="form-input readonly"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="currentStatus">Current Status</label>
                  <input
                    type="text"
                    id="currentStatus"
                    value={userApplication?.status || 'Unknown'}
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
                    <label htmlFor="revisionInstructions">
                      <FaEdit style={{ marginRight: '8px' }} />
                      Revision Instructions
                    </label>
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
                  <label htmlFor="comment">
                    <FaComments style={{ marginRight: '8px' }} />
                    Official Comment
                  </label>
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

              {/* Comments History Section */}
              <div className="comments-history-section">
                <h3>
                  <FaHistory style={{ marginRight: '8px' }} />
                  Comments History
                </h3>
                
                {commentsLoading ? (
                  <div className="loading-indicator">Loading comments...</div>
                ) : comments.length > 0 ? (
                  <div className="comments-list">
                    {comments.map(comment => (
                      <div key={comment.id} className="comment-item">
                        <div className="comment-header">
                          <span className="comment-date">
                            <FaRegClock style={{ marginRight: '5px' }} />
                            {formatDate(comment.comment_date)}
                          </span>
                        </div>
                        
                        {comment.official_comment && (
                          <div className="comment-content">
                            <h4>Official Comment:</h4>
                            <div 
                              className="comment-text"
                              dangerouslySetInnerHTML={{ __html: comment.official_comment }}
                            />
                          </div>
                        )}
                        
                        {comment.revision_comment && (
                          <div className="revision-content">
                            <h4>Revision Instructions:</h4>
                            <div 
                              className="revision-text"
                              dangerouslySetInnerHTML={{ __html: comment.revision_comment }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-comments">No comments available for this application</div>
                )}
              </div>
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