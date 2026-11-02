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
    image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=600&q=80",
    father: "Rex",
    mother: "Chloe",
    microchip: "CHIP-9903",
    vaccines: ["Rabies", "DHPP", "Lyme"]
  }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem("rescue_active_user_v18")) || null;
  });

  const [dogs, setDogs] = useState(() => {
    return JSON.parse(localStorage.getItem("rescue_dogs_v18")) || DEFAULT_DOGS;
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

  const [currentView, setCurrentView] = useState("catalog");

  // Sync state to localStorage
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

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setCurrentView(user.role === "admin" ? "admin" : "catalog");
  };

  const handleLogout = () => {
    localStorage.removeItem("rescue_active_user_v18");
    setCurrentUser(null);
  };

  const toggleFavorite = (dogId) => {
    setFavorites((prev) =>
      prev.includes(dogId) ? prev.filter((id) => id !== dogId) : [...prev, dogId]
    );
  };

  const handleAddDog = (dog) => {
    setDogs([dog, ...dogs]);
  };

  const handleDeleteDog = (dogId) => {
    if (window.confirm("Are you sure you want to remove this dog?")) {
      setDogs(dogs.filter((d) => d.id !== dogId));
    }
  };

  const handleSubmitApplication = (app) => {
    setApplications([app, ...applications]);
  };

  const handleSendMessage = (msg) => {
    setMessages([msg, ...messages]);
  };

  const handleUpdateAppStatus = (appId, newStatus, remarks) => {
    setApplications(
      applications.map((app) =>
        app.appId === appId
          ? { ...app, status: newStatus, adminRemarks: remarks || app.adminRemarks }
          : app
      )
    );
  };

  if (!currentUser) {
    return <AuthModal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-shell">
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        currentView={currentView}
        setView={setCurrentView}
        favCount={favorites.length}
      />

      <main className="content-area">
        {currentUser.role === "admin" ? (
          <AdminModule
            dogs={dogs}
            onAddDog={handleAddDog}
            onDeleteDog={handleDeleteDog}
            applications={applications}
            onUpdateAppStatus={handleUpdateAppStatus}
            messages={messages}
          />
        ) : (
          <UserModule
            dogs={dogs}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            currentView={currentView}
            applications={applications}
            onSubmitApplication={handleSubmitApplication}
            currentUser={currentUser}
            onSendMessage={handleSendMessage}
          />
        )}
      </main>
    </div>
  );
}