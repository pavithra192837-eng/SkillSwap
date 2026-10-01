import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const departments = [
    "CSE",
    "IT",
    "ECE",
    "EEE",
    "ME",
    "CE",
    "AI & DS",
    "AI & ML",
    "Cyber Security",
    "CSBS",
    "CSD",
    "EIE",
    "BME",
    "BT",
    "IBT",
    "Chemical",
    "Aeronautical",
    "Aerospace",
    "Automobile",
    "Mechatronics",
    "Robotics & Automation",
    "Industrial",
    "Manufacturing",
    "Production",
    "Instrumentation & Control",
    "Environmental",
    "Agricultural",
  ];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    regNo: "",
    department: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    /* =========================
       NAME
    ========================= */

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required.";
    } else if (!/^[A-Za-z ]+$/.test(formData.name.trim())) {
      newErrors.name =
        "Name can contain only letters and spaces.";
    } else if (formData.name.trim().length < 3) {
      newErrors.name =
        "Name must contain at least 3 characters.";
    }

    /* =========================
       EMAIL
    ========================= */

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim()
      )
    ) {
      newErrors.email =
        "Please enter a valid email address.";
    }

    /* =========================
       PHONE
    ========================= */

    if (!formData.phone.trim()) {
      newErrors.phone =
        "Phone number is required.";
    } else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone =
        "Phone number must contain only digits.";
    } else if (formData.phone.length !== 10) {
      newErrors.phone =
        "Phone number must contain exactly 10 digits.";
    }

    /* =========================
       COLLEGE
    ========================= */

    if (!formData.college.trim()) {
      newErrors.college =
        "College name is required.";
    } else if (formData.college.trim().length < 3) {
      newErrors.college =
        "Please enter a valid college name.";
    }

    /* =========================
       REGISTER NUMBER
    ========================= */

    if (!formData.regNo.trim()) {
      newErrors.regNo =
        "Register number is required.";
    } else if (
      !/^[A-Za-z0-9]+$/.test(formData.regNo.trim())
    ) {
      newErrors.regNo =
        "Register number can contain only letters and numbers.";
    }

    /* =========================
       DEPARTMENT
    ========================= */

    if (!formData.department) {
      newErrors.department =
        "Please select your department.";
    }

    /* =========================
       PASSWORD
    ========================= */

    if (!formData.password) {
      newErrors.password =
        "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password =
        "Password must contain at least 8 characters.";
    } else if (
      !/[A-Z]/.test(formData.password)
    ) {
      newErrors.password =
        "Password must contain at least one uppercase letter.";
    } else if (
      !/[a-z]/.test(formData.password)
    ) {
      newErrors.password =
        "Password must contain at least one lowercase letter.";
    } else if (
      !/[0-9]/.test(formData.password)
    ) {
      newErrors.password =
        "Password must contain at least one number.";
    }

    /* =========================
       CONFIRM PASSWORD
    ========================= */

    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password.";
    } else if (
      formData.password !==
      formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    /*
      FRONTEND DEMO

      Backend/Firebase authentication will be
      connected later.

      For now, successful validation
      redirects the user to Login.
    */

    navigate("/login");
  };

  return (
    <main className="register-page">

      <div className="register-container">

        {/* LEFT SECTION */}

        <section className="register-info">

          <Link
            to="/"
            className="register-logo"
          >
            Skill<span>Swap</span>
          </Link>

          <div className="register-info-content">

            <p className="register-label">
              JOIN SKILLSWAP
            </p>

            <h1>
              Learn.
              <br />
              Teach.
              <br />
              <span>Grow together.</span>
            </h1>

            <p>
              Create your SkillSwap account and
              connect with students who want to
              learn and share their skills.
            </p>

            <div className="register-benefits">

              <div>
                <span>✓</span>
                <p>
                  Discover people with complementary
                  skills
                </p>
              </div>

              <div>
                <span>✓</span>
                <p>
                  Exchange knowledge and learn together
                </p>
              </div>

              <div>
                <span>✓</span>
                <p>
                  Build your skills and reputation
                </p>
              </div>

            </div>

          </div>

        </section>


        {/* FORM SECTION */}

        <section className="register-card">

          <div className="register-heading">

            <h2>
              Create your account
            </h2>

            <p>
              Fill in your details to get started
            </p>

          </div>


          <form
            className="register-form"
            onSubmit={handleSubmit}
            noValidate
          >

            {/* NAME */}

            <div className="register-form-group">

              <label htmlFor="name">
                Full Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className={
                  errors.name
                    ? "register-input-error"
                    : ""
                }
              />

              {errors.name && (
                <small className="register-field-error">
                  {errors.name}
                </small>
              )}

            </div>


            {/* EMAIL */}

            <div className="register-form-group">

              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className={
                  errors.email
                    ? "register-input-error"
                    : ""
                }
              />

              {errors.email && (
                <small className="register-field-error">
                  {errors.email}
                </small>
              )}

            </div>


            {/* PHONE */}

            <div className="register-form-group">

              <label htmlFor="phone">
                Phone Number
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                maxLength="10"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                className={
                  errors.phone
                    ? "register-input-error"
                    : ""
                }
              />

              {errors.phone && (
                <small className="register-field-error">
                  {errors.phone}
                </small>
              )}

            </div>


            {/* COLLEGE */}

            <div className="register-form-group">

              <label htmlFor="college">
                College
              </label>

              <input
                id="college"
                name="college"
                type="text"
                placeholder="Enter your college name"
                value={formData.college}
                onChange={handleChange}
                className={
                  errors.college
                    ? "register-input-error"
                    : ""
                }
              />

              {errors.college && (
                <small className="register-field-error">
                  {errors.college}
                </small>
              )}

            </div>


            {/* REGISTER NUMBER */}

            {/* Register Number */}
<div className="register-form-group">
  <label htmlFor="regNo">Register Number</label>

  <input
    id="regNo"
    name="regNo"
    type="text"
    inputMode="numeric"
    pattern="[0-9]*"
    value={formData.regNo}
    onChange={(e) => {
      const value = e.target.value;

      if (/^\d*$/.test(value)) {
        setFormData({
          ...formData,
          regNo: value,
        });
      }
    }}
    placeholder="Enter your register number"
  />
</div>


            {/* DEPARTMENT */}

            <div className="register-form-group">

              <label htmlFor="department">
                Department
              </label>

              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={
                  errors.department
                    ? "register-input-error"
                    : ""
                }
              >

                <option value="" disabled>
                  Select your department
                </option>

                {departments.map(
                  (department) => (
                    <option
                      key={department}
                      value={department}
                    >
                      {department}
                    </option>
                  )
                )}

              </select>

              {errors.department && (
                <small className="register-field-error">
                  {errors.department}
                </small>
              )}

            </div>


            {/* PASSWORD */}

            <div className="register-form-group">

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                className={
                  errors.password
                    ? "register-input-error"
                    : ""
                }
              />

              {errors.password && (
                <small className="register-field-error">
                  {errors.password}
                </small>
              )}

            </div>


            {/* CONFIRM PASSWORD */}

            <div className="register-form-group">

              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={
                  errors.confirmPassword
                    ? "register-input-error"
                    : ""
                }
              />

              {errors.confirmPassword && (
                <small className="register-field-error">
                  {errors.confirmPassword}
                </small>
              )}

            </div>


            {/* SUBMIT */}

            <button
              type="submit"
              className="register-submit"
            >
              Create Account
            </button>

          </form>


          {/* LOGIN */}

          <div className="register-login">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Login
            </Link>

          </div>

        </section>

      </div>

    </main>
  );
}

export default Register;