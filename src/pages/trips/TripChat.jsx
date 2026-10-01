import Icon from "../../components/Icon";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import "./TripChat.css";

function TripChat() {
  const navigate = useNavigate();
  const { tripId } = useParams();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/transporter/chats/${tripId}/messages`);
        if (res.data) {
          const formatted = res.data.map(m => ({
            id: m.id,
            type: m.sender_type === "TRANSPORTER" ? "sent" : "received",
            text: m.message,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setMessages(formatted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (tripId) fetchMessages();
  }, [tripId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    // Optimistically update
    const tempMsg = {
      id: Date.now(),
      type: "sent",
      text: trimmedMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setMessage("");

    try {
      await api.post(`/transporter/chats/${tripId}/messages`, { message: trimmedMessage });
    } catch (err) {
      console.error(err);
      // Ideally remove optimistic message on failure
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="trip-chat-page">
      <header className="chat-header">
        <Button 
          variant="ghost" 
          size="lg" 
          icon="arrowLeft" 
          onClick={() => navigate(-1)} 
          style={{ padding: "8px", width: "42px", height: "42px", borderRadius: "10px" }}
        />

        <div className="chat-contact-info">
          <div className="chat-avatar">MM</div>
          <div>
            <strong>Trip #{tripId || "Support"}</strong>
            <span>Online</span>
          </div>
        </div>

        <Button 
          variant="ghost" 
          icon="phone" 
          aria-label="Call"
          style={{ padding: "8px", width: "42px", height: "42px", borderRadius: "10px" }}
        />
      </header>

      <div className="chat-messages-area">
        {loading ? (
          <p style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>Loading messages...</p>
        ) : messages.length === 0 ? (
          <div className="empty-chat-state">
            <Icon name="chat" size={48} />
            <p>No messages yet.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.type}`}>
              <div className="message-bubble">{msg.text}</div>
              <span className="message-time">{msg.time}</span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Button 
          variant="ghost" 
          icon="pin"
          aria-label="Open live location and sharing"
          onClick={() => navigate(`/trips/${tripId}/live`)}
          style={{ padding: "8px", width: "42px", height: "42px", borderRadius: "10px" }}
        />

        <input
          type="text"
          className="chat-text-input"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1 }}
        />

        <Button
          variant="primary"
          icon="arrow"
          onClick={sendMessage}
          disabled={!message.trim()}
          aria-label="Send message"
          style={{ padding: "8px", width: "42px", height: "42px", borderRadius: "10px" }}
        />
      </div>
    </div>
  );
}

export default TripChat;
