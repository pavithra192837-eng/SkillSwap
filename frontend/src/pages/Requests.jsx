import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Clock3, MessageCircle, CalendarDays, X, RefreshCw } from "lucide-react";
import api, { getErrorMessage } from "../api";
import "./Requests.css";

function initials(name = "User") {
  return name.split(" ").filter(Boolean).map(x => x[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function Requests() {
  const [tab, setTab] = useState("received");
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [scheduleFor, setScheduleFor] = useState(null);
  const [scheduleAt, setScheduleAt] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [inRes, outRes] = await Promise.all([
        api.get("/requests/incoming"),
        api.get("/requests/outgoing"),
      ]);
      setIncoming(inRes.data.requests || []);
      setOutgoing(outRes.data.requests || []);
    } catch (e) {
      setError(getErrorMessage(e, "Could not load your requests."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, []);

  const pendingIncoming = useMemo(
    () => incoming.filter(r => r.status === "PENDING"),
    [incoming]
  );
  const pendingOutgoing = useMemo(
    () => outgoing.filter(r => r.status === "PENDING"),
    [outgoing]
  );

  const accept = async (id) => {
    try {
      setBusyId(id);
      setError("");
      await api.put(`/requests/${id}/accept`);
      await load();
    } catch (e) {
      setError(getErrorMessage(e, "Could not accept this request."));
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id) => {
    if (!window.confirm("Decline this exchange request?")) return;
    try {
      setBusyId(id);
      setError("");
      await api.put(`/requests/${id}/reject`);
      await load();
    } catch (e) {
      setError(getErrorMessage(e, "Could not decline this request."));
    } finally {
      setBusyId(null);
    }
  };

  const cancel = async (id) => {
    if (!window.confirm("Cancel this exchange request?")) return;
    try {
      setBusyId(id);
      setError("");
      await api.delete(`/requests/${id}`);
      await load();
    } catch (e) {
      setError(getErrorMessage(e, "Could not cancel this request."));
    } finally {
      setBusyId(null);
    }
  };

  const schedule = async (requestId) => {
    if (!scheduleAt) {
      setError("Choose a date and time first.");
      return;
    }
    try {
      setBusyId(requestId);
      setError("");
      await api.post("/sessions", {
        request_id: requestId,
        scheduled_at: scheduleAt,
      });
      setScheduleFor(null);
      setScheduleAt("");
      await load();
    } catch (e) {
      setError(getErrorMessage(e, "Could not schedule the session."));
    } finally {
      setBusyId(null);
    }
  };

  const list = tab === "received" ? incoming : outgoing;

  return (
    <main className="requests-page">
      <div className="requests-container">
        <section className="requests-header">
          <Link to="/dashboard" className="requests-back">← Back to Dashboard</Link>
          <p className="requests-label">SKILLSWAP CONNECTIONS</p>
          <h1>Your <span>requests.</span></h1>
          <p className="requests-description">
            Every request below comes from your database account. Accepting a request
            creates a real connection; no demo requests are used.
          </p>
        </section>

        <div className="requests-toolbar">
          <div className="requests-tabs">
            <button className={tab === "received" ? "active" : ""} onClick={() => setTab("received")}>
              Received <span>{pendingIncoming.length}</span>
            </button>
            <button className={tab === "sent" ? "active" : ""} onClick={() => setTab("sent")}>
              Sent <span>{pendingOutgoing.length}</span>
            </button>
          </div>
          <button className="refresh-requests" onClick={load} disabled={loading}>
            <RefreshCw size={16} className={loading ? "spin" : ""} /> Refresh
          </button>
        </div>

        {error && <div className="request-alert">{error}</div>}

        {loading ? (
          <div className="requests-empty"><Clock3 size={28}/><h3>Loading requests…</h3></div>
        ) : list.length === 0 ? (
          <div className="requests-empty">
            <MessageCircle size={30}/>
            <h3>{tab === "received" ? "No received requests" : "No sent requests"}</h3>
            <p>
              {tab === "received"
                ? "When another student sends you an exchange request, it will appear here."
                : "Open a student's profile from Matches to send an exchange request."}
            </p>
            {tab === "sent" && <Link to="/matches" className="explore-matches-button">Explore Matches</Link>}
          </div>
        ) : (
          <div className="requests-list">
            {list.map(request => {
              const received = tab === "received";
              const person = received ? {
                name: request.sender_name,
                department: request.sender_department,
                roll: request.sender_roll_no,
              } : {
                name: request.receiver_name,
                department: request.receiver_department,
                roll: request.receiver_roll_no,
              };
              const isPending = request.status === "PENDING";
              const isAccepted = request.status === "ACCEPTED";
              return (
                <article className="request-card" key={request.id}>
                  <div className="request-person">
                    <div className="request-avatar">{initials(person.name)}</div>
                    <div>
                      <h3>{person.name}</h3>
                      <p>{person.department || "Student"}{person.roll ? ` · ${person.roll}` : ""}</p>
                    </div>
                    <span className={`request-status status-${request.status.toLowerCase()}`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="request-exchange">
                    <div>
                      <span>{received ? "THEY TEACH" : "YOU TEACH"}</span>
                      <strong>{request.offered_skill_name}</strong>
                    </div>
                    <div className="request-arrow">⇄</div>
                    <div>
                      <span>{received ? "THEY WANT" : "YOU WANT"}</span>
                      <strong>{request.requested_skill_name}</strong>
                    </div>
                  </div>

                  {request.message && <p className="request-message">“{request.message}”</p>}

                  <div className="request-meta">
                    <span><Clock3 size={15}/> {formatDate(request.created_at)}</span>
                  </div>

                  {isPending && received && (
                    <div className="request-actions">
                      <button className="accept-button" disabled={busyId === request.id} onClick={() => accept(request.id)}>
                        <Check size={16}/> {busyId === request.id ? "Accepting…" : "Accept connection"}
                      </button>
                      <button className="decline-button" disabled={busyId === request.id} onClick={() => reject(request.id)}>
                        <X size={16}/> Decline
                      </button>
                    </div>
                  )}

                  {isPending && !received && (
                    <div className="request-actions">
                      <button className="cancel-button" disabled={busyId === request.id} onClick={() => cancel(request.id)}>
                        <X size={16}/> Cancel request
                      </button>
                    </div>
                  )}

                  {isAccepted && received && (
                    <div className="accepted-actions">
                      <Link to={`/messages?userId=${request.sender_id}`} className="secondary-action">
                        <MessageCircle size={16}/> Message
                      </Link>
                      {scheduleFor === request.id ? (
                        <div className="schedule-box">
                          <input
                            type="datetime-local"
                            value={scheduleAt}
                            min={new Date().toISOString().slice(0, 16)}
                            onChange={e => setScheduleAt(e.target.value)}
                          />
                          <button className="accept-button" disabled={busyId === request.id} onClick={() => schedule(request.id)}>
                            <CalendarDays size={16}/> {busyId === request.id ? "Scheduling…" : "Confirm session"}
                          </button>
                          <button className="decline-button" onClick={() => { setScheduleFor(null); setScheduleAt(""); }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button className="accept-button" onClick={() => setScheduleFor(request.id)}>
                          <CalendarDays size={16}/> Schedule session
                        </button>
                      )}
                    </div>
                  )}

                  {isAccepted && !received && (
                    <div className="accepted-actions">
                      <Link to={`/messages?userId=${request.receiver_id}`} className="secondary-action">
                        <MessageCircle size={16}/> Message
                      </Link>
                      {scheduleFor === request.id ? (
                        <div className="schedule-box">
                          <input
                            type="datetime-local"
                            value={scheduleAt}
                            min={new Date().toISOString().slice(0, 16)}
                            onChange={e => setScheduleAt(e.target.value)}
                          />
                          <button className="accept-button" disabled={busyId === request.id} onClick={() => schedule(request.id)}>
                            <CalendarDays size={16}/> Confirm session
                          </button>
                          <button className="decline-button" onClick={() => { setScheduleFor(null); setScheduleAt(""); }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button className="accept-button" onClick={() => setScheduleFor(request.id)}>
                          <CalendarDays size={16}/> Schedule session
                        </button>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
