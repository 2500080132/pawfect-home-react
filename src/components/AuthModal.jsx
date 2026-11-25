import React, { useState } from "react";
import { Dog, Lock, Mail, User, ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function AuthModal({ onLoginSuccess, showToast }) {
  const [activeTab, setActiveTab] = useState("adopter-login");
  const [showPassword, setShowPassword] = useState(false);

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
    setShowPassword(false);
    setFormData({ userId: "", name: "", email: "", password: "" });
  };

  const handleAdopterLogin = (e) => {
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
      const roleMatches = !u.role || u.role === "customer" || u.role === "adopter";

      return idMatches && passMatches && roleMatches;
    });

    if (user) {
      const normalizedUser = { ...user, role: "adopter" };
      localStorage.setItem("rescue_active_user_v18", JSON.stringify(normalizedUser));
      onLoginSuccess(normalizedUser);
    } else {
      setErrorMsg("Invalid adopter credentials. Please check your username or password.");
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setErrorMsg("");

    const inputId = formData.userId.trim().toLowerCase();
    const inputPass = formData.password.trim();
    const storedUsers = JSON.parse(localStorage.getItem("rescue_users_v18")) || [];

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
      role: "adopter",
      phone: "",
      address: "",
      homeType: "Apartment / Flat",
      experience: "First-time Dog Owner",
      joinedDate: new Date().toLocaleDateString()
    };

    storedUsers.push(newUser);
    localStorage.setItem("rescue_users_v18", JSON.stringify(storedUsers));
    localStorage.setItem("rescue_active_user_v18", JSON.stringify(newUser));

    if (showToast) showToast("Adopter account created successfully!");
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
          <p>Pet Adoption &amp; Stray Rescue Portal</p>
        </div>

        <div className="tab-switcher">
          <button
            type="button"
            className={activeTab === "adopter-login" ? "tab-active" : ""}
            onClick={() => switchTab("adopter-login")}
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

        {activeTab === "adopter-login" && (
          <form onSubmit={handleAdopterLogin} className="auth-form">
            <div className="input-group">
              <User size={18} />
              <input
                type="text"
                name="userId"
                placeholder="Adopter Username or Email"
                value={formData.userId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <Lock size={18} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="eye-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <button type="submit" className="submit-btn">
              Login as Adopter
            </button>
          </form>
        )}

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
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Admin Master Key / Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="eye-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <button type="submit" className="submit-btn" style={{ background: "#dc2626" }}>
              Access Admin Panel
            </button>
          </form>
        )}

        {activeTab === "signup" && (
          <form onSubmit={handleSignup} className="auth-form">
            <div className="input-group">
              <User size={18} />
              <input
                type="text"
                name="userId"
                placeholder="Desired Adopter Username"
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
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create Password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="eye-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <button type="submit" className="submit-btn">
              Create Adopter Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
}