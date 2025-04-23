import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaDownload, FaCheckCircle, FaClock, FaFileAlt, FaPaperPlane, FaUpload, FaCog, FaTimes, FaFile } from 'react-icons/fa';
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
        if (statusUpdate.status === 'Needs Revision') {
          if (step.status === 'On Review') {
            return {
              ...step,
              isDone: false,
              current: false,
              date: null,
              time: null,
              description: `Revision required: ${statusUpdate.revisionInstructions}`
            };
          }
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
            description: statusUpdate.status === 'Needs Revision' 
              ? `Revision required: ${statusUpdate.revisionInstructions}`
              : statusUpdate.comment.message
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

      // Add revision instructions to comments if status is "Needs Revision"
      const updatedComments = [...application.comments];
      if (statusUpdate.status === 'Needs Revision') {
        updatedComments.push({
          id: application.comments.length + 1,
          user: "Admin",
          role: "admin",
          message: statusUpdate.revisionInstructions,
          timestamp: new Date().toLocaleString(),
          isOfficial: true,
          type: "revision-request"
        });
      }

      setApplication(prev => ({
        ...prev,
        status: statusUpdate.status,
        comments: updatedComments,
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

        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-bar">
            <div className="progress-line"></div>
            <div 
              className="progress-line-fill"
              style={{ 
                width: `${
                  application.status === 'Rejected' ? '100%' :
                  application.status === 'Approved' ? '100%' :
                  application.status === 'Under Review' ? '50%' :
                  application.status === 'Document Verification' ? '25%' :
                  '0%'
                }`
              }}
            ></div>
            
            <div className={`progress-step ${application.timeline[0].isDone ? 'completed' : ''}`}>
              <div className="step-circle">
                {application.timeline[0].isDone ? <FaCheckCircle /> : <FaClock />}
              </div>
              <div className="step-label">Submitted</div>
            </div>

            <div className={`progress-step ${
              application.timeline[1].isDone ? 'completed' : 
              application.timeline[1].current ? 'active' : ''
            }`}>
              <div className="step-circle">
                {application.timeline[1].isDone ? <FaCheckCircle /> : 
                 application.timeline[1].current ? <FaClock /> : <FaFile />}
              </div>
              <div className="step-label">Document Verification</div>
            </div>

            <div className={`progress-step ${
              application.timeline[2].isDone ? 'completed' : 
              application.timeline[2].current ? 'active' : ''
            }`}>
              <div className="step-circle">
                {application.timeline[2].isDone ? <FaCheckCircle /> : 
                 application.timeline[2].current ? <FaClock /> : <FaFile />}
              </div>
              <div className="step-label">Under Review</div>
            </div>

            <div className={`progress-step ${
              application.status === 'Approved' ? 'completed' : 
              application.status === 'Rejected' ? 'rejected' : ''
            }`}>
              <div className="step-circle">
                {application.status === 'Approved' ? <FaCheckCircle /> :
                 application.status === 'Rejected' ? <FaTimes /> : <FaFile />}
              </div>
              <div className="step-label">
                {application.status === 'Rejected' ? 'Rejected' : 'Approved'}
              </div>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="progress-timeline">
            <div className="timeline-list">
              {application.timeline.map((item, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-date">
                    <div className="date">{item.date}</div>
                    <div className="time">{item.time}</div>
                  </div>
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <p>{item.description}</p>
                    {item.status === 'Approved' && (
                      <div className="additional-info">
                        <p>Recipient: {item.additionalInfo?.recipient}</p>
                        <p>Approved Date: {item.additionalInfo?.approvedDate}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="comments-section">
          <h2>Official Comments</h2>
          <div className="comments-list">
            {application.comments
              .filter(comment => comment.role === 'admin' && comment.isOfficial)
              .map((comment, index) => (
                <div 
                  key={index} 
                  className={`comment-item admin ${
                    comment.type === 'revision-request' ? 'revision' : 
                    application.status === 'Rejected' ? 'rejected' : ''
                  }`}
                >
                  <div className="comment-header">
                    <span className="comment-user">DENR Admin</span>
                    <span className="comment-timestamp">{comment.timestamp}</span>
                  </div>
                  <div className="comment-content">
                    {comment.type === 'revision-request' ? (
                      <>
                        <h4>Revision Instructions:</h4>
                        <p>{comment.message}</p>
                      </>
                    ) : (
                      <p>{comment.message}</p>
                    )}
                  </div>
                </div>
            ))}
            {application.comments.filter(comment => comment.role === 'admin' && comment.isOfficial).length === 0 && (
              <div className="no-comments">
                <p>No official comments yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Add resubmission area when status is "needs-revision" */}
        {application.status === "Needs Revision" && (
          <div className="resubmission-area">
            <div className="resubmission-header">
              <h3>Revision Required</h3>
              <p>Please review the comments above and resubmit your application with the necessary changes.</p>
            </div>
            <div className="resubmission-form">
              <div 
                className="file-upload-container"
                onClick={() => document.getElementById('file-upload').click()}
              >
                <p>Click to upload files or drag and drop</p>
                <p>Supported formats: PDF, DOC, DOCX, JPG, PNG</p>
                <input
                  type="file"
                  id="file-upload"
                  className="file-upload-input"
                  multiple
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>
              {selectedFiles.length > 0 && (
                <div className="selected-files-list">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="selected-file-item">
                      <span className="file-name">{file.name}</span>
                      <button
                        className="remove-file-btn"
                        onClick={() => {
                          const newSelectedFiles = selectedFiles.filter((_, i) => i !== index);
                          setSelectedFiles(newSelectedFiles);
                        }}
                        aria-label={`Remove ${file.name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                className="resubmit-button"
                disabled={selectedFiles.length === 0}
                onClick={handleResubmit}
              >
                Resubmit Application
              </button>
            </div>
          </div>
        )}

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
