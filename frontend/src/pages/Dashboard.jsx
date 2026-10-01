// import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const matches = [
    {
      name: "Arun Kumar",
      department: "Computer Science",
      teaches: "Python",
      wants: "UI/UX Design",
      match: "92%",
      avatar: "A",
    },
    {
      name: "Priya Sharma",
      department: "Information Technology",
      teaches: "Figma",
      wants: "JavaScript",
      match: "88%",
      avatar: "P",
    },
    {
      name: "Rahul Raj",
      department: "ECE",
      teaches: "React",
      wants: "Data Science",
      match: "84%",
      avatar: "R",
    },
  ];

  const activities = [
    {
      title: "New skill match found",
      description: "You matched with Arun Kumar",
      time: "10 min ago",
    },
    {
      title: "Profile updated",
      description: "You added UI/UX Design",
      time: "2 hours ago",
    },
    {
      title: "Session completed",
      description: "Python learning session completed",
      time: "Yesterday",
    },
  ];

  return (
    <main className="dashboard-page">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="dashboard-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside
        className={`dashboard-sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >

        <div className="dashboard-logo">
          Skill<span>Swap</span>
        </div>

        <div className="sidebar-profile">

          <div className="sidebar-avatar">
            Y
          </div>

          <div>
            <h3>Yuvarani</h3>
            <p>ECE Student</p>
          </div>

        </div>

        <nav className="dashboard-nav">

          {/* DASHBOARD */}
          <Link
            to="/dashboard"
            className="dashboard-nav-item active"
            onClick={() => setSidebarOpen(false)}
          >
            <span>⌂</span>
            Dashboard
          </Link>

          {/* PROFILE */}
          <Link
            to="/profile"
            className="dashboard-nav-item"
            onClick={() => setSidebarOpen(false)}
          >
            <span>◯</span>
            Profile
          </Link>

          {/* EXPLORE */}
          <Link
            to="/explore"
            className="dashboard-nav-item"
            onClick={() => setSidebarOpen(false)}
          >
            <span>⌕</span>
            Explore Skills
          </Link>

          {/* MATCHES */}
          <Link
            to="/matches"
            className="dashboard-nav-item"
            onClick={() => setSidebarOpen(false)}
          >
            <span>✦</span>
            Matches
          </Link>

          {/* REQUESTS */}
          <Link
            to="/requests"
            className="dashboard-nav-item"
            onClick={() => setSidebarOpen(false)}
          >
            <span>...</span>
            Requests
          </Link>

          {/* SESSIONS */}
          <Link
            to="/sessions"
            className="dashboard-nav-item"
            onClick={() => setSidebarOpen(false)}
          >
            <span>▣</span>
            Sessions
          </Link>
          <Link
  to="/messages"
  className="dashboard-nav-item"
  onClick={() => setSidebarOpen(false)}
>
  <span>◌</span>
  Messages
</Link>


          

          {/* NOTIFICATIONS */}
          <Link
  to="/notifications"
  className="dashboard-nav-item"
  onClick={() => setSidebarOpen(false)}
>
  <span>◉</span>
  Notifications
</Link>

        </nav>

        {/* SIDEBAR BOTTOM */}
        <div className="sidebar-bottom">

          <Link
  to="/settings"
  className="dashboard-nav-item"
  onClick={() => setSidebarOpen(false)}
>
  <span>⚙</span>
  Settings
</Link>

          <Link
            to="/"
            className="dashboard-nav-item logout-item"
          >
            <span>↪</span>
            Logout
          </Link>

        </div>

      </aside>

      {/* MAIN AREA */}
      <div className="dashboard-main">

        {/* TOPBAR */}
        <header className="dashboard-topbar">

          <button
            className="dashboard-menu-button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>

          <div className="dashboard-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search skills, people..."
            />
          </div>

          <div className="dashboard-top-actions">

            <button className="notification-button">
              ♢
              <span></span>
            </button>

            <div className="topbar-user">

              <div className="topbar-avatar">
                Y
              </div>

              <div>
                <strong>Yuvarani</strong>
                <small>ECE</small>
              </div>

            </div>

          </div>

        </header>

        {/* DASHBOARD CONTENT */}
        <div className="dashboard-content">

          {/* WELCOME */}
          <section className="dashboard-welcome">

            <div>
              <p className="dashboard-label">
                YOUR DASHBOARD
              </p>

              <h1>
                Welcome back, Yuvarani 👋
              </h1>

              <p>
                Continue learning, sharing and connecting
                with your SkillSwap community.
              </p>
            </div>

            <Link
              to="/explore"
              className="dashboard-primary-button"
            >
              Find Skills
            </Link>

          </section>

          {/* STATS */}
          <section className="dashboard-stats">

            <div className="dashboard-stat-card">

              <div className="stat-icon blue">
                ✦
              </div>

              <div>
                <span>Skill Points</span>
                <strong>245</strong>
              </div>

            </div>

            <div className="dashboard-stat-card">

              <div className="stat-icon cyan">
                ⇄
              </div>

              <div>
                <span>Skill Matches</span>
                <strong>18</strong>
              </div>

            </div>

            <div className="dashboard-stat-card">

              <div className="stat-icon green">
                ✓
              </div>

              <div>
                <span>Sessions</span>
                <strong>12</strong>
              </div>

            </div>

            <div className="dashboard-stat-card">

              <div className="stat-icon purple">
                ★
              </div>

              <div>
                <span>Rating</span>
                <strong>4.8</strong>
              </div>

            </div>

          </section>

          {/* MAIN GRID */}
          <div className="dashboard-grid">

            {/* MATCHES */}
            <section className="dashboard-panel matches-panel">

              <div className="panel-header">

                <div>
                  <p className="panel-label">
                    DISCOVER
                  </p>

                  <h2>
                    Suggested Matches
                  </h2>
                </div>

                <Link to="/matches">
                  View all →
                </Link>

              </div>

              <div className="matches-list">

                {matches.map((match) => (

                  <div
                    className="match-item"
                    key={match.name}
                  >

                    <div className="match-person">

                      <div className="match-avatar">
                        {match.avatar}
                      </div>

                      <div>
                        <h3>{match.name}</h3>
                        <p>{match.department}</p>
                      </div>

                    </div>

                    <div className="match-skills">

                      <span>
                        Teaches: <strong>{match.teaches}</strong>
                      </span>

                      <span>
                        Wants: <strong>{match.wants}</strong>
                      </span>

                    </div>

                    <div className="match-score">
                      <strong>{match.match}</strong>
                      <span>Match</span>
                    </div>

                    <button className="match-connect">
                      Connect
                    </button>

                  </div>

                ))}

              </div>

            </section>

            {/* SKILLS */}
            <section className="dashboard-panel skills-panel">

              <div className="panel-header">

                <div>
                  <p className="panel-label">
                    YOUR SKILLS
                  </p>

                  <h2>
                    Skills
                  </h2>
                </div>

                <button>
                  Edit
                </button>

              </div>

              <div className="skill-group">

                <span className="skill-group-label">
                  I can teach
                </span>

                <div className="dashboard-skill-tags">

                  <span>Python</span>
                  <span>C++</span>
                  <span>HTML</span>
                  <span>CSS</span>

                </div>

              </div>

              <div className="skill-group">

                <span className="skill-group-label">
                  I want to learn
                </span>

                <div className="dashboard-skill-tags learning">

                  <span>UI/UX</span>
                  <span>React</span>
                  <span>Figma</span>
                  <span>JavaScript</span>

                </div>

              </div>

            </section>

            {/* REQUESTS */}
            <section className="dashboard-panel requests-panel">

              <div className="panel-header">

                <div>
                  <p className="panel-label">
                    ACTIVITY
                  </p>

                  <h2>
                    Requests
                  </h2>
                </div>

                <Link to="/requests">
                  View all →
                </Link>

              </div>

              <div className="request-card">

                <div className="request-avatar">
                  A
                </div>

                <div className="request-info">

                  <h3>Arun Kumar</h3>

                  <p>
                    Wants to learn Python from you
                  </p>

                  <small>
                    15 minutes ago
                  </small>

                </div>

                <div className="request-actions">

                  <button className="accept-button">
                    Accept
                  </button>

                  <button className="reject-button">
                    Decline
                  </button>

                </div>

              </div>

              <div className="request-card">

                <div className="request-avatar">
                  P
                </div>

                <div className="request-info">

                  <h3>Priya Sharma</h3>

                  <p>
                    Wants to exchange Figma ↔ JavaScript
                  </p>

                  <small>
                    2 hours ago
                  </small>

                </div>

                <div className="request-actions">

                  <button className="accept-button">
                    Accept
                  </button>

                  <button className="reject-button">
                    Decline
                  </button>

                </div>

              </div>

            </section>

            {/* UPCOMING SESSION */}
            <section className="dashboard-panel session-panel">

              <div className="panel-header">

                <div>
                  <p className="panel-label">
                    YOUR SCHEDULE
                  </p>

                  <h2>
                    Upcoming Session
                  </h2>
                </div>

                <Link to="/sessions">
                  View all →
                </Link>

              </div>

              <div className="session-card">

                <div className="session-date">
                  <strong>28</strong>
                  <span>SEP</span>
                </div>

                <div className="session-info">

                  <h3>
                    Python Basics
                  </h3>

                  <p>
                    With Arun Kumar
                  </p>

                  <span>
                    6:00 PM – 7:00 PM
                  </span>

                </div>

                <Link to="/sessions">
                  Join
                </Link>

              </div>

            </section>

          </div>

          {/* RECENT ACTIVITY */}
          <section className="dashboard-panel activity-panel">

            <div className="panel-header">

              <div>
                <p className="panel-label">
                  RECENT
                </p>

                <h2>
                  Recent Activity
                </h2>
              </div>

              <button>
                View all →
              </button>

            </div>

            <div className="activity-list">

              {activities.map((activity) => (

                <div
                  className="activity-item"
                  key={activity.title}
                >

                  <div className="activity-dot"></div>

                  <div>
                    <h3>{activity.title}</h3>
                    <p>{activity.description}</p>
                  </div>

                  <span>
                    {activity.time}
                  </span>

                </div>

              ))}

            </div>

          </section>

        </div>

      </div>

    </main>
  );
}

export default Dashboard;