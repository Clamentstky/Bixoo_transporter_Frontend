import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
      setLoading(true); setError("");
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

  const verifiedCount = documents.filter(doc => doc.status === "VERIFIED").length;
  const pendingCount = documents.filter(doc => doc.status === "PENDING").length;
  const actionCount = documents.filter(doc => ["NOT_SUBMITTED", "REJECTED", "EXPIRED"].includes(doc.status)).length;

  return (
    <div className="profile-documents-page pd-page">
      <div className="pd-container">
        <Button className="pd-back" variant="ghost" icon="arrowLeft" onClick={() => navigate("/profile")}>Back to profile</Button>
        <header className="pd-heading">
          <span className="pd-eyebrow">VERIFICATION</span>
          <h1>Transporter documents</h1>
          <p>Upload, track and manage your verification documents.</p>
        </header>

        {error ? (
          <div className="pd-state" role="alert">
            <span className="pd-state-icon"><Icon name="help" size={28} /></span>
            <h2>Documents couldn’t be loaded</h2><p>{error}</p>
            <Button onClick={fetchDocuments}>Retry</Button>
          </div>
        ) : loading ? (
          <div className="pd-state" role="status">
            <span className="pd-state-icon"><Icon name="document" size={28} /></span>
            <h2>Loading documents…</h2><p>Getting your verification details ready.</p>
          </div>
        ) : (
          <>
            <section className="pd-overview" aria-label="Verification overview">
              <div className="pd-progress">
                <span className="pd-progress-icon"><Icon name="shield" size={26} /></span>
                <div className="pd-progress-copy">
                  <h2>Verification overview</h2>
                  <p><strong>{verifiedCount} of {documents.length}</strong> documents verified</p>
                  <div className="pd-progress-track" role="progressbar" aria-label="Documents verified" aria-valuemin={0} aria-valuemax={documents.length || 1} aria-valuenow={verifiedCount}><span style={{ width: `${documents.length ? verifiedCount / documents.length * 100 : 0}%` }} /></div>
                </div>
              </div>
              <dl className="pd-stats">
                <div><dd className="pd-verified-count">{verifiedCount}</dd><dt><i />Verified</dt></div>
                <div><dd className="pd-pending-count">{pendingCount}</dd><dt><i />Pending</dt></div>
                <div><dd className="pd-action-count">{actionCount}</dd><dt><i />To update</dt></div>
              </dl>
            </section>

            <div className="pd-section-heading"><h2>Your documents <span>{documents.length}</span></h2><p>Keep your documents clear and up to date.</p></div>
            <div className="pd-grid">
              {documents.map((doc) => (
                <article key={doc.document_type} className="pd-card" data-status={doc.status}>
                  <div className="pd-card-top">
                    <span className="pd-doc-icon"><Icon name={doc.document_type === "AADHAAR_CARD" ? "user" : "document"} size={25} /></span>
                    <DocumentStatusBadge status={doc.status} />
                  </div>
                  <h3>{getDocName(doc.document_type.toLowerCase())}</h3>
                  <span className="pd-doc-subtitle">Verification document</span>
                  {doc.uploaded_at || doc.expiry_date ? (
                    <dl className="pd-doc-details">
                      {doc.uploaded_at && <div><dt><Icon name="calendar" size={14} />Uploaded on</dt><dd>{new Date(doc.uploaded_at).toLocaleDateString()}</dd></div>}
                      {doc.expiry_date && <div><dt><Icon name="clock" size={14} />Expires on</dt><dd>{new Date(doc.expiry_date).toLocaleDateString()}</dd></div>}
                    </dl>
                  ) : (
                    <div className="pd-upload-hint"><Icon name="upload" size={23} /><div><strong>Document required</strong><span>Add a clear image or PDF to get started.</span></div></div>
                  )}
                  {doc.message && <p className="pd-message"><Icon name="help" size={14} />{doc.message}</p>}
                  <div className="pd-card-action">
                    <Button
                      variant={doc.status === "NOT_SUBMITTED" || doc.status === "REJECTED" || doc.status === "EXPIRED" ? "primary" : "outline"}
                      fullWidth
                      icon={["NOT_SUBMITTED", "REJECTED", "EXPIRED"].includes(doc.status) ? "upload" : "document"}
                      onClick={() => handleAction(doc)}
                    >
                      {doc.status === "NOT_SUBMITTED" ? "Upload Document" :
                       doc.status === "REJECTED" ? "Re-upload Document" :
                       doc.status === "EXPIRED" ? "Upload Renewed Document" :
                       doc.status === "PENDING" ? "View / Replace" :
                       "View Document"}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
            {documents.length === 0 && <div className="pd-state"><span className="pd-state-icon"><Icon name="document" size={28} /></span><h2>No documents to display</h2><p>Your verification documents will appear here.</p></div>}
            <aside className="pd-guidance" aria-label="Upload guidelines">
              <span className="pd-guidance-icon"><Icon name="help" size={20} /></span>
              <div><h2>Before you upload</h2><p>Use a clear, readable copy with all details visible.</p></div>
              <div className="pd-file-rules"><span>JPG, PNG or PDF</span><span>Up to 5 MB per file</span></div>
            </aside>
          </>
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
