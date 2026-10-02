import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Remove error while typing
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setLoginError("");
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must contain at least 6 characters.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setLoginError("");

    if (!validateForm()) {
      return;
    }

    /*
      FRONTEND DEMO LOGIN

      At this stage there is no backend/Firebase authentication connected.
      So we only validate the form and continue to the dashboard.

      Later this section will be replaced with:
      API/Firebase authentication.
    */

    navigate("/dashboard");
  };

  return (
    <main className="login-page">

      <div className="login-container">

        {/* LEFT SIDE */}
        <section className="login-info">

          <Link to="/" className="login-logo">
            Skill<span>Swap</span>
          </Link>

          <div className="login-info-content">

            <p className="login-label">
              WELCOME BACK
            </p>

            <h1>
              Continue your
              <span> skill journey.</span>
            </h1>

            <p>
              Connect with learners, share your knowledge,
              and continue growing with the SkillSwap community.
            </p>

          </div>

        </section>


        {/* RIGHT SIDE */}
        <section className="login-card">

          <div className="login-heading">

            <h2>
              Welcome back
            </h2>

            <p>
              Login to your SkillSwap account
            </p>

          </div>


          {/* GENERAL LOGIN ERROR */}

          {loginError && (
            <div className="login-error-message">
              {loginError}
            </div>
          )}


          <form
            className="login-form"
            onSubmit={handleSubmit}
            noValidate
          >

            {/* EMAIL */}

            <div className="form-group">

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
                className={errors.email ? "input-error" : ""}
              />

              {errors.email && (
                <small className="field-error">
                  {errors.email}
                </small>
              )}

            </div>


            {/* PASSWORD */}

            <div className="form-group">

              <div className="password-label">

                <label htmlFor="password">
                  Password
                </label>

                <Link to="/forgot-password">
                  Forgot password?
                </Link>

              </div>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
              />

              {errors.password && (
                <small className="field-error">
                  {errors.password}
                </small>
              )}

            </div>


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="login-submit"
            >
              Login
            </button>

          </form>


          {/* SIGN UP */}

          <div className="login-register">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Sign Up
            </Link>

          </div>

        </section>

      </div>

    </main>
  );
}

export default Login;