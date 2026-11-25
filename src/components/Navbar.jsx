import React from "react";
import { Dog, LogOut, ShieldCheck, User, AlertTriangle, MessageSquare } from "lucide-react";

export default function Navbar({ currentUser, onLogout, currentView, setView, favCount, msgCount }) {
  return (
    <header className="navbar">
      <div className="nav-brand" onClick={() => setView("catalog")}>
        <Dog size={28} className="brand-icon" />
        <h2>Pawfect Home</h2>
      </div>

      <nav className="nav-actions">
        {currentUser.role === "admin" ? (
          <div className="admin-pill">
            <ShieldCheck size={16} /> Admin Mode
          </div>
        ) : (
          <>
            <button
              className={`nav-btn ${currentView === "catalog" ? "active" : ""}`}
              onClick={() => setView("catalog")}
            >
              Available Dogs
            </button>
            <button
              className={`nav-btn ${currentView === "favorites" ? "active" : ""}`}
              onClick={() => setView("favorites")}
            >
              Saved ({favCount})
            </button>
            <button
              className={`nav-btn ${currentView === "applications" ? "active" : ""}`}
              onClick={() => setView("applications")}
            >
              My Requests
            </button>
            <button
              className={`nav-btn ${currentView === "rescue" ? "active" : ""}`}
              onClick={() => setView("rescue")}
            >
              <AlertTriangle size={14} style={{ verticalAlign: "-2px", marginRight: "4px" }} />
              Report a Rescue
            </button>
            <button
              className={`nav-btn ${currentView === "messages" ? "active" : ""}`}
              onClick={() => setView("messages")}
            >
              <MessageSquare size={14} style={{ verticalAlign: "-2px", marginRight: "4px" }} />
              My Messages {msgCount > 0 && <span className="nav-dot">{msgCount}</span>}
            </button>
          </>
        )}

        <div
          className={`user-profile-badge ${currentUser.role !== "admin" ? "clickable" : ""}`}
          onClick={() => currentUser.role !== "admin" && setView("profile")}
          title={currentUser.role !== "admin" ? "Edit Adopter Profile & Auto-Fill" : "Admin"}
        >
          <User size={16} />
          <span>{currentUser.name}</span>
        </div>

        <button className="logout-btn" onClick={onLogout} title="Log out">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </nav>
    </header>
  );
}