import React, { useState } from "react";
import { 
  Heart, Search, ShieldCheck, Activity, Award, 
  Send, MessageSquare, Sparkles, SlidersHorizontal, DollarSign 
} from "lucide-react";

export default function UserModule({
  dogs,
  favorites,
  toggleFavorite,
  currentView,
  applications,
  onSubmitApplication,
  currentUser,
  onSendMessage
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBreed, setSelectedBreed] = useState("all");
  const [activeDogModal, setActiveDogModal] = useState(null);
  const [applyNotes, setApplyNotes] = useState("");
  
  // Inquiry state
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  // STANDOUT FEATURE 1: AI Lifestyle Matcher State
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({ home: "apartment", activity: "moderate" });
  const [quizApplied, setQuizApplied] = useState(false);

  const breeds = ["all", ...new Set(dogs.map((d) => d.breed))];

  // Calculate dynamic match score based on lifestyle quiz
  const getMatchScore = (dog) => {
    if (!quizApplied) return null;
    let score = 75;
    if (quizAnswers.home === "apartment" && dog.breed.includes("Corgi")) score += 20;
    if (quizAnswers.home === "house" && (dog.breed.includes("Retriever") || dog.breed.includes("Shepherd"))) score += 22;
    if (quizAnswers.activity === "active" && !dog.age.includes("Senior")) score += 15;
    return Math.min(score, 99);
  };

  const displayedDogs = dogs.filter((dog) => {
    const matchesSearch =
      dog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dog.breed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBreed = selectedBreed === "all" || dog.breed === selectedBreed;
    const matchesView = currentView === "favorites" ? favorites.includes(dog.id) : true;
    return matchesSearch && matchesBreed && matchesView;
  });

  const handleApply = (e) => {
    e.preventDefault();
    if (!activeDogModal) return;

    onSubmitApplication({
      appId: "APP-" + Date.now().toString().slice(-6),
      dogId: activeDogModal.id,
      dogName: activeDogModal.name,
      userId: currentUser.userId,
      userName: currentUser.name,
      notes: applyNotes || "Standard adoption request",
      status: "Pending",
      adminRemarks: "Under Shelter Review",
      date: new Date().toLocaleDateString()
    });

    alert(`Application submitted for ${activeDogModal.name}! Status: Pending`);
    setActiveDogModal(null);
    setApplyNotes("");
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;

    if (onSendMessage) {
      onSendMessage({
        id: "MSG-" + Date.now().toString().slice(-5),
        userName: currentUser.name,
        userEmail: currentUser.email || currentUser.userId,
        subject: contactSubject || "General Inquiry",
        message: contactMessage,
        date: new Date().toLocaleDateString()
      });
    }

    alert("Your question has been sent to the Shelter Admin!");
    setContactSubject("");
    setContactMessage("");
  };

  // View: Applications with Admin Remarks visible
  if (currentView === "applications") {
    const myApps = applications.filter((a) => a.userId === currentUser.userId);
    return (
      <div className="module-container">
        <h2>My Adoption Requests</h2>
        {myApps.length === 0 ? (
          <p className="empty-state">You have not submitted any adoption requests yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>App ID</th>
                <th>Dog Name</th>
                <th>Date</th>
                <th>Status</th>
                <th>Shelter Admin Remarks</th>
              </tr>
            </thead>
            <tbody>
              {myApps.map((app) => (
                <tr key={app.appId}>
                  <td>{app.appId}</td>
                  <td><strong>{app.dogName}</strong></td>
                  <td>{app.date}</td>
                  <td>
                    <span className={`badge badge-${app.status.toLowerCase()}`}>
                      {app.status}
                    </span>
                  </td>
                  <td style={{ color: "#4b5563", fontStyle: "italic" }}>
                    {app.adminRemarks || "Pending evaluation"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  return (
    <div className="module-container">
      {/* HERO BANNER */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1>Find Your <span>Pawfect</span> Companion</h1>
          <p>
            Every rescue dog deserves a loving home. Browse verified health records, 
            lineage pedigree, and start your adoption process in minutes.
          </p>
          <button 
            type="button"
            className="quiz-trigger-btn"
            onClick={() => setShowQuiz(true)}
          >
            <Sparkles size={16} /> Take AI Lifestyle Compatibility Quiz
          </button>
        </div>
      </section>

      {/* QUIZ MODAL */}
      {showQuiz && (
        <div className="modal-overlay" onClick={() => setShowQuiz(false)}>
          <div className="modal-content quiz-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h2>Smart Lifestyle Matcher</h2>
              <button className="close-x" onClick={() => setShowQuiz(false)}>&times;</button>
            </div>
            <p style={{ color: "#6b7280", marginBottom: "16px", fontSize: "0.9rem" }}>
              Answer 2 quick questions to calculate your personalized compatibility rating with each rescue dog.
            </p>
            <div className="quiz-field">
              <label>1. What is your living environment?</label>
              <select 
                value={quizAnswers.home} 
                onChange={(e) => setQuizAnswers({ ...quizAnswers, home: e.target.value })}
              >
                <option value="apartment">Apartment / Flat (Compact Space)</option>
                <option value="house">Independent House with Fenced Yard</option>
              </select>
            </div>
            <div className="quiz-field" style={{ marginTop: "12px" }}>
              <label>2. Your typical daily energy & exercise level?</label>
              <select 
                value={quizAnswers.activity} 
                onChange={(e) => setQuizAnswers({ ...quizAnswers, activity: e.target.value })}
              >
                <option value="moderate">Moderate (Normal walks & indoor play)</option>
                <option value="active">High Energy (Daily jogging, outdoor runs)</option>
              </select>
            </div>
            <button 
              className="submit-btn" 
              style={{ marginTop: "20px" }}
              onClick={() => {
                setQuizApplied(true);
                setShowQuiz(false);
              }}
            >
              Calculate Compatibility Scores
            </button>
          </div>
        </div>
      )}

      {/* STATS BAR */}
      <div className="shelter-stats-bar">
        <div className="stat-item">
          <h3>140+</h3>
          <p>Successful Adoptions</p>
        </div>
        <div className="stat-item">
          <h3>100%</h3>
          <p>Vaccinated &amp; Microchipped</p>
        </div>
        <div className="stat-item">
          <h3>12+</h3>
          <p>Partner Vet Clinics</p>
        </div>
        <div className="stat-item">
          <h3>24/7</h3>
          <p>Shelter Support</p>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by dog name or breed..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={selectedBreed}
          onChange={(e) => setSelectedBreed(e.target.value)}
          className="breed-dropdown"
        >
          {breeds.map((b) => (
            <option key={b} value={b}>
              {b === "all" ? "All Breeds" : b}
            </option>
          ))}
        </select>
      </div>

      {/* DOGS GRID */}
      <div className="dog-grid">
        {displayedDogs.length === 0 ? (
          <p className="empty-state">No rescue dogs matched your search.</p>
        ) : (
          displayedDogs.map((dog) => {
            const isFav = favorites.includes(dog.id);
            const match = getMatchScore(dog);
            return (
              <div key={dog.id} className="dog-card">
                <div className="card-media">
                  <img src={dog.image} alt={dog.name} />
                  {match && (
                    <span className="match-pill">
                      <Sparkles size={12} /> {match}% Match
                    </span>
                  )}
                  <button
                    className={`fav-icon-btn ${isFav ? "active" : ""}`}
                    onClick={() => toggleFavorite(dog.id)}
                    title={isFav ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart size={20} fill={isFav ? "#e11d48" : "none"} />
                  </button>
                </div>
                <div className="card-info">
                  <div className="card-header">
                    <h3>{dog.name}</h3>
                    <span className="age-tag">{dog.age}</span>
                  </div>
                  <p className="breed-text">{dog.breed}</p>

                  <div className="card-badges">
                    <span className="mini-badge">
                      <ShieldCheck size={14} /> Vaccinated
                    </span>
                    <span className="mini-badge">
                      <Activity size={14} /> Microchipped
                    </span>
                  </div>

                  <button
                    className="view-btn"
                    onClick={() => setActiveDogModal(dog)}
                  >
                    View Passport &amp; Apply
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CONTACT SHELTER SECTION */}
      <section className="inquiry-section">
        <div className="inquiry-card">
          <div className="inquiry-header">
            <MessageSquare size={24} className="inquiry-icon" />
            <div>
              <h3>Have Questions Before Adopting?</h3>
              <p>Send a direct message to our shelter manager.</p>
            </div>
          </div>
          <form onSubmit={handleSendMessage} className="inquiry-form">
            <input
              type="text"
              placeholder="Subject (e.g. Adoption Fee, Visiting Hours)"
              value={contactSubject}
              onChange={(e) => setContactSubject(e.target.value)}
              required
            />
            <textarea
              placeholder="Write your question or message here..."
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              rows={3}
              required
            />
            <button type="submit" className="submit-btn" style={{ width: "auto" }}>
              <Send size={16} /> Send Question
            </button>
          </form>
        </div>
      </section>

      {/* HEALTH PASSPORT MODAL (With Cost Estimator) */}
      {activeDogModal && (
        <div className="modal-overlay" onClick={() => setActiveDogModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h2>{activeDogModal.name}'s Health Passport</h2>
              <button className="close-x" onClick={() => setActiveDogModal(null)}>
                &times;
              </button>
            </div>

            <div className="passport-sections">
              <div className="passport-box health-box">
                <h4><ShieldCheck size={18} /> Medical &amp; Vaccines</h4>
                <p><strong>Microchip ID:</strong> {activeDogModal.microchip || "CHIP-98421"}</p>
                <p><strong>Vaccinations:</strong> {activeDogModal.vaccines?.join(", ") || "Rabies, DHPP, Bordetella"}</p>
                <p><strong>Neutered/Spayed:</strong> Yes</p>
              </div>

              <div className="passport-box pedigree-box">
                <h4><Award size={18} /> Pedigree / Lineage</h4>
                <p><strong>Sire (Father):</strong> {activeDogModal.father || "Shelter Verified"}</p>
                <p><strong>Dam (Mother):</strong> {activeDogModal.mother || "Shelter Verified"}</p>
              </div>

              {/* Cost Estimator */}
              <div className="passport-box cost-box">
                <h4><DollarSign size={18} /> Estimated Monthly Care Cost</h4>
                <p>Premium Kibble: ~₹1,800/mo • Routine Vet/Grooming: ~₹800/mo</p>
              </div>
            </div>

            <form onSubmit={handleApply} className="apply-form">
              <label>Adoption Note / Request Details:</label>
              <textarea
                placeholder="Tell us about your home and experience with dogs..."
                value={applyNotes}
                onChange={(e) => setApplyNotes(e.target.value)}
                rows={3}
                required
              />
              <button type="submit" className="submit-btn">
                Submit Adoption Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}