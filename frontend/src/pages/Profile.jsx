import { useState } from "react";
import { Link } from "react-router-dom";
import "./Profile.css";

/* =========================
   MOCK PROFILE DATA
========================= */

const initialProfileData = {
  name: "Yuvarani",
  initials: "Y",
  role: "ECE Student",
  college: "Your College Name",
  department: "Electronics and Communication Engineering",
  registerNumber: "Your Register Number",
  location: "Tamil Nadu, India",

  about:
    "I am an ECE student interested in software development, problem solving and learning new technologies. I enjoy sharing what I know and learning from other students through SkillSwap.",

  skillPoints: 245,
  exchanges: 12,
  rating: "4.8",

  skillsToTeach: [
    "C",
    "C++",
    "Python",
    "HTML",
    "CSS",
  ],

  skillsToLearn: [
    "React",
    "JavaScript",
    "UI/UX Design",
    "Figma",
  ],
};


/* =========================
   PROFILE COMPONENT
========================= */

function Profile() {
  const [profile, setProfile] = useState(initialProfileData);

  const [editMode, setEditMode] = useState(false);

  const [editData, setEditData] = useState(initialProfileData);


  /* =========================
     EDIT PROFILE
  ========================= */

  const handleEdit = () => {
    setEditData(profile);
    setEditMode(true);
  };


  /* =========================
     CANCEL EDIT
  ========================= */

  const handleCancel = () => {
    setEditData(profile);
    setEditMode(false);
  };


  /* =========================
     INPUT CHANGE
  ========================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setEditData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  /* =========================
     SAVE PROFILE
  ========================= */

  const handleSave = (event) => {
    event.preventDefault();

    setProfile({
      ...editData,
      initials: editData.name
        ? editData.name.charAt(0).toUpperCase()
        : "Y",
    });

    setEditMode(false);
  };


  return (
    <main className="profile-page">

      <div className="profile-container">

        {/* =========================
            PAGE HEADER
        ========================= */}

        <div className="profile-page-header">

          <div>

            <Link
              to="/dashboard"
              className="profile-back"
            >
              ← Back to Dashboard
            </Link>

            <p className="profile-label">
              MY PROFILE
            </p>

            <h1>
              Your Profile
            </h1>

            <p className="profile-subtitle">
              Manage your SkillSwap profile and showcase your skills.
            </p>

          </div>


          {!editMode && (
            <button
              className="edit-profile-button"
              onClick={handleEdit}
            >
              ✏️ Edit Profile
            </button>
          )}

        </div>


        {/* =========================
            EDIT PROFILE FORM
        ========================= */}

        {editMode && (

          <form
            className="profile-edit-card"
            onSubmit={handleSave}
          >

            <div className="edit-card-header">

              <div>
                <p className="profile-label">
                  EDIT PROFILE
                </p>

                <h2>
                  Update your information
                </h2>
              </div>

            </div>


            <div className="edit-form-grid">

              {/* NAME */}

              <div className="edit-form-group">

                <label htmlFor="name">
                  Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={editData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                />

              </div>


              {/* COLLEGE */}

              <div className="edit-form-group">

                <label htmlFor="college">
                  College
                </label>

                <input
                  id="college"
                  name="college"
                  type="text"
                  value={editData.college}
                  onChange={handleChange}
                  placeholder="Enter your college"
                />

              </div>


              {/* DEPARTMENT */}

              <div className="edit-form-group">

                <label htmlFor="department">
                  Department
                </label>

                <select
                  id="department"
                  name="department"
                  value={editData.department}
                  onChange={handleChange}
                >

                  <option>
                    Computer Science and Engineering
                  </option>

                  <option>
                    Information Technology
                  </option>

                  <option>
                    Electronics and Communication Engineering
                  </option>

                  <option>
                    Electrical and Electronics Engineering
                  </option>

                  <option>
                    Mechanical Engineering
                  </option>

                  <option>
                    Civil Engineering
                  </option>

                  <option>
                    Artificial Intelligence and Data Science
                  </option>

                  <option>
                    Artificial Intelligence and Machine Learning
                  </option>

                  <option>
                    Cyber Security
                  </option>

                  <option>
                    EIE
                  </option>

                  <option>
                    IBT
                  </option>

                </select>

              </div>


              {/* REGISTER NUMBER */}

              <div className="edit-form-group">

                <label htmlFor="registerNumber">
                  Register Number
                </label>

                <input
                  id="registerNumber"
                  name="registerNumber"
                  type="text"
                  value={editData.registerNumber}
                  onChange={handleChange}
                  placeholder="Enter register number"
                />

              </div>


              {/* LOCATION */}

              <div className="edit-form-group">

                <label htmlFor="location">
                  Location
                </label>

                <input
                  id="location"
                  name="location"
                  type="text"
                  value={editData.location}
                  onChange={handleChange}
                  placeholder="Enter your location"
                />

              </div>

            </div>


            {/* ABOUT */}

            <div className="edit-form-group">

              <label htmlFor="about">
                About Me
              </label>

              <textarea
                id="about"
                name="about"
                value={editData.about}
                onChange={handleChange}
                placeholder="Tell people about yourself..."
                rows="5"
              />

            </div>


            {/* BUTTONS */}

            <div className="edit-form-actions">

              <button
                type="button"
                className="cancel-profile-button"
                onClick={handleCancel}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-profile-button"
              >
                ✓ Save Changes
              </button>

            </div>

          </form>

        )}


        {/* =========================
            PROFILE DISPLAY
        ========================= */}

        {!editMode && (

          <>

            {/* PROFILE HERO */}

            <section className="profile-hero-card">

              <div className="profile-avatar">
                {profile.initials}
              </div>

              <div className="profile-main-info">

                <div className="profile-name-row">

                  <div>

                    <h2>
                      {profile.name}
                    </h2>

                    <p className="profile-role">
                      {profile.role}
                    </p>

                  </div>

                  <span className="profile-status">
                    ● Active
                  </span>

                </div>


                <div className="profile-details">

                  <span>
                    🎓 {profile.college}
                  </span>

                  <span>
                    💻 {profile.department}
                  </span>

                  <span>
                    📍 {profile.location}
                  </span>

                </div>

              </div>

            </section>


            {/* PROFILE STATS */}

            <section className="profile-stats">

              <div className="profile-stat-card">

                <div className="stat-icon">
                  ⚡
                </div>

                <div>
                  <span>Skill Points</span>
                  <strong>
                    {profile.skillPoints}
                  </strong>
                </div>

              </div>


              <div className="profile-stat-card">

                <div className="stat-icon">
                  🔄
                </div>

                <div>
                  <span>Exchanges</span>
                  <strong>
                    {profile.exchanges}
                  </strong>
                </div>

              </div>


              <div className="profile-stat-card">

                <div className="stat-icon">
                  ⭐
                </div>

                <div>
                  <span>Rating</span>
                  <strong>
                    {profile.rating}
                  </strong>
                </div>

              </div>

            </section>


            {/* CONTENT */}

            <div className="profile-content-grid">

              {/* LEFT COLUMN */}

              <div className="profile-left-column">

                {/* ABOUT */}

                <section className="profile-card">

                  <div className="profile-card-header">

                    <div>

                      <p className="card-label">
                        ABOUT
                      </p>

                      <h3>
                        About Me
                      </h3>

                    </div>

                  </div>

                  <p className="about-text">
                    {profile.about}
                  </p>

                </section>


                {/* TEACH */}

                <section className="profile-card">

                  <div className="profile-card-header">

                    <div>

                      <p className="card-label">
                        SHARING
                      </p>

                      <h3>
                        Skills I Can Teach
                      </h3>

                    </div>

                    <span className="skill-count">
                      {profile.skillsToTeach.length} skills
                    </span>

                  </div>


                  <div className="skill-tags">

                    {profile.skillsToTeach.map(
                      (skill) => (
                        <span
                          className="skill-tag teach"
                          key={skill}
                        >
                          {skill}
                        </span>
                      )
                    )}

                  </div>

                </section>


                {/* LEARN */}

                <section className="profile-card">

                  <div className="profile-card-header">

                    <div>

                      <p className="card-label">
                        LEARNING
                      </p>

                      <h3>
                        Skills I Want to Learn
                      </h3>

                    </div>

                    <span className="skill-count">
                      {profile.skillsToLearn.length} skills
                    </span>

                  </div>


                  <div className="skill-tags">

                    {profile.skillsToLearn.map(
                      (skill) => (
                        <span
                          className="skill-tag learn"
                          key={skill}
                        >
                          {skill}
                        </span>
                      )
                    )}

                  </div>

                </section>

              </div>


              {/* RIGHT COLUMN */}

              <div className="profile-right-column">

                {/* INFORMATION */}

                <section className="profile-card">

                  <div className="profile-card-header">

                    <div>

                      <p className="card-label">
                        DETAILS
                      </p>

                      <h3>
                        Profile Information
                      </h3>

                    </div>

                  </div>


                  <div className="information-list">

                    <div className="information-item">
                      <span>Name</span>
                      <strong>
                        {profile.name}
                      </strong>
                    </div>

                    <div className="information-item">
                      <span>College</span>
                      <strong>
                        {profile.college}
                      </strong>
                    </div>

                    <div className="information-item">
                      <span>Department</span>
                      <strong>
                        {profile.department}
                      </strong>
                    </div>

                    <div className="information-item">
                      <span>Register Number</span>
                      <strong>
                        {profile.registerNumber}
                      </strong>
                    </div>

                  </div>

                </section>


                {/* COMPLETION */}

                <section className="profile-card completion-card">

                  <div className="completion-header">

                    <div>

                      <p className="card-label">
                        PROFILE
                      </p>

                      <h3>
                        Profile Completion
                      </h3>

                    </div>

                    <strong>
                      80%
                    </strong>

                  </div>


                  <div className="progress-bar">

                    <div className="progress-fill"></div>

                  </div>


                  <p className="completion-text">
                    Complete your profile to get better skill matches.
                  </p>

                </section>


                {/* QUICK ACTIONS */}

                <section className="profile-card">

                  <div className="profile-card-header">

                    <div>

                      <p className="card-label">
                        QUICK ACTIONS
                      </p>

                      <h3>
                        Explore SkillSwap
                      </h3>

                    </div>

                  </div>


                  <div className="profile-actions">

                    <Link
                      to="/explore"
                      className="profile-action"
                    >
                      <span>🔎</span>

                      <div>
                        <strong>
                          Explore Skills
                        </strong>

                        <small>
                          Find something new to learn
                        </small>
                      </div>

                    </Link>


                    <Link
                      to="/dashboard"
                      className="profile-action"
                    >
                      <span>📊</span>

                      <div>
                        <strong>
                          View Dashboard
                        </strong>

                        <small>
                          Check your latest activity
                        </small>
                      </div>

                    </Link>

                  </div>

                </section>

              </div>

            </div>

          </>
        )}

      </div>

    </main>
  );
}

export default Profile;