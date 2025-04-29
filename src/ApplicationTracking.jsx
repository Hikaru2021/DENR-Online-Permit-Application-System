import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaClock, FaFileAlt, FaCog, FaTimes, FaFile, FaTimesCircle } from 'react-icons/fa';
import { supabase } from './library/supabaseClient';
import ManageApplicationModal from './Modals/ManageApplicationModal';
import './CSS/ApplicationTracking.css';

function ApplicationTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdminManagement, setShowAdminManagement] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (user) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role_id')
            .eq('id', user.id)
            .single();

          if (userError) throw userError;
          setUserRole(userData.role_id);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setIsLoading(true);
        
        // Fetch the application details with only applications join
        const { data: applicationData, error: applicationError } = await supabase
          .from('user_applications')
          .select(`
            *,
            applications (
              id,
              title,
              type,
              description,
              requirements,
              application_fee,
              processing_fee
            )
          `)
          .eq('id', id)
          .single();

        if (applicationError) throw applicationError;
        if (!applicationData) throw new Error('Application not found');

        // Fetch comments for this application
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select('*')
          .eq('user_applications_id', id)
          .order('comment_date', { ascending: false });

        if (commentsError) throw commentsError;
        
        // Get status name based on status ID
        const getStatusName = (statusId) => {
          switch (statusId) {
            case 1: return 'Submitted';
            case 2: return 'Under Review';
            case 3: return 'Needs Revision';
            case 4: return 'Approved';
            case 5: return 'Rejected';
            default: return 'Unknown';
          }
        };

        // Format the comments from database
        const formattedComments = commentsData ? commentsData.map(comment => ({
          id: comment.id,
          user: "DENR Admin",
          role: "admin",
          timestamp: new Date(comment.comment_date).toLocaleString(),
          isOfficial: true,
          type: comment.revision_comment ? 'revision-request' : 'official-comment',
          message: comment.official_comment || comment.revision_comment || ''
        })) : [];

        // Determine if there's a revision instruction from comments
        const revisionComment = commentsData?.find(comment => comment.revision_comment);
        const revisionInstructions = revisionComment ? revisionComment.revision_comment : 
                                    (applicationData.status === 3 ? "Please update the required documents" : "");

        // Format the application data
        const formattedApplication = {
          id: applicationData.id,
          title: applicationData.applications.title,
          referenceNumber: `REF-${applicationData.created_at.split('T')[0]}-${applicationData.id}`,
          type: applicationData.applications.type,
          status: getStatusName(applicationData.status),
          submissionDate: new Date(applicationData.created_at).toLocaleDateString(),
          submissionTime: new Date(applicationData.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          lastUpdated: new Date(applicationData.created_at).toLocaleDateString(),
          description: applicationData.applications.description,
          comments: formattedComments,
          timeline: [
            {
              status: "Submitted",
              date: new Date(applicationData.created_at).toLocaleDateString(),
              time: new Date(applicationData.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              description: "Application has been successfully submitted",
              isDone: true,
              current: applicationData.status === 1
            },
            {
              status: "Under Review",
              date: applicationData.status >= 2 ? new Date(applicationData.created_at).toLocaleDateString() : null,
              time: applicationData.status >= 2 ? new Date(applicationData.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
              description: "Application is being reviewed by the DENR technical team",
              isDone: applicationData.status >= 2,
              current: applicationData.status === 2
            },
            {
              status: applicationData.status === 5 ? "Rejected" : "Approved",
              date: (applicationData.status === 4 || applicationData.status === 5) ? new Date(applicationData.approved_date || applicationData.created_at).toLocaleDateString() : null,
              time: (applicationData.status === 4 || applicationData.status === 5) ? new Date(applicationData.approved_date || applicationData.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
              description: applicationData.status === 5 
                ? "Application has been rejected"
                : "Application has been approved and ready for certificate claiming",
              isDone: applicationData.status === 4 || applicationData.status === 5,
              current: applicationData.status === 4 || applicationData.status === 5,
              additionalInfo: applicationData.status === 4 ? {
                recipient: applicationData.full_name,
                approvedDate: new Date(applicationData.approved_date || applicationData.created_at).toLocaleDateString()
              } : null
            }
          ],
          needsRevision: applicationData.status === 3,
          revisionInstructions: revisionInstructions,
          // Add application details
          full_name: applicationData.full_name,
          contact_number: applicationData.contact_number,
          address: applicationData.address,
          purpose: applicationData.purpose,
          application_fee: applicationData.applications.application_fee,
          processing_fee: applicationData.applications.processing_fee
        };

        setApplication(formattedApplication);
        setComments(formattedComments);
        setIsLoading(false);
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

  const handleUpdateStatus = async (statusUpdate) => {
    try {
      // Insert status comment into database
      const { data: commentData, error: commentError } = await supabase
        .from('comments')
        .insert({
          user_applications_id: application.id,
          official_comment: statusUpdate.status !== "Needs Revision" ? statusUpdate.comment.message : null,
          revision_comment: statusUpdate.status === "Needs Revision" ? statusUpdate.comment.message : null,
        })
        .select();
        
      if (commentError) throw commentError;
      
      // Update application status in database
      const statusId = 
        statusUpdate.status === "Submitted" ? 1 :
        statusUpdate.status === "Under Review" ? 2 :
        statusUpdate.status === "Needs Revision" ? 3 :
        statusUpdate.status === "Approved" ? 4 :
        statusUpdate.status === "Rejected" ? 5 : 1;
        
      const { error: updateError } = await supabase
        .from('user_applications')
        .update({ status: statusId })
        .eq('id', application.id);
        
      if (updateError) throw updateError;
      
      // Update local state
      const newComment = {
        id: commentData[0].id,
        user: "Admin",
        role: "admin",
        message: statusUpdate.comment.message,
        timestamp: new Date().toLocaleString(),
        isOfficial: true,
        type: statusUpdate.status === "Needs Revision" ? 'revision-request' : 'official-comment'
      };
      
      setApplication(prev => ({
        ...prev,
        status: statusUpdate.status,
        comments: [newComment, ...prev.comments],
        needsRevision: statusUpdate.status === "Needs Revision",
        revisionInstructions: statusUpdate.status === "Needs Revision" ? statusUpdate.comment.message : prev.revisionInstructions,
        lastUpdated: new Date().toLocaleDateString()
      }));
    } catch (error) {
      console.error('Error updating status:', error);
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
        {userRole !== 3 && (
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

        <div className="progress-section">
          <div className="progress-bar">
            <div className="progress-line"></div>
            {/* Progress line fill based on status */}
            <div 
              className="progress-line-fill"
              style={{ 
                '--progress-width': application.status === 'Submitted' ? '33%' : 
                                  application.status === 'Under Review' ? '66%' : 
                                  '100%',
                backgroundColor: application.status === 'Rejected' ? '#dc3545' : '#4CAF50'
              }}
            ></div>

            {application.timeline.map((step, index) => (
              <div 
                key={index} 
                className={`progress-step 
                  ${step.isDone && step.status !== 'Rejected' ? 'completed' : ''}
                  ${step.current ? 'current' : ''} 
                  ${step.status === 'Rejected' ? 'rejected' : ''}
                  ${step.status === 'Approved' && step.current ? 'completed current' : ''}
                `}
              >
                <div className="step-circle">
                  {step.isDone && step.status !== 'Rejected' ? <FaCheckCircle /> : 
                   step.status === 'Rejected' ? <FaTimesCircle /> :
                   step.current ? <FaClock /> : <FaFile />}
                </div>
                <div className="step-label">{step.status}</div>
              </div>
            ))}
          </div>

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
                    {item.additionalInfo && (
                      <div className="additional-info">
                        <p>Recipient: {item.additionalInfo.recipient}</p>
                        <p>Approved Date: {item.additionalInfo.approvedDate}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="comments-section">
          <h2>Official Comments</h2>
          <div className="comments-list">
            {application.comments
              .filter(comment => comment.type === 'official-comment')
              .map((comment, index) => (
                <div 
                  key={index} 
                  className={`comment-item admin ${
                    application.status === 'Rejected' ? 'rejected' : ''
                  }`}
                >
                  <div className="comment-header">
                    <span className="comment-user">Deparment of Environent and Natural Resources Office</span>
                    <span className="comment-timestamp">{comment.timestamp}</span>
                  </div>
                  <div className="comment-content">
                    <p>{comment.message}</p>
                  </div>
                </div>
            ))}
            {application.comments.filter(comment => comment.type === 'official-comment').length === 0 && (
              <div className="no-comments">
                <p>No official comments yet.</p>
              </div>
            )}
          </div>
        </div>

        {application.needsRevision && (
          <div className="resubmission-area">
            <div className="resubmission-header">
              <h3>Revision Required</h3>
              <p>Please review the revision instructions below and resubmit your application with the necessary changes.</p>
            </div>
            <div className="revision-instructions">
              {application.comments
                .filter(comment => comment.type === 'revision-request')
                .map((comment, index) => (
                  <div 
                    key={index} 
                    className="comment-item revision"
                  >
                    <div className="comment-header">
                      <span className="comment-user">DENR Admin</span>
                      <span className="comment-timestamp">{comment.timestamp}</span>
                    </div>
                    <div className="comment-content">
                      <h4>Revision Instructions:</h4>
                      <p>{comment.message}</p>
                    </div>
                  </div>
              ))}
              {application.comments.filter(comment => comment.type === 'revision-request').length === 0 && (
                <div className="no-comments">
                  <p>{application.revisionInstructions || "Please update your application as required."}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showAdminManagement && application && (
        <ManageApplicationModal
          isOpen={showAdminManagement}
          onClose={() => setShowAdminManagement(false)}
          application={application}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}

export default ApplicationTracking;
