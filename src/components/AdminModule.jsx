import React, { useState, useRef } from "react";
import {
  PlusCircle, Trash2, CheckCircle, XCircle, MessageSquare,
  Download, Upload, BarChart2, Edit3, Award, Users, AlertTriangle, Printer
} from "lucide-react";

export default function AdminModule({
  dogs,
  onAddDog,
  onEditDog,
  onDeleteDog,
  applications,
  onUpdateAppStatus,
  messages = [],
  onReplyMessage,
  rescueReports = [],
  onUpdateRescueStatus,
  adoptionHistory = [],
  registeredUsers = [],
  onRestoreBackup
}) {
  const [newDog, setNewDog] = useState({
    name: "",
    breed: "",
    age: "",
    ageGroup: "Young",
    size: "Medium",
    traits: "Good with Kids, Friendly",
    vetNotes: "",
    image: "",
    father: "",
    mother: "",
    microchip: "",
    vaccines: "Rabies, DHPP"
  });

  const [editingDog, setEditingDog] = useState(null);
  const [decisionNotes, setDecisionNotes] = useState({});
  const [replyNotes, setReplyNotes] = useState({});
  const [certificateRecord, setCertificateRecord] = useState(null);
  const fileInputRef = useRef(null);

  const handleDecision = (appId, status) => {
    const remark =
      decisionNotes[appId] ||
      (status === "Approved"
        ? "Home check verified & adoption approved!"
        : status === "Meet & Greet"
        ? "Scheduled for shelter meet & greet"
        : status === "Under Review"
        ? "Application under vet & coordinator review"
        : "Requirements not met");
    onUpdateAppStatus(appId, status, remark);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newDog.name || !newDog.breed) return;

    const dogObj = {
      ...newDog,
      id: Date.now().toString(),
      status: "Available",
      traits: newDog.traits.split(",").map((t) => t.trim()).filter(Boolean),
      image:
        newDog.image ||
        "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80",
      vaccines: newDog.vaccines.split(",").map((v) => v.trim()).filter(Boolean)
    };

    onAddDog(dogObj);
    setNewDog({
      name: "",
      breed: "",
      age: "",
      ageGroup: "Young",
      size: "Medium",
      traits: "Good with Kids, Friendly",
      vetNotes: "",
      image: "",
      father: "",
      mother: "",
      microchip: "",
      vaccines: "Rabies, DHPP"
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingDog) return;
    onEditDog(editingDog);
    setEditingDog(null);
  };

  // Export Full Shelter Backup
  const exportData = () => {
    const payload = {
      dogs,
      applications,
      messages,
      rescueReports,
      adoptionHistory,
      registeredUsers
    };
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "pawfect_home_full_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Two-Way Restore / Import JSON
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        onRestoreBackup(parsed);
      } catch {
        alert("Invalid JSON backup file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const maxCapacity = 10;
  const capacityPercent = Math.min(Math.round((dogs.length / maxCapacity) * 100), 100);
  const adoptersList = registeredUsers.filter((u) => u.role !== "admin");

  return (
    <div className="admin-grid-layout">
      {/* LEFT SIDEBAR: Kennel Occupancy, Backup/Restore & Publish New Dog */}
      <div className="admin-sidebar-col">
        <div className="admin-card">
          <h3><BarChart2 size={18} /> Kennel Occupancy</h3>
          <div className="capacity-bar-container">
            <div className="capacity-fill" style={{ width: `${capacityPercent}%` }}></div>
          </div>
          <div className="capacity-labels">
            <span><strong>{dogs.length}</strong> Dogs Housed</span>
            <span>Max Limit: {maxCapacity}</span>
          </div>

          <button onClick={exportData} className="export-btn">
            <Download size={14} /> Backup Shelter Records (JSON)
          </button>

          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImportFile}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="export-btn"
            style={{ background: "#fff7ed", borderColor: "#fdba74", color: "#c2410c" }}
          >
            <Upload size={14} /> Restore / Import JSON
          </button>
        </div>

        {/* Publish New Dog Form with Live Preview & Vet Notes */}
        <div className="admin-card">
          <h3><PlusCircle size={20} /> Publish New Dog</h3>
          <form onSubmit={handleCreate} className="admin-form">
            <input
              type="text"
              placeholder="Dog Name *"
              value={newDog.name}
              onChange={(e) => setNewDog({ ...newDog, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Breed *"
              value={newDog.breed}
              onChange={(e) => setNewDog({ ...newDog, breed: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Age (e.g. 2 Years) *"
              value={newDog.age}
              onChange={(e) => setNewDog({ ...newDog, age: e.target.value })}
              required
            />

            <div className="two-col-inputs">
              <select
                className="breed-dropdown"
                value={newDog.ageGroup}
                onChange={(e) => setNewDog({ ...newDog, ageGroup: e.target.value })}
              >
                <option value="Puppy">Puppy</option>
                <option value="Young">Young</option>
                <option value="Adult">Adult</option>
              </select>
              <select
                className="breed-dropdown"
                value={newDog.size}
                onChange={(e) => setNewDog({ ...newDog, size: e.target.value })}
              >
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="Traits (comma separated)"
              value={newDog.traits}
              onChange={(e) => setNewDog({ ...newDog, traits: e.target.value })}
            />
            <input
              type="text"
              placeholder="Medical / Vet Notes"
              value={newDog.vetNotes}
              onChange={(e) => setNewDog({ ...newDog, vetNotes: e.target.value })}
            />
            <input
              type="text"
              placeholder="Image URL"
              value={newDog.image}
              onChange={(e) => setNewDog({ ...newDog, image: e.target.value })}
            />
            {newDog.image && (
              <img src={newDog.image} alt="Live preview" className="preview-banner-img" />
            )}
            <input
              type="text"
              placeholder="Sire (Father)"
              value={newDog.father}
              onChange={(e) => setNewDog({ ...newDog, father: e.target.value })}
            />
            <input
              type="text"
              placeholder="Dam (Mother)"
              value={newDog.mother}
              onChange={(e) => setNewDog({ ...newDog, mother: e.target.value })}
            />
            <button type="submit" className="submit-btn">
              Publish Listing
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT MAIN AREA */}
      <div className="admin-data-col">
        {/* 1. ADOPTION REQUESTS QUEUE WITH VETTING DETAILS & MULTI-STAGE WORKFLOW */}
        <div className="admin-card">
          <h3>Adopter Adoption Requests ({applications.length})</h3>
          {applications.length === 0 ? (
            <p className="empty-state">No adoption requests submitted yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dog &amp; Match</th>
                  <th>Adopter Vetting Info</th>
                  <th>Stage</th>
                  <th>Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.appId}>
                    <td>
                      <strong>{app.dogName}</strong>
                      <div style={{ fontSize: "0.76rem", color: "#6b7280" }}>{app.appId}</div>
                      {app.matchScore && (
                        <span className="badge badge-approved" style={{ display: "inline-block", marginTop: "4px" }}>
                          {app.matchScore}% AI Match
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: "0.82rem" }}>
                      <strong>{app.userName}</strong>
                      <div>{app.phone || "No phone"} • {app.userEmail}</div>
                      <div style={{ color: "#6b7280" }}>{app.homeType} • {app.experience}</div>
                    </td>
                    <td>
                      <select
                        className="stage-select"
                        value={app.status === "Pending" ? "Submitted" : app.status}
                        onChange={(e) => handleDecision(app.appId, e.target.value)}
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Meet & Greet">Meet &amp; Greet</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="Decision remark..."
                        className="admin-remark-input"
                        value={decisionNotes[app.appId] ?? app.adminRemarks ?? ""}
                        onChange={(e) => setDecisionNotes({ ...decisionNotes, [app.appId]: e.target.value })}
                      />
                    </td>
                    <td>
                      <button
                        className="action-icon-btn approve"
                        onClick={() => handleDecision(app.appId, "Approved")}
                        title="Approve & Archive"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        className="action-icon-btn reject"
                        onClick={() => handleDecision(app.appId, "Rejected")}
                        title="Reject"
                      >
                        <XCircle size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 2. ADOPTION HISTORY ('WHO ADOPTED' LOG) + PRINTABLE CERTIFICATES */}
        <div className="admin-card">
          <h3><Award size={18} /> Adoption History — Who Adopted ({adoptionHistory.length})</h3>
          {adoptionHistory.length === 0 ? (
            <p className="empty-state">Approved adoptions will automatically archive here.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dog</th>
                  <th>Adopted By</th>
                  <th>Contact</th>
                  <th>Date</th>
                  <th>Certificate</th>
                </tr>
              </thead>
              <tbody>
                {adoptionHistory.map((rec) => (
                  <tr key={rec.id}>
                    <td><strong>{rec.dogName}</strong> ({rec.breed})</td>
                    <td>{rec.adopterName}</td>
                    <td>{rec.adopterPhone}</td>
                    <td>{rec.adoptedDate}</td>
                    <td>
                      <button
                        className="cert-btn"
                        onClick={() => setCertificateRecord(rec)}
                      >
                        <Printer size={14} /> Certificate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 3. STRAY RESCUE REPORTS BOARD */}
        <div className="admin-card">
          <h3><AlertTriangle size={18} /> Stray Rescue Reports ({rescueReports.length})</h3>
          {rescueReports.length === 0 ? (
            <p className="empty-state">No stray rescue alerts reported yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Location &amp; Notes</th>
                  <th>Urgency</th>
                  <th>Reported By</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rescueReports.map((rep) => (
                  <tr key={rep.id}>
                    <td><img src={rep.photoUrl} alt="Stray" className="table-thumb" /></td>
                    <td>
                      <strong>{rep.location}</strong>
                      <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>{rep.description}</div>
                    </td>
                    <td><span className="badge badge-pending">{rep.urgency}</span></td>
                    <td>{rep.reporterName}</td>
                    <td>
                      <select
                        className="stage-select"
                        value={rep.status}
                        onChange={(e) => onUpdateRescueStatus(rep.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Rescued">Rescued</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 4. USER INQUIRIES WITH INTERACTIVE REPLY */}
        <div className="admin-card">
          <h3><MessageSquare size={18} /> User Inquiries ({messages.length})</h3>
          {messages.length === 0 ? (
            <p className="empty-state">No questions received yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Adopter</th>
                  <th>Subject &amp; Question</th>
                  <th>Shelter Reply</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr key={m.id}>
                    <td><strong>{m.userName}</strong><div style={{ fontSize: "0.76rem" }}>{m.date}</div></td>
                    <td>
                      <strong>{m.subject}:</strong> {m.message}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <input
                          type="text"
                          className="admin-remark-input"
                          placeholder="Write reply..."
                          value={replyNotes[m.id] ?? m.adminReply ?? ""}
                          onChange={(e) => setReplyNotes({ ...replyNotes, [m.id]: e.target.value })}
                        />
                        <button
                          className="cert-btn"
                          onClick={() => onReplyMessage(m.id, replyNotes[m.id] || "")}
                        >
                          Reply
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 5. ACTIVE LISTINGS WITH IN-PLACE EDIT & STATUS BADGES */}
        <div className="admin-card">
          <h3>Active Listings ({dogs.length})</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name &amp; Specs</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dogs.map((dog) => (
                <tr key={dog.id}>
                  <td>
                    <img src={dog.image} alt={dog.name} className="table-thumb" />
                  </td>
                  <td>
                    <strong>{dog.name}</strong>
                    <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                      {dog.breed} • {dog.age} • {dog.size || "Medium"}
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${(dog.status || "Available").toLowerCase()}`}>
                      {dog.status || "Available"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="action-icon-btn"
                      style={{ color: "#2563eb" }}
                      onClick={() => setEditingDog({ ...dog })}
                      title="Edit dog"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="action-icon-btn delete"
                      onClick={() => onDeleteDog(dog.id)}
                      title="Delete dog"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 6. REGISTERED ADOPTERS DIRECTORY */}
        <div className="admin-card">
          <h3><Users size={18} /> Registered Adopters Directory ({adoptersList.length})</h3>
          {adoptersList.length === 0 ? (
            <p className="empty-state">No registered adopters yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username / Email</th>
                  <th>Phone</th>
                  <th>Home Type</th>
                </tr>
              </thead>
              <tbody>
                {adoptersList.map((u) => (
                  <tr key={u.userId}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.userId} ({u.email || "N/A"})</td>
                    <td>{u.phone || "Not provided"}</td>
                    <td>{u.homeType || "Not specified"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* EDIT DOG MODAL */}
      {editingDog && (
        <div className="modal-overlay" onClick={() => setEditingDog(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h2>Edit Listing — {editingDog.name}</h2>
              <button className="close-x" onClick={() => setEditingDog(null)}>&times;</button>
            </div>
            <form onSubmit={handleSaveEdit} className="admin-form">
              <input
                type="text"
                value={editingDog.name}
                onChange={(e) => setEditingDog({ ...editingDog, name: e.target.value })}
                required
              />
              <input
                type="text"
                value={editingDog.breed}
                onChange={(e) => setEditingDog({ ...editingDog, breed: e.target.value })}
                required
              />
              <input
                type="text"
                value={editingDog.age}
                onChange={(e) => setEditingDog({ ...editingDog, age: e.target.value })}
                required
              />
              <select
                className="breed-dropdown"
                value={editingDog.status || "Available"}
                onChange={(e) => setEditingDog({ ...editingDog, status: e.target.value })}
              >
                <option value="Available">Available</option>
                <option value="Pending">Pending</option>
                <option value="Adopted">Adopted</option>
              </select>
              <input
                type="text"
                placeholder="Vet Notes"
                value={editingDog.vetNotes || ""}
                onChange={(e) => setEditingDog({ ...editingDog, vetNotes: e.target.value })}
              />
              <button type="submit" className="submit-btn">Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE ADOPTION CERTIFICATE MODAL */}
      {certificateRecord && (
        <div className="modal-overlay" onClick={() => setCertificateRecord(null)}>
          <div className="modal-content certificate-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="cert-border">
              <p className="cert-eyebrow">PAWFECT HOME ANIMAL SHELTER &amp; RESCUE</p>
              <h2 className="cert-title">Official Certificate of Adoption</h2>
              <p className="cert-sub">This proudly certifies that</p>
              <h3 className="cert-adopter">{certificateRecord.adopterName}</h3>
              <p className="cert-sub">has officially adopted and provided a forever home to</p>
              <h3 className="cert-dog">{certificateRecord.dogName} ({certificateRecord.breed})</h3>
              <p className="cert-date">Adopted on {certificateRecord.adoptedDate} • Record ID: {certificateRecord.id}</p>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "18px", justifyContent: "flex-end" }}>
              <button className="submit-btn" onClick={() => window.print()}>
                <Printer size={16} /> Print / Save PDF
              </button>
              <button className="logout-btn" onClick={() => setCertificateRecord(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}