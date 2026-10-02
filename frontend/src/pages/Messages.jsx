import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { onValue, push, ref } from "firebase/database";
import { signInAnonymously } from "firebase/auth";
import { MessageCircle, Phone, Video, Search, Send, ArrowLeft, Users, Wifi } from "lucide-react";
import { firebaseAuth, realtimeDb, firebaseConfigured } from "../firebase";
import api, { getErrorMessage } from "../api";
import { useAuth } from "../context/AuthContext";
import "./Messages.css";

async function ensureFirebaseAuth() {
  if (!firebaseConfigured || !firebaseAuth || !realtimeDb) {
    throw new Error("Chat and calls need Firebase. Add the VITE_FIREBASE_* values to frontend/.env.");
  }
  if (!firebaseAuth.currentUser) await signInAnonymously(firebaseAuth);
}
function chatId(a, b) { return [Number(a), Number(b)].sort((x, y) => x - y).join("_"); }
function initials(name = "U") { return name.split(" ").filter(Boolean).map(x => x[0]).join("").slice(0, 2).toUpperCase(); }

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const targetId = params.get("userId");
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    api.get("/users")
      .then(r => setUsers((r.data.users || r.data.data || []).filter(u => Number(u.id) !== Number(user.id))))
      .catch(e => setError(getErrorMessage(e, "Could not load students.")))
      .finally(() => setLoading(false));
  }, [user.id]);

  useEffect(() => {
    if (targetId) {
      const found = users.find(u => String(u.id) === String(targetId));
      if (found) setSelected(found);
    }
  }, [targetId, users]);

  useEffect(() => {
    if (!firebaseConfigured || !realtimeDb) return undefined;
    let unsub = () => {};
    ensureFirebaseAuth()
      .then(() => {
        setFirebaseReady(true);
        unsub = onValue(ref(realtimeDb, `incomingCalls/${user.id}`), snap => {
          const calls = snap.val() || {};
          const first = Object.entries(calls).find(([, c]) => c.status === "RINGING");
          if (first) {
            const [callId, call] = first;
            navigate(`${call.type === "video" ? "/video-call" : "/voice-call"}?callId=${callId}&userId=${call.callerId}&callerId=${call.callerId}&name=${encodeURIComponent(call.callerName || "SkillSwap user")}`);
          }
        });
      })
      .catch(e => setError(e.message));
    return () => unsub();
  }, [user.id, navigate]);

  useEffect(() => {
    if (!selected || !firebaseReady) return undefined;
    const messageRef = ref(realtimeDb, `chats/${chatId(user.id, selected.id)}/messages`);
    return onValue(messageRef, snap => {
      const value = snap.val() || {};
      setMessages(Object.entries(value).map(([id, m]) => ({ id, ...m })).sort((a, b) => a.createdAt - b.createdAt));
    });
  }, [selected, user.id, firebaseReady]);

  const visible = useMemo(() => users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.department?.toLowerCase().includes(search.toLowerCase())
  ), [users, search]);

  const send = async e => {
    e.preventDefault();
    if (!text.trim() || !selected) return;
    try {
      await ensureFirebaseAuth();
      setFirebaseReady(true);
      await push(ref(realtimeDb, `chats/${chatId(user.id, selected.id)}/messages`), {
        senderId: Number(user.id),
        senderName: user.name,
        text: text.trim(),
        createdAt: Date.now(),
      });
      setText("");
    } catch (e) { setError(e.message || "Message could not be sent."); }
  };

  const openCall = type => {
    if (!selected) return;
    navigate(`${type === "video" ? "/video-call" : "/voice-call"}?userId=${selected.id}&name=${encodeURIComponent(selected.name)}`);
  };

  return (
    <main className="realtime-page">
      <div className="messages-shell">
        <aside className="people-panel">
          <div className="messages-top">
            <Link to="/dashboard"><ArrowLeft size={16}/> Dashboard</Link>
            <div className="messages-title-row"><div><span className="messages-kicker">SKILLSWAP</span><h1>Messages</h1></div><Users size={21}/></div>
          </div>
          <div className="people-search-wrap"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students…"/></div>
          <div className="people-list">
            {loading ? <p className="muted">Loading students…</p> :
            visible.length ? visible.map(u => (
              <button key={u.id} className={`person-row ${selected?.id === u.id ? "selected" : ""}`} onClick={() => navigate(`/messages?userId=${u.id}`)}>
                <span className="person-avatar">{initials(u.name)}</span>
                <span className="person-copy"><b>{u.name}</b><small>{u.department || "Student"}</small></span>
              </button>
            )) : <p className="muted">No students found.</p>}
          </div>
        </aside>

        <section className="chat-panel">
          {selected ? <>
            <header className="realtime-chat-header">
              <div className="person-title">
                <span className="person-avatar">{initials(selected.name)}</span>
                <div><h2>{selected.name}</h2><p>{selected.department || "Student"} · Real-time chat</p></div>
              </div>
              <div className="call-buttons">
                <button title="Voice call" onClick={() => openCall("voice")}><Phone size={18}/><span>Voice</span></button>
                <button title="Video call" onClick={() => openCall("video")}><Video size={18}/><span>Video</span></button>
              </div>
            </header>

            {error && <div className="form-alert">{error}</div>}

            <div className="chat-status"><Wifi size={14}/> {firebaseReady ? "Real-time connection ready" : "Connecting to chat…"}</div>

            <div className="realtime-messages">
              {messages.length ? messages.map(m => (
                <div key={m.id} className={`bubble-row ${Number(m.senderId) === Number(user.id) ? "mine" : ""}`}>
                  <div className="bubble">
                    <span>{m.text}</span>
                    <small>{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>
                  </div>
                </div>
              )) : <div className="empty-state small"><MessageCircle size={26}/><h3>No messages yet</h3><p>Say hello to {selected.name} and start planning your exchange.</p></div>}
            </div>

            <form className="realtime-composer" onSubmit={send}>
              <input value={text} onChange={e => setText(e.target.value)} placeholder={`Message ${selected.name}…`} autoComplete="off"/>
              <button disabled={!text.trim()}><Send size={17}/><span>Send</span></button>
            </form>
          </> : (
            <div className="chat-empty"><div className="chat-empty-icon"><MessageCircle/></div><h2>Choose a student</h2><p>Select a person to open your real-time conversation.</p></div>
          )}
        </section>
      </div>
    </main>
  );
}
