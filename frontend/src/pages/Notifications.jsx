import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, UserPlus, MessageCircle, Calendar, Star, Users, Video, ArrowLeft, RefreshCw } from "lucide-react";
import api, { getErrorMessage } from "../api";
import "./Notifications.css";

function typeName(value = "") { return String(value).toLowerCase(); }
function timeText(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const response = await api.get("/notifications");
      setNotifications(response.data.notifications || []);
    } catch (e) {
      setError(getErrorMessage(e, "Could not load notifications."));
    } finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, []);

  const icon = (type) => {
    const t = typeName(type);
    if (t.includes("request")) return <UserPlus size={19} />;
    if (t.includes("message")) return <MessageCircle size={19} />;
    if (t.includes("session")) return <Calendar size={19} />;
    if (t.includes("rating") || t.includes("completed")) return <Star size={19} />;
    if (t.includes("call")) return <Video size={19} />;
    if (t.includes("match")) return <Users size={19} />;
    return <Bell size={19} />;
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((current) => current.map((n) => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) { setError(getErrorMessage(e, "Could not update notification.")); }
  };

  const unread = notifications.filter((n) => !n.is_read).length;

  return <main className="notifications-page">
    <header className="notifications-topbar">
      <button className="notifications-back" onClick={() => navigate("/dashboard")}><ArrowLeft size={19} /></button>
      <div className="notifications-title-area"><div className="notifications-title-icon"><Bell size={20} /></div><div><h1>Notifications</h1><p>Live activity from your SkillSwap account</p></div></div>
      <button className="mark-all-button" onClick={load} disabled={loading}><RefreshCw size={17} /> Refresh</button>
    </header>
    <section className="notifications-container">
      {error && <div className="notification-item notification-unread"><div className="notification-content"><p>{error}</p></div></div>}
      <div className="notifications-summary"><div><span>ALL NOTIFICATIONS</span><strong>{notifications.length}</strong></div><div><span>UNREAD</span><strong>{unread}</strong></div></div>
      <div className="notifications-list">
        {loading ? <div className="empty-notifications"><Bell size={27} /><h2>Loading notifications…</h2></div> : notifications.length === 0 ? <div className="empty-notifications"><div className="empty-icon"><Bell size={27} /></div><h2>No notifications</h2><p>New requests, sessions and account activity will appear here.</p></div> : notifications.map((notification) => <div key={notification.id} className={`notification-item ${!notification.is_read ? "notification-unread" : ""}`} onClick={() => !notification.is_read && markRead(notification.id)}>
          <div className={`notification-icon notification-${typeName(notification.type)}`}>{icon(notification.type)}</div>
          <div className="notification-content"><div className="notification-heading"><h3>{notification.title}</h3>{!notification.is_read && <span className="unread-dot" />}</div><p>{notification.message || notification.description || "SkillSwap activity update"}</p><span className="notification-time">{timeText(notification.created_at)}</span></div>
        </div>)}
      </div>
    </section>
  </main>;
}
