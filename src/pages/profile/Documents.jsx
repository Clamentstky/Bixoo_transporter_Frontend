import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Icon from "../../components/Icon";
import documentService from "../../services/documentService";
import DocumentStatusBadge from "../../components/support/DocumentStatusBadge";
import DocumentUploader from "../../components/support/DocumentUploader";
import "./Documents.css";

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);

  const navigate = useNavigate();

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentService.getDocumentStatus();
      setDocuments(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleAction = (doc) => {
    setSelectedDoc(doc);
  };

  const getDocName = (type) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="profile-documents-page ui-page">
      <div className="profile-docs-container">
        <button className="ui-link" onClick={() => navigate("/profile")} style={{ marginBottom: "24px", alignSelf: "flex-start" }}>
          <Icon name="arrow" style={{ transform: "rotate(180deg)" }} /> Back to Profile
        </button>

        <PageHeader 
          eyebrow="VERIFICATION" 
          title="Transporter Documents" 
          description="Upload and manage your verification documents." 
        />

        {error ? (
          <div className="ui-empty-state">
            <p>{error}</p>
            <Button onClick={fetchDocuments}>Retry</Button>
          </div>
        ) : loading ? (
          <div className="ui-loading"><div className="ui-spinner"></div> Loading documents...</div>
        ) : (
          <div className="profile-docs-grid">
            {documents.map((doc) => (
              <div key={doc.document_type} className="profile-docs-card">
                <div className="profile-docs-card-header">
                  <div className="profile-docs-icon">
                    <Icon name="file" />
                  </div>
                  <div className="profile-docs-info">
                    <strong>{getDocName(doc.document_type)}</strong>
                    {doc.uploaded_at && <span>Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}</span>}
                    {doc.expiry_date && <span>Expires: {new Date(doc.expiry_date).toLocaleDateString()}</span>}
                    {!doc.uploaded_at && <span>Required</span>}
                  </div>
                </div>
                
                <div className="profile-docs-card-status">
                  <DocumentStatusBadge status={doc.status} />
                  {doc.message && <p className="profile-docs-message">{doc.message}</p>}
                </div>
                
                <div className="profile-docs-card-action">
                  <Button 
                    variant={doc.status === "NOT_SUBMITTED" || doc.status === "REJECTED" || doc.status === "EXPIRED" ? "primary" : "outline"} 
                    fullWidth 
                    onClick={() => handleAction(doc)}
                  >
                    {doc.status === "NOT_SUBMITTED" ? "Upload Document" : 
                     doc.status === "REJECTED" ? "Re-upload Document" :
                     doc.status === "EXPIRED" ? "Upload Renewed Document" :
                     doc.status === "PENDING" ? "View / Replace" :
                     "View Document"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {selectedDoc && (
        <DocumentUploader 
          documentType={selectedDoc.document_type} 
          currentStatus={selectedDoc.status}
          onClose={() => setSelectedDoc(null)} 
          onSuccess={() => {
            setSelectedDoc(null);
            fetchDocuments();
          }} 
        />
      )}
    </div>
  );
}

export default Documents;
