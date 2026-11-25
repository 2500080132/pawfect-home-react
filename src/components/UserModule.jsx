import React, { useState } from "react";
import {
  Heart, Search, ShieldCheck, Activity, Award,
  Send, MessageSquare, Sparkles, DollarSign,
  AlertTriangle, MapPin, UserCheck, CheckCircle2, Camera
} from "lucide-react";

const TRACKER_STAGES = ["Submitted", "Under Review", "Meet & Greet", "Approved"];

export default function UserModule({
  dogs,
  favorites,
  toggleFavorite,
  currentView,
  setView,
  applications,
  onSubmitApplication,
  currentUser,
  onUpdateProfile,
  messages = [],
  onSendMessage,
  rescueReports = [],
  onSubmitRescue
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBreed, setSelectedBreed] = useState("all");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");

  const [activeDogModal, setActiveDogModal] = useState(null);
  const [applyForm, setApplyForm] = useState({
    phone: currentUser.phone || "",
    address: currentUser.address || "",
    homeType: currentUser.homeType || "Apartment / Flat",
    experience: currentUser.experience || "First-time Dog Owner",
    notes: ""
  });

  // Inquiry state
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  // AI Lifestyle Matcher State
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({ home: "apartment", activity: "moderate" });
  const [quizApplied, setQuizApplied] = useState(false);

  // Stray Rescue Form State
  const [rescueForm, setRescueForm] = useState({
    photoUrl: "",
    location: "",
    urgency: "High",
    description: ""
  });

  // Adopter Profile State
  const [profileForm, setProfileForm] = useState({
    name: currentUser.name || "",
    email: currentUser.email || "",
    phone: currentUser.phone || "",
    address: currentUser.address || "",
    homeType: currentUser.homeType || "Apartment / Flat",
    experience: currentUser.experience || "First-time Dog Owner"
  });

  const breeds = ["all", ...new Set(dogs.map((d) => d.breed))];

  const getMatchScore = (dog) => {
    if (!quizApplied) return null;
    let score = 74;
    const traits = dog.traits || [];
    if (quizAnswers.home === "apartment" && (traits.includes("Apartment Friendly") || dog.size === "Small")) {
      score += 18;
    }
    if (quizAnswers.home === "house" && (dog.size === "Large" || dog.size === "Medium")) {
      score += 18;
    }
    if (quizAnswers.activity === "active" && (traits.includes("High Energy") || dog.ageGroup !== "Adult")) {
      score += 7;
    }
    if (quizAnswers.activity === "moderate" && !traits.includes("High Energy")) {
      score += 7;
    }
    return Math.min(score, 99);
  };

  const filteredDogs = dogs
    .filter((dog) => {
      const matchesSearch =
        dog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dog.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dog.traits || []).some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesBreed = selectedBreed === "all" || dog.breed === selectedBreed;
      const matchesAge = selectedAgeGroup === "all" || (dog.ageGroup || "Adult") === selectedAgeGroup;
      const matchesSize = selectedSize === "all" || (dog.size || "Medium") === selectedSize;
      const matchesView = currentView === "favorites" ? favorites.includes(dog.id) : true;
      return matchesSearch && matchesBreed && matchesAge && matchesSize && matchesView;
    })
    .sort((a, b) => {
      if (!quizApplied) return 0;
      return (getMatchScore(b) || 0) - (getMatchScore(a) || 0);
    });

  const openPassportModal = (dog) => {
    setApplyForm({
      phone: currentUser.phone || "",
      address: currentUser.address || "",
      homeType: currentUser.homeType || "Apartment / Flat",
      experience: currentUser.experience || "First-time Dog Owner",
      notes: ""
    });
    setActiveDogModal(dog);
  };

  const handleApply = (e) => {
    e.preventDefault();
    if (!activeDogModal) return;

    const score = getMatchScore(activeDogModal);
    onSubmitApplication({
      appId: "APP-" + Date.now().toString().slice(-6),
      dogId: activeDogModal.id,
      dogName: activeDogModal.name,
      userId: currentUser.userId,
      userName: currentUser.name,
      userEmail: currentUser.email || currentUser.userId,
      phone: applyForm.phone,
      address: applyForm.address,
      homeType: applyForm.homeType,
      experience: applyForm.experience,
      matchScore: score,
      notes: applyForm.notes || "Standard adoption request",
      status: "Submitted",
      adminRemarks: "Application received by shelter",
      date: new Date().toLocaleDateString()
    });

    setActiveDogModal(null);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;

    if (onSendMessage) {
      onSendMessage({
        id: "MSG-" + Date.now().toString().slice(-5),
        userId: currentUser.userId,
        userName: currentUser.name,
        userEmail: currentUser.email || currentUser.userId,
        subject: contactSubject || "General Inquiry",
        message: contactMessage,
        adminReply: "",
        date: new Date().toLocaleDateString()
      });
    }

    setContactSubject("");
    setContactMessage("");
  };

  const handleRescueSubmit = (e) => {
    e.preventDefault();
    if (!rescueForm.location.trim()) return;

    onSubmitRescue({
      id: "RSC-" + Date.now().toString().slice(-5),
      reporterId: currentUser.userId,
      reporterName: currentUser.name,
      photoUrl:
        rescueForm.photoUrl ||
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80",
      location: rescueForm.location,
      urgency: rescueForm.urgency,
      description: rescueForm.description,
      status: "Pending",
      date: new Date().toLocaleDateString()
    });

    setRescueForm({ photoUrl: "", location: "", urgency: "High", description: "" });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    onUpdateProfile(profileForm);
  };

  // VIEW 1: Adopter Profile & Auto-Fill Settings
  if (currentView === "profile") {
    return (
      <div className="module-container">
        <div className="inquiry-card" style={{ maxWidth: "640px", margin: "0 auto" }}>
          <div className="inquiry-header">
            <UserCheck size={26} className="inquiry-icon" />
            <div>
              <h2>My Adopter Profile</h2>
              <p>Save your details once for 1-click auto-fill on adoption applications.</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="inquiry-form">
            <label className="field-label">Full Name</label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              required
            />

            <label className="field-label">Email Address</label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
            />

            <label className="field-label">Phone Number</label>
            <input
              type="text"
              placeholder="+91 98765 43210"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
            />

            <label className="field-label">Residential Address</label>
            <input
              type="text"
              placeholder="Street, Area, City"
              value={profileForm.address}
              onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
            />

            <div className="two-col-inputs">
              <div>
                <label className="field-label">Home Type</label>
                <select
                  className="breed-dropdown"
                  style={{ width: "100%" }}
                  value={profileForm.homeType}
                  onChange={(e) => setProfileForm({ ...profileForm, homeType: e.target.value })}
                >
                  <option value="Apartment / Flat">Apartment / Flat</option>
                  <option value="Independent House with Yard">Independent House with Yard</option>
                  <option value="Gated Villa / Farm">Gated Villa / Farm</option>
                </select>
              </div>
              <div>
                <label className="field-label">Pet Experience</label>
                <select
                  className="breed-dropdown"
                  style={{ width: "100%" }}
                  value={profileForm.experience}
                  onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })}
                >
                  <option value="First-time Dog Owner">First-time Dog Owner</option>
                  <option value="Experienced Owner">Experienced Owner</option>
                  <option value="Multi-Pet Household">Multi-Pet Household</option>
                </select>
              </div>
            </div>

            <button type="submit" className="submit-btn">
              Save Profile &amp; Enable Auto-Fill
            </button>
          </form>
        </div>
      </div>
    );
  }

  // VIEW 2: Report a Stray / Rescue Workflow
  if (currentView === "rescue") {
    const myReports = rescueReports.filter((r) => r.reporterId === currentUser.userId);
    return (
      <div className="module-container">
        <div className="inquiry-card">
          <div className="inquiry-header">
            <AlertTriangle size={26} className="inquiry-icon" />
            <div>
              <h2>Report a Stray / Rescue Animal</h2>
              <p>Alert our rescue team with location, photo, and urgency level for immediate dispatch.</p>
            </div>
          </div>

          <form onSubmit={handleRescueSubmit} className="inquiry-form">
            <div className="two-col-inputs">
              <div>
                <label className="field-label"><MapPin size={14} /> Landmark / Location Address *</label>
                <input
                  type="text"
                  placeholder="e.g. Near Benz Circle, Vijayawada"
                  value={rescueForm.location}
                  onChange={(e) => setRescueForm({ ...rescueForm, location: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="field-label">Urgency Level</label>
                <select
                  className="breed-dropdown"
                  style={{ width: "100%" }}
                  value={rescueForm.urgency}
                  onChange={(e) => setRescueForm({ ...rescueForm, urgency: e.target.value })}
                >
                  <option value="Critical">Critical (Injured / Traffic Hazard)</option>
                  <option value="High">High (Stray Puppy / Distressed)</option>
                  <option value="Moderate">Moderate (Needs Shelter / Food)</option>
                </select>
              </div>
            </div>

            <label className="field-label"><Camera size={14} /> Photo URL (Optional)</label>
            <input
              type="text"
              placeholder="Paste image link of the stray dog..."
              value={rescueForm.photoUrl}
              onChange={(e) => setRescueForm({ ...rescueForm, photoUrl: e.target.value })}
            />

            {rescueForm.photoUrl && (
              <img src={rescueForm.photoUrl} alt="Rescue preview" className="preview-banner-img" />
            )}

            <textarea
              placeholder="Describe condition, collar presence, and exact spot..."
              rows={3}
              value={rescueForm.description}
              onChange={(e) => setRescueForm({ ...rescueForm, description: e.target.value })}
              required
            />

            <button type="submit" className="submit-btn" style={{ width: "auto" }}>
              <Send size={16} /> Submit Rescue Alert
            </button>
          </form>
        </div>

        <div className="inquiry-card" style={{ marginTop: "24px" }}>
          <h3>My Submitted Rescue Reports ({myReports.length})</h3>
          {myReports.length === 0 ? (
            <p className="empty-state">You have not reported any stray rescues yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Location</th>
                  <th>Urgency</th>
                  <th>Date</th>
                  <th>Rescue Status</th>
                </tr>
              </thead>
              <tbody>
                {myReports.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td><strong>{r.location}</strong></td>
                    <td>{r.urgency}</td>
                    <td>{r.date}</td>
                    <td>
                      <span className={`badge badge-${r.status.toLowerCase().replace(/\s+/g, "-")}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  // VIEW 3: My Messages & Shelter Replies
  if (currentView === "messages") {
    const myMsgs = messages.filter((m) => m.userId === currentUser.userId);
    return (
      <div className="module-container">
        <h2>My Messages &amp; Shelter Replies</h2>
        {myMsgs.length === 0 ? (
          <p className="empty-state">No inquiries sent yet. Use the form on the catalog page to ask a question.</p>
        ) : (
          <div className="tracker-list">
            {myMsgs.map((m) => (
              <div key={m.id} className="inquiry-card" style={{ marginBottom: "16px" }}>
                <div className="card-header">
                  <h4>{m.subject}</h4>
                  <span className="age-tag">{m.date}</span>
                </div>
                <p style={{ margin: "8px 0", color: "#374151" }}><strong>You:</strong> {m.message}</p>
                {m.adminReply ? (
                  <div className="reply-bubble">
                    <strong>Shelter Admin Reply ({m.repliedDate}):</strong> {m.adminReply}
                  </div>
                ) : (
                  <p style={{ fontSize: "0.85rem", color: "#9ca3af", fontStyle: "italic" }}>
                    Awaiting response from shelter team...
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // VIEW 4: Visual Multi-Stage Adoption Status Tracker
  if (currentView === "applications") {
    const myApps = applications.filter((a) => a.userId === currentUser.userId);
    return (
      <div className="module-container">
        <h2>My Adoption Requests &amp; Live Status Tracker</h2>
        {myApps.length === 0 ? (
          <p className="empty-state">You have not submitted any adoption requests yet.</p>
        ) : (
          <div className="tracker-list">
            {myApps.map((app) => {
              const normalizedStatus = app.status === "Pending" ? "Submitted" : app.status;
              const currentStepIdx = TRACKER_STAGES.indexOf(normalizedStatus);
              const isRejected = normalizedStatus === "Rejected";

              return (
                <div key={app.appId} className="inquiry-card" style={{ marginBottom: "20px" }}>
                  <div className="card-header">
                    <div>
                      <h3>{app.dogName} <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>({app.appId})</span></h3>
                      <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Submitted on {app.date}</p>
                    </div>
                    <span className={`badge badge-${normalizedStatus.toLowerCase().replace(/[^a-z]/g, "-")}`}>
                      {normalizedStatus}
                    </span>
                  </div>

                  {!isRejected && (
                    <div className="stepper-row">
                      {TRACKER_STAGES.map((stage, idx) => {
                        const completed = idx <= (currentStepIdx === -1 ? 0 : currentStepIdx);
                        return (
                          <div key={stage} className={`stepper-step ${completed ? "done" : ""}`}>
                            <div className="step-circle">
                              {completed ? <CheckCircle2 size={16} /> : idx + 1}
                            </div>
                            <span>{stage}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <p style={{ marginTop: "12px", fontSize: "0.9rem", color: "#4b5563" }}>
                    <strong>Shelter Note:</strong> {app.adminRemarks || "Under review by adoption coordinator"}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // VIEW 5: Main Catalog & Saved Shortlist
  return (
    <div className="module-container">
      <section className="hero-banner">
        <div className="hero-content">
          <h1>Find Your <span>Pawfect</span> Companion</h1>
          <p>
            Every rescue dog deserves a loving home. Browse verified health records,
            personality tags, and start your adoption process in minutes.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              className="quiz-trigger-btn"
              onClick={() => setShowQuiz(true)}
            >
              <Sparkles size={16} /> {quizApplied ? "Retake AI Compatibility Quiz" : "Take AI Lifestyle Compatibility Quiz"}
            </button>
            <button
              type="button"
              className="quiz-trigger-btn"
              style={{ background: "#fef2f2", color: "#dc2626" }}
              onClick={() => setView("rescue")}
            >
              <AlertTriangle size={16} /> Report a Stray / Rescue
            </button>
          </div>
        </div>
      </section>

      {showQuiz && (
        <div className="modal-overlay" onClick={() => setShowQuiz(false)}>
          <div className="modal-content quiz-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h2>Smart Lifestyle Matcher</h2>
              <button className="close-x" onClick={() => setShowQuiz(false)}>&times;</button>
            </div>
            <p style={{ color: "#6b7280", marginBottom: "16px", fontSize: "0.9rem" }}>
              Answer 2 quick questions to rank dogs by your personalized AI Match % score.
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
              <label>2. Your typical daily energy &amp; exercise level?</label>
              <select
                value={quizAnswers.activity}
                onChange={(e) => setQuizAnswers({ ...quizAnswers, activity: e.target.value })}
              >
                <option value="moderate">Moderate (Normal walks &amp; indoor play)</option>
                <option value="active">High Energy (Daily jogging, outdoor runs)</option>
              </select>
            </div>
            <button
              className="submit-btn"
              style={{ marginTop: "20px", width: "100%" }}
              onClick={() => {
                setQuizApplied(true);
                setShowQuiz(false);
              }}
            >
              Rank Best Matches
            </button>
          </div>
        </div>
      )}

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
          <p>Stray Rescue Dispatch</p>
        </div>
      </div>

      {/* EXPANDED FILTER & SEARCH BAR */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by dog name, breed, or trait..."
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

        <select
          value={selectedAgeGroup}
          onChange={(e) => setSelectedAgeGroup(e.target.value)}
          className="breed-dropdown"
        >
          <option value="all">All Ages</option>
          <option value="Puppy">Puppy</option>
          <option value="Young">Young</option>
          <option value="Adult">Adult</option>
        </select>

        <select
          value={selectedSize}
          onChange={(e) => setSelectedSize(e.target.value)}
          className="breed-dropdown"
        >
          <option value="all">All Sizes</option>
          <option value="Small">Small</option>
          <option value="Medium">Medium</option>
          <option value="Large">Large</option>
        </select>
      </div>

      {/* 3-COLUMN BALANCED DOG GRID */}
      <div className="dog-grid">
        {filteredDogs.length === 0 ? (
          <p className="empty-state">No rescue dogs matched your filter criteria.</p>
        ) : (
          filteredDogs.map((dog) => {
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
                  <p className="breed-text">
                    {dog.breed} • {dog.size || "Medium"}
                  </p>

                  {/* Personality Trait Tags */}
                  <div className="trait-row">
                    {(dog.traits || ["Friendly"]).map((trait) => (
                      <span key={trait} className="trait-pill">
                        {trait}
                      </span>
                    ))}
                  </div>

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
                    onClick={() => openPassportModal(dog)}
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
              <p>Send a direct message to our shelter manager and track replies in My Messages.</p>
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

      {/* HEALTH PASSPORT & AUTO-FILLED APPLICATION MODAL */}
      {activeDogModal && (
        <div className="modal-overlay" onClick={() => setActiveDogModal(null)}>
          <div className="modal-content" style={{ maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h2>{activeDogModal.name}'s Health Passport</h2>
              <button className="close-x" onClick={() => setActiveDogModal(null)}>
                &times;
              </button>
            </div>

            <div className="passport-sections">
              <div className="passport-box health-box">
                <h4><ShieldCheck size={18} /> Medical &amp; Vet Notes</h4>
                <p><strong>Microchip ID:</strong> {activeDogModal.microchip || "CHIP-98421"}</p>
                <p><strong>Vaccinations:</strong> {activeDogModal.vaccines?.join(", ") || "Rabies, DHPP, Bordetella"}</p>
                <p><strong>Vet Notes:</strong> {activeDogModal.vetNotes || "Cleared for adoption"}</p>
              </div>

              <div className="passport-box pedigree-box">
                <h4><Award size={18} /> Pedigree / Lineage</h4>
                <p><strong>Sire (Father):</strong> {activeDogModal.father || "Shelter Verified"}</p>
                <p><strong>Dam (Mother):</strong> {activeDogModal.mother || "Shelter Verified"}</p>
              </div>

              <div className="passport-box cost-box">
                <h4><DollarSign size={18} /> Estimated Monthly Care Cost</h4>
                <p>Premium Kibble: ~₹1,800/mo • Routine Vet/Grooming: ~₹800/mo</p>
              </div>
            </div>

            <form onSubmit={handleApply} className="apply-form">
              <div className="two-col-inputs">
                <div>
                  <label className="field-label">Contact Phone *</label>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="+91 98765 43210"
                    value={applyForm.phone}
                    onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="field-label">Home Type *</label>
                  <select
                    className="modal-input"
                    value={applyForm.homeType}
                    onChange={(e) => setApplyForm({ ...applyForm, homeType: e.target.value })}
                  >
                    <option value="Apartment / Flat">Apartment / Flat</option>
                    <option value="Independent House with Yard">Independent House with Yard</option>
                    <option value="Gated Villa / Farm">Gated Villa / Farm</option>
                  </select>
                </div>
              </div>

              <label className="field-label" style={{ marginTop: "8px", display: "block" }}>Pet Experience</label>
              <select
                className="modal-input"
                value={applyForm.experience}
                onChange={(e) => setApplyForm({ ...applyForm, experience: e.target.value })}
              >
                <option value="First-time Dog Owner">First-time Dog Owner</option>
                <option value="Experienced Owner">Experienced Owner</option>
                <option value="Multi-Pet Household">Multi-Pet Household</option>
              </select>

              <label className="field-label" style={{ marginTop: "8px", display: "block" }}>Adoption Note:</label>
              <textarea
                placeholder="Tell us about your daily routine and family..."
                value={applyForm.notes}
                onChange={(e) => setApplyForm({ ...applyForm, notes: e.target.value })}
                rows={2}
                required
              />
              <button type="submit" className="submit-btn" style={{ width: "100%" }}>
                Submit Adoption Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}