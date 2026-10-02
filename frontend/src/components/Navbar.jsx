import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Go to Home page and then scroll to a section
  const goToSection = (sectionId) => {
    closeMenu();

    if (location.pathname === "/") {
      // Already on Home page
      const section = document.getElementById(sectionId);

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } else {
      // On Login/Register/etc.
      navigate(`/#${sectionId}`);
    }
  };

  // Go back to the top of Home
  const goToHome = () => {
    closeMenu();

    if (location.pathname === "/") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      navigate("/");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <button
          className="navbar-logo"
          onClick={goToHome}
        >
          Skill<span>Swap</span>
        </button>


        {/* Desktop Navigation */}
        <div className="desktop-nav">

          <button
            className="nav-link nav-button"
            onClick={goToHome}
          >
            Home
          </button>

          <button
            className="nav-link nav-button"
            onClick={() => goToSection("explore")}
          >
            Explore
          </button>

          <button
            className="nav-link nav-button"
            onClick={() => goToSection("how-it-works")}
          >
            How It Works
          </button>

        </div>


        {/* Desktop Login / Sign Up */}
        <div className="desktop-actions">

          <Link
            to="/login"
            className="login-btn"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="signup-btn"
          >
            Sign Up
          </Link>

        </div>


        {/* Mobile Menu Button */}
        <button
          className={`menu-button ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>


        {/* Mobile Navigation */}
        <div
          className={`mobile-menu ${
            menuOpen ? "open" : ""
          }`}
        >

          <button
            onClick={goToHome}
          >
            Home
          </button>

          <button
            onClick={() => goToSection("explore")}
          >
            Explore
          </button>

          <button
            onClick={() => goToSection("how-it-works")}
          >
            How It Works
          </button>

          <Link
            to="/login"
            onClick={closeMenu}
          >
            Login
          </Link>

          <Link
            to="/register"
            onClick={closeMenu}
          >
            Sign Up
          </Link>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;