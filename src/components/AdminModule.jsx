import React, { useState, useRef } from "react";
import {
  PlusCircle,
  Trash2,
  CheckCircle,
  XCircle,
  BarChart3,
  Download,
  Upload,
  Award,
  Edit3,
  AlertTriangle,
  MessageSquare,
  Users
} from "lucide-react";

const AdminModule = ({
  dogs,
  setDogs,
  requests,
  setRequests,
  adoptedHistory,
  setAdoptedHistory,
  strayReports,
  setStrayReports,
  messages,
  setMessages,
  usersList,
  showToast
}) => {
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [ageGroup, setAgeGroup] = useState("Young");
  const [size, setSize] = useState("Medium");
  const [traitsInput, setTraitsInput] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");
  const [image, setImage] = useState("");
  const [sire, setSire] = useState("");
  const [dam, setDam] = useState("");

  const [editingDog, setEditingDog] = useState(null);
  const [remarks, setRemarks] = useState({});
  const [replyDrafts, setReplyDrafts] = useState({});
  const [certificateData, setCertificateData] = useState(null);

  const fileInputRef = useRef(null);

  const [maxCapacity, setMaxCapacity] = useState(() => {
    return Number(localStorage.getItem("rescue_kennel_capacity_v18")) || 20;
  });

  const handleCapacityChange = (delta) => {
    const next = Math.max(dogs.length, Math.min(50, maxCapacity + delta));
    setMaxCapacity(next);
    localStorage.setItem("rescue_kennel_capacity_v18", String(next));
    showToast(`Kennel capacity updated to ${next} slots.`);
  };

  const capacityPercent = Math.min(Math.round((dogs.length / maxCapacity) * 100), 100);

  const handleAddDog = (e) => {
    e.preventDefault();
    if (!name.trim() || !breed.trim() || !age.trim()) return;

    const newDog = {
      id: Date.now(),
      name: name.trim(),
      breed: breed.trim(),
      age: age.trim(),
      ageGroup,
      size,
      traits: traitsInput
        ? traitsInput.split(",").map((t) => t.trim()).filter(Boolean)
        : ["Friendly", "Healthy"],
      status: "Available",
      image:
        image.trim() ||
        "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
      sire: sire.trim() || "Verified Shelter Lineage",
      dam: dam.trim() || "Verified Shelter Lineage",
      vaccines: ["Rabies (Up to date)", "DHPP Core Vaccine", "Dewormed"],
      medicalNotes: medicalNotes.trim() || "Cleared by shelter veterinarian."
    };

    setDogs((prev) => [...prev, newDog]);
    setName("");
    setBreed("");
    setAge("");
    setAgeGroup("Young");
    setSize("Medium");
    setTraitsInput("");
    setMedicalNotes("");
    setImage("");
    setSire("");
    setDam("");
    showToast(`${newDog.name} added to shelter catalog!`);
  };

  const handleSaveEditDog = (e) => {
    e.preventDefault();
    if (!editingDog) return;
    setDogs((prev) =>
      prev.map((d) => (d.id === editingDog.id ? editingDog : d))
    );
    showToast(`Updated listing for ${editingDog.name}.`);
    setEditingDog(null);
  };

  const handleDeleteDog = (id, dogName) => {
    setDogs((prev) => prev.filter((d) => d.id !== id));
    showToast(`${dogName} removed from active listings.`);
  };

  const handleRequestStageChange = (req, newStage) => {
    const adminRemark = remarks[req.id] || req.adminRemark || "";

    if (newStage === "Approved") {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === req.id
            ? { ...r, status: "Approved", stage: "Approved", adminRemark }
            : r
        )
      );

      const dogObj = dogs.find((d) => d.id === req.dogId);
      setDogs((prev) => prev.filter((d) => d.id !== req.dogId));

      const historyEntry = {
        id: Date.now(),
        dogId: req.dogId,
        dogName: req.dogName,
        dogBreed: dogObj?.breed || "Rescue Dog",
        adopterName: req.applicantName,
        adopterUsername: req.username,
        adopterEmail: req.email || "",
        adopterPhone: req.phone || "",
        adoptedDate: new Date().toLocaleDateString()
      };
      setAdoptedHistory((prev) => [historyEntry, ...prev]);
      showToast(`Adoption approved! ${req.dogName} placed with ${req.applicantName}.`);
    } else if (newStage === "Rejected") {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === req.id
            ? { ...r, status: "Rejected", stage: "Rejected", adminRemark }
            : r
        )
      );
      showToast(`Request for ${req.dogName} marked Rejected.`);
    } else {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === req.id
            ? { ...r, status: newStage, stage: newStage, adminRemark }
            : r
        )
      );
      showToast(`Updated ${req.applicantName}'s stage to ${newStage}.`);
    }
  };

  const handleStrayStatus = (id, status) => {
    setStrayReports((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
    showToast(`Stray rescue alert updated to "${status}".`);
  };

  const handleSendReply = (msgId) => {
    const replyText = replyDrafts[msgId];
    if (!replyText || !replyText.trim()) return;
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? { ...m, reply: replyText.trim(), repliedAt: new Date().toLocaleDateString() }
          : m
      )
    );
    setReplyDrafts((prev) => ({ ...prev, [msgId]: "" }));
    showToast("Reply sent to adopter!");
  };

  const handleBackupJSON = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      maxCapacity,
      dogs,
      requests,
      adoptedHistory,
      strayReports,
      messages
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pawfect-shelter-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Shelter JSON backup downloaded!");
  };

  const handleRestoreJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (Array.isArray(data.dogs)) setDogs(data.dogs);
        if (Array.isArray(data.requests)) setRequests(data.requests);
        if (Array.isArray(data.adoptedHistory)) setAdoptedHistory(data.adoptedHistory);
        if (Array.isArray(data.strayReports)) setStrayReports(data.strayReports);
        if (Array.isArray(data.messages)) setMessages(data.messages);
        if (typeof data.maxCapacity === "number") {
          setMaxCapacity(data.maxCapacity);
          localStorage.setItem("rescue_kennel_capacity_v18", String(data.maxCapacity));
        }
        showToast("Shelter state restored from JSON backup!");
      } catch {
        showToast("Invalid JSON backup file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const adoptersOnly = usersList.filter((u) => u.role !== "admin");

  return (
    <div className="admin-grid-layout">
      {/* LEFT SIDEBAR COLUMN */}
      <div className="admin-sidebar-col">
        {/* Kennel Occupancy Card */}
        <div className="admin-card">
          <h3>
            <BarChart3 size={18} color="#ea580c" /> Kennel Occupancy
          </h3>
          <div className="capacity-bar-container">
            <div
              className="capacity-fill"
              style={{ width: `${capacityPercent}%` }}
            />
          </div>
          <div className="capacity-labels">
            <span>
              <strong>{dogs.length}</strong> Housed ({maxCapacity - dogs.length} Free)
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              Max Limit: <strong>{maxCapacity}</strong>
              <button
                type="button"
                onClick={() => handleCapacityChange(-2)}
                style={{
                  padding: "1px 7px",
                  borderRadius: "4px",
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  cursor: "pointer",
                  fontWeight: 700
                }}
                title="Decrease kennel capacity"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => handleCapacityChange(2)}
                style={{
                  padding: "1px 7px",
                  borderRadius: "4px",
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  cursor: "pointer",
                  fontWeight: 700
                }}
                title="Increase kennel capacity"
              >
                +
              </button>
            </span>
          </div>

          <button type="button" className="export-btn" onClick={handleBackupJSON}>
            <Download size={15} /> Backup Shelter Records (JSON)
          </button>

          <button
            type="button"
            className="export-btn"
            style={{ background: "#fff7ed", color: "#ea580c", borderColor: "#fed7aa" }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={15} /> Restore / Import JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={handleRestoreJSON}
          />
        </div>

        {/* Publish New Dog Card */}
        <div className="admin-card">
          <h3>
            <PlusCircle size={18} color="#ea580c" /> Publish New Dog
          </h3>
          <form className="admin-form" onSubmit={handleAddDog}>
            <input
              type="text"
              placeholder="Dog Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Breed *"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Age (e.g. 2 Years) *"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />

            <div className="two-col-inputs">
              <select
                className="breed-dropdown"
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
              >
                <option value="Young">Young</option>
                <option value="Puppy">Puppy</option>
                <option value="Adult">Adult</option>
              </select>

              <select
                className="breed-dropdown"
                value={size}
                onChange={(e) => setSize(e.target.value)}
              >
                <option value="Medium">Medium</option>
                <option value="Small">Small</option>
                <option value="Large">Large</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="Good with Kids, Friendly"
              value={traitsInput}
              onChange={(e) => setTraitsInput(e.target.value)}
            />
            <input
              type="text"
              placeholder="Medical / Vet Notes"
              value={medicalNotes}
              onChange={(e) => setMedicalNotes(e.target.value)}
            />
            <input
              type="text"
              placeholder="Image URL"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />

            {image.trim() && (
              <img
                src={image}
                alt="Preview"
                className="preview-banner-img"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}

            <input
              type="text"
              placeholder="Sire (Father)"
              value={sire}
              onChange={(e) => setSire(e.target.value)}
            />
            <input
              type="text"
              placeholder="Dam (Mother)"
              value={dam}
              onChange={(e) => setDam(e.target.value)}
            />

            <button type="submit" className="submit-btn">
              Publish Listing
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT MAIN DATA COLUMN */}
      <div className="admin-data-col">
        {/* Adopter Adoption Requests */}
        <div className="admin-card">
          <h3>Adopter Adoption Requests ({requests.length})</h3>
          {requests.length === 0 ? (
            <p className="empty-state">No adoption requests submitted yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dog</th>
                  <th>Adopter Details</th>
                  <th>Stage</th>
                  <th>Admin Remark</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <strong>{req.dogName}</strong>
                      {req.matchScore && (
                        <div style={{ fontSize: "0.76rem", color: "#059669", fontWeight: 700 }}>
                          {req.matchScore}% AI Match
                        </div>
                      )}
                    </td>
                    <td>
                      <strong>{req.applicantName}</strong>
                      <div style={{ fontSize: "0.78rem", color: "#6b7280" }}>
                        {req.phone || "No phone"} • {req.homeType || "Home"}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#4b5563" }}>
                        "{req.reason}"
                      </div>
                    </td>
                    <td>
                      <select
                        className="stage-select"
                        value={req.stage || req.status || "Submitted"}
                        onChange={(e) => handleRequestStageChange(req, e.target.value)}
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Meet & Greet">Meet & Greet</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="admin-remark-input"
                        placeholder="Add note..."
                        value={remarks[req.id] ?? req.adminRemark ?? ""}
                        onChange={(e) =>
                          setRemarks((prev) => ({ ...prev, [req.id]: e.target.value }))
                        }
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="action-icon-btn approve"
                        title="Approve Adoption"
                        onClick={() => handleRequestStageChange(req, "Approved")}
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        type="button"
                        className="action-icon-btn reject"
                        title="Reject Request"
                        onClick={() => handleRequestStageChange(req, "Rejected")}
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

        {/* Adoption History */}
        <div className="admin-card">
          <h3>
            <Award size={18} color="#ea580c" /> Adoption History — Who Adopted ({adoptedHistory.length})
          </h3>
          {adoptedHistory.length === 0 ? (
            <p className="empty-state">Approved adoptions will automatically archive here.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dog</th>
                  <th>Adopter</th>
                  <th>Date</th>
                  <th>Certificate</th>
                </tr>
              </thead>
              <tbody>
                {adoptedHistory.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.dogName}</strong> ({item.dogBreed})
                    </td>
                    <td>
                      <strong>{item.adopterName}</strong>
                      <div style={{ fontSize: "0.78rem", color: "#6b7280" }}>
                        {item.adopterEmail} {item.adopterPhone ? `• ${item.adopterPhone}` : ""}
                      </div>
                    </td>
                    <td>{item.adoptedDate}</td>
                    <td>
                      <button
                        type="button"
                        className="cert-btn"
                        onClick={() => setCertificateData(item)}
                      >
                        <Award size={14} /> Certificate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Stray Rescue Reports */}
        <div className="admin-card">
          <h3>
            <AlertTriangle size={18} color="#ea580c" /> Stray Rescue Reports ({strayReports.length})
          </h3>
          {strayReports.length === 0 ? (
            <p className="empty-state">No stray rescue alerts reported yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Location & Urgency</th>
                  <th>Reporter</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {strayReports.map((rep) => (
                  <tr key={rep.id}>
                    <td>
                      <strong>{rep.location}</strong> ({rep.urgency})
                      <div style={{ fontSize: "0.78rem", color: "#6b7280" }}>
                        {rep.description}
                      </div>
                    </td>
                    <td>{rep.reporterName}</td>
                    <td>
                      <select
                        className="stage-select"
                        value={rep.status}
                        onChange={(e) => handleStrayStatus(rep.id, e.target.value)}
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

        {/* User Inquiries */}
        <div className="admin-card">
          <h3>
            <MessageSquare size={18} color="#ea580c" /> User Inquiries ({messages.length})
          </h3>
          {messages.length === 0 ? (
            <p className="empty-state">No questions received yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>Subject & Message</th>
                  <th>Reply</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <strong>{m.senderName || m.username}</strong>
                    </td>
                    <td>
                      <strong>{m.subject}</strong>
                      <div style={{ fontSize: "0.82rem", color: "#4b5563" }}>{m.message}</div>
                      {m.reply && (
                        <div className="reply-bubble">
                          <strong>Shelter Reply:</strong> {m.reply}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <input
                          type="text"
                          className="admin-remark-input"
                          placeholder="Write reply..."
                          value={replyDrafts[m.id] || ""}
                          onChange={(e) =>
                            setReplyDrafts((prev) => ({ ...prev, [m.id]: e.target.value }))
                          }
                        />
                        <button
                          type="button"
                          className="cert-btn"
                          onClick={() => handleSendReply(m.id)}
                        >
                          Send
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Active Listings */}
        <div className="admin-card">
          <h3>Active Listings ({dogs.length})</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name & Specs</th>
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
                      {dog.breed} • {dog.age} • {dog.size}
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${(dog.status || "Available").toLowerCase()}`}>
                      {dog.status || "Available"}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="action-icon-btn"
                      style={{ color: "#2563eb" }}
                      title="Edit Listing"
                      onClick={() => setEditingDog({ ...dog })}
                    >
                      <Edit3 size={17} />
                    </button>
                    <button
                      type="button"
                      className="action-icon-btn delete"
                      title="Delete Listing"
                      onClick={() => handleDeleteDog(dog.id, dog.name)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Registered Adopters Directory */}
        <div className="admin-card">
          <h3>
            <Users size={18} color="#ea580c" /> Registered Adopters Directory ({adoptersOnly.length})
          </h3>
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
              {adoptersOnly.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.name || "—"}</strong>
                  </td>
                  <td>
                    {u.username} ({u.email})
                  </td>
                  <td>{u.phone || "Not provided"}</td>
                  <td>{u.homeType || "Not specified"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Dog Modal */}
      {editingDog && (
        <div className="modal-overlay" onClick={() => setEditingDog(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h3>Edit Dog Listing — {editingDog.name}</h3>
              <button className="close-x" onClick={() => setEditingDog(null)}>
                ×
              </button>
            </div>
            <form className="admin-form" onSubmit={handleSaveEditDog}>
              <input
                type="text"
                value={editingDog.name}
                onChange={(e) => setEditingDog({ ...editingDog, name: e.target.value })}
                placeholder="Dog Name"
                required
              />
              <input
                type="text"
                value={editingDog.breed}
                onChange={(e) => setEditingDog({ ...editingDog, breed: e.target.value })}
                placeholder="Breed"
                required
              />
              <div className="two-col-inputs">
                <input
                  type="text"
                  value={editingDog.age}
                  onChange={(e) => setEditingDog({ ...editingDog, age: e.target.value })}
                  placeholder="Age"
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
              </div>
              <input
                type="text"
                value={editingDog.medicalNotes || ""}
                onChange={(e) =>
                  setEditingDog({ ...editingDog, medicalNotes: e.target.value })
                }
                placeholder="Medical / Vet Notes"
              />
              <input
                type="text"
                value={editingDog.image}
                onChange={(e) => setEditingDog({ ...editingDog, image: e.target.value })}
                placeholder="Image URL"
              />
              <button type="submit" className="submit-btn">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Official Adoption Certificate Modal */}
      {certificateData && (
        <div className="modal-overlay" onClick={() => setCertificateData(null)}>
          <div
            className="modal-content certificate-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-top">
              <h3>Official Adoption Certificate</h3>
              <button className="close-x" onClick={() => setCertificateData(null)}>
                ×
              </button>
            </div>
            <div className="cert-border">
              <div className="cert-eyebrow">PAWFECT HOME ANIMAL SHELTER</div>
              <h2 className="cert-title">Certificate of Adoption</h2>
              <p className="cert-sub">This proudly certifies that</p>
              <div className="cert-adopter">{certificateData.adopterName}</div>
              <p className="cert-sub">has officially welcomed into their forever home</p>
              <div className="cert-dog">
                {certificateData.dogName} ({certificateData.dogBreed})
              </div>
              <p className="cert-date">Adopted on {certificateData.adoptedDate}</p>
            </div>
            <div style={{ marginTop: "16px", textAlign: "right" }}>
              <button
                type="button"
                className="submit-btn"
                onClick={() => window.print()}
              >
                Print / Save as PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminModule;