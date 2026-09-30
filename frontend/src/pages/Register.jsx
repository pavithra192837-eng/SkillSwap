import { Link } from "react-router-dom";
import "./Register.css";

function Register() {
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

  return (
    <main className="register-page">
      <div className="register-container">

        {/* Left Section */}
        <section className="register-info">
          <Link to="/" className="register-logo">
            Skill<span>Swap</span>
          </Link>

          <div className="register-info-content">
            <p className="register-label">JOIN SKILLSWAP</p>

            <h1>
              Learn.
              <br />
              Teach.
              <br />
              <span>Grow together.</span>
            </h1>

            <p>
              Create your SkillSwap account and connect with
              students who want to learn and share their skills.
            </p>

            <div className="register-benefits">
              <div>
                <span>✓</span>
                <p>Discover people with complementary skills</p>
              </div>

              <div>
                <span>✓</span>
                <p>Exchange knowledge and learn together</p>
              </div>

              <div>
                <span>✓</span>
                <p>Build your skills and reputation</p>
              </div>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="register-card">

          <div className="register-heading">
            <h2>Create your account</h2>
            <p>Fill in your details to get started</p>
          </div>

          <form className="register-form">

            {/* Name */}
            <div className="register-form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div className="register-form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
              />
            </div>

            {/* Phone */}
            <div className="register-form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
              />
            </div>

            {/* College */}
            <div className="register-form-group">
              <label htmlFor="college">College</label>
              <input
                id="college"
                type="text"
                placeholder="Enter your college name"
              />
            </div>

            {/* Register Number */}
            <div className="register-form-group">
              <label htmlFor="regNo">Register Number</label>
              <input
                id="regNo"
                type="text"
                placeholder="Enter your register number"
              />
            </div>

            {/* Department */}
            <div className="register-form-group">
              <label htmlFor="department">Department</label>

              <select id="department" defaultValue="">
                <option value="" disabled>
                  Select your department
                </option>

                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div className="register-form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Create a password"
              />
            </div>

            {/* Confirm Password */}
            <div className="register-form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
              />
            </div>

            {/* Submit */}
            <button type="submit" className="register-submit">
              Create Account
            </button>

          </form>

          <div className="register-login">
            <span>Already have an account?</span>
            <Link to="/login">Login</Link>
          </div>

        </section>
      </div>
    </main>
  );
}

export default Register;