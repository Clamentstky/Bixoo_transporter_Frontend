import Icon from "../../components/Icon";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import { errorMessage } from "../../services/session";
import { formatDate } from "../../services/display";
import "./TripChat.css";

export default function TripChat() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const messagesEndRef = useRef(null);
  useEffect(() => {
    let active = true;
    let timer;
    setLoading(true); setMessages([]); setError("");
    const refresh = async () => {
      try {
        const res = await api.get(`/transporter/chats/${tripId}/messages`);
        if (active) { setMessages(res.data); setError(""); }
      } catch (err) { if (active) setError(errorMessage(err)); }
      finally {
        if (active) { setLoading(false); timer = setTimeout(refresh, 10000); }
      }
    };
    refresh();
    return () => { active = false; clearTimeout(timer); };
  }, [tripId, attempt]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);
  const sendMessage = async event => {
    event.preventDefault();
    if (!message.trim() || sending) return;
    setSending(true); setError("");
    try {
      const res = await api.post(`/transporter/chats/${tripId}/messages`, { message: message.trim() });
      setMessages(previous => [...previous.filter(item => item.id !== res.data.id), res.data]);
      setMessage("");
    } catch (err) { setError(errorMessage(err)); }
    finally { setSending(false); }
  };
  return <div className="trip-chat-page">
    <header className="chat-header">
      <Button variant="ghost" icon="arrowLeft" onClick={() => navigate(`/trips/${tripId}`)} />
      <div className="chat-contact-info"><div className="chat-avatar"><Icon name="chat" /></div><div><strong>Transporter Direct</strong><span>Trip #{tripId} logistics coordination</span></div></div>
    </header>
    <div className="chat-quick-actions" aria-label="Trip coordination actions">
      <Button variant="outline" size="sm" icon="pin" onClick={() => navigate(`/trips/${tripId}/live`)}>Live location</Button>
      <Button variant="outline" size="sm" icon="document" onClick={() => navigate(`/trips/${tripId}/documents`)}>Documents</Button>
    </div>
    {error && <div role="alert"><p>{error}</p><Button variant="outline" onClick={() => setAttempt(value => value + 1)}>Retry loading messages</Button></div>}
    <div className="chat-messages-area">
      {loading ? <p role="status">Loading messages...</p> : messages.length === 0 && !error ? <p>No messages yet.</p> : messages.map(msg => <div key={msg.id} className={`chat-message ${msg.sender_type === "TRANSPORTER" ? "sent" : "received"}`}><div className="message-bubble">{msg.message}</div><span className="message-time">{formatDate(msg.created_at)}</span></div>)}
      <div ref={messagesEndRef} />
    </div>
    <form className="chat-input-area" onSubmit={sendMessage} style={{ display: "flex", gap: 8 }}>
      <Button variant="ghost" icon="pin" aria-label="Open live location sharing" onClick={() => navigate(`/trips/${tripId}/live`)} />
      <input aria-label="Message" className="chat-text-input" value={message} maxLength={5000} onChange={event => setMessage(event.target.value)} disabled={sending} placeholder="Type a message..." style={{ flex: 1, minWidth: 0 }} />
      <Button type="submit" icon="arrow" aria-label="Send message" disabled={!message.trim() || loading} loading={sending} />
    </form>
  </div>;
}
