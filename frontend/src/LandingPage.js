import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css"; // Import styles

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <h1 className="landing-title">🚀 Welcome to TaskFlow</h1>
      <p className="landing-subtitle">Your personal Notion-inspired task manager</p>
      <button className="landing-button" onClick={() => navigate("/dashboard")}>
        Go to Dashboard →
      </button>
    </div>
  );
}

export default LandingPage;
