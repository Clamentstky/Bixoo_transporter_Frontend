import React, { useState } from "react";
import Button from "../ui/Button";
import Icon from "../Icon";
import documentService from "../../services/documentService";
import "./DocumentUploader.css";

export default function DocumentUploader({ documentType, currentStatus, onClose, onSuccess }) {
  const [docNumber, setDocNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const title = documentType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  
  const isAadhaar = documentType === "AADHAAR_CARD";
  const requiresDates = documentType === "DRIVING_LICENSE" || documentType === "INSURANCE" || documentType === "FITNESS_CERTIFICATE" || documentType === "PERMIT";

  const handleFileChange = (e, setFile) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      setFile(file);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!frontFile && (currentStatus === "NOT_SUBMITTED" || currentStatus === "REJECTED")) {
      setError("Front image is required");
      return;
    }
    
    // In edit mode (PENDING), they might just be updating numbers? Wait, upload requires front_file if we use POST.
    // Let's require front_file always for now when they upload/replace.
    if (!frontFile) {
      setError("Please select a file to upload");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      
      const formData = new FormData();
      formData.append("document_type", documentType);
      formData.append("document_number", docNumber);
      if (issueDate) formData.append("issue_date", issueDate);
      if (expiryDate) formData.append("expiry_date", expiryDate);
      formData.append("front_file", frontFile);
      if (backFile) formData.append("back_file", backFile);
      
      await documentService.uploadDocument(formData);
      onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to upload document. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="document-modal-overlay">
      <div className="document-modal">
        <div className="document-modal-header">
          <h2>Upload {title}</h2>
          <button className="close-btn" onClick={onClose}><Icon name="close" size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="document-modal-body">
          {error && <div className="document-error">{error}</div>}
          
          <div className="form-group">
            <label>{title} Number</label>
            <input 
              type="text" 
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              placeholder={`Enter ${title} number`}
              required
            />
          </div>
          
          {requiresDates && (
            <div className="form-row">
              <div className="form-group">
                <label>Issue Date (Optional)</label>
                <input 
                  type="date" 
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Expiry Date</label>
                <input 
                  type="date" 
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                />
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label>Front Image / PDF *</label>
            <div className="file-upload-box">
              <input 
                type="file" 
                accept=".jpg,.jpeg,.png,.pdf" 
                onChange={(e) => handleFileChange(e, setFrontFile)} 
              />
              <div className="upload-placeholder">
                {frontFile ? (
                  <span className="file-name">{frontFile.name}</span>
                ) : (
                  <>
                    <Icon name="upload" size={24} />
                    <span>Click to browse or drag file here</span>
                    <small>JPG, PNG, PDF up to 5MB</small>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label>Back Image (Optional)</label>
            <div className="file-upload-box">
              <input 
                type="file" 
                accept=".jpg,.jpeg,.png,.pdf" 
                onChange={(e) => handleFileChange(e, setBackFile)} 
              />
              <div className="upload-placeholder">
                {backFile ? (
                  <span className="file-name">{backFile.name}</span>
                ) : (
                  <>
                    <Icon name="upload" size={24} />
                    <span>Click to browse or drag file here</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="document-modal-footer">
            <Button variant="ghost" type="button" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button variant="primary" type="submit" loading={submitting}>Submit Document</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
