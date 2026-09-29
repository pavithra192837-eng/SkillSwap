import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      
      {/* Logo */}
      <Link to="/" className="logo">
        <span className="logo-icon">S</span>
        <span>Skill<span>Swap</span></span>
      </Link>

      {/* Navigation Links */}
      <div className="nav-links">
        <Link to="/" className="nav-link">
          Home
        </Link>

        <a href="#how-it-works" className="nav-link">
          How It Works
        </a>

        <a href="#skills" className="nav-link">
          Explore Skills
        </a>
      </div>

      {/* Authentication Buttons */}
      <div className="nav-buttons">
        <Link to="/login" className="login-btn">
          Login
        </Link>

        <Link to="/register" className="signup-btn">
          Sign Up
        </Link>
      </div>

    </nav>
  );
}

export default Navbar;