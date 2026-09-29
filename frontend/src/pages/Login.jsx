import { Link } from "react-router-dom";
import "./Auth.css";

function Login() {
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
            Welcome
            <span> Back!</span>
          </h1>

          <p>
            Continue your skill-sharing journey.
            Find people to learn from and share what you know.
          </p>

          <div className="auth-highlight">
            <span>🤝</span>
            <div>
              <strong>Learn. Teach. Exchange.</strong>
              <small>Connect with the right skill partner.</small>
            </div>
          </div>

        </div>


        {/* Right Side */}
        <div className="auth-form">

          <h2>Sign in</h2>

          <p className="form-subtitle">
            Enter your details to continue
          </p>

          <form>

            <div className="input-group">
              <label>Email Address</label>

              <input
                type="email"
                placeholder="Enter your email"
              />
            </div>


            <div className="input-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
              />
            </div>


            <div className="form-options">

              <label className="remember">
                <input type="checkbox" />
                Remember me
              </label>

              <a href="#" className="forgot">
                Forgot password?
              </a>

            </div>


            <button type="submit" className="auth-button">
              Sign In →
            </button>

          </form>


          <div className="auth-divider">
            <span>or</span>
          </div>


          <p className="switch-auth">
            Don't have an account?

            <Link to="/register">
              Sign Up
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;