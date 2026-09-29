import React, { useState } from "react";
import SupportPageHeader from "../../components/support/SupportPageHeader";
import FAQItem from "../../components/support/FAQItem";
import Icon from "../../components/Icon";
import FilterPill from "../../components/ui/FilterPill";
import "./SupportPages.css";

const faqData = [
  { id: 1, category: "Loads", question: "How do I accept a load?", answer: "Open Available Loads, select the required load, review the load details and choose Accept." },
  { id: 2, category: "Loads", question: "Why is my load no longer available?", answer: "The load may have been accepted by another transporter, cancelled, expired, or may no longer match your availability." },
  { id: 3, category: "Trips", question: "How do I start pickup?", answer: "Open My Trips, choose an accepted trip and use the Start Pickup action." },
  { id: 4, category: "Trips", question: "How do I share live location?", answer: "Open the active trip/chat and use the Send Live Location option while the trip is active." },
  { id: 5, category: "Payments", question: "How is settlement calculated?", answer: "Settlement information is calculated by the backend based on completed trip and applicable settlement rules." },
  { id: 6, category: "Account", question: "How do I update my vehicle information?", answer: "Go to Profile, click Edit Profile, and update your vehicle details under the Vehicle section." },
  { id: 7, category: "Documents", question: "What documents are required for settlement?", answer: "You must upload a Gate Pass photo and the signed Proof of Delivery (POD) to receive your settlement." },
  { id: 8, category: "Technical", question: "The app is not loading loads. What should I do?", answer: "Please check your internet connection. If the problem persists, try logging out and logging back in, or contact BIXOO support." }
];

const categories = ["All", "Account", "Loads", "Trips", "Payments", "Documents", "Technical"];

function FAQs() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [openItem, setOpenItem] = useState(null);

  const filteredFaqs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(search.toLowerCase()) || faq.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (id) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <div className="support-page ui-page">
      <div className="support-container">
        <SupportPageHeader 
          title="Frequently Asked Questions"
          subtitle="Quick answers to common BIXOO Transporter questions."
        />

        <div className="search-bar-container" style={{ marginBottom: "24px", position: "relative" }}>
          <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--ui-muted)" }}>
            <Icon name="search" size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search FAQs..." 
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

        <div className="faq-categories">
          {categories.map(category => (
            <FilterPill 
              key={category}
              active={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </FilterPill>
          ))}
        </div>

        {filteredFaqs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--ui-muted)" }}>
            <Icon name="info" size={48} />
            <p style={{ marginTop: "16px" }}>No FAQs found matching your criteria.</p>
          </div>
        ) : (
          <div className="faq-list">
            {filteredFaqs.map(faq => (
              <FAQItem 
                key={faq.id}
                question={faq.question}
                answer={faq.answer}
                isOpen={openItem === faq.id}
                onToggle={() => toggleItem(faq.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FAQs;
