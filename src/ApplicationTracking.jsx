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

  // Format date and time helper function
  const formatDateTime = (dateString) => {
    if (!dateString) return { date: '', time: '' };
    
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

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
        
        // Fetch status history
        const { data: statusHistoryData, error: statusHistoryError } = await supabase
          .from('application_status_history')
          .select('*')
          .eq('user_application_id', id)
          .order('changed_at', { ascending: false });
          
        if (statusHistoryError) throw statusHistoryError;
        
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

        // Create timeline from status history
        let timeline = statusHistoryData?.map(history => {
          const statusName = getStatusName(history.status_id);
          const { date, time } = formatDateTime(history.changed_at);
          
          return {
            status: statusName,
            date,
            time,
            description: history.remarks || `Application status changed to ${statusName}`,
            isDone: true,
            current: applicationData.status === history.status_id,
            additionalInfo: history.status_id === 4 ? {
              recipient: applicationData.full_name,
              approvedDate: date
            } : null
          };
        }) || [];
        
        // If no history records exist, create an initial 'Submitted' entry
        if (timeline.length === 0) {
          const { date, time } = formatDateTime(applicationData.created_at);
          timeline = [{
            status: "Submitted",
            date,
            time,
            description: "Application has been successfully submitted",
            isDone: true,
            current: applicationData.status === 1
          }];
        }

        // Get formatted submission date and time
        const { date: submissionDate, time: submissionTime } = formatDateTime(applicationData.created_at);

        // Format the application data
        const formattedApplication = {
          id: applicationData.id,
          title: applicationData.applications.title,
          referenceNumber: `REF-${applicationData.created_at.split('T')[0]}-${applicationData.id}`,
          type: applicationData.applications.type,
          status: getStatusName(applicationData.status),
          submissionDate,
          submissionTime,
          lastUpdated: formatDateTime(applicationData.created_at).date,
          description: applicationData.applications.description,
          comments: formattedComments,
          timeline: timeline,
          needsRevision: applicationData.status === 3,
          revisionInstructions: revisionInstructions,
          // Add application details
          full_name: applicationData.full_name,
          contact_number: applicationData.contact_number,
          address: applicationData.address,
          purpose: applicationData.purpose,
          application_fee: applicationData.applications.application_fee,
          processing_fee: applicationData.applications.processing_fee,
          statusId: applicationData.status
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
      
      // Get current formatted date and time
      const { date, time } = formatDateTime(new Date());
      
      // Create a new timeline entry
      const newTimelineEntry = {
        status: statusUpdate.status,
        date,
        time,
        description: statusUpdate.status === "Needs Revision" 
          ? "Application needs revision"
          : statusUpdate.status === "Approved"
          ? "Application has been approved and ready for certificate claiming"
          : statusUpdate.status === "Rejected"
          ? "Application has been rejected"
          : `Application status changed to ${statusUpdate.status}`,
        isDone: true,
        current: true,
        additionalInfo: statusUpdate.status === "Approved" ? {
          recipient: application.full_name,
          approvedDate: date
        } : null
      };
      
      setApplication(prev => {
        // Update the current flag for all timeline items
        const updatedTimeline = prev.timeline.map(item => ({
          ...item,
          current: false
        }));
        
        // Add the new timeline entry at the beginning
        updatedTimeline.unshift(newTimelineEntry);
        
        return {
          ...prev,
          status: statusUpdate.status,
          statusId: statusUpdate.statusId,
          comments: [newComment, ...prev.comments],
          timeline: updatedTimeline,
          needsRevision: statusUpdate.status === "Needs Revision",
          revisionInstructions: statusUpdate.status === "Needs Revision" ? statusUpdate.comment.message : prev.revisionInstructions,
          lastUpdated: date
        };
      });
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

            {/* Fixed progress steps */}
            <div 
              className={`progress-step ${application.statusId >= 1 ? 'completed' : ''} ${application.statusId === 1 ? 'current' : ''}`}
            >
              <div className="step-circle">
                {application.statusId > 1 ? <FaCheckCircle /> : 
                 application.statusId === 1 ? <FaClock /> : <FaFile />}
              </div>
              <div className="step-label">Submitted</div>
            </div>
            
            <div 
              className={`progress-step ${application.statusId >= 2 ? 'completed' : ''} ${application.statusId === 2 || application.statusId === 3 ? 'current' : ''}`}
            >
              <div className="step-circle">
                {application.statusId > 3 ? <FaCheckCircle /> : 
                 application.statusId === 2 || application.statusId === 3 ? <FaClock /> : <FaFile />}
              </div>
              <div className="step-label">Under Review</div>
            </div>
            
            <div 
              className={`progress-step ${application.statusId === 4 ? 'completed current' : application.statusId === 5 ? 'rejected' : ''}`}
            >
              <div className="step-circle">
                {application.statusId === 4 ? <FaCheckCircle /> : 
                 application.statusId === 5 ? <FaTimesCircle /> : <FaFile />}
              </div>
              <div className="step-label">{application.statusId === 5 ? 'Rejected' : 'Approved'}</div>
            </div>
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
