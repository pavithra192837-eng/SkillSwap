import "./Home.css";

function Home() {
  return (
    <div className="home">

      {/* Hero Section */}
      <section className="hero">

        <div className="hero-content">
          <p className="hero-tag">
            ✦ Learn. Teach. Exchange.
          </p>

          <h1>
            Your Skills Are
            <span> Worth Sharing.</span>
          </h1>

          <p className="hero-description">
            SkillSwap connects people who want to learn
            with people who have the skills to teach.
            Exchange knowledge, grow together, and build
            meaningful connections.
          </p>

          <div className="hero-buttons">
            <a href="/register" className="primary-btn">
              Find Your Skill Partner →
            </a>

            <a href="#how-it-works" className="secondary-btn">
              How It Works
            </a>
          </div>

          <div className="hero-stats">
            <div>
              <strong>100+</strong>
              <span>Skills</span>
            </div>

            <div>
              <strong>500+</strong>
              <span>Learners</span>
            </div>

            <div>
              <strong>250+</strong>
              <span>Skill Matches</span>
            </div>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="hero-visual">

          <div className="floating-card card-one">
            <span>💻</span>
            <div>
              <strong>Python</strong>
              <small>Can teach</small>
            </div>
          </div>

          <div className="exchange-circle">
            ⇄
          </div>

          <div className="floating-card card-two">
            <span>🎨</span>
            <div>
              <strong>UI/UX Design</strong>
              <small>Wants to learn</small>
            </div>
          </div>

          <div className="match-badge">
            ✨ 92% Match
          </div>

        </div>

      </section>


      {/* How It Works */}
      <section className="how-section" id="how-it-works">

        <div className="section-heading">
          <p>HOW IT WORKS</p>

          <h2>
            Turn What You Know
            <span> Into What You Need.</span>
          </h2>

          <div className="heading-line"></div>
        </div>

        <div className="steps">

          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon">🧠</div>

            <h3>Add Your Skills</h3>

            <p>
              Tell us what you can teach and
              what you want to learn.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon">🤝</div>

            <h3>Find Your Match</h3>

            <p>
              Our matching system finds people
              whose skills complement yours.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon">🚀</div>

            <h3>Start Exchanging</h3>

            <p>
              Connect, chat, schedule a session,
              and exchange knowledge.
            </p>
          </div>

        </div>

      </section>


      {/* Explore Skills */}
      <section className="skills-section" id="skills">

        <div className="section-heading">
          <p>EXPLORE</p>

          <h2>
            Discover Skills.
            <span> Discover People.</span>
          </h2>
        </div>

        <div className="skill-grid">

          <div className="skill-card">
            <span>💻</span>
            <h3>Programming</h3>
            <p>Python · Java · C++ · React</p>
          </div>

          <div className="skill-card">
            <span>🎨</span>
            <h3>Design</h3>
            <p>UI/UX · Figma · Graphic Design</p>
          </div>

          <div className="skill-card">
            <span>🎬</span>
            <h3>Video Editing</h3>
            <p>Premiere Pro · CapCut · DaVinci</p>
          </div>

          <div className="skill-card">
            <span>🌎</span>
            <h3>Languages</h3>
            <p>English · Tamil · Hindi · More</p>
          </div>

        </div>

      </section>


      {/* Final CTA */}
      <section className="cta-section">

        <h2>
          Have a Skill?
          <span> Share It.</span>
        </h2>

        <p>
          Someone out there is looking for exactly
          what you know.
        </p>

        <a href="/register" className="primary-btn">
          Join SkillSwap →
        </a>

      </section>

    </div>
  );
}

export default Home;