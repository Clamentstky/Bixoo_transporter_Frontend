import Icon from "../../components/Icon";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import "./TripDocuments.css";
import { errorMessage } from "../../services/session";

function TripDocuments() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef(null);
  const [activeDocType, setActiveDocType] = useState(null);

  useEffect(() => {
    const fetchTripAndDocs = async () => {
      setLoading(true);
      try {
        const tripRes = await api.get(`/transporter/trips/${tripId}`);
        if (tripRes.data) {
          setTrip(tripRes.data);
          // Trip details usually include documents list or we fetch them separately
          if (tripRes.data.documents) {
            setDocuments(tripRes.data.documents);
          } else {
            const docRes = await api.get(`/transporter/trips/${tripId}/documents`);
            if (docRes.data) setDocuments(docRes.data);
          }
        }
      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    if (tripId) fetchTripAndDocs();
  }, [tripId]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !activeDocType || busy) return;
    if (file.size > 5 * 1024 * 1024) { setError("Each document must be 5 MB or smaller."); return; }
    setBusy(true); setError("");
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", activeDocType);

    try {
      const res = await api.post(`/transporter/trips/${tripId}/documents`, formData);
      if (res.data) {
        setDocuments(prev => [...prev, res.data]);
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerUpload = (type) => {
    setActiveDocType(type);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleDelete = async (docId) => {
    if (busy) return;
    setBusy(true); setError("");
    try {
      await api.delete(`/transporter/trips/${tripId}/documents/${docId}`);
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (err) {
      setError(errorMessage(err));
    }
    finally { setBusy(false); }
  };

  const handleDownload = async (doc) => {
    setError("");
    try {
      const blob = await api.get(`/transporter/trips/${tripId}/documents/${doc.id}/file`, { responseType: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.file_name || "trip-document";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) return <div className="trip-documents-page"><p style={{ padding: "20px" }}>Loading...</p></div>;
  if (!trip) return <div className="trip-documents-page"><p style={{ padding: "20px" }}>{error || "Trip not found."}</p></div>;

  const hasDocType = (type) => documents.find(d => d.document_type === type);

  return (
    <div className="trip-documents-page ui-page">
      <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileUpload} accept=".jpg,.jpeg,.png,.pdf" />
      
      {error && <p role="alert">{error}</p>}
      {busy && <p role="status">Saving document changes...</p>}
      <header className="documents-header">
        <Button variant="ghost" size="lg" icon="arrowLeft" onClick={handleBack} style={{ padding: "8px", width: "42px", height: "42px", borderRadius: "10px" }} />
        <div>
          <span>DOCUMENTS</span>
          <h1>Trip #{trip.trip_code}</h1>
        </div>
      </header>

      <div className="documents-info-card">
        <Icon name="info" size={20} />
        <p>Please upload clear, legible photos of all required documents to ensure prompt settlement.</p>
      </div>

      <div className="documents-list">
        {/* Gate Photo */}
        <div className={`document-upload-card ${hasDocType('GATE_PASS') ? 'uploaded' : ''}`}>
          <div className="document-card-header">
            <div className="document-title">
              <Icon name="camera" size={20} />
              <strong>Gate Photo / Pass</strong>
            </div>
            {hasDocType('GATE_PASS') && <span className="doc-status-badge"><Icon name="check" size={12} /> Uploaded</span>}
          </div>
          <p className="document-desc">Photo or stamped gate pass used for delivery verification.</p>
          {hasDocType('GATE_PASS') ? (
            <div className="uploaded-file-info">
              <span className="file-name">{hasDocType('GATE_PASS').file_name}</span>
              <Button variant="outline" size="sm" onClick={() => handleDownload(hasDocType('GATE_PASS'))}>Download</Button>
              <Button variant="danger" size="sm" disabled={busy} onClick={() => handleDelete(hasDocType('GATE_PASS').id)}>Remove</Button>
            </div>
          ) : (
            <Button variant="outline" fullWidth disabled={busy} onClick={() => triggerUpload('GATE_PASS')}>Upload Photo</Button>
          )}
        </div>

        {/* E-Way Bill */}
        <div className={`document-upload-card ${hasDocType('EWAY_BILL') ? 'uploaded' : ''}`}>
          <div className="document-card-header">
            <div className="document-title">
              <Icon name="file" size={20} />
              <strong>E-Way Bill</strong>
            </div>
            {hasDocType('EWAY_BILL') && <span className="doc-status-badge"><Icon name="check" size={12} /> Uploaded</span>}
          </div>
          <p className="document-desc">Scan or photo of the E-Way bill with receiver signature.</p>
          {hasDocType('EWAY_BILL') ? (
            <div className="uploaded-file-info">
              <span className="file-name">{hasDocType('EWAY_BILL').file_name}</span>
              <Button variant="outline" size="sm" onClick={() => handleDownload(hasDocType('EWAY_BILL'))}>Download</Button>
              <Button variant="danger" size="sm" disabled={busy} onClick={() => handleDelete(hasDocType('EWAY_BILL').id)}>Remove</Button>
            </div>
          ) : (
            <Button variant="outline" fullWidth disabled={busy} onClick={() => triggerUpload('EWAY_BILL')}>Upload Document</Button>
          )}
        </div>

        {/* Proof of Delivery (POD) */}
        <div className={`document-upload-card ${hasDocType('POD') ? 'uploaded' : ''}`}>
          <div className="document-card-header">
            <div className="document-title">
              <Icon name="check" size={20} />
              <strong>Proof of Delivery (POD)</strong>
            </div>
            {hasDocType('POD') && <span className="doc-status-badge"><Icon name="check" size={12} /> Uploaded</span>}
          </div>
          <p className="document-desc">Signed delivery challan or receipt.</p>
          {hasDocType('POD') ? (
            <div className="uploaded-file-info">
              <span className="file-name">{hasDocType('POD').file_name}</span>
              <Button variant="outline" size="sm" onClick={() => handleDownload(hasDocType('POD'))}>Download</Button>
              <Button variant="danger" size="sm" disabled={busy} onClick={() => handleDelete(hasDocType('POD').id)}>Remove</Button>
            </div>
          ) : (
            <Button variant="outline" fullWidth disabled={busy} onClick={() => triggerUpload('POD')}>Upload POD</Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TripDocuments;
