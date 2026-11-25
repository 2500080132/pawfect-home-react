import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";
import UserModule from "./components/UserModule";
import AdminModule from "./components/AdminModule";
import "./App.css";

const DEFAULT_DOGS = [
  {
    id: "101",
    name: "Buddy",
    breed: "Golden Retriever",
    age: "2 Years",
    ageGroup: "Adult",
    size: "Large",
    traits: ["Good with Kids", "Friendly"],
    status: "Available",
    vetNotes: "Annual booster complete; hip score normal.",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80",
    father: "Max (Champion Golden)",
    mother: "Bella (Retriever Line)",
    microchip: "CHIP-9901",
    vaccines: ["Rabies", "DHPP", "Bordetella"]
  },
  {
    id: "102",
    name: "Rocky",
    breed: "Welsh Corgi",
    age: "1.5 Years",
    ageGroup: "Young",
    size: "Small",
    traits: ["Apartment Friendly", "Playful"],
    status: "Available",
    vetNotes: "Dental check cleared; ideal indoor weight.",
    image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=80",
    father: "Winston",
    mother: "Daisy",
    microchip: "CHIP-9902",
    vaccines: ["Rabies", "DHPP"]
  },
  {
    id: "103",
    name: "Luna",
    breed: "German Shepherd",
    age: "3 Years",
    ageGroup: "Adult",
    size: "Large",
    traits: ["High Energy", "Loyal Guard"],
    status: "Available",
    vetNotes: "Dewormed & tick-free; thrives on daily runs.",
    image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=600&q=80",
    father: "Rex",
    mother: "Chloe",
    microchip: "CHIP-9903",
    vaccines: ["Rabies", "DHPP", "Lyme"]
  },
  {
    id: "104",
    name: "Milo",
    breed: "Beagle",
    age: "8 Months",
    ageGroup: "Puppy",
    size: "Small",
    traits: ["Good with Kids", "Apartment Friendly"],
    status: "Available",
    vetNotes: "Puppy series complete; gentle temperament.",
    image: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=600&q=80",
    father: "Charlie",
    mother: "Molly",
    microchip: "CHIP-9904",
    vaccines: ["Rabies", "DHPP", "Parvo"]
  },
  {
    id: "105",
    name: "Coco",
    breed: "Labrador Retriever",
    age: "1 Year",
    ageGroup: "Young",
    size: "Medium",
    traits: ["Good with Kids", "High Energy"],
    status: "Available",
    vetNotes: "Spayed & healthy; loves water and fetch.",
    image: "https://images.unsplash.com/photo-1579213838058-8a90b5867820?auto=format&fit=crop&w=600&q=80",
    father: "Bruno",
    mother: "Nala",
    microchip: "CHIP-9905",
    vaccines: ["Rabies", "DHPP", "Bordetella"]
  },
  {
    id: "106",
    name: "Simba",
    breed: "Indian Pariah",
    age: "2.5 Years",
    ageGroup: "Adult",
    size: "Medium",
    traits: ["Apartment Friendly", "Low Maintenance"],
    status: "Available",
    vetNotes: "Highly resilient; vaccinated and microchipped.",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=600&q=80",
    father: "Shelter Rescue",
    mother: "Shelter Rescue",
    microchip: "CHIP-9906",
    vaccines: ["Rabies", "DHPP"]
  }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem("rescue_active_user_v18")) || null;
  });

  const [dogs, setDogs] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("rescue_dogs_v18"));
    return saved && saved.length > 0 ? saved : DEFAULT_DOGS;
  });

  const [applications, setApplications] = useState(() => {
    return JSON.parse(localStorage.getItem("rescue_apps_v18")) || [];
  });

  const [messages, setMessages] = useState(() => {
    return JSON.parse(localStorage.getItem("rescue_messages_v18")) || [];
  });

  const [favorites, setFavorites] = useState(() => {
    return JSON.parse(localStorage.getItem("rescue_favs_v18")) || [];
  });

  const [rescueReports, setRescueReports] = useState(() => {
    return JSON.parse(localStorage.getItem("rescue_reports_v18")) || [];
  });

  const [adoptionHistory, setAdoptionHistory] = useState(() => {
    return JSON.parse(localStorage.getItem("rescue_history_v18")) || [];
  });

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    return JSON.parse(localStorage.getItem("rescue_users_v18")) || [];
  });

  const [currentView, setCurrentView] = useState("catalog");
  const [toast, setToast] = useState(null);

  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    localStorage.setItem("rescue_dogs_v18", JSON.stringify(dogs));
  }, [dogs]);

  useEffect(() => {
    localStorage.setItem("rescue_apps_v18", JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem("rescue_messages_v18", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("rescue_favs_v18", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("rescue_reports_v18", JSON.stringify(rescueReports));
  }, [rescueReports]);

  useEffect(() => {
    localStorage.setItem("rescue_history_v18", JSON.stringify(adoptionHistory));
  }, [adoptionHistory]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setRegisteredUsers(JSON.parse(localStorage.getItem("rescue_users_v18")) || []);
    setCurrentView(user.role === "admin" ? "admin" : "catalog");
    showToast(`Welcome back, ${user.name}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem("rescue_active_user_v18");
    setCurrentUser(null);
  };

  const handleUpdateUserProfile = (updatedFields) => {
    const updatedUser = { ...currentUser, ...updatedFields };
    setCurrentUser(updatedUser);
    localStorage.setItem("rescue_active_user_v18", JSON.stringify(updatedUser));

    const allUsers = JSON.parse(localStorage.getItem("rescue_users_v18")) || [];
    const nextUsers = allUsers.map((u) =>
      u.userId === updatedUser.userId ? updatedUser : u
    );
    localStorage.setItem("rescue_users_v18", JSON.stringify(nextUsers));
    setRegisteredUsers(nextUsers);
    showToast("Adopter profile saved for 1-click auto-fill!");
  };

  const toggleFavorite = (dogId) => {
    setFavorites((prev) =>
      prev.includes(dogId) ? prev.filter((id) => id !== dogId) : [...prev, dogId]
    );
  };

  const handleAddDog = (dog) => {
    setDogs([dog, ...dogs]);
    showToast(`Published listing for ${dog.name}!`);
  };

  const handleEditDog = (updatedDog) => {
    setDogs(dogs.map((d) => (d.id === updatedDog.id ? updatedDog : d)));
    showToast(`Updated ${updatedDog.name}'s profile!`);
  };

  const handleDeleteDog = (dogId) => {
    if (window.confirm("Are you sure you want to remove this dog?")) {
      setDogs(dogs.filter((d) => d.id !== dogId));
      showToast("Listing removed from active kennel.", "info");
    }
  };

  const handleSubmitApplication = (app) => {
    setApplications([app, ...applications]);
    setDogs(
      dogs.map((d) => (d.id === app.dogId ? { ...d, status: "Pending" } : d))
    );
    showToast(`Adoption application submitted for ${app.dogName}!`);
  };

  const handleUpdateAppStatus = (appId, newStatus, remarks) => {
    const targetApp = applications.find((a) => a.appId === appId);
    setApplications(
      applications.map((app) =>
        app.appId === appId
          ? { ...app, status: newStatus, adminRemarks: remarks || app.adminRemarks }
          : app
      )
    );

    if (targetApp && newStatus === "Approved") {
      const adoptedDog = dogs.find((d) => d.id === targetApp.dogId);
      setDogs((prev) => prev.filter((d) => d.id !== targetApp.dogId));

      const alreadyLogged = adoptionHistory.some((h) => h.appId === appId);
      if (!alreadyLogged) {
        const record = {
          id: "HIST-" + Date.now().toString().slice(-5),
          appId: targetApp.appId,
          dogName: targetApp.dogName,
          breed: adoptedDog?.breed || "Rescue Dog",
          image: adoptedDog?.image || "",
          adopterName: targetApp.userName,
          adopterEmail: targetApp.userEmail || targetApp.userId,
          adopterPhone: targetApp.phone || "On File",
          adoptedDate: new Date().toLocaleDateString()
        };
        setAdoptionHistory([record, ...adoptionHistory]);
      }
      showToast(`${targetApp.dogName} approved & archived in Adoption History!`);
    } else {
      showToast(`Application ${appId} updated to ${newStatus}`);
    }
  };

  const handleSendMessage = (msg) => {
    setMessages([msg, ...messages]);
    showToast("Your message was sent to the Shelter Admin!");
  };

  const handleReplyMessage = (msgId, replyText) => {
    setMessages(
      messages.map((m) =>
        m.id === msgId
          ? { ...m, adminReply: replyText, repliedDate: new Date().toLocaleDateString() }
          : m
      )
    );
    showToast("Reply sent to adopter!");
  };

  const handleSubmitRescue = (report) => {
    setRescueReports([report, ...rescueReports]);
    showToast("Stray rescue report dispatched to Shelter Admin!");
  };

  const handleUpdateRescueStatus = (reportId, nextStatus) => {
    setRescueReports(
      rescueReports.map((r) => (r.id === reportId ? { ...r, status: nextStatus } : r))
    );
    showToast(`Rescue report ${reportId} marked as ${nextStatus}`);
  };

  const handleRestoreBackup = (data) => {
    if (data.dogs) setDogs(data.dogs);
    if (data.applications) setApplications(data.applications);
    if (data.messages) setMessages(data.messages);
    if (data.rescueReports) setRescueReports(data.rescueReports);
    if (data.adoptionHistory) setAdoptionHistory(data.adoptionHistory);
    if (data.registeredUsers) {
      setRegisteredUsers(data.registeredUsers);
      localStorage.setItem("rescue_users_v18", JSON.stringify(data.registeredUsers));
    }
    showToast("Full shelter backup restored successfully!");
  };

  return (
    <div className="app-shell">
      {toast && (
        <div className={`toast-banner toast-${toast.type}`}>
          <span>{toast.text}</span>
          <button onClick={() => setToast(null)}>&times;</button>
        </div>
      )}

      {!currentUser ? (
        <AuthModal onLoginSuccess={handleLoginSuccess} showToast={showToast} />
      ) : (
        <>
          <Navbar
            currentUser={currentUser}
            onLogout={handleLogout}
            currentView={currentView}
            setView={setCurrentView}
            favCount={favorites.length}
            msgCount={messages.filter((m) => m.userId === currentUser.userId && m.adminReply).length}
          />

          <main className="content-area">
            {currentUser.role === "admin" ? (
              <AdminModule
                dogs={dogs}
                onAddDog={handleAddDog}
                onEditDog={handleEditDog}
                onDeleteDog={handleDeleteDog}
                applications={applications}
                onUpdateAppStatus={handleUpdateAppStatus}
                messages={messages}
                onReplyMessage={handleReplyMessage}
                rescueReports={rescueReports}
                onUpdateRescueStatus={handleUpdateRescueStatus}
                adoptionHistory={adoptionHistory}
                registeredUsers={registeredUsers}
                onRestoreBackup={handleRestoreBackup}
              />
            ) : (
              <UserModule
                dogs={dogs}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                currentView={currentView}
                setView={setCurrentView}
                applications={applications}
                onSubmitApplication={handleSubmitApplication}
                currentUser={currentUser}
                onUpdateProfile={handleUpdateUserProfile}
                messages={messages}
                onSendMessage={handleSendMessage}
                rescueReports={rescueReports}
                onSubmitRescue={handleSubmitRescue}
              />
            )}
          </main>
        </>
      )}
    </div>
  );
}