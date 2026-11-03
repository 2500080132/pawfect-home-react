import React, { useState } from "react";
import { Dog, Lock, Mail, User, ShieldCheck } from "lucide-react";

export default function AuthModal({ onLoginSuccess }) {
  // Modes: "customer-login", "admin-login", "signup"
  const [activeTab, setActiveTab] = useState("customer-login");

  const [formData, setFormData] = useState({
    userId: "",
    name: "",
    email: "",
    password: "",
  });

  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setErrorMsg("");
    setFormData({ userId: "", name: "", email: "", password: "" });
  };

  // 1. Separate Customer Login Handler
  const handleCustomerLogin = (e) => {
    e.preventDefault();
    setErrorMsg("");

    const inputId = formData.userId.trim().toLowerCase();
    const inputPass = formData.password.trim();

    const storedUsers = JSON.parse(localStorage.getItem("rescue_users_v18")) || [];

    const user = storedUsers.find((u) => {
      const storedId = (u.userId || u.username || "").trim().toLowerCase();
      const storedEmail = (u.email || "").trim().toLowerCase();
      const storedPass = (u.password || "").trim();

      const idMatches = storedId === inputId || storedEmail === inputId;
      const passMatches = storedPass === inputPass;
      const roleMatches = !u.role || u.role === "customer";

      return idMatches && passMatches && roleMatches;
    });

    if (user) {
      localStorage.setItem("rescue_active_user_v18", JSON.stringify(user));
      onLoginSuccess(user);
    } else {
      setErrorMsg("Invalid customer credentials. Please check your username or password.");
    }
  };

  // 2. Separate Admin Login Handler
  const handleAdminLogin = (e) => {
    e.preventDefault();
    setErrorMsg("");

    const inputId = formData.userId.trim().toLowerCase();
    const inputPass = formData.password.trim();

    const storedUsers = JSON.parse(localStorage.getItem("rescue_users_v18")) || [];

    // Check fixed default admin or created admin accounts in LocalStorage
    const isDefaultAdmin = inputId === "admin" && inputPass === "admin123";
    const isRegisteredAdmin = storedUsers.some(
      (u) =>
        ((u.userId || u.username || "").trim().toLowerCase() === inputId ||
          (u.email || "").trim().toLowerCase() === inputId) &&
        (u.password || "").trim() === inputPass &&
        u.role === "admin"
    );

    if (isDefaultAdmin || isRegisteredAdmin) {
      const adminUser = {
        userId: formData.userId.trim(),
        name: "Shelter Admin",
        role: "admin",
      };
      localStorage.setItem("rescue_active_user_v18", JSON.stringify(adminUser));
      onLoginSuccess(adminUser);
    } else {
      setErrorMsg("Unauthorized: Invalid Admin username or security key.");
    }
  };

  // 3. Signup Handler (Registers Customer to LocalStorage)
  const handleSignup = (e) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanUserId = formData.userId.trim();
    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim();
    const cleanPassword = formData.password.trim();

    if (!cleanUserId || !cleanPassword || !cleanName) {
      setErrorMsg("Please complete all required fields.");
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem("rescue_users_v18")) || [];

    if (
      storedUsers.some(
        (u) => (u.userId || u.username || "").toLowerCase() === cleanUserId.toLowerCase()
      )
    ) {
      setErrorMsg("Username is already taken. Please choose another.");
      return;
    }

    const newUser = {
      userId: cleanUserId,
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      role: "customer",
    };

    storedUsers.push(newUser);
    localStorage.setItem("rescue_users_v18", JSON.stringify(storedUsers));
    localStorage.setItem("rescue_active_user_v18", JSON.stringify(newUser));

    alert("Account created successfully!");
    onLoginSuccess(newUser);
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-circle">
            <Dog size={36} color="#fff" />
          </div>
          <h2>Pawfect Home</h2>
          <p>Pet Adoption &amp; Rescue Portal</p>
        </div>

        {/* Dedicated 3-Way Tabs */}
        <div className="tab-switcher">
          <button
            type="button"
            className={activeTab === "customer-login" ? "tab-active" : ""}
            onClick={() => switchTab("customer-login")}
          >
            Adopter Login
          </button>
          <button
            type="button"
            className={activeTab === "admin-login" ? "tab-active" : ""}
            onClick={() => switchTab("admin-login")}
          >
            Admin Login
          </button>
          <button
            type="button"
            className={activeTab === "signup" ? "tab-active" : ""}
            onClick={() => switchTab("signup")}
          >
            Register
          </button>
        </div>

        {errorMsg && <div className="alert-error">{errorMsg}</div>}

        {/* CUSTOMER LOGIN VIEW */}
        {activeTab === "customer-login" && (
          <form onSubmit={handleCustomerLogin} className="auth-form">
            <div className="input-group">
              <User size={18} />
              <input
                type="text"
                name="userId"
                placeholder="Customer Username or Email"
                value={formData.userId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <Lock size={18} />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="submit-btn">
              Login as Customer
            </button>
          </form>
        )}

        {/* ADMIN LOGIN VIEW */}
        {activeTab === "admin-login" && (
          <form onSubmit={handleAdminLogin} className="auth-form">
            <div className="input-group">
              <ShieldCheck size={18} />
              <input
                type="text"
                name="userId"
                placeholder="Admin Username"
                value={formData.userId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <Lock size={18} />
              <input
                type="password"
                name="password"
                placeholder="Admin Master Key / Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="submit-btn" style={{ background: "#dc2626" }}>
              Access Admin Panel
            </button>
          </form>
        )}

        {/* SIGN UP VIEW */}
        {activeTab === "signup" && (
          <form onSubmit={handleSignup} className="auth-form">
            <div className="input-group">
              <User size={18} />
              <input
                type="text"
                name="userId"
                placeholder="Desired Username"
                value={formData.userId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <User size={18} />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <Mail size={18} />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <Lock size={18} />
              <input
                type="password"
                name="password"
                placeholder="Create Password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="submit-btn">
              Create Customer Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
}