import { Link } from "react-router-dom";
import "./Login.css";

function Login() {
  return (
    <main className="login-page">

      <div className="login-container">

        {/* Left Side */}
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


        {/* Right Side */}
        <section className="login-card">

          <div className="login-heading">

            <h2>
              Welcome back
            </h2>

            <p>
              Login to your SkillSwap account
            </p>

          </div>


          <form className="login-form">

            {/* Email */}

            <div className="form-group">

              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
              />

            </div>


            {/* Password */}

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
                type="password"
                placeholder="Enter your password"
              />

            </div>


            {/* Login Button */}

            <button
              type="submit"
              className="login-submit"
            >
              Login
            </button>

          </form>


          {/* Sign Up */}

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