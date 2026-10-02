import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

const emptyProfile = {
  id: null,
  name: "",
  email: "",
  phone: "",
  college: "",
  roll_no: "",
  department: "",
  bio: "",
  profile_image: "",
  teachSkills: [],
  learnSkills: [],
  reputation: { rating: 0, completed_sessions: 0, points: 0 },
};

function initials(name = "User") {
  return name.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "U";
}

function levelLabel(level) {
  return level === "ADVANCED" ? "PROFICIENT" : level || "BEGINNER";
}

export default function Profile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(emptyProfile);
  const [editData, setEditData] = useState(emptyProfile);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  const load = async () => {
    try {
      setError("");
      const [profileRes, skillsRes] = await Promise.all([
        api.get("/users/me"),
        api.get("/users/me/skills"),
      ]);
      const u = profileRes.data.user || {};
      const skills = skillsRes.data.skills || skillsRes.data.userSkills || [];
      const next = {
        ...emptyProfile,
        ...u,
        teachSkills: skills.filter((s) => s.type === "TEACH"),
        learnSkills: skills.filter((s) => s.type === "LEARN"),
        reputation: u.reputation || { rating: 0, completed_sessions: 0, points: 0 },
      };
      setProfile(next);
      setEditData(next);
      setUser?.((previous) => ({ ...previous, ...u }));
    } catch (e) {
      setError(getErrorMessage(e, "Could not load your profile."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, []);

  const completion = useMemo(() => {
    const checks = [profile.name, profile.email, profile.college, profile.roll_no, profile.department, profile.bio, profile.teachSkills.length, profile.learnSkills.length];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [profile]);

  const updateField = (name, value) => {
    setEditData((current) => ({ ...current, [name]: value }));
    setSaved("");
  };

  const save = async (event) => {
    event.preventDefault();
    if (!editData.name.trim()) return setError("Name is required.");
    try {
      setSaving(true);
      setError("");
      const response = await api.put("/users/me", {
        name: editData.name.trim(),
        phone: editData.phone?.trim() || null,
        college: editData.college?.trim() || null,
        roll_no: editData.roll_no?.trim() || null,
        department: editData.department?.trim() || null,
        bio: editData.bio?.trim() || null,
      });
      const updated = { ...profile, ...response.data.user };
      setProfile(updated);
      setEditData(updated);
      setUser?.((previous) => ({ ...previous, ...response.data.user }));
      setEditMode(false);
      setSaved("Profile updated successfully");
    } catch (e) {
      setError(getErrorMessage(e, "Could not save your profile."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="profile-page"><div className="profile-container"><div className="profile-card"><h3>Loading your profile…</h3></div></div></main>;

  const rating = Number(profile.reputation?.rating || 0);
  const completed = Number(profile.reputation?.completed_sessions || 0);

  return (
    <main className="profile-page">
      <div className="profile-container">
        <div className="profile-page-header">
          <div>
            <Link to="/dashboard" className="profile-back">← Back to Dashboard</Link>
            <p className="profile-label">MY PROFILE</p>
            <h1>Your Profile</h1>
            <p className="profile-subtitle">Your profile is loaded from your account and database.</p>
          </div>
          {!editMode && <button className="edit-profile-button" onClick={() => { setEditData(profile); setEditMode(true); }}>Edit Profile</button>}
        </div>

        {error && <div className="profile-card" style={{ marginBottom: 16 }}><p className="profile-error">{error}</p></div>}
        {saved && <div className="profile-card" style={{ marginBottom: 16 }}><p>{saved}</p></div>}

        {editMode ? (
          <form className="profile-edit-card" onSubmit={save}>
            <div className="edit-card-header"><div><p className="profile-label">EDIT PROFILE</p><h2>Update your real account details</h2></div></div>
            <div className="edit-form-grid">
              <div className="edit-form-group"><label>Name</label><input value={editData.name || ""} onChange={(e) => updateField("name", e.target.value)} /></div>
              <div className="edit-form-group"><label>Email</label><input value={editData.email || ""} disabled /></div>
              <div className="edit-form-group"><label>College</label><input value={editData.college || ""} onChange={(e) => updateField("college", e.target.value)} /></div>
              <div className="edit-form-group"><label>Department</label><input value={editData.department || ""} onChange={(e) => updateField("department", e.target.value)} /></div>
              <div className="edit-form-group"><label>Register Number</label><input value={editData.roll_no || ""} onChange={(e) => updateField("roll_no", e.target.value.replace(/\s/g, ""))} /></div>
              <div className="edit-form-group"><label>Phone</label><input value={editData.phone || ""} maxLength={10} onChange={(e) => updateField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} /></div>
            </div>
            <div className="edit-form-group"><label>About Me</label><textarea rows={5} maxLength={500} value={editData.bio || ""} onChange={(e) => updateField("bio", e.target.value)} /><span className="word-counter">{(editData.bio || "").length} / 500 characters</span></div>
            <div className="edit-form-actions"><button type="button" className="cancel-profile-button" onClick={() => setEditMode(false)}>Cancel</button><button type="submit" className="save-profile-button" disabled={saving}>{saving ? "Saving…" : "✓ Save Changes"}</button></div>
          </form>
        ) : (
          <>
            <section className="profile-hero-card">
              <div className="profile-avatar">{initials(profile.name)}</div>
              <div className="profile-main-info">
                <div className="profile-name-row"><div><h2>{profile.name || "Student"}</h2><p className="profile-role">{profile.department || "Student"}</p></div><span className="profile-status">● Active</span></div>
                <div className="profile-details"><span>🎓 {profile.college || "College not added"}</span><span>💻 {profile.department || "Department not added"}</span></div>
              </div>
            </section>

            <section className="profile-stats">
              <div className="profile-stat-card"><div className="stat-icon">⚡</div><div><span>Skills</span><strong>{profile.teachSkills.length + profile.learnSkills.length}</strong></div></div>
              <div className="profile-stat-card"><div className="stat-icon">🔄</div><div><span>Completed exchanges</span><strong>{completed}</strong></div></div>
              <div className="profile-stat-card"><div className="stat-icon">⭐</div><div><span>Rating</span><strong>{rating ? rating.toFixed(1) : "New"}</strong></div></div>
            </section>

            <div className="profile-content-grid">
              <div className="profile-left-column">
                <section className="profile-card"><div className="profile-card-header"><div><p className="card-label">ABOUT</p><h3>About Me</h3></div></div><p className="about-text">{profile.bio || "Add a short introduction so other students know what you enjoy teaching and learning."}</p></section>
                <section className="profile-card"><div className="profile-card-header"><div><p className="card-label">SHARING</p><h3>Skills I Can Teach</h3></div><span className="skill-count">{profile.teachSkills.length} skills</span></div><div className="skill-tags">{profile.teachSkills.length ? profile.teachSkills.map((s) => <span className="skill-tag teach" key={s.id}>{s.name} · {levelLabel(s.level)}</span>) : <span>No teaching skills added yet.</span>}</div></section>
                <section className="profile-card"><div className="profile-card-header"><div><p className="card-label">LEARNING</p><h3>Skills I Want to Learn</h3></div><span className="skill-count">{profile.learnSkills.length} skills</span></div><div className="skill-tags">{profile.learnSkills.length ? profile.learnSkills.map((s) => <span className="skill-tag learn" key={s.id}>{s.name} · {levelLabel(s.level)}</span>) : <span>No learning skills added yet.</span>}</div></section>
              </div>
              <div className="profile-right-column">
                <section className="profile-card"><div className="profile-card-header"><div><p className="card-label">DETAILS</p><h3>Profile Information</h3></div></div><div className="information-list">
                  <div className="information-item"><span>Name</span><strong>{profile.name}</strong></div>
                  <div className="information-item"><span>Email</span><strong>{profile.email || "Not added"}</strong></div>
                  <div className="information-item"><span>College</span><strong>{profile.college || "Not added"}</strong></div>
                  <div className="information-item"><span>Department</span><strong>{profile.department || "Not added"}</strong></div>
                  <div className="information-item"><span>Register Number</span><strong>{profile.roll_no || "Not added"}</strong></div>
                  <div className="information-item"><span>Phone</span><strong>{profile.phone || "Not added"}</strong></div>
                </div></section>
                <section className="profile-card completion-card"><div className="completion-header"><div><p className="card-label">PROFILE</p><h3>Profile Completion</h3></div><strong>{completion}%</strong></div><div className="progress-bar"><div className="progress-fill" style={{ width: `${completion}%` }} /></div><p className="completion-text">Complete your profile to improve matching quality.</p></section>
                <section className="profile-card"><div className="profile-card-header"><div><p className="card-label">QUICK ACTIONS</p><h3>Explore SkillSwap</h3></div></div><div className="profile-actions"><Link to="/skill-setup" className="profile-action"><span>✦</span><div><strong>Edit skills</strong><small>Update what you teach and learn</small></div></Link><Link to="/matches" className="profile-action"><span>🔎</span><div><strong>Find matches</strong><small>Connect with compatible students</small></div></Link><Link to="/messages" className="profile-action"><span>💬</span><div><strong>Messages</strong><small>Continue your conversations</small></div></Link></div></section>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
