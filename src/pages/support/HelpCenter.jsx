import React, { useState } from "react";
import SupportPageHeader from "../../components/support/SupportPageHeader";
import Icon from "../../components/Icon";
import "./SupportPages.css";

const helpTopics = [
  { id: 1, category: "Getting Started", title: "How to go Online / Offline" },
  { id: 2, category: "Getting Started", title: "How to find Available Loads" },
  { id: 3, category: "Getting Started", title: "How to accept a load" },
  { id: 4, category: "Getting Started", title: "How to start a trip" },
  { id: 5, category: "Getting Started", title: "How to complete a trip" },
  
  { id: 6, category: "Available Loads", title: "How to view load details?" },
  { id: 7, category: "Available Loads", title: "How do I accept a load?" },
  { id: 8, category: "Available Loads", title: "Why can't I accept a load?" },
  { id: 9, category: "Available Loads", title: "What does Direct Match mean?" },
  { id: 10, category: "Available Loads", title: "Why is a load no longer available?" },
  
  { id: 11, category: "Trips", title: "How to start pickup?" },
  { id: 12, category: "Trips", title: "How to update trip status?" },
  { id: 13, category: "Trips", title: "How to share live location?" },
  { id: 14, category: "Trips", title: "How to upload gate photo/POD?" },
  { id: 15, category: "Trips", title: "How to complete delivery?" },
  
  { id: 16, category: "Payments & Settlements", title: "How are payouts calculated?" },
  { id: 17, category: "Payments & Settlements", title: "What is pending settlement?" },
  { id: 18, category: "Payments & Settlements", title: "What is Weekly Settlement?" },
  { id: 19, category: "Payments & Settlements", title: "What is Monthly Subscription?" },
  { id: 20, category: "Payments & Settlements", title: "When will my settlement be processed?" },
];

const categories = [
  "Getting Started",
  "Available Loads",
  "Trips",
  "Payments & Settlements",
  "Profile & Documents",
  "Account & Security",
  "Chat & Support"
];

function HelpCenter() {
  const [search, setSearch] = useState("");

  const filteredTopics = search 
    ? helpTopics.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()))
    : helpTopics;

  // Group by category if no search
  const topicsByCategory = filteredTopics.reduce((acc, topic) => {
    if (!acc[topic.category]) acc[topic.category] = [];
    acc[topic.category].push(topic);
    return acc;
  }, {});

  return (
    <div className="support-page ui-page">
      <div className="support-container">
        <SupportPageHeader 
          title="Help Center"
          subtitle="Find answers and guidance for using BIXOO Transporter."
        />

        <div className="search-bar-container" style={{ marginBottom: "32px", position: "relative" }}>
          <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--ui-muted)" }}>
            <Icon name="search" size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search help topics..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              height: "52px",
              padding: "0 16px 0 48px",
              borderRadius: "14px",
              border: "1px solid var(--ui-border)",
              fontSize: "15px",
              outline: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
            }}
          />
        </div>

        {search && filteredTopics.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--ui-muted)" }}>
            <Icon name="help" size={48} />
            <p style={{ marginTop: "16px" }}>No help topics found for "{search}"</p>
          </div>
        )}

        {Object.keys(topicsByCategory).map(category => (
          <div key={category} style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "var(--ui-text)" }}>{category}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {topicsByCategory[category].map(topic => (
                <div 
                  key={topic.id}
                  role="button"
                  tabIndex={0}
                  className="help-topic-item"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px",
                    background: "white",
                    borderRadius: "12px",
                    border: "1px solid var(--ui-border)",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: "15px", fontWeight: "500" }}>{topic.title}</span>
                  <Icon name="arrow" size={16} />
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Categories that don't have static content yet but should be visible */}
        {!search && categories.filter(c => !topicsByCategory[c]).map(category => (
          <div key={category} style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "var(--ui-text)" }}>{category}</h2>
            <div style={{ padding: "16px", background: "white", borderRadius: "12px", border: "1px solid var(--ui-border)", color: "var(--ui-muted)", fontStyle: "italic", fontSize: "14px" }}>
              More topics coming soon.
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}

export default HelpCenter;
