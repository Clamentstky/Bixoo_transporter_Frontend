import React, { useState, useEffect, useRef } from "react";
import Button from "../ui/Button";
import Icon from "../Icon";
import documentService from "../../services/documentService";
import "./DocumentUploader.css";
import api from "../../services/api";
import { errorMessage } from "../../services/session";

export default function DocumentUploader({ documentType, currentStatus, onClose, onSuccess }) {
  const [docNumber, setDocNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [existing, setExisting] = useState(null);
  const modalRef = useRef(null);
  useEffect(() => {
    let active = true;
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modalRef.current?.querySelector("button")?.focus();
    if (currentStatus !== "NOT_SUBMITTED") documentService.getDocument(documentType)
      .then(doc => { if (active) setExisting(doc); })
      .catch(err => { if (active) setError(errorMessage(err)); });
    return () => { active = false; document.body.style.overflow = previousOverflow; previous?.focus(); };
  }, [documentType, currentStatus]);
  const download = async side => {
    try {
      const blob = await api.get(`/transporter/documents/${documentType}/file/${side}`, { responseType: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.download = `${documentType}-${side}`;
      link.click(); setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch { setError("The document could not be downloaded. Please try again."); }
  };
  const onKeyDown = event => {
    if (event.key === "Escape" && !submitting) onClose();
    if (event.key !== "Tab") return;
    const controls = [...modalRef.current.querySelectorAll("button, input")].filter(item => !item.disabled);
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };

  const title = documentType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  
  const requiresDates = documentType === "DRIVING_LICENSE" || documentType === "INSURANCE" || documentType === "FITNESS_CERTIFICATE" || documentType === "PERMIT";

  const handleFileChange = (e, setFile) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFile(null); e.target.value = "";
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
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="document-modal-overlay">
      <div className="document-modal" ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="document-modal-title" onKeyDown={onKeyDown}>
        <div className="document-modal-header">
          <h2 id="document-modal-title">{currentStatus === "NOT_SUBMITTED" ? "Upload" : "View or replace"} {title}</h2>
          <button className="close-btn" aria-label="Close document dialog" disabled={submitting} onClick={onClose}><Icon name="close" size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="document-modal-body">
          {error && <div className="document-error" role="alert">{error}</div>}
          {existing && <section aria-label="Saved document"><p>Saved number: {existing.document_number_masked}</p>{existing.file_url && <Button variant="outline" onClick={() => download("front")}>Download front document</Button>}{existing.back_file_url && <Button variant="outline" onClick={() => download("back")}>Download back document</Button>}<p>To replace this document, enter its number and select a new file below.</p></section>}
          
          <div className="form-group">
            <label htmlFor="document-number">{title} Number</label>
            <input 
              type="text" 
              id="document-number" maxLength={documentType === "AADHAAR_CARD" ? 12 : 255} pattern={documentType === "AADHAAR_CARD" ? "[0-9]{12}" : undefined}
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              placeholder={`Enter ${title} number`}
              required
            />
          </div>
          
          {requiresDates && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="document-issue-date">Issue Date (Optional)</label>
                <input 
                  type="date" 
                  value={issueDate}
                  id="document-issue-date"
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="document-expiry-date">Expiry Date</label>
                <input 
                  type="date" 
                  value={expiryDate}
                  id="document-expiry-date"
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                />
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="document-front-file">Front Image / PDF *</label>
            <div className="file-upload-box">
              <input 
                type="file" 
                accept=".jpg,.jpeg,.png,.pdf" 
                onChange={(e) => handleFileChange(e, setFrontFile)} 
                id="document-front-file"
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
            <label htmlFor="document-back-file">Back Image (Optional)</label>
            <div className="file-upload-box">
              <input 
                type="file" 
                accept=".jpg,.jpeg,.png,.pdf" 
                onChange={(e) => handleFileChange(e, setBackFile)} 
                id="document-back-file"
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
