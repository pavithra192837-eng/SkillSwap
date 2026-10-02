import { useState } from "react";
import { Link } from "react-router-dom";
import "./Requests.css";

const receivedRequestsData = [
  {
    id: 1,
    name: "Arun Kumar",
    avatar: "A",
    department: "CSE",
    year: "3rd Year",
    teaches: "Python",
    wants: "UI/UX Design",
    message:
      "Hi! I can help you learn Python. I would love to learn UI/UX Design from you.",
  },
  {
    id: 2,
    name: "Priya Sharma",
    avatar: "P",
    department: "IT",
    year: "3rd Year",
    teaches: "Figma",
    wants: "JavaScript",
    message:
      "Hey! I am interested in exchanging Figma and JavaScript skills with you.",
  },
];

function Requests() {
  const [activeTab, setActiveTab] = useState("received");
  const [receivedRequests, setReceivedRequests] = useState(
    receivedRequestsData
  );

  const [sentRequests, setSentRequests] = useState(() => {
    const savedRequests = localStorage.getItem("skillswapRequests");

    return savedRequests ? JSON.parse(savedRequests) : [];
  });

  const handleAccept = (id) => {
    setReceivedRequests((currentRequests) =>
      currentRequests.filter((request) => request.id !== id)
    );
  };

  const handleDecline = (id) => {
    setReceivedRequests((currentRequests) =>
      currentRequests.filter((request) => request.id !== id)
    );
  };

  const handleCancel = (id) => {
    const updatedRequests = sentRequests.filter(
      (request) => request.id !== id
    );

    setSentRequests(updatedRequests);

    localStorage.setItem(
      "skillswapRequests",
      JSON.stringify(updatedRequests)
    );
  };

  return (
    <main className="requests-page">
      <div className="requests-container">

        {/* Header */}
        <section className="requests-header">
          <Link to="/dashboard" className="requests-back">
            ← Back to Dashboard
          </Link>

          <p className="requests-label">SKILLSWAP CONNECTIONS</p>

          <h1>
            Your <span>requests.</span>
          </h1>

          <p className="requests-description">
            Manage your skill exchange requests and connect with students
            who share your learning goals.
          </p>
        </section>

        {/* Tabs */}
        <section className="requests-tabs">
          <button
            className={activeTab === "received" ? "active" : ""}
            onClick={() => setActiveTab("received")}
          >
            Received
            <span>{receivedRequests.length}</span>
          </button>

          <button
            className={activeTab === "sent" ? "active" : ""}
            onClick={() => setActiveTab("sent")}
          >
            Sent
            <span>{sentRequests.length}</span>
          </button>
        </section>

        {/* Received Requests */}
        {activeTab === "received" && (
          <section className="request-section">

            <div className="request-section-heading">
              <div>
                <p>INCOMING</p>
                <h2>Received Requests</h2>
              </div>

              <span className="request-count">
                {receivedRequests.length} requests
              </span>
            </div>

            {receivedRequests.length > 0 ? (
              <div className="requests-list">

                {receivedRequests.map((request) => (
                  <article className="request-card" key={request.id}>

                    <div className="request-person">
                      <div className="request-avatar">
                        {request.avatar}
                      </div>

                      <div>
                        <h3>{request.name}</h3>
                        <p>
                          {request.department} · {request.year}
                        </p>
                      </div>
                    </div>

                    <div className="request-exchange">

                      <div>
                        <span>CAN TEACH</span>
                        <strong>{request.teaches}</strong>
                      </div>

                      <div className="request-arrow">
                        ⇄
                      </div>

                      <div>
                        <span>WANTS TO LEARN</span>
                        <strong>{request.wants}</strong>
                      </div>

                    </div>

                    <p className="request-message">
                      "{request.message}"
                    </p>

                    <div className="request-actions">

                      <button
                        className="accept-button"
                        onClick={() => handleAccept(request.id)}
                      >
                        ✓ Accept
                      </button>

                      <button
                        className="decline-button"
                        onClick={() => handleDecline(request.id)}
                      >
                        Decline
                      </button>

                    </div>

                  </article>
                ))}

              </div>
            ) : (
              <div className="requests-empty">
                <div className="empty-icon">✓</div>
                <h3>No pending requests</h3>
                <p>
                  You don't have any new connection requests right now.
                </p>
              </div>
            )}

          </section>
        )}

        {/* Sent Requests */}
        {activeTab === "sent" && (
          <section className="request-section">

            <div className="request-section-heading">
              <div>
                <p>OUTGOING</p>
                <h2>Sent Requests</h2>
              </div>

              <span className="request-count">
                {sentRequests.length} requests
              </span>
            </div>

            {sentRequests.length > 0 ? (
              <div className="requests-list">

                {sentRequests.map((request) => (
                  <article className="request-card" key={request.id}>

                    <div className="request-person">
                      <div className="request-avatar">
                        {request.avatar}
                      </div>

                      <div>
                        <h3>{request.name}</h3>
                        <p>
                          {request.department} · {request.year}
                        </p>
                      </div>
                    </div>

                    <div className="request-exchange">

                      <div>
                        <span>THEY TEACH</span>
                        <strong>{request.teaches}</strong>
                      </div>

                      <div className="request-arrow">
                        ⇄
                      </div>

                      <div>
                        <span>THEY WANT</span>
                        <strong>{request.wants}</strong>
                      </div>

                    </div>

                    <div className="sent-status">
                      <span className="pending-dot"></span>
                      Pending
                    </div>

                    <button
                      className="cancel-button"
                      onClick={() => handleCancel(request.id)}
                    >
                      Cancel Request
                    </button>

                  </article>
                ))}

              </div>
            ) : (
              <div className="requests-empty">
                <div className="empty-icon">↗</div>

                <h3>No sent requests</h3>

                <p>
                  Explore matches and connect with students who match
                  your skills.
                </p>

                <Link to="/matches" className="explore-matches-button">
                  Explore Matches
                </Link>
              </div>
            )}

          </section>
        )}

      </div>
    </main>
  );
}

export default Requests;