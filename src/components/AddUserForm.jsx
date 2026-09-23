import React, { useState, useEffect } from "react";
import "../styles/AddUserForm.css";

export default function AddUserForm({ onAdd, onClose }) {
  // Form state
  const [fullName, setFullName] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");
  const [role, setRole] = useState("administrator"); // default
  const [reportsAccess, setReportsAccess] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle role selection
  const roles = [
    {
      key: "viewer",
      name: "Viewer",
      description: "Read-only access to view data and reports",
      reportsAccess: true,
      reportsDisabled: true,
    },
    {
      key: "operator",
      name: "Operator",
      description: "System control access for daily operations",
      reportsAccess: true,
      reportsDisabled: false,
    },
    {
      key: "administrator",
      name: "Administrator",
      description: "Full access including user management",
      reportsAccess: true,
      reportsDisabled: false,
    },
  ];

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole.key);
    setReportsAccess(selectedRole.reportsAccess);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!fullName.trim()) {
      alert("Please enter a full name.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    const newUser = {
      fullName,
      email,
      role,
      reportsAccess,
      status: "pending",
      created: new Date().toISOString(),
    };

    console.log("New User:", newUser);
    setShowSuccess(true);

    // Optionally pass to parent
    if (onAdd) onAdd(newUser);
  };

  const closeSuccessModal = () => {
    setShowSuccess(false);
    // Reset form
    setFullName("");
    setEmail("");
    setRole("administrator");
    setReportsAccess(true);
    if (onClose) onClose();
  };

  // Animation on mount
  useEffect(() => {
    const container = document.querySelector(".form-container");
    if (container) {
      container.style.opacity = "0";
      container.style.transform = "translateY(20px)";
      setTimeout(() => {
        container.style.transition = "opacity 0.5s ease, transform 0.5s ease";
        container.style.opacity = "1";
        container.style.transform = "translateY(0)";
      }, 100);
    }
  }, []);

  return (
    <div className="container">
      <div className="form-container">
        <header>
          <h1>
            <i className="fas fa-user-plus"></i> Add New User
          </h1>
          <p className="subtitle">
            Create a new user account with specified role and permissions.
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          {/* Personal Info */}
          <div className="form-section">
            <div className="section-title">
              <i className="fas fa-user"></i> Personal Information
            </div>
            <div className="form-field">
              <label htmlFor="fullName">Full Name</label>
              <div className="field-description">
                Enter the user's full name as it should appear in the system
              </div>
              <input
                type="text"
                id="fullName"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="email">Email Address</label>
              <div className="field-description">
                The user will receive login instructions at this email
              </div>
              <input
                type="email"
                id="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Role Assignment */}
          <div className="form-section">
            <div className="section-title">
              <i className="fas fa-user-tag"></i> Role Assignment
            </div>
            <div className="field-description">
              Select the appropriate role for this user based on their
              responsibilities
            </div>
            <div className="role-options">
              {roles.map((r) => (
                <div
                  key={r.key}
                  className={`role-option ${role === r.key ? "selected" : ""}`}
                  onClick={() => handleRoleSelect(r)}
                >
                  <div className="role-name">{r.name}</div>
                  <div className="role-description">{r.description}</div>
                  <i className="fas fa-check-circle role-icon"></i>
                </div>
              ))}
            </div>
          </div>

          {/* Reports Access */}
          <div className="form-section">
            <div className="section-title">
              <i className="fas fa-chart-bar"></i> Reports Access
            </div>
            <div className="checkbox-section">
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  checked={reportsAccess}
                  disabled={
                    roles.find((r) => r.key === role)?.reportsDisabled || false
                  }
                  onChange={(e) => setReportsAccess(e.target.checked)}
                />
                <div className="checkbox-content">
                  <div className="checkbox-title">
                    View analytics and generate reports
                  </div>
                  <div className="checkbox-description">
                    Allow this user to access analytics dashboard, generate
                    reports, and export data. Disabling this will restrict
                    access to reporting features.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="form-buttons">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              <i className="fas fa-times"></i> Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <i className="fas fa-user-plus"></i> Add User
            </button>
          </div>
        </form>

        {/* Footer Links */}
        <div className="footer-links">
          <a href="#" className="footer-link">
            <span className="link-icon">Use</span>
            <span>User Guide</span>
          </a>

          <a href="#" className="footer-link">
            <span className="link-icon">Act</span>
            <span>Activity Log</span>
          </a>

          <a href="#" className="footer-link">
            <span className="link-icon">Li</span>
            <span>License</span>
          </a>

          <a href="#" className="footer-link">
            <span className="link-icon">Sa</span>
            <span>Support Area</span>
          </a>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="success-modal">
          <div className="success-content">
            <div className="success-icon">
              <i className="fas fa-check"></i>
            </div>
            <h2>User Added Successfully</h2>
            <p>The new user account has been created.</p>
            <div className="success-details">
              <div>
                <strong>Full Name:</strong> {fullName}
              </div>
              <div>
                <strong>Email:</strong> {email}
              </div>
              <div>
                <strong>Role:</strong> {role.charAt(0).toUpperCase() + role.slice(1)}
              </div>
            </div>
            <button className="btn btn-primary" onClick={closeSuccessModal}>
              <i className="fas fa-check"></i> OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
