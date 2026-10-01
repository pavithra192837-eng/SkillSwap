import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  User,
  Bell,
  Lock,
  MessageCircle,
  Video,
  LogOut,
  ChevronRight,
  Save,
  X,
  ShieldCheck,
  KeyRound,
} from "lucide-react";

import "./Settings.css";

function Settings() {
  const navigate = useNavigate();

  /* =====================================================
     STATES
  ===================================================== */

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("notifications");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [messageNotifications, setMessageNotifications] = useState(() => {
    const saved = localStorage.getItem("messageNotifications");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [callNotifications, setCallNotifications] = useState(() => {
    const saved = localStorage.getItem("callNotifications");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [showSecurity, setShowSecurity] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /* =====================================================
     SAVE SETTINGS
  ===================================================== */

  const handleSave = () => {
    localStorage.setItem(
      "notifications",
      JSON.stringify(notifications)
    );

    localStorage.setItem(
      "messageNotifications",
      JSON.stringify(messageNotifications)
    );

    localStorage.setItem(
      "callNotifications",
      JSON.stringify(callNotifications)
    );

    alert("Settings saved successfully!");
  };

  /* =====================================================
     PROFILE
  ===================================================== */

  const openProfile = () => {
    navigate("/profile");
  };

  /* =====================================================
     NOTIFICATION LOGIC
  ===================================================== */

  const handleMainNotification = (value) => {
    setNotifications(value);

    if (!value) {
      setMessageNotifications(false);
      setCallNotifications(false);
    }
  };

  const handleMessageNotification = (value) => {
    setMessageNotifications(value);

    if (value) {
      setNotifications(true);
    }
  };

  const handleCallNotification = (value) => {
    setCallNotifications(value);

    if (value) {
      setNotifications(true);
    }
  };

  /* =====================================================
     SECURITY
  ===================================================== */

  const handlePasswordUpdate = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    localStorage.setItem("userPassword", newPassword);

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    alert("Password updated successfully!");

    setShowSecurity(false);
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("isLoggedIn");

    alert("You have been logged out.");

    navigate("/login");
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="settings-page">

      <div className="settings-container">
        <button
  className="settings-back-button"
  onClick={() => navigate("/dashboard")}
>
  ← Back to Dashboard
</button>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="settings-header">

          <div>
            <h1>Settings</h1>

            <p>
              Manage your SkillSwap account and preferences
            </p>
          </div>

          <button
            className="save-settings-button"
            onClick={handleSave}
          >
            <Save size={17} />
            Save Changes
          </button>

        </div>

        {/* =================================================
            ACCOUNT
        ================================================= */}

        <section className="settings-section">

          <div className="section-title">

            <User size={19} />

            <div>
              <h2>Account</h2>
              <p>Manage your account information</p>
            </div>

          </div>

          <div className="settings-card">

            {/* PROFILE */}

            <button
              className="settings-item"
              onClick={openProfile}
            >

              <div className="settings-item-left">

                <div className="settings-icon">
                  <User size={18} />
                </div>

                <div>
                  <h3>Profile</h3>

                  <p>
                    Update your name, skills and profile
                  </p>
                </div>

              </div>

              <ChevronRight size={18} />

            </button>

            {/* SECURITY */}

            <button
              className="settings-item"
              onClick={() => setShowSecurity(true)}
            >

              <div className="settings-item-left">

                <div className="settings-icon">
                  <Lock size={18} />
                </div>

                <div>
                  <h3>Password & Security</h3>

                  <p>
                    Manage your password and security
                  </p>
                </div>

              </div>

              <ChevronRight size={18} />

            </button>

          </div>

        </section>

        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <section className="settings-section">

          <div className="section-title">

            <Bell size={19} />

            <div>
              <h2>Notifications</h2>

              <p>
                Control how you receive notifications
              </p>
            </div>

          </div>

          <div className="settings-card">

            {/* MAIN NOTIFICATION */}

            <div className="settings-item">

              <div className="settings-item-left">

                <div className="settings-icon">
                  <Bell size={18} />
                </div>

                <div>
                  <h3>Notifications</h3>

                  <p>
                    Enable SkillSwap notifications
                  </p>
                </div>

              </div>

              <label className="switch">

                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) =>
                    handleMainNotification(
                      e.target.checked
                    )
                  }
                />

                <span className="slider"></span>

              </label>

            </div>

            {/* MESSAGE NOTIFICATION */}

            <div
              className={`settings-item ${
                !notifications
                  ? "disabled-setting"
                  : ""
              }`}
            >

              <div className="settings-item-left">

                <div className="settings-icon">
                  <MessageCircle size={18} />
                </div>

                <div>
                  <h3>Message Notifications</h3>

                  <p>
                    Get notified when someone sends a message
                  </p>
                </div>

              </div>

              <label className="switch">

                <input
                  type="checkbox"
                  checked={messageNotifications}
                  disabled={!notifications}
                  onChange={(e) =>
                    handleMessageNotification(
                      e.target.checked
                    )
                  }
                />

                <span className="slider"></span>

              </label>

            </div>

            {/* CALL NOTIFICATION */}

            <div
              className={`settings-item ${
                !notifications
                  ? "disabled-setting"
                  : ""
              }`}
            >

              <div className="settings-item-left">

                <div className="settings-icon">
                  <Video size={18} />
                </div>

                <div>
                  <h3>Call Notifications</h3>

                  <p>
                    Get notified about incoming calls
                  </p>
                </div>

              </div>

              <label className="switch">

                <input
                  type="checkbox"
                  checked={callNotifications}
                  disabled={!notifications}
                  onChange={(e) =>
                    handleCallNotification(
                      e.target.checked
                    )
                  }
                />

                <span className="slider"></span>

              </label>

            </div>

          </div>

        </section>

        {/* =================================================
            ACCOUNT ACTIONS
        ================================================= */}

        <section className="settings-section danger-section">

          <div className="section-title danger-title">

            <LogOut size={19} />

            <div>
              <h2>Account Actions</h2>

              <p>
                Manage your SkillSwap account
              </p>
            </div>

          </div>

          <div className="settings-card">

            <button
              className="logout-button"
              onClick={handleLogout}
            >

              <LogOut size={18} />

              Logout

            </button>

          </div>

        </section>

      </div>

      {/* ===================================================
          SECURITY MODAL
      =================================================== */}

      {showSecurity && (

        <div
          className="security-overlay"
          onClick={() => setShowSecurity(false)}
        >

          <div
            className="security-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* SECURITY HEADER */}

            <div className="security-modal-header">

              <div className="security-modal-title">

                <div className="security-modal-icon">
                  <ShieldCheck size={22} />
                </div>

                <div>

                  <h2>Password & Security</h2>

                  <p>
                    Manage your account security
                  </p>

                </div>

              </div>

              <button
                className="security-close"
                onClick={() => setShowSecurity(false)}
              >
                <X size={18} />
              </button>

            </div>

            {/* SECURITY FORM */}

            <div className="security-form">

              {/* CURRENT PASSWORD */}

              <label>

                <span>
                  Current Password
                </span>

                <div className="password-input">

                  <KeyRound size={16} />

                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) =>
                      setCurrentPassword(
                        e.target.value
                      )
                    }
                    placeholder="••••••••"
                  />

                </div>

              </label>

              {/* NEW PASSWORD */}

              <label>

                <span>
                  New Password
                </span>

                <div className="password-input">

                  <KeyRound size={16} />

                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(
                        e.target.value
                      )
                    }
                    placeholder="••••••••"
                  />

                </div>

              </label>

              {/* CONFIRM PASSWORD */}

              <label>

                <span>
                  Confirm New Password
                </span>

                <div className="password-input">

                  <KeyRound size={16} />

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="••••••••"
                  />

                </div>

              </label>

              {/* ACTIONS */}

              <div className="security-actions">

                <button
                  className="security-cancel"
                  onClick={() =>
                    setShowSecurity(false)
                  }
                >
                  Close
                </button>

                <button
                  className="security-update"
                  onClick={handlePasswordUpdate}
                >

                  <Lock size={16} />

                  Update Password

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Settings;