import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, CheckCheck, UserPlus, MessageCircle, Calendar, Star, Users, Video, ArrowLeft, MoreHorizontal, Trash2, X } from "lucide-react";
import api, { getErrorMessage } from "../api";
import "./Notifications.css";

function typeName(value = "") { return String(value).toLowerCase(); }
function timeText(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const diff = Date.now() - date.getTime();
  if (diff < 60_000) return "now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}d`;
  return date.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
}

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuId, setMenuId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [clearing, setClearing] = useState(false);

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
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, []);

  const icon = (type) => {
    const t = typeName(type);
    if (t.includes("request")) return <UserPlus />;
    if (t.includes("message")) return <MessageCircle />;
    if (t.includes("session")) return <Calendar />;
    if (t.includes("rating") || t.includes("completed")) return <Star />;
    if (t.includes("call")) return <Video />;
    if (t.includes("match")) return <Users />;
    return <Bell />;
  };

  const markRead = async id => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(current => current.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) { setError(getErrorMessage(e, "Could not update notification.")); }
  };

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications(current => current.map(n => ({ ...n, is_read: true })));
    } catch (e) { setError(getErrorMessage(e, "Could not mark notifications as read.")); }
  };

  const remove = async id => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(current => current.filter(n => n.id !== id));
      setMenuId(null);
    } catch (e) { setError(getErrorMessage(e, "Could not remove notification.")); }
  };

  const clearAll = async () => {
    if (!notifications.length || clearing) return;
    if (!window.confirm("Clear all notifications? This cannot be undone.")) return;
    try {
      setClearing(true);
      await api.delete("/notifications");
      setNotifications([]);
      setMenuId(null);
    } catch (e) { setError(getErrorMessage(e, "Could not clear notifications.")); }
    finally { setClearing(false); }
  };

  const unread = notifications.filter(n => !n.is_read).length;
  const filtered = useMemo(() => activeTab === "unread" ? notifications.filter(n => !n.is_read) : notifications, [activeTab, notifications]);

  return <main className="notifications-page" onClick={() => menuId && setMenuId(null)}>
    <header className="notifications-topbar">
      <button className="notifications-back" onClick={() => navigate(-1)} aria-label="Back"><ArrowLeft size={19} /></button>
      <div className="notifications-title-area">
        <div className="notifications-title-icon"><Bell size={21} /></div>
        <div><h1>Notifications</h1><p>Stay updated on your SkillSwap activity</p></div>
      </div>
      <div className="notifications-actions">
        <button onClick={markAllRead} disabled={!unread} className="top-action"><CheckCheck size={16}/> <span>Mark all read</span></button>
        <button onClick={clearAll} disabled={!notifications.length || clearing} className="top-action danger"><Trash2 size={16}/> <span>{clearing ? "Clearing…" : "Clear all"}</span></button>
      </div>
    </header>

    <section className="notifications-container">
      {error && <div className="notification-error"><span>{error}</span><button onClick={() => setError("")}><X size={16}/></button></div>}
      <div className="notification-tabs">
        <button className={activeTab === "all" ? "active" : ""} onClick={() => setActiveTab("all")}>All <b>{notifications.length}</b></button>
        <button className={activeTab === "unread" ? "active" : ""} onClick={() => setActiveTab("unread")}>Unread {unread > 0 && <b>{unread}</b>}</button>
      </div>

      <div className="notifications-list">
        {loading ? <div className="empty-notifications"><Bell size={27} /><h2>Loading activity…</h2></div> : filtered.length === 0 ? <div className="empty-notifications"><div className="empty-icon"><Check size={28}/></div><h2>{activeTab === "unread" ? "You're all caught up" : "No notifications yet"}</h2><p>{activeTab === "unread" ? "You have no unread activity." : "New requests, messages, sessions and matches will appear here."}</p></div> : filtered.map(notification => <article key={notification.id} className={`notification-item ${!notification.is_read ? "notification-unread" : ""}`} onClick={() => !notification.is_read && markRead(notification.id)}>
          <div className={`notification-icon notification-${typeName(notification.type)}`}>{icon(notification.type)}</div>
          <div className="notification-content">
            <div className="notification-heading"><h3>{notification.title || "SkillSwap update"}</h3>{!notification.is_read && <span className="unread-dot" />}</div>
            <p>{notification.message || notification.description || "SkillSwap activity update"}</p>
            <span className="notification-time">{timeText(notification.created_at)}</span>
          </div>
          <div className="notification-menu-wrap" onClick={e => e.stopPropagation()}>
            <button className="notification-more" aria-label="Notification options" onClick={() => setMenuId(menuId === notification.id ? null : notification.id)}><MoreHorizontal size={19}/></button>
            {menuId === notification.id && <div className="notification-menu">
              {!notification.is_read && <button onClick={() => { markRead(notification.id); setMenuId(null); }}><Check size={15}/> Mark as read</button>}
              <button className="delete-action" onClick={() => remove(notification.id)}><Trash2 size={15}/> Remove</button>
            </div>}
          </div>
        </article>)}
      </div>
    </section>
  </main>;
}
