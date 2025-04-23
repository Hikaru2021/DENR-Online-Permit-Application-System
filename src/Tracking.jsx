{/* Add the resubmission area if status is "needs-revision" */}
{status === "needs-revision" && (
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
          onChange={handleFileChange}
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
                onClick={() => removeFile(index)}
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