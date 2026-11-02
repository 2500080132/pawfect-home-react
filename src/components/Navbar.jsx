import React from "react";
import { Dog, LogOut, ShieldCheck, User } from "lucide-react";

export default function Navbar({ currentUser, onLogout, currentView, setView, favCount }) {
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
          </>
        )}

        <div className="user-profile-badge">
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