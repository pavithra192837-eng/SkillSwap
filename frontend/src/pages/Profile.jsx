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
  phone: "",
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

  const [editData, setEditData] =
    useState(initialProfileData);

  const [errors, setErrors] = useState({});


  /* =========================
     WORD COUNT
  ========================= */
const getCharacterCount = (text) => {
  return text.length;
};
  


  /* =========================
     EDIT PROFILE
  ========================= */

  const handleEdit = () => {
    setEditData(profile);
    setErrors({});
    setEditMode(true);
  };


  /* =========================
     CANCEL EDIT
  ========================= */

  const handleCancel = () => {
    setEditData(profile);
    setErrors({});
    setEditMode(false);
  };


  /* =========================
     INPUT CHANGE
  ========================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    let newValue = value;

    /* PHONE */
    if (name === "phone") {
      newValue = value.replace(/\D/g, "");

      if (newValue.length > 10) {
        newValue = newValue.slice(0, 10);
      }
    }

    /* NAME */
    if (name === "name") {
      newValue = value.replace(/[^a-zA-Z\s]/g, "");
    }

    /* REGISTER NUMBER */
    if (name === "registerNumber") {
      newValue = value.replace(/[^a-zA-Z0-9]/g, "");
    }

    /* ABOUT ME */
    /* ABOUT ME */
if (name === "about") {
  if (value.length > 500) {
    setErrors((previous) => ({
      ...previous,
      about: "About Me cannot exceed 500 characters.",
    }));

    return;
  }

  setErrors((previous) => ({
    ...previous,
    about: "",
  }));
}

    setEditData((previous) => ({
      ...previous,
      [name]: newValue,
    }));

    /* Clear field error when user edits */
    setErrors((previous) => ({
      ...previous,
      [name]:
        name === "about"
          ? previous.about
          : "",
    }));
  };


  /* =========================
     VALIDATION
  ========================= */

  const validateProfile = () => {
    const newErrors = {};

    /* NAME */
    if (!editData.name.trim()) {
      newErrors.name = "Name is required.";
    } else if (!/^[a-zA-Z\s]+$/.test(editData.name.trim())) {
      newErrors.name =
        "Name can contain only letters and spaces.";
    }

    /* PHONE */
    if (!editData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(editData.phone)) {
      newErrors.phone =
        "Phone number must contain exactly 10 digits.";
    }

    /* REGISTER NUMBER */
    if (!editData.registerNumber.trim()) {
      newErrors.registerNumber =
        "Register number is required.";
    } else if (
      !/^[a-zA-Z0-9]+$/.test(
        editData.registerNumber.trim()
      )
    ) {
      newErrors.registerNumber =
        "Register number can contain only letters and numbers.";
    }

    /* COLLEGE */
    if (!editData.college.trim()) {
      newErrors.college =
        "College name is required.";
    }

    /* LOCATION */
    if (!editData.location.trim()) {
      newErrors.location =
        "Location is required.";
    }

    /* ABOUT */
   const aboutCharacterCount =
  editData.about.length;

if (!editData.about.trim()) {
  newErrors.about =
    "About Me is required.";
} else if (aboutCharacterCount > 500) {
  newErrors.about =
    "About Me cannot exceed 500 characters.";
}

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  /* =========================
     SAVE PROFILE
  ========================= */

  const handleSave = (event) => {
    event.preventDefault();

    const isValid = validateProfile();

    if (!isValid) {
      return;
    }

    setProfile({
      ...editData,
      initials: editData.name
        ? editData.name.charAt(0).toUpperCase()
        : "Y",
    });

    setErrors({});
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
              Edit Profile
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

                {errors.name && (
                  <small className="profile-error">
                    {errors.name}
                  </small>
                )}

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

                {errors.college && (
                  <small className="profile-error">
                    {errors.college}
                  </small>
                )}

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

                  <option value="Computer Science and Engineering">
                    Computer Science and Engineering
                  </option>

                  <option value="Information Technology">
                    Information Technology
                  </option>

                  <option value="Electronics and Communication Engineering">
                    Electronics and Communication Engineering
                  </option>

                  <option value="Electrical and Electronics Engineering">
                    Electrical and Electronics Engineering
                  </option>

                  <option value="Mechanical Engineering">
                    Mechanical Engineering
                  </option>

                  <option value="Civil Engineering">
                    Civil Engineering
                  </option>

                  <option value="Artificial Intelligence and Data Science">
                    Artificial Intelligence and Data Science
                  </option>

                  <option value="Artificial Intelligence and Machine Learning">
                    Artificial Intelligence and Machine Learning
                  </option>

                  <option value="Cyber Security">
                    Cyber Security
                  </option>

                  <option value="EIE">
                    EIE
                  </option>

                  <option value="IBT">
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
    inputMode="numeric"
    value={editData.registerNumber}
    onChange={(event) => {
      const value = event.target.value;

      if (/^\d*$/.test(value)) {
        setEditData((previous) => ({
          ...previous,
          registerNumber: value,
        }));

        setErrors((previous) => ({
          ...previous,
          registerNumber: "",
        }));
      } else {
        setErrors((previous) => ({
          ...previous,
          registerNumber: "Register number must contain numbers only.",
        }));
      }
    }}
    placeholder="Enter register number"
  />

  {errors.registerNumber && (
    <small className="profile-error">
      {errors.registerNumber}
    </small>
  )}

</div>

              {/* PHONE */}

              <div className="edit-form-group">

                <label htmlFor="phone">
                  Phone Number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={editData.phone}
                  onChange={handleChange}
                  placeholder="Enter 10-digit phone number"
                  maxLength="10"
                />

                {errors.phone && (
                  <small className="profile-error">
                    {errors.phone}
                  </small>
                )}

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

                {errors.location && (
                  <small className="profile-error">
                    {errors.location}
                  </small>
                )}

              </div>

            </div>


            {/* =========================
                ABOUT ME
            ========================= */}

            <div className="edit-form-group">

              <div className="about-label-row">

                <label htmlFor="about">
                  About Me
                </label>

              <span className="word-counter">
  {getCharacterCount(editData.about)} / 500 characters
</span>

              </div>

              <textarea
                id="about"
                name="about"
                value={editData.about}
                onChange={handleChange}
                placeholder="Tell people about yourself..."
                rows="5"
              />

              {errors.about && (
                <small className="profile-error">
                  {errors.about}
                </small>
              )}

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

              <div className="profile-left-column">

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


              <div className="profile-right-column">

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

                    <div className="information-item">
                      <span>Phone</span>
                      <strong>
                        {profile.phone || "Not added"}
                      </strong>
                    </div>

                  </div>

                </section>


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