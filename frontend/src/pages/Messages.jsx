import { useCallback, useEffect, useMemo, useState } from 'react';
import { onDisconnect, onValue, push, ref, serverTimestamp, set } from 'firebase/database';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';
import { MessageCircle, Phone, Video, Search, Send, UsersRound, Wifi, Circle } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { firebaseAuth, realtimeDb, firebaseConfigured, firebaseStorage } from '../firebase';
import api, { getErrorMessage } from '../api';
import { useAuth } from '../context/AuthContext';
import './Messages.css';

const chatId = (a, b) => [Number(a), Number(b)].sort((x, y) => x - y).join('_');
const initials = (name = 'Student') => name.split(/\s+/).filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'S';

async function ensureFirebase() {
  if (!firebaseConfigured || !firebaseAuth || !realtimeDb) throw new Error('Realtime chat is not configured. Add the Firebase environment variables and enable Anonymous Authentication.');
  if (!firebaseAuth.currentUser) await signInAnonymously(firebaseAuth);
}

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const targetId = params.get('userId');
  const [connections, setConnections] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [online, setOnline] = useState(false);
  const [sendingFile, setSendingFile] = useState(false);

  const loadConnections = useCallback(async () => {
    try {
      const response = await api.get('/connections');
      setConnections(response.data.connections || []);
    } catch (e) { setError(getErrorMessage(e, 'Could not load your connections.')); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadConnections();
    const timer = setInterval(loadConnections, 8000);
    return () => clearInterval(timer);
  }, [loadConnections]);

  useEffect(() => {
    const found = connections.find(c => String(c.user_id) === String(targetId));
    if (found) setSelected(found);
    else if (!selected && connections[0]) setSelected(connections[0]);
  }, [connections, targetId]);

  useEffect(() => {
    let cleanupPresence = () => {};
    ensureFirebase().then(async () => {
      setFirebaseReady(true);
      const presenceRef = ref(realtimeDb, `presence/${user.id}`);
      await set(presenceRef, { online: true, updatedAt: Date.now() });
      await onDisconnect(presenceRef).set({ online: false, updatedAt: serverTimestamp() });
      cleanupPresence = onValue(presenceRef, () => {});
    }).catch(e => setError(e.message));
    return () => { cleanupPresence(); };
  }, [user.id]);

  useEffect(() => {
    if (!selected || !firebaseReady) return undefined;
    const id = chatId(user.id, selected.user_id);
    const messagesRef = ref(realtimeDb, `chats/${id}/messages`);
    const presenceRef = ref(realtimeDb, `presence/${selected.user_id}`);
    const unsubMessages = onValue(messagesRef, snap => {
      const value = snap.val() || {};
      const next = Object.entries(value).map(([messageId, message]) => ({ id: messageId, ...message })).sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));
      setMessages(next);
    });
    const unsubPresence = onValue(presenceRef, snap => setOnline(Boolean(snap.val()?.online)));
    return () => { unsubMessages(); unsubPresence(); };
  }, [selected, user.id, firebaseReady]);

  const filtered = useMemo(() => connections.filter(c => `${c.name} ${c.department || ''}`.toLowerCase().includes(search.toLowerCase())), [connections, search]);

  const choose = (connection) => {
    setSelected(connection);
    setParams({ userId: String(connection.user_id) });
  };

  const sendAttachment = async e => {
    const file = e.target.files?.[0]; e.target.value='';
    if (!file || !selected) return;
    if (!firebaseStorage) { setError('File sharing is not configured. Enable Firebase Storage.'); return; }
    if (file.size > 20 * 1024 * 1024) { setError('Files must be 20 MB or smaller.'); return; }
    try {
      setSendingFile(true); setError(''); await ensureFirebase();
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
      const path = storageRef(firebaseStorage, `chat-files/${chatId(user.id, selected.user_id)}/${Date.now()}-${safe}`);
      await uploadBytes(path, file, { contentType:file.type || 'application/octet-stream' });
      const url = await getDownloadURL(path);
      await push(ref(realtimeDb, `chats/${chatId(user.id, selected.user_id)}/messages`), { senderId:Number(user.id), senderName:user.name, attachment:{url,name:file.name,size:file.size,type:file.type||'application/octet-stream'}, createdAt:Date.now() });
    } catch(e) { setError(e.message || 'Could not send the file.'); } finally { setSendingFile(false); }
  };

  const send = async e => {
    e.preventDefault();
    if (!text.trim() || !selected) return;
    try {
      await ensureFirebase();
      const path = ref(realtimeDb, `chats/${chatId(user.id, selected.user_id)}/messages`);
      await push(path, { senderId: Number(user.id), senderName: user.name, text: text.trim(), createdAt: Date.now() });
      setText('');
    } catch (e) { setError(e.message || 'Message could not be sent.'); }
  };

  const call = type => navigate(`/${type === 'video' ? 'video' : 'voice'}-call?userId=${selected.user_id}&name=${encodeURIComponent(selected.name)}`);

  return <div className="messages-modern">
    <aside className="conversation-sidebar">
      <div className="messages-heading"><div><span className="page-eyebrow">REAL-TIME</span><h2>Messages</h2></div><UsersRound size={20}/></div>
      <div className="message-search"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search connections"/></div>
      <div className="connection-hint">Only accepted SkillSwap connections can message or call each other.</div>
      <div className="conversation-list">
        {loading ? <div className="conversation-empty">Loading connections…</div> : filtered.length ? filtered.map(c => <button key={c.user_id} className={`conversation-row ${selected?.user_id === c.user_id ? 'selected' : ''}`} onClick={() => choose(c)}><div className="conversation-avatar">{initials(c.name)}</div><div><strong>{c.name}</strong><span>{c.department || 'Student'}</span></div><Circle size={8} className="conversation-dot" fill="currentColor"/></button>) : <div className="conversation-empty"><UsersRound size={24}/><strong>No connections</strong><span>Accept an exchange request to start a conversation.</span></div>}
      </div>
    </aside>

    <section className="conversation-panel">
      {selected ? <>
        <header className="conversation-header"><div className="conversation-person"><div className="conversation-avatar large">{initials(selected.name)}</div><div><h3>{selected.name}</h3><span><i className={online ? 'online' : ''}/>{online ? 'Online now' : 'Offline'} · {selected.department || 'Student'}</span></div></div><div className="conversation-actions"><button title="Voice call" onClick={() => call('voice')}><Phone size={18}/></button><button title="Video call" onClick={() => call('video')}><Video size={18}/></button></div></header>
        {error && <div className="message-alert">{error}</div>}
        <div className="realtime-banner"><Wifi size={14}/>{firebaseReady ? 'Real-time messaging connected' : 'Connecting to real-time messaging…'}</div>
        <div className="messages-scroll">
          {messages.length ? messages.map(m => <div className={`message-row ${Number(m.senderId) === Number(user.id) ? 'mine' : ''}`} key={m.id}><div className="message-bubble">{m.text&&<span>{m.text}</span>}{m.attachment&&<a className="message-file" href={m.attachment.url} target="_blank" rel="noreferrer">{m.attachment.type?.startsWith('image/')?<img src={m.attachment.url} alt={m.attachment.name}/>:<span>📎</span>}<strong>{m.attachment.name}</strong><small>{Math.max(1,Math.round((m.attachment.size||0)/1024))} KB</small></a>}<small>{m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</small></div></div>) : <div className="messages-zero"><div><MessageCircle size={24}/></div><h3>Start the exchange</h3><p>Say hello and agree on what you want to learn in your first session.</p></div>}
        </div>
        <form className="message-composer" onSubmit={send}><label className="message-attach" title="Send photo or document">📎<input type="file" hidden onChange={sendAttachment} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"/></label><input value={text} onChange={e => setText(e.target.value)} placeholder={`Message ${selected.name}…`} autoComplete="off"/><button disabled={!text.trim()||sendingFile}><Send size={17}/></button></form>
      </> : <div className="messages-zero"><div><MessageCircle size={28}/></div><h2>Your conversations</h2><p>Choose an accepted connection to chat, call or plan a session.</p></div>}
    </section>
  </div>;
}
