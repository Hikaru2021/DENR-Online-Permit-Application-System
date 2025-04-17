import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaDownload, FaCheckCircle, FaClock, FaFileAlt, FaPaperPlane, FaUpload, FaCog, FaTimes } from 'react-icons/fa';
import { supabase } from './library/supabaseClient';
import AdminApplicationManagement from './AdminApplicationManagement';
import './CSS/ApplicationTracking.css';

function ApplicationTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdminManagement, setShowAdminManagement] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true); // This would come from auth context

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setIsLoading(true);
        // Mock data for demonstration
        const mockApplication = {
          id: id,
          title: "Building Permit Application",
          referenceNumber: `REF-2023-${id}`,
          type: "Permit",
          status: "Needs Revision",
          submissionDate: "2024-03-15",
          submissionTime: "09:30 AM",
          lastUpdated: "2024-03-18",
          description: "Application for a new commercial building construction permit.",
          comments: [
            {
              id: 1,
              user: "Admin",
              role: "admin",
              message: "Please provide updated building plans with proper measurements.",
              timestamp: "2024-03-18 14:30",
              isOfficial: true
            },
            {
              id: 2,
              user: "John Doe",
              role: "client",
              message: "I will submit the revised plans by tomorrow.",
              timestamp: "2024-03-18 15:45",
              isOfficial: false
            }
          ],
          attachments: ["building_plan.pdf", "site_plan.pdf", "requirements.pdf"],
          timeline: [
            {
              status: "Submitted",
              date: "2024-03-15",
              time: "09:30 AM",
              description: "Application has been successfully submitted",
              isDone: true
            },
            {
              status: "Document Verification",
              date: "2024-03-16",
              time: "10:15 AM",
              description: "Documents are being verified by the administrative staff",
              isDone: true
            },
            {
              status: "Under Review",
              date: "2024-03-18",
              time: "02:45 PM",
              description: "Application is being reviewed by the DENR technical team",
              isDone: true,
              current: true
            },
            {
              status: "Final Assessment",
              date: null,
              time: null,
              description: "Technical assessment and evaluation",
              isDone: false
            },
            {
              status: "Approved",
              date: null,
              time: null,
              description: "Application is approved and ready for certificate claiming",
              isDone: false
            }
          ],
          needsRevision: true,
          revisionInstructions: "Please update the following documents:\n1. Building plans with proper measurements\n2. Environmental compliance certificate"
        };

        setTimeout(() => {
          setApplication(mockApplication);
          setIsLoading(false);
        }, 1000);

      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  const handleBack = () => {
    navigate('/MyApplication');
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    // In a real app, you would send this to your backend
    const newCommentObj = {
      id: application.comments.length + 1,
      user: "John Doe", // This would come from auth context
      role: "client",
      message: newComment,
      timestamp: new Date().toLocaleString(),
      isOfficial: false
    };

    setApplication(prev => ({
      ...prev,
      comments: [...prev.comments, newCommentObj]
    }));
    setNewComment('');
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleResubmit = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real app, you would upload files and update application status
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      setApplication(prev => ({
        ...prev,
        status: 'Under Review',
        needsRevision: false,
        comments: [
          ...prev.comments,
          {
            id: prev.comments.length + 1,
            user: "System",
            role: "system",
            message: "Application has been resubmitted with revised documents.",
            timestamp: new Date().toLocaleString(),
            isOfficial: true
          }
        ]
      }));
      setSelectedFiles([]);
    } catch (err) {
      alert('Error resubmitting application: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (statusUpdate) => {
    try {
      const statusOrder = [
        'Pending',
        'Document Verification',
        'On Review',
        'Final Assessment',
        'Needs Revision',
        'Approved',
        'Rejected'
      ];

      const currentStatusIndex = statusOrder.indexOf(statusUpdate.status);
      const updatedTimeline = application.timeline.map(step => {
        const stepStatusIndex = statusOrder.indexOf(step.status);
        
        // Special case: If status is "Needs Revision", mark "Under Review" as incomplete
        if (statusUpdate.status === 'Needs Revision' && step.status === 'On Review') {
          return {
            ...step,
            isDone: false,
            current: false,
            date: null,
            time: null,
            description: step.description
          };
        }

        // Special case: If status is "Rejected", mark all steps as incomplete except the current
        if (statusUpdate.status === 'Rejected') {
          if (stepStatusIndex === currentStatusIndex) {
            return {
              ...step,
              isDone: true,
              current: true,
              date: new Date().toLocaleDateString(),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              description: statusUpdate.comment.message
            };
          }
          return {
            ...step,
            isDone: false,
            current: false,
            date: null,
            time: null,
            description: step.description
          };
        }
        
        // If the step's status comes before the current status, mark it as done
        if (stepStatusIndex < currentStatusIndex) {
          return {
            ...step,
            isDone: true,
            current: false,
            date: step.date,
            time: step.time,
            description: step.description
          };
        }
        
        // If this is the current status step
        if (stepStatusIndex === currentStatusIndex) {
          return {
            ...step,
            isDone: true,
            current: true,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            description: statusUpdate.comment.message
          };
        }
        
        // For any steps after the current status, uncheck them
        return {
          ...step,
          isDone: false,
          current: false,
          date: null,
          time: null,
          description: step.description
        };
      });

      setApplication(prev => ({
        ...prev,
        status: statusUpdate.status,
        comments: [...prev.comments, statusUpdate.comment],
        needsRevision: statusUpdate.status === 'Needs Revision',
        revisionInstructions: statusUpdate.revisionInstructions,
        timeline: updatedTimeline,
        lastUpdated: new Date().toLocaleDateString()
      }));
    } catch (error) {
      throw new Error('Failed to update application status');
    }
  };

  if (isLoading) {
    return (
      <div className="tracking-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading application details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tracking-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={handleBack}>Go Back</button>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="tracking-page">
        <div className="error-container">
          <h2>Application Not Found</h2>
          <p>The requested application could not be found.</p>
          <button onClick={handleBack}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="tracking-page">
      <div className="tracking-page-header">
        <div className="header-left">
          <button className="back-button" onClick={handleBack}>
            <FaArrowLeft /> Back to Applications
          </button>
        </div>
        {isAdmin && (
          <div className="header-right">
            <button 
              className="admin-manage-button"
              onClick={() => setShowAdminManagement(true)}
            >
              <FaCog /> Manage Application
            </button>
          </div>
        )}
      </div>

      <div className="tracking-page-content">
        {/* Application Header */}
        <div className="application-header">
          <div className="header-main">
            <h1>{application.title}</h1>
            <div className="header-meta">
              <p className="reference-number">Reference Number: {application.referenceNumber}</p>
              <div className={`status-badge ${application.status.toLowerCase().replace(' ', '-')}`}>
                {application.status}
              </div>
            </div>
          </div>
          <div className="submission-info">
            <p>Submitted on {application.submissionDate} at {application.submissionTime}</p>
          </div>
        </div>

        {/* Tracking Timeline Section */}
        <section className="timeline-section">
          <h2>Application Timeline</h2>
          <div className="timeline">
            {application.timeline.map((step, index) => (
              <div 
                key={index} 
                className={`timeline-item ${step.isDone ? 'done' : ''} ${step.current ? 'current' : ''} ${application.status === 'Rejected' ? 'rejected' : ''}`}
              >
                <div className="timeline-icon">
                  {step.isDone ? (
                    <FaCheckCircle className="icon-done" />
                  ) : application.status === 'Rejected' ? (
                    <FaTimes className="icon-rejected" />
                  ) : (
                    <FaClock className="icon-pending" />
                  )}
                </div>
                <div className="timeline-content">
                  <h3>{step.status}</h3>
                  {step.date && step.time ? (
                    <p className="timeline-date">{step.date} at {step.time}</p>
                  ) : (
                    <p className="timeline-date pending">Pending</p>
                  )}
                  <p className="timeline-description">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Revision Notice */}
        {application?.needsRevision && (
          <section className="revision-section">
            <div className="revision-notice">
              <h2>Revision Required</h2>
              <div className="revision-instructions">
                <h3>Instructions from Administrator:</h3>
                <pre>{application.revisionInstructions}</pre>
              </div>
              <div className="resubmission-form">
                <h3>Resubmit Documents</h3>
                <div className="file-upload-area">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    id="file-upload"
                    className="file-input"
                  />
                  <label htmlFor="file-upload" className="file-upload-label">
                    <FaUpload /> Choose Files
                  </label>
                  {selectedFiles.length > 0 && (
                    <div className="selected-files">
                      <h4>Selected Files:</h4>
                      <ul>
                        {selectedFiles.map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <button
                    className="resubmit-button"
                    onClick={handleResubmit}
                    disabled={isSubmitting || selectedFiles.length === 0}
                  >
                    {isSubmitting ? 'Resubmitting...' : 'Resubmit Application'}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Comments Section */}
        <section className="comments-section">
          <h2>Comments</h2>
          <div className="comments-list">
            {application?.comments.map(comment => (
              <div 
                key={comment.id} 
                className={`comment-item ${comment.role} ${comment.isOfficial ? 'official' : ''}`}
              >
                <div className="comment-header">
                  <span className="comment-user">{comment.user}</span>
                  <span className="comment-timestamp">{comment.timestamp}</span>
                </div>
                <div className="comment-content">
                  {comment.message}
                </div>
              </div>
            ))}
          </div>
          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows={3}
            />
            <button type="submit" className="submit-comment" disabled={!newComment.trim()}>
              <FaPaperPlane /> Send Comment
            </button>
          </form>
        </section>

        {/* Application Details Section */}
        <section className="details-section">
          <h2>Application Details</h2>
          <div className="details-grid">
            <div className="detail-item">
              <h3>Type</h3>
              <p>{application.type}</p>
            </div>
            <div className="detail-item">
              <h3>Submission Date</h3>
              <p>{application.submissionDate}</p>
            </div>
            <div className="detail-item">
              <h3>Last Updated</h3>
              <p>{application.lastUpdated}</p>
            </div>
          </div>

          <div className="detail-description">
            <h3>Description</h3>
            <p>{application.description}</p>
          </div>

          <div className="detail-attachments">
            <h3>Attachments</h3>
            <div className="attachments-list">
              {application.attachments.map((attachment, index) => (
                <div key={index} className="attachment-item">
                  <FaFileAlt className="attachment-icon" />
                  <span>{attachment}</span>
                  <button className="download-button">
                    <FaDownload /> Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Admin Management Modal */}
      {showAdminManagement && application && (
        <AdminApplicationManagement
          application={application}
          onClose={() => setShowAdminManagement(false)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}

export default ApplicationTracking;
