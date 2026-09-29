import { Link } from "react-router-dom";
import "./Auth.css";

function Register() {
  return (
    <div className="auth-page">

      <div className="auth-card">

        {/* Left Side */}
        <div className="auth-info">

          <div className="auth-logo">
            <span>S</span>
            SkillSwap
          </div>

          <h1>
            Join
            <span> SkillSwap!</span>
          </h1>

          <p>
            Create your account and start exchanging
            knowledge with people who want to learn
            what you know.
          </p>

          <div className="auth-highlight">
            <span>✨</span>
            <div>
              <strong>Share Your Skills</strong>
              <small>
                Teach what you know and learn something new.
              </small>
            </div>
          </div>

        </div>


        {/* Right Side */}
        <div className="auth-form">

          <h2>Create Account</h2>

          <p className="form-subtitle">
            Fill in your details to join SkillSwap
          </p>

          <form>

            {/* Name */}
            <div className="input-group">
              <label>Name</label>

              <input
                type="text"
                placeholder="Enter your full name"
              />
            </div>


            {/* Email */}
            <div className="input-group">
              <label>Email</label>

              <input
                type="email"
                placeholder="Enter your email"
              />
            </div>


            {/* Phone */}
            <div className="input-group">
              <label>Phone No</label>

              <input
                type="tel"
                placeholder="Enter your phone number"
              />
            </div>


            {/* College */}
            <div className="input-group">
              <label>College</label>

              <input
                type="text"
                placeholder="Enter your college name"
              />
            </div>


            {/* Registration Number */}
            <div className="input-group">
  <label>Department</label>

  <select defaultValue="">
    <option value="" disabled>
      Select your department
    </option>

    <option value="CSE">Computer Science and Engineering (CSE)</option>
    <option value="IT">Information Technology (IT)</option>
    <option value="ECE">Electronics and Communication Engineering (ECE)</option>
    <option value="EEE">Electrical and Electronics Engineering (EEE)</option>
    <option value="ME">Mechanical Engineering (ME)</option>
    <option value="CE">Civil Engineering (CE)</option>
    <option value="AI-DS">Artificial Intelligence and Data Science (AI & DS)</option>
    <option value="AI-ML">Artificial Intelligence and Machine Learning (AI & ML)</option>
    <option value="CS">Cyber Security (CS)</option>
    <option value="CSBS">Computer Science and Business Systems (CSBS)</option>
    <option value="CSD">Computer Science and Design (CSD)</option>
    <option value="EIE">Electronics and Instrumentation Engineering (EIE)</option>
    <option value="BME">Biomedical Engineering (BME)</option>
    <option value="BT">Biotechnology (BT)</option>
    <option value="IBT">Industrial Biotechnology (IBT)</option>
    <option value="CHEM">Chemical Engineering</option>
    <option value="AERO">Aeronautical Engineering</option>
    <option value="AEROSPACE">Aerospace Engineering</option>
    <option value="AUTO">Automobile Engineering</option>
    <option value="MECHATRONICS">Mechatronics Engineering</option>
    <option value="ROBOTICS">Robotics and Automation Engineering</option>
    <option value="INDUSTRIAL">Industrial Engineering</option>
    <option value="MANUFACTURING">Manufacturing Engineering</option>
    <option value="PRODUCTION">Production Engineering</option>
    <option value="ICE">Instrumentation and Control Engineering</option>
    <option value="ENVIRONMENTAL">Environmental Engineering</option>
    <option value="AGRICULTURAL">Agricultural Engineering</option>
    <option value="FOOD">Food Technology</option>
    <option value="PETROLEUM">Petroleum Engineering</option>
    <option value="MINING">Mining Engineering</option>
    <option value="METALLURGICAL">Metallurgical Engineering</option>
    <option value="MARINE">Marine Engineering</option>
    <option value="NAOE">Naval Architecture and Ocean Engineering</option>
    <option value="TEXTILE">Textile Technology</option>
    <option value="PRINTING">Printing Technology</option>
    <option value="ETE">Electronics and Telecommunication Engineering</option>
    <option value="ISE">Information Science and Engineering (ISE)</option>
    <option value="IOT">Internet of Things (IoT)</option>
    <option value="VLSI">VLSI Design and Technology</option>
    <option value="ECE-COMP">Electronics and Computer Engineering</option>
    <option value="COMPUTER">Computer Engineering</option>
  </select>
</div>


            {/* Password */}
            <div className="input-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="Create a password"
              />
            </div>


            {/* Register Button */}
            <button
              type="submit"
              className="auth-button"
            >
              Create Account →
            </button>

          </form>


          {/* Switch to Login */}
          <p className="switch-auth">
            Already have an account?

            <Link to="/login">
              Login
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;