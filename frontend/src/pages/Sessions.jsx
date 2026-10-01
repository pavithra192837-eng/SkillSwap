import { useState } from "react";
import "./Session.css";

const initialSessions = [
  {
    id: 1,
    partner: "Arun Kumar",
    initials: "AK",
    teach: "JavaScript",
    learn: "UI/UX Design",
    date: "October 3, 2026",
    time: "10:00 AM - 11:00 AM",
    mode: "Online",
    status: "Upcoming",
  },
  {
    id: 2,
    partner: "Priya S",
    initials: "PS",
    teach: "React.js",
    learn: "Python",
    date: "October 5, 2026",
    time: "4:00 PM - 5:00 PM",
    mode: "Online",
    status: "Upcoming",
  },
  {
    id: 3,
    partner: "Rahul M",
    initials: "RM",
    teach: "Java",
    learn: "MongoDB",
    date: "September 25, 2026",
    time: "3:00 PM - 4:00 PM",
    mode: "Online",
    status: "Completed",
  },
  {
    id: 4,
    partner: "Divya R",
    initials: "DR",
    teach: "HTML & CSS",
    learn: "React.js",
    date: "September 20, 2026",
    time: "11:00 AM - 12:00 PM",
    mode: "Online",
    status: "Completed",
  },
];

function Sessions() {
  const [sessions, setSessions] = useState(initialSessions);
  const [activeTab, setActiveTab] = useState("upcoming");

  const upcomingSessions = sessions.filter(
    (session) => session.status === "Upcoming"
  );

  const completedSessions = sessions.filter(
    (session) => session.status === "Completed"
  );

  const displayedSessions =
    activeTab === "upcoming" ? upcomingSessions : completedSessions;

  const handleCancel = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this session?"
    );

    if (!confirmed) return;

    setSessions((currentSessions) =>
      currentSessions.filter((session) => session.id !== id)
    );
  };

  const handleJoin = (session) => {
    alert(`Joining session with ${session.partner}`);
  };

  return (
    <div className="sessions-page">
      {/* Header */}
      <div className="sessions-header">
        <div>
          <p className="sessions-label">SKILLSWAP</p>
          <h1>Sessions</h1>
          <p className="sessions-subtitle">
            Manage your skill exchange sessions and learning journey.
          </p>
        </div>

        <div className="session-count">
          <span>{upcomingSessions.length}</span>
          <small>Upcoming</small>
        </div>
      </div>

      {/* Tabs */}
      <div className="session-tabs">
        <button
          className={activeTab === "upcoming" ? "active" : ""}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming
          <span>{upcomingSessions.length}</span>
        </button>

        <button
          className={activeTab === "completed" ? "active" : ""}
          onClick={() => setActiveTab("completed")}
        >
          Completed
          <span>{completedSessions.length}</span>
        </button>
      </div>

      {/* Sessions */}
      <div className="sessions-list">
        {displayedSessions.length > 0 ? (
          displayedSessions.map((session) => (
            <div className="session-card" key={session.id}>
              {/* Partner */}
              <div className="session-partner">
                <div className="partner-avatar">{session.initials}</div>

                <div>
                  <h3>{session.partner}</h3>
                  <p>Skill Exchange Partner</p>
                </div>
              </div>

              {/* Exchange */}
              <div className="session-exchange">
                <div className="skill-box">
                  <span className="skill-label">YOU TEACH</span>
                  <strong>{session.teach}</strong>
                </div>

                <div className="exchange-icon">⇄</div>

                <div className="skill-box">
                  <span className="skill-label">YOU LEARN</span>
                  <strong>{session.learn}</strong>
                </div>
              </div>

              {/* Details */}
              <div className="session-details">
                <div className="detail-item">
                  <span className="detail-icon"></span>
                  <div>
                    <small>Date</small>
                    <p>{session.date}</p>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon"></span>
                  <div>
                    <small>Time</small>
                    <p>{session.time}</p>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon"></span>
                  <div>
                    <small>Mode</small>
                    <p>{session.mode}</p>
                  </div>
                </div>
              </div>

              {/* Status + Actions */}
              <div className="session-actions">
                <span
                  className={`session-status ${
                    session.status === "Upcoming"
                      ? "status-upcoming"
                      : "status-completed"
                  }`}
                >
                  {session.status}
                </span>

                {session.status === "Upcoming" && (
                  <div className="action-buttons">
                    <button
                      className="join-button"
                      onClick={() => handleJoin(session)}
                    >
                      Join Session
                    </button>

                    <button
                      className="cancel-button"
                      onClick={() => handleCancel(session.id)}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {session.status === "Completed" && (
                  <button className="view-button">View Details</button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-sessions">
            <div className="empty-icon"></div>
            <h3>No {activeTab} sessions</h3>
            <p>
              {activeTab === "upcoming"
                ? "Your upcoming skill exchange sessions will appear here."
                : "Your completed sessions will appear here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sessions;