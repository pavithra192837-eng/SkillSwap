import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Clock3, MessageCircle, Video, X, RefreshCw, CheckCircle2 } from "lucide-react";
import api, { getErrorMessage } from "../api";
import { useAuth } from "../context/AuthContext";
import "./Session.css";

function initials(name = "User") {
  return name.split(" ").filter(Boolean).map(x => x[0]).join("").slice(0, 2).toUpperCase();
}
function dateText(v) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString([], { dateStyle: "medium" });
}
function timeText(v) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Sessions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [tab, setTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const r = await api.get("/sessions");
      setSessions(r.data.sessions || []);
    } catch (e) {
      setError(getErrorMessage(e, "Could not load sessions."));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, []);

  const upcoming = useMemo(
    () => sessions.filter(s => ["SCHEDULED", "ONGOING"].includes(s.status)),
    [sessions]
  );
  const completed = useMemo(
    () => sessions.filter(s => ["COMPLETED", "CANCELLED"].includes(s.status)),
    [sessions]
  );
  const displayed = tab === "upcoming" ? upcoming : completed;

  const cancel = async (id) => {
    if (!window.confirm("Cancel this session?")) return;
    try {
      setBusy(id);
      await api.delete(`/sessions/${id}`);
      await load();
    } catch (e) {
      setError(getErrorMessage(e, "Could not cancel the session."));
    } finally { setBusy(null); }
  };

  const join = async (s) => {
    const otherId = Number(s.user1_id) === Number(user?.id) ? Number(s.user2_id) : Number(s.user1_id);
    const otherName = Number(s.user1_id) === Number(user?.id) ? s.user2_name : s.user1_name;
    try {
      setBusy(s.id);
      if (s.status === "SCHEDULED") await api.put(`/sessions/${s.id}/start`);
      navigate(`/video-call?userId=${otherId}&name=${encodeURIComponent(otherName || "SkillSwap user")}&sessionId=${s.id}`);
    } catch (e) {
      setError(getErrorMessage(e, "Could not start the session."));
    } finally { setBusy(null); }
  };

  return (
    <div className="sessions-page">
      <button className="sessions-back-button" onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
      <div className="sessions-header">
        <div>
          <p className="sessions-label">SKILLSWAP</p>
          <h1>Your sessions</h1>
          <p className="sessions-subtitle">Real sessions created from accepted exchange requests.</p>
        </div>
        <div className="session-count"><span>{upcoming.length}</span><small>Upcoming</small></div>
      </div>

      <div className="session-toolbar">
        <div className="session-tabs">
          <button className={tab === "upcoming" ? "active" : ""} onClick={() => setTab("upcoming")}>Upcoming <span>{upcoming.length}</span></button>
          <button className={tab === "completed" ? "active" : ""} onClick={() => setTab("completed")}>History <span>{completed.length}</span></button>
        </div>
        <button className="session-refresh" onClick={load} disabled={loading}><RefreshCw size={16}/> Refresh</button>
      </div>

      {error && <div className="session-alert">{error}</div>}

      {loading ? <div className="empty-sessions"><Clock3 size={30}/><h3>Loading sessions…</h3></div> :
      displayed.length ? <div className="sessions-list">{displayed.map(s => {
        const uid = Number(user?.id);
        const isUser1 = uid === Number(s.user1_id);
        const otherName = isUser1 ? s.user2_name : s.user1_name;
        const otherId = isUser1 ? s.user2_id : s.user1_id;
        return <article className="session-card" key={s.id}>
          <div className="session-partner">
            <div className="partner-avatar">{initials(otherName)}</div>
            <div><h3>{otherName}</h3><p>Skill exchange partner</p></div>
            <span className={`session-status status-${s.status.toLowerCase()}`}>{s.status}</span>
          </div>
          <div className="session-details">
            <div><CalendarDays size={18}/><span><small>Date</small><b>{dateText(s.scheduled_at)}</b></span></div>
            <div><Clock3 size={18}/><span><small>Time</small><b>{timeText(s.scheduled_at)}</b></span></div>
            <div><CheckCircle2 size={18}/><span><small>Request</small><b>#{s.request_id}</b></span></div>
          </div>
          <div className="session-actions">
            <button className="secondary-session" onClick={() => navigate(`/messages?userId=${otherId}`)}><MessageCircle size={16}/> Message</button>
            {["SCHEDULED","ONGOING"].includes(s.status) && <button className="join-button" disabled={busy === s.id} onClick={() => join(s)}><Video size={16}/>{busy === s.id ? "Opening…" : "Join video session"}</button>}
            {s.status === "SCHEDULED" && <button className="cancel-button" disabled={busy === s.id} onClick={() => cancel(s.id)}><X size={16}/> Cancel</button>}
          </div>
        </article>;
      })}</div> :
      <div className="empty-sessions"><CalendarDays size={30}/><h3>No {tab === "upcoming" ? "upcoming" : "past"} sessions</h3><p>Accept an exchange request and schedule a session to see it here.</p></div>}
    </div>
  );
}
