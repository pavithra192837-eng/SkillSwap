import { Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Explore from "./pages/Explore";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Matches from "./pages/Matches";
import Requests from "./pages/Requests";
import Sessions from "./pages/Sessions";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import Call from "./pages/Call";
import Notifications from "./pages/Notifications";
function Home() {
  const navigate = useNavigate();

  const scrollToExplore = () => {
    const section = document.getElementById("explore");

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <main className="home">

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content">

          <p className="hero-label">
            SKILL EXCHANGE PLATFORM
          </p>

          <h1>
            Exchange Skills.
            <br />
            <span>Grow Together.</span>
          </h1>

          <p className="hero-text">
            SkillSwap connects students who want to learn new skills
            with people who are ready to share what they already know.
          </p>

          <div className="hero-actions">

            <button
              className="primary-button"
              onClick={() => navigate("/login")}
            >
              Find Your Match
            </button>

            <button
              className="secondary-button"
              onClick={scrollToExplore}
            >
              Explore Skills
            </button>

          </div>

          <div className="hero-stats">

            <div>
              <strong>1000+</strong>
              <span>Learners</span>
            </div>

            <div>
              <strong>500+</strong>
              <span>Skills</span>
            </div>

            <div>
              <strong>50+</strong>
              <span>Skill Categories</span>
            </div>

          </div>

        </div>

        {/* HERO VISUAL */}
        <div className="hero-visual">

          <div className="match-card">

            <div className="match-header">
              <span>Skill Match</span>

              <span className="match-status">
                ● 92% Match
              </span>
            </div>

            <div className="person-card">

              <div className="avatar">
                A
              </div>

              <div className="person-info">
                <h3>Arun Kumar</h3>
                <p>Computer Science</p>
              </div>

            </div>

            {/* DO NOT PUT id="explore" HERE */}
            <div className="skill-section">

              <div className="skill-column">
                <span>You can teach</span>

                <div className="skill-tag">
                  Python
                </div>

                <div className="skill-tag">
                  C++
                </div>
              </div>

              <div className="exchange-icon">
                ⇄
              </div>

              <div className="skill-column">
                <span>You want to learn</span>

                <div className="skill-tag">
                  UI/UX
                </div>

                <div className="skill-tag">
                  Figma
                </div>
              </div>

            </div>

            <button
              className="match-button"
              onClick={() => navigate("/login")}
            >
              View Match
            </button>

          </div>

          <div className="floating-skill skill-one">
            Python
          </div>

          <div className="floating-skill skill-two">
            UI/UX Design
          </div>

          <div className="floating-skill skill-three">
            JavaScript
          </div>

        </div>

      </section>


      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="how-section"
      >

        <div className="section-heading">

          <p className="section-label">
            HOW IT WORKS
          </p>

          <h2>
            Learn. Teach. Exchange.
          </h2>

          <p>
            SkillSwap makes it simple to exchange knowledge
            with people who have complementary skills.
          </p>

        </div>

        <div className="steps">

          <div className="step-card">

            <div className="step-number">
              01
            </div>

            <h3>
              Choose Your Skills
            </h3>

            <p>
              Tell us what skills you already know
              and what you want to learn.
            </p>

          </div>

          <div className="step-card">

            <div className="step-number">
              02
            </div>

            <h3>
              Find Your Match
            </h3>

            <p>
              Our matching system helps you discover
              people with complementary skills.
            </p>

          </div>

          <div className="step-card">

            <div className="step-number">
              03
            </div>

            <h3>
              Exchange Knowledge
            </h3>

            <p>
              Connect, learn, teach and grow together
              through skill exchange.
            </p>

          </div>

        </div>

      </section>


      {/* POPULAR SKILLS */}
      <section
        id="explore"
        className="skills-section"
      >

        <div className="section-heading">

          <p className="section-label">
            EXPLORE SKILLS
          </p>

          <h2>
            Skills people are exchanging
          </h2>

          <p>
            Discover popular skills and find someone
            who can help you learn them.
          </p>

        </div>

        <div className="skills-grid">

          <div className="skill-card">
            <span>Programming</span>
            <small>120+ learners</small>
          </div>

          <div className="skill-card">
            <span>UI / UX Design</span>
            <small>90+ learners</small>
          </div>

          <div className="skill-card">
            <span>Data Science</span>
            <small>75+ learners</small>
          </div>

          <div className="skill-card">
            <span>Digital Marketing</span>
            <small>60+ learners</small>
          </div>

          <div className="skill-card">
            <span>Video Editing</span>
            <small>55+ learners</small>
          </div>

          <div className="skill-card">
            <span>Communication</span>
            <small>100+ learners</small>
          </div>

        </div>

      </section>


      {/* WHY SKILLSWAP */}
      <section className="why-section">

        <div className="why-content">

          <p className="section-label">
            WHY SKILLSWAP
          </p>

          <h2>
            More than learning.
            <br />
            It's skill exchange.
          </h2>

          <p>
            SkillSwap creates a community where everyone
            can be both a learner and a teacher.
          </p>

        </div>

        <div className="features">

          <div className="feature">
            <h3>AI Skill Matching</h3>

            <p>
              Discover people whose skills match
              what you want to learn.
            </p>
          </div>

          <div className="feature">
            <h3>Learning Roadmaps</h3>

            <p>
              Follow personalized roadmaps to
              improve your skills.
            </p>
          </div>

          <div className="feature">
            <h3>Skill Points</h3>

            <p>
              Build your reputation by teaching
              and helping others.
            </p>
          </div>

          <div className="feature">
            <h3>Real Connections</h3>

            <p>
              Learn directly from students and
              creators in your community.
            </p>
          </div>

        </div>

      </section>


      {/* FINAL CTA */}
      <section className="cta-section">

        <h2>
          Ready to exchange your skills?
        </h2>

        <p>
          Join SkillSwap and start learning from
          people around you.
        </p>

        <button
          className="cta-button"
          onClick={() => navigate("/register")}
        >
          Get Started
        </button>

      </section>


      {/* FOOTER */}
      <footer className="footer">

        <div>

          <h3>
            Skill<span>Swap</span>
          </h3>

          <p>
            Learn. Teach. Grow together.
          </p>

        </div>

        <p>
          © 2026 SkillSwap. All rights reserved.
        </p>

      </footer>

    </main>
  );
}


function App() {
  return (
    <>
      <Navbar />

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />
        <Route
  path="/explore"
  element={<Explore />}
/>
    <Route
  path="/dashboard"
  element={<Dashboard />}
/>
<Route
  path="/profile"
  element={<Profile />}
/>
<Route path="/matches" element={<Matches />} />
<Route path="/requests" element={<Requests />} />
      
      <Route path="/sessions" element={<Sessions />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/voice-call" element={<Call />} />
      <Route path="/video-call" element={<Call />} />
      <Route
  path="/notifications"
  element={<Notifications />}
/>

      </Routes>
    </>
    
    
  );
}

export default App;