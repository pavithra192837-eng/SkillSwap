import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Bell,
  Lock,
  MessageCircle,
  Video,
  Palette,
  Globe,
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

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "English";
  });

  const [showSecurity, setShowSecurity] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /* =====================================================
     LANGUAGE TEXT
  ===================================================== */

  const translations = {
    English: {
      title: "Settings",
      subtitle: "Manage your SkillSwap account and preferences",
      save: "Save Changes",

      account: "Account",
      accountDesc: "Manage your account information",

      profile: "Profile",
      profileDesc: "Update your name, skills and profile",

      security: "Password & Security",
      securityDesc: "Manage your password and security",

      notifications: "Notifications",
      notificationsDesc: "Control how you receive notifications",

      notificationTitle: "Notifications",
      notificationDesc: "Enable SkillSwap notifications",

      messageTitle: "Message Notifications",
      messageDesc: "Get notified when someone sends a message",

      callTitle: "Call Notifications",
      callDesc: "Get notified about incoming calls",

      appearance: "Appearance",
      appearanceDesc: "Customize your SkillSwap experience",

      darkTitle: "Dark Mode",
      darkDesc: "Use dark appearance across the application",

      language: "Language",
      languageDesc: "Select your preferred language",

      applicationLanguage: "Application Language",
      applicationLanguageDesc: "Choose the language used in SkillSwap",

      actions: "Account Actions",
      actionsDesc: "Manage your SkillSwap account",

      logout: "Logout",

      securityTitle: "Password & Security",
      securitySubtitle: "Manage your account security",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmPassword: "Confirm New Password",
      updatePassword: "Update Password",
      close: "Close",

      passwordUpdated: "Password updated successfully!",
      passwordMismatch: "New passwords do not match.",
      passwordRequired: "Please fill in all password fields.",

      settingsSaved: "Settings saved successfully!",
      logoutMessage: "You have been logged out.",
    },

    Tamil: {
      title: "அமைப்புகள்",
      subtitle: "உங்கள் SkillSwap கணக்கு மற்றும் விருப்பங்களை நிர்வகிக்கவும்",
      save: "மாற்றங்களை சேமிக்கவும்",

      account: "கணக்கு",
      accountDesc: "உங்கள் கணக்கு தகவல்களை நிர்வகிக்கவும்",

      profile: "சுயவிவரம்",
      profileDesc: "பெயர், திறன்கள் மற்றும் சுயவிவரத்தை மாற்றவும்",

      security: "கடவுச்சொல் மற்றும் பாதுகாப்பு",
      securityDesc: "கடவுச்சொல் மற்றும் பாதுகாப்பை நிர்வகிக்கவும்",

      notifications: "அறிவிப்புகள்",
      notificationsDesc: "அறிவிப்புகளை எவ்வாறு பெறுவது என்பதை கட்டுப்படுத்தவும்",

      notificationTitle: "அறிவிப்புகள்",
      notificationDesc: "SkillSwap அறிவிப்புகளை இயக்கவும்",

      messageTitle: "செய்தி அறிவிப்புகள்",
      messageDesc: "யாராவது செய்தி அனுப்பும்போது அறிவிப்பைப் பெறவும்",

      callTitle: "அழைப்பு அறிவிப்புகள்",
      callDesc: "உள்வரும் அழைப்புகள் பற்றிய அறிவிப்பைப் பெறவும்",

      appearance: "தோற்றம்",
      appearanceDesc: "SkillSwap தோற்றத்தை மாற்றவும்",

      darkTitle: "இருண்ட பயன்முறை",
      darkDesc: "பயன்பாடு முழுவதும் இருண்ட தோற்றத்தைப் பயன்படுத்தவும்",

      language: "மொழி",
      languageDesc: "உங்களுக்கு விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்",

      applicationLanguage: "பயன்பாட்டு மொழி",
      applicationLanguageDesc:
        "SkillSwap இல் பயன்படுத்தப்படும் மொழியைத் தேர்ந்தெடுக்கவும்",

      actions: "கணக்கு செயல்கள்",
      actionsDesc: "உங்கள் SkillSwap கணக்கை நிர்வகிக்கவும்",

      logout: "வெளியேறு",

      securityTitle: "கடவுச்சொல் மற்றும் பாதுகாப்பு",
      securitySubtitle: "உங்கள் கணக்கு பாதுகாப்பை நிர்வகிக்கவும்",
      currentPassword: "தற்போதைய கடவுச்சொல்",
      newPassword: "புதிய கடவுச்சொல்",
      confirmPassword: "புதிய கடவுச்சொல்லை உறுதிப்படுத்தவும்",
      updatePassword: "கடவுச்சொல்லை மாற்றவும்",
      close: "மூடு",

      passwordUpdated: "கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது!",
      passwordMismatch: "புதிய கடவுச்சொற்கள் பொருந்தவில்லை.",
      passwordRequired: "அனைத்து கடவுச்சொல் புலங்களையும் நிரப்பவும்.",

      settingsSaved: "அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டன!",
      logoutMessage: "நீங்கள் வெளியேறிவிட்டீர்கள்.",
    },

    Hindi: {
      title: "सेटिंग्स",
      subtitle: "अपने SkillSwap खाते और प्राथमिकताओं को प्रबंधित करें",
      save: "परिवर्तन सहेजें",

      account: "खाता",
      accountDesc: "अपने खाते की जानकारी प्रबंधित करें",

      profile: "प्रोफ़ाइल",
      profileDesc: "अपना नाम, कौशल और प्रोफ़ाइल अपडेट करें",

      security: "पासवर्ड और सुरक्षा",
      securityDesc: "अपना पासवर्ड और सुरक्षा प्रबंधित करें",

      notifications: "सूचनाएं",
      notificationsDesc: "सूचनाएं प्राप्त करने का तरीका नियंत्रित करें",

      notificationTitle: "सूचनाएं",
      notificationDesc: "SkillSwap सूचनाएं सक्षम करें",

      messageTitle: "संदेश सूचनाएं",
      messageDesc: "जब कोई आपको संदेश भेजे तो सूचना प्राप्त करें",

      callTitle: "कॉल सूचनाएं",
      callDesc: "आने वाली कॉल के बारे में सूचना प्राप्त करें",

      appearance: "दिखावट",
      appearanceDesc: "अपने SkillSwap अनुभव को अनुकूलित करें",

      darkTitle: "डार्क मोड",
      darkDesc: "पूरे एप्लिकेशन में डार्क थीम का उपयोग करें",

      language: "भाषा",
      languageDesc: "अपनी पसंदीदा भाषा चुनें",

      applicationLanguage: "एप्लिकेशन भाषा",
      applicationLanguageDesc:
        "SkillSwap में उपयोग की जाने वाली भाषा चुनें",

      actions: "खाता कार्य",
      actionsDesc: "अपने SkillSwap खाते को प्रबंधित करें",

      logout: "लॉग आउट",

      securityTitle: "पासवर्ड और सुरक्षा",
      securitySubtitle: "अपने खाते की सुरक्षा प्रबंधित करें",
      currentPassword: "वर्तमान पासवर्ड",
      newPassword: "नया पासवर्ड",
      confirmPassword: "नए पासवर्ड की पुष्टि करें",
      updatePassword: "पासवर्ड अपडेट करें",
      close: "बंद करें",

      passwordUpdated: "पासवर्ड सफलतापूर्वक अपडेट किया गया!",
      passwordMismatch: "नए पासवर्ड मेल नहीं खाते।",
      passwordRequired: "कृपया सभी पासवर्ड फ़ील्ड भरें।",

      settingsSaved: "सेटिंग्स सफलतापूर्वक सहेजी गईं!",
      logoutMessage: "आप लॉग आउट हो गए हैं।",
    },
  };

  const t = translations[language];

  /* =====================================================
     DARK MODE
  ===================================================== */

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("darkMode", JSON.stringify(darkMode));

    return () => {
      document.body.classList.remove("dark-mode");
    };
  }, [darkMode]);

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

    localStorage.setItem(
      "darkMode",
      JSON.stringify(darkMode)
    );

    localStorage.setItem("language", language);

    alert(t.settingsSaved);
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
     LANGUAGE
  ===================================================== */

  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;

    setLanguage(selectedLanguage);
    localStorage.setItem("language", selectedLanguage);
  };

  /* =====================================================
     SECURITY
  ===================================================== */

  const handlePasswordUpdate = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert(t.passwordRequired);
      return;
    }

    if (newPassword !== confirmPassword) {
      alert(t.passwordMismatch);
      return;
    }

    localStorage.setItem("userPassword", newPassword);

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    alert(t.passwordUpdated);

    setShowSecurity(false);
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("isLoggedIn");

    alert(t.logoutMessage);

    navigate("/login");
  };

  return (
    <div className={`settings-page ${darkMode ? "settings-dark" : ""}`}>

      <div className="settings-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="settings-header">

          <div>
            <h1>{t.title}</h1>

            <p>{t.subtitle}</p>
          </div>

          <button
            className="save-settings-button"
            onClick={handleSave}
          >
            <Save size={17} />
            {t.save}
          </button>

        </div>

        {/* =================================================
            ACCOUNT
        ================================================= */}

        <section className="settings-section">

          <div className="section-title">

            <User size={19} />

            <div>
              <h2>{t.account}</h2>
              <p>{t.accountDesc}</p>
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
                  <h3>{t.profile}</h3>
                  <p>{t.profileDesc}</p>
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
                  <h3>{t.security}</h3>
                  <p>{t.securityDesc}</p>
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
              <h2>{t.notifications}</h2>
              <p>{t.notificationsDesc}</p>
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
                  <h3>{t.notificationTitle}</h3>
                  <p>{t.notificationDesc}</p>
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

            {/* MESSAGE */}

            <div
              className={`settings-item ${
                !notifications ? "disabled-setting" : ""
              }`}
            >

              <div className="settings-item-left">

                <div className="settings-icon">
                  <MessageCircle size={18} />
                </div>

                <div>
                  <h3>{t.messageTitle}</h3>
                  <p>{t.messageDesc}</p>
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

            {/* CALL */}

            <div
              className={`settings-item ${
                !notifications ? "disabled-setting" : ""
              }`}
            >

              <div className="settings-item-left">

                <div className="settings-icon">
                  <Video size={18} />
                </div>

                <div>
                  <h3>{t.callTitle}</h3>
                  <p>{t.callDesc}</p>
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
            APPEARANCE
        ================================================= */}

        <section className="settings-section">

          <div className="section-title">

            <Palette size={19} />

            <div>
              <h2>{t.appearance}</h2>
              <p>{t.appearanceDesc}</p>
            </div>

          </div>

          <div className="settings-card">

            <div className="settings-item">

              <div className="settings-item-left">

                <div className="settings-icon">
                  <Palette size={18} />
                </div>

                <div>
                  <h3>{t.darkTitle}</h3>
                  <p>{t.darkDesc}</p>
                </div>

              </div>

              <label className="switch">

                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) =>
                    setDarkMode(e.target.checked)
                  }
                />

                <span className="slider"></span>

              </label>

            </div>

          </div>

        </section>

        {/* =================================================
            LANGUAGE
        ================================================= */}

        <section className="settings-section">

          <div className="section-title">

            <Globe size={19} />

            <div>
              <h2>{t.language}</h2>
              <p>{t.languageDesc}</p>
            </div>

          </div>

          <div className="settings-card">

            <div className="language-row">

              <div>
                <h3>{t.applicationLanguage}</h3>
                <p>{t.applicationLanguageDesc}</p>
              </div>

              <select
                value={language}
                onChange={handleLanguageChange}
              >
                <option value="English">
                  English
                </option>

                <option value="Tamil">
                  தமிழ்
                </option>

                <option value="Hindi">
                  हिन्दी
                </option>
              </select>

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
              <h2>{t.actions}</h2>
              <p>{t.actionsDesc}</p>
            </div>

          </div>

          <div className="settings-card">

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              {t.logout}
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

            <div className="security-modal-header">

              <div className="security-modal-title">

                <div className="security-modal-icon">
                  <ShieldCheck size={22} />
                </div>

                <div>
                  <h2>{t.securityTitle}</h2>
                  <p>{t.securitySubtitle}</p>
                </div>

              </div>

              <button
                className="security-close"
                onClick={() => setShowSecurity(false)}
              >
                <X size={18} />
              </button>

            </div>

            <div className="security-form">

              <label>
                <span>{t.currentPassword}</span>

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

              <label>
                <span>{t.newPassword}</span>

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

              <label>
                <span>{t.confirmPassword}</span>

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

              <div className="security-actions">

                <button
                  className="security-cancel"
                  onClick={() =>
                    setShowSecurity(false)
                  }
                >
                  {t.close}
                </button>

                <button
                  className="security-update"
                  onClick={handlePasswordUpdate}
                >
                  <Lock size={16} />
                  {t.updatePassword}
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