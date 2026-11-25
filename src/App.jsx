import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";
import UserModule from "./components/UserModule";
import AdminModule from "./components/AdminModule";
import "./App.css";

const DEFAULT_DOGS = [
  {
    id: 1,
    name: "Buddy",
    breed: "Golden Retriever",
    age: "7 Months",
    ageGroup: "Young",
    size: "Medium",
    traits: ["Good with Kids", "Gentle", "Trainable"],
    status: "Available",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80",
    sire: "Max (Purebred Golden)",
    dam: "Bella (Purebred Golden)",
    vaccines: ["Rabies (Valid till Dec 2026)", "DHPP Booster", "Bordetella"],
    medicalNotes: "Fully vaccinated, dewormed, microchipped, and cleared for adoption."
  },
  {
    id: 2,
    name: "Rocky",
    breed: "Welsh Corgi",
    age: "1.5 Years",
    ageGroup: "Young",
    size: "Medium",
    traits: ["Apartment Friendly", "Playful", "Alert"],
    status: "Available",
    image: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80",
    sire: "Duke (Pembroke Corgi)",
    dam: "Lucy (Pembroke Corgi)",
    vaccines: ["Rabies (Valid till Oct 2026)", "Parvovirus", "Canine Distemper"],
    medicalNotes: "Healthy weight, active joints, microchipped, and heartworm negative."
  },
  {
    id: 3,
    name: "Charlie",
    breed: "Chow Chow",
    age: "1 Year",
    ageGroup: "Young",
    size: "Medium",
    traits: ["Calm", "Loyal", "Low Barking"],
    status: "Available",
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
    sire: "Leo (Champion Line)",
    dam: "Daisy (Cream Chow)",
    vaccines: ["Rabies (Valid till Jan 2027)", "DHPP", "Leptospirosis"],
    medicalNotes: "Neutered, coat groomed, routine blood panel normal."
  },
  {
    id: 4,
    name: "Bruno",
    breed: "French Bulldog",
    age: "2 Years",
    ageGroup: "Young",
    size: "Medium",
    traits: ["Apartment Friendly", "Good with Kids", "Affectionate"],
    status: "Available",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80",
    sire: "Oscar (Fawn Frenchie)",
    dam: "Chloe (Brindle Frenchie)",
    vaccines: ["Rabies (Valid till Nov 2026)", "DHPP", "Bordetella"],
    medicalNotes: "Vaccinated, microchipped, and cleared for indoor living."
  },
  {
    id: 5,
    name: "Luna",
    breed: "Beagle",
    age: "5 Months",
    ageGroup: "Puppy",
    size: "Small",
    traits: ["Good with Kids", "Apartment Friendly", "Curious"],
    status: "Available",
    image: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=800&q=80",
    sire: "Oliver (Tri-color Beagle)",
    dam: "Daisy (Lemon Beagle)",
    vaccines: ["Puppy DHPP Series", "Bordetella", "Deworming Complete"],
    medicalNotes: "First two puppy vaccine rounds complete; microchipped and active."
  },
  {
    id: 6,
    name: "Max",
    breed: "German Shepherd",
    age: "3 Years",
    ageGroup: "Adult",
    size: "Large",
    traits: ["Loyal Guardian", "Active", "Obedience Trained"],
    status: "Available",
    image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=800&q=80",
    sire: "Rex (Working Line GSD)",
    dam: "Bella (Black & Tan GSD)",
    vaccines: ["Rabies (Valid till Feb 2027)", "DHPP", "Lyme Vaccine"],
    medicalNotes: "Neutered, hip-checked, and up to date on all annual boosters."
  },
  {
    id: 7,
    name: "Simba",
    breed: "Indian Pariah (Indie Rescue)",
    age: "1 Year",
    ageGroup: "Young",
    size: "Medium",
    traits: ["Street Rescue", "Smart & Resilient", "Good with Kids"],
    status: "Available",
    image: "https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=800&q=80",
    sire: "Community Street Rescue",
    dam: "Community Street Rescue",
    vaccines: ["Anti-Rabies (Valid till Mar 2027)", "9-in-1 DHPPiL", "Dewormed"],
    medicalNotes: "Rescued near Vijayawada; fully vaccinated, tick-treated, sterilized, and very affectionate."
  }
];

function App() {
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("rescue_active_user_v18")) || null;
  });

  const [usersList, setUsersList] = useState(() => {
    return (
      JSON.parse(localStorage.getItem("rescue_users_v18")) || [
        {
          id: 101,
          userId: "customer1",
          name: "Jane Adopter",
          username: "customer1",
          email: "jane@example.com",
          password: "password123",
          role: "adopter",
          phone: "",
          address: "",
          homeType: "Apartment",
          experience: "First-time owner"
        }
      ]
    );
  });

  const [dogs, setDogs] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("rescue_dogs_v18"));
      if (!Array.isArray(saved) || saved.length === 0) return DEFAULT_DOGS;
      const existingIds = new Set(saved.map((d) => d.id));
      const missingDefaults = DEFAULT_DOGS.filter((d) => !existingIds.has(d.id));
      return missingDefaults.length > 0 ? [...saved, ...missingDefaults] : saved;
    } catch {
      return DEFAULT_DOGS;
    }
  });

  const [requests, setRequests] = useState(() => {
    return JSON.parse(localStorage.getItem("rescue_requests_v18")) || [];
  });

  const [adoptedHistory, setAdoptedHistory] = useState(() => {
    return JSON.parse(localStorage.getItem("rescue_adopted_history_v18")) || [];
  });

  const [strayReports, setStrayReports] = useState(() => {
    return JSON.parse(localStorage.getItem("rescue_strays_v18")) || [];
  });

  const [messages, setMessages] = useState(() => {
    return JSON.parse(localStorage.getItem("rescue_messages_v18")) || [];
  });

  const [favorites, setFavorites] = useState(() => {
    return JSON.parse(localStorage.getItem("rescue_favs_v18")) || [];
  });

  const [activeTab, setActiveTab] = useState("browse");
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    localStorage.setItem("rescue_active_user_v18", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem("rescue_users_v18", JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    localStorage.setItem("rescue_dogs_v18", JSON.stringify(dogs));
  }, [dogs]);

  useEffect(() => {
    localStorage.setItem("rescue_requests_v18", JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem("rescue_adopted_history_v18", JSON.stringify(adoptedHistory));
  }, [adoptedHistory]);

  useEffect(() => {
    localStorage.setItem("rescue_strays_v18", JSON.stringify(strayReports));
  }, [strayReports]);

  useEffect(() => {
    localStorage.setItem("rescue_messages_v18", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("rescue_favs_v18", JSON.stringify(favorites));
  }, [favorites]);

  const handleLoginSuccess = (loggedInUser) => {
    const normalized = {
      ...loggedInUser,
      username: loggedInUser.username || loggedInUser.userId
    };
    setUser(normalized);
    setUsersList(JSON.parse(localStorage.getItem("rescue_users_v18")) || usersList);
    setActiveTab("browse");
    showToast(`Welcome back, ${normalized.name || normalized.username}!`);
  };

  const handleUpdateProfile = (updatedFields) => {
    if (!user) return;
    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);
    setUsersList((prev) =>
      prev.map((u) =>
        (u.userId || u.username) === (user.userId || user.username) ? updatedUser : u
      )
    );
    showToast("Adopter profile updated & saved for 1-click applications!");
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab("browse");
  };

  const toggleFavorite = (dogId) => {
    setFavorites((prev) =>
      prev.includes(dogId) ? prev.filter((id) => id !== dogId) : [...prev, dogId]
    );
  };

  return (
    <div className="app-shell">
      {toast && (
        <div className="toast-banner">
          <span>{toast}</span>
          <button onClick={() => setToast(null)}>×</button>
        </div>
      )}

      {!user ? (
        <AuthModal
          onLoginSuccess={handleLoginSuccess}
          showToast={showToast}
        />
      ) : (
        <>
          <Navbar
            user={user}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
            favCount={favorites.length}
            msgCount={
              messages.filter(
                (m) => m.username === (user.username || user.userId) && m.reply
              ).length
            }
            onOpenProfile={() => setActiveTab("profile")}
          />

          <main className="content-area">
            {user.role === "admin" ? (
              <AdminModule
                dogs={dogs}
                setDogs={setDogs}
                requests={requests}
                setRequests={setRequests}
                adoptedHistory={adoptedHistory}
                setAdoptedHistory={setAdoptedHistory}
                strayReports={strayReports}
                setStrayReports={setStrayReports}
                messages={messages}
                setMessages={setMessages}
                usersList={usersList}
                showToast={showToast}
              />
            ) : (
              <UserModule
                user={user}
                dogs={dogs}
                requests={requests}
                setRequests={setRequests}
                adoptedHistory={adoptedHistory}
                strayReports={strayReports}
                setStrayReports={setStrayReports}
                messages={messages}
                setMessages={setMessages}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onUpdateProfile={handleUpdateProfile}
                showToast={showToast}
              />
            )}
          </main>
        </>
      )}
    </div>
  );
}

export default App;