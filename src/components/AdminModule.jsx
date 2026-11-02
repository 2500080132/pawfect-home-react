import React, { useState } from "react";
import { PlusCircle, Trash2, CheckCircle, XCircle, MessageSquare, Download, BarChart2 } from "lucide-react";

export default function AdminModule({
  dogs,
  onAddDog,
  onDeleteDog,
  applications,
  onUpdateAppStatus,
  messages = []
}) {
  const [newDog, setNewDog] = useState({
    id: "",
    name: "",
    breed: "",
    age: "",
    image: "",
    father: "",
    mother: "",
    microchip: "",
    vaccines: "Rabies, DHPP"
  });

  const [decisionNotes, setDecisionNotes] = useState({});

  const handleDecision = (appId, status) => {
    const remark = decisionNotes[appId] || (status === "Approved" ? "Home check verified and approved" : "Requirements not met");
    onUpdateAppStatus(appId, status, remark);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newDog.name || !newDog.breed) return;

    const dogObj = {
      ...newDog,
      id: newDog.id || Date.now().toString(),
      image:
        newDog.image ||
        "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80",
      vaccines: newDog.vaccines.split(",").map((v) => v.trim())
    };

    onAddDog(dogObj);
    alert(`Published listing for ${dogObj.name}!`);
    setNewDog({
      id: "",
      name: "",
      breed: "",
      age: "",
      image: "",
      father: "",
      mother: "",
      microchip: "",
      vaccines: "Rabies, DHPP"
    });
  };

  // Export Data to JSON/File
  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ dogs, applications, messages }, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "pawfect_home_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const maxCapacity = 10;
  const capacityPercent = Math.min(Math.round((dogs.length / maxCapacity) * 100), 100);

  return (
    <div className="admin-grid-layout">
      {/* Left Column: Shelter Capacity + Add Dog */}
      <div className="admin-sidebar-col">
        {/* STANDOUT FEATURE 2: Shelter Kennel Capacity Meter */}
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
            <Download size={14} /> Backup Shelter Records
          </button>
        </div>

        {/* Add Dog Form */}
        <div className="admin-card">
          <h3><PlusCircle size={20} /> Publish New Dog</h3>
          <form onSubmit={handleCreate} className="admin-form">
            <input
              type="text"
              placeholder="Dog Name"
              value={newDog.name}
              onChange={(e) => setNewDog({ ...newDog, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Breed"
              value={newDog.breed}
              onChange={(e) => setNewDog({ ...newDog, breed: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Age (e.g. 2 Years)"
              value={newDog.age}
              onChange={(e) => setNewDog({ ...newDog, age: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Image URL"
              value={newDog.image}
              onChange={(e) => setNewDog({ ...newDog, image: e.target.value })}
            />
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
              Save Listing
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Applications, Inquiries & Dogs */}
      <div className="admin-data-col">
        {/* Adoption Applications Table with Admin Remarks */}
        <div className="admin-card">
          <h3>Customer Adoption Requests ({applications.length})</h3>
          {applications.length === 0 ? (
            <p className="empty-state">No customer requests submitted yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>App ID</th>
                  <th>Customer</th>
                  <th>Dog</th>
                  <th>Status</th>
                  <th>Admin Remarks</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.appId}>
                    <td>{app.appId}</td>
                    <td>{app.userName}</td>
                    <td><strong>{app.dogName}</strong></td>
                    <td>
                      <span className={`badge badge-${app.status.toLowerCase()}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="Add decision remark..."
                        className="admin-remark-input"
                        value={decisionNotes[app.appId] ?? app.adminRemarks ?? ""}
                        onChange={(e) => setDecisionNotes({ ...decisionNotes, [app.appId]: e.target.value })}
                      />
                    </td>
                    <td>
                      <button
                        className="action-icon-btn approve"
                        onClick={() => handleDecision(app.appId, "Approved")}
                        title="Approve"
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

        {/* Customer Inquiries Table */}
        <div className="admin-card">
          <h3><MessageSquare size={18} /> User Inquiries ({messages.length})</h3>
          {messages.length === 0 ? (
            <p className="empty-state">No questions received yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr key={m.id}>
                    <td>{m.userName}</td>
                    <td><strong>{m.subject}</strong></td>
                    <td>{m.message}</td>
                    <td>{m.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Existing Dogs Table */}
        <div className="admin-card">
          <h3>Active Listings ({dogs.length})</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Breed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dogs.map((dog) => (
                <tr key={dog.id}>
                  <td>
                    <img src={dog.image} alt={dog.name} className="table-thumb" />
                  </td>
                  <td>{dog.name}</td>
                  <td>{dog.breed}</td>
                  <td>
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
      </div>
    </div>
  );
}