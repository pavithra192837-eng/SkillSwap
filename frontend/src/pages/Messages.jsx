import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { onDisconnect, onValue, push, ref, serverTimestamp, set } from 'firebase/database';
import { getDownloadURL, ref as storageRef, uploadBytesResumable } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';
import { MessageCircle, Phone, Video, Search, Send, UsersRound, Wifi, Circle, Paperclip, Image as ImageIcon, FileText, Smile, LoaderCircle, CheckCircle2 } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { firebaseAuth, realtimeDb, firebaseConfigured, firebaseStorage } from '../firebase';
import api, { getErrorMessage } from '../api';
import { useAuth } from '../context/AuthContext';
import './Messages.css';

const chatId = (a, b) => [Number(a), Number(b)].sort((x, y) => x - y).join('_');
const initials = (name = 'Student') => name.split(/\s+/).filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'S';
const MAX_FILE_SIZE = 20 * 1024 * 1024;

async function ensureFirebase() {
  if (!firebaseConfigured || !firebaseAuth || !realtimeDb) {
    throw new Error('Realtime chat is not configured. Check the Firebase environment variables.');
  }
  if (!firebaseAuth.currentUser) await signInAnonymously(firebaseAuth);
}

function explainFirebaseError(error, fallback) {
  const code = error?.code || '';
  if (code.includes('storage/unauthorized') || code.includes('storage/unauthenticated')) return 'Firebase Storage rejected this upload. Check Storage rules and Anonymous Authentication.';
  if (code.includes('storage/quota-exceeded')) return 'Firebase Storage quota has been exceeded.';
  if (code.includes('storage/canceled')) return 'The upload was canceled.';
  if (code.includes('permission-denied') || code.includes('PERMISSION_DENIED')) return 'Firebase denied this message. Check Realtime Database rules and Anonymous Authentication.';
  if (code.includes('auth/operation-not-allowed')) return 'Firebase Anonymous Authentication is disabled. Enable it in Firebase Authentication.';
  if (code.includes('auth/network-request-failed')) return 'Firebase could not be reached. Check your internet connection and Firebase configuration.';
  return error?.message || fallback;
}

const isNearBottom = element => element.scrollHeight - element.scrollTop - element.clientHeight < 120;

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
  const [sending, setSending] = useState(false);
  const [uploadJobs, setUploadJobs] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [justSent, setJustSent] = useState(false);
  const messagesEndRef = useRef(null);
  const uploadTasksRef = useRef(new Map());
  const messagesScrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const shouldStickToBottom = useRef(true);

  const loadConnections = useCallback(async () => {
    try {
      const response = await api.get('/connections');
      setConnections(response.data.connections || []);
    } catch (e) {
      setError(getErrorMessage(e, 'Could not load your connections.'));
    } finally {
      setLoading(false);
    }
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
  }, [connections, targetId, selected]);

  useEffect(() => {
    let cleanupPresence = () => {};
    ensureFirebase().then(async () => {
      setFirebaseReady(true);
      const presenceRef = ref(realtimeDb, `presence/${user.id}`);
      await set(presenceRef, { online: true, updatedAt: Date.now() });
      await onDisconnect(presenceRef).set({ online: false, updatedAt: serverTimestamp() });
      cleanupPresence = onValue(presenceRef, () => {});
    }).catch(e => setError(explainFirebaseError(e, 'Could not connect to real-time chat.')));
    return () => cleanupPresence();
  }, [user.id]);

  useEffect(() => {
    if (!selected || !firebaseReady) return undefined;
    setMessages([]);
    shouldStickToBottom.current = true;
    const id = chatId(user.id, selected.user_id);
    const messagesRef = ref(realtimeDb, `chats/${id}/messages`);
    const presenceRef = ref(realtimeDb, `presence/${selected.user_id}`);
    const unsubMessages = onValue(messagesRef, snap => {
      const value = snap.val() || {};
      const next = Object.entries(value)
        .map(([messageId, message]) => ({ id: messageId, ...message }))
        .sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));
      setMessages(next);
    }, e => setError(explainFirebaseError(e, 'Could not read this conversation.')));
    const unsubPresence = onValue(presenceRef, snap => setOnline(Boolean(snap.val()?.online)));
    return () => { unsubMessages(); unsubPresence(); };
  }, [selected, user.id, firebaseReady]);

  useEffect(() => {
    const el = messagesScrollRef.current;
    if (!el || !shouldStickToBottom.current) return;
    requestAnimationFrame(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }));
  }, [messages]);

  const filtered = useMemo(
    () => connections.filter(c => `${c.name} ${c.department || ''}`.toLowerCase().includes(search.toLowerCase())),
    [connections, search]
  );

  const choose = connection => {
    setSelected(connection);
    setParams({ userId: String(connection.user_id) });
    setError('');
  };

  const sendAttachment = async file => {
    if (!file || !selected) return;
    if (!firebaseStorage) {
      setError('File sharing is not configured. Check the Firebase Storage environment variable.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Files must be 20 MB or smaller.');
      return;
    }

    const conversationId = chatId(user.id, selected.user_id);
    const recipient = { id: Number(selected.user_id), name: selected.name };
    const jobId = `${conversationId}_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    try {
      setError('');
      await ensureFirebase();
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileRef = storageRef(firebaseStorage, `chat-files/${conversationId}/${Date.now()}-${safe}`);
      const task = uploadBytesResumable(fileRef, file, {
        contentType: file.type || 'application/octet-stream',
        cacheControl: 'public,max-age=3600',
      });

      uploadTasksRef.current.set(jobId, task);
      setUploadJobs(current => ({
        ...current,
        [conversationId]: { id: jobId, name: file.name, progress: 0, recipient },
      }));

      await new Promise((resolve, reject) => {
        let settled = false;
        const finish = (fn, value) => {
          if (settled) return;
          settled = true;
          clearTimeout(timeout);
          fn(value);
        };
        const timeout = setTimeout(() => {
          try { task.cancel(); } catch {}
          finish(reject, new Error('Upload timed out. Please try again or use a smaller file.'));
        }, 120000);

        task.on('state_changed',
          snapshot => {
            const progress = Math.min(100, Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
            setUploadJobs(current => current[conversationId]?.id === jobId
              ? { ...current, [conversationId]: { ...current[conversationId], progress } }
              : current);
          },
          error => finish(reject, error),
          () => finish(resolve)
        );
      });

      const url = await getDownloadURL(fileRef);
      const messageRef = push(ref(realtimeDb, `chats/${conversationId}/messages`));
      await set(messageRef, {
        senderId: Number(user.id),
        senderName: user.name,
        attachment: { url, name: file.name, size: file.size, type: file.type || 'application/octet-stream' },
        createdAt: Date.now(),
      });
      setJustSent(true);
      setTimeout(() => setJustSent(false), 1200);
    } catch (e) {
      setError(explainFirebaseError(e, 'Could not send the attachment. Nothing was added to the chat.'));
    } finally {
      uploadTasksRef.current.delete(jobId);
      setUploadJobs(current => {
        if (current[conversationId]?.id !== jobId) return current;
        const next = { ...current };
        delete next[conversationId];
        return next;
      });
    }
  };

  const handleFileInput = async e => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) await sendAttachment(file);
  };

  const handleDrop = async e => {
    e.preventDefault();
    setDragActive(false);
    await sendAttachment(e.dataTransfer.files?.[0]);
  };

  const send = async e => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !selected || sending) return;
    try {
      setSending(true);
      setError('');
      await ensureFirebase();
      const path = ref(realtimeDb, `chats/${chatId(user.id, selected.user_id)}/messages`);
      await push(path, { senderId: Number(user.id), senderName: user.name, text: trimmed, createdAt: Date.now() });
      setText('');
      setJustSent(true);
      setTimeout(() => setJustSent(false), 1200);
    } catch (e) {
      setError(explainFirebaseError(e, 'Message could not be sent.'));
    } finally {
      setSending(false);
    }
  };

  const call = type => navigate(`/${type === 'video' ? 'video' : 'voice'}-call?userId=${selected.user_id}&name=${encodeURIComponent(selected.name)}`);
  useEffect(() => () => {
    uploadTasksRef.current.forEach(task => { try { task.cancel(); } catch {} });
    uploadTasksRef.current.clear();
  }, []);

  const handleComposerKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  return <div className="messages-modern">
    <aside className="conversation-sidebar">
      <div className="messages-heading"><div><span className="page-eyebrow">REAL-TIME</span><h2>Messages</h2></div><UsersRound size={20}/></div>
      <div className="message-search"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search connections" aria-label="Search connections"/></div>
      <div className="connection-hint">Only accepted SkillSwap connections can message or call each other.</div>
      <div className="conversation-list">
        {loading ? <div className="conversation-empty">Loading connections…</div> : filtered.length ? filtered.map(c => <button key={c.user_id} className={`conversation-row ${selected?.user_id === c.user_id ? 'selected' : ''}`} onClick={() => choose(c)}><div className="conversation-avatar">{initials(c.name)}</div><div><strong>{c.name}</strong><span>{c.department || 'Student'}</span></div><Circle size={8} className="conversation-dot" fill="currentColor"/></button>) : <div className="conversation-empty"><UsersRound size={24}/><strong>No connections</strong><span>Accept an exchange request to start a conversation.</span></div>}
      </div>
    </aside>

    <section className="conversation-panel">
      {selected ? <>
        <header className="conversation-header">
          <div className="conversation-person"><div className="conversation-avatar large">{initials(selected.name)}</div><div><h3>{selected.name}</h3><span><i className={online ? 'online' : ''}/>{online ? 'Online now' : 'Offline'} · {selected.department || 'Student'}</span></div></div>
          <div className="conversation-actions"><button title="Voice call" aria-label="Voice call" onClick={() => call('voice')}><Phone size={19}/></button><button title="Video call" aria-label="Video call" onClick={() => call('video')}><Video size={19}/></button></div>
        </header>
        {error && <div className="message-alert" role="alert"><strong>Chat issue</strong><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss">×</button></div>}
        <div className="realtime-banner"><Wifi size={14}/>{firebaseReady ? 'Real-time messaging connected' : 'Connecting to real-time messaging…'}</div>
        <div
          className={`messages-scroll ${dragActive ? 'drag-active' : ''}`}
          ref={messagesScrollRef}
          onScroll={e => { shouldStickToBottom.current = isNearBottom(e.currentTarget); }}
          onDragOver={e => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={e => { if (e.currentTarget === e.target) setDragActive(false); }}
          onDrop={handleDrop}
        >
          {dragActive && <div className="drop-overlay"><Paperclip size={28}/><strong>Drop a photo or file to send</strong><span>Up to 20 MB</span></div>}
          {messages.length ? messages.map(m => <div className={`message-row ${Number(m.senderId) === Number(user.id) ? 'mine' : ''}`} key={m.id}>
            <div className="message-bubble">
              {m.text && <span className="message-text">{m.text}</span>}
              {m.attachment && <a className={`message-file ${m.attachment.type?.startsWith('image/') ? 'image-attachment' : ''}`} href={m.attachment.url} target="_blank" rel="noreferrer">
                {m.attachment.type?.startsWith('image/') ? <img src={m.attachment.url} alt={m.attachment.name}/> : <span className="file-icon"><FileText size={20}/></span>}
                <span className="file-copy"><strong>{m.attachment.name}</strong><small>{Math.max(1, Math.round((m.attachment.size || 0) / 1024))} KB</small></span>
              </a>}
              <small className="message-time">{m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</small>
            </div>
          </div>) : <div className="messages-zero"><div><MessageCircle size={25}/></div><h3>Start the exchange</h3><p>Say hello and agree on what you want to learn in your first session.</p></div>}
          <div ref={messagesEndRef} />
        </div>
        <form className="message-composer" onSubmit={send}>
          <div className="composer-tools">
            <button type="button" className="composer-icon" title="Send photo" aria-label="Send photo" onClick={() => imageInputRef.current?.click()} disabled={Boolean(uploadJobs[chatId(user.id, selected?.user_id || '')])}><ImageIcon size={19}/></button>
            <button type="button" className="composer-icon" title="Attach file" aria-label="Attach file" onClick={() => fileInputRef.current?.click()} disabled={Boolean(uploadJobs[chatId(user.id, selected?.user_id || '')])}><Paperclip size={19}/></button>
            <input ref={imageInputRef} type="file" hidden onChange={handleFileInput} accept="image/*"/>
            <input ref={fileInputRef} type="file" hidden onChange={handleFileInput} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"/>
          </div>
          <textarea value={text} onChange={e => setText(e.target.value)} onKeyDown={handleComposerKeyDown} placeholder={`Write a message to ${selected.name}…`} aria-label={`Message ${selected.name}`} rows={1} autoComplete="off"/>
          <button className="composer-send" disabled={!text.trim() || sending} aria-label="Send message" title="Send message">{sending ? <LoaderCircle size={18} className="spin"/> : <Send size={18}/>}</button>
        </form>
        <div className="composer-status">{uploadJobs[chatId(user.id, selected?.user_id || '')] ? <><LoaderCircle size={13} className="spin"/> Uploading {uploadJobs[chatId(user.id, selected?.user_id || '')].progress}% · {uploadJobs[chatId(user.id, selected?.user_id || '')].name}</> : justSent ? <><CheckCircle2 size={13}/> Sent</> : <><Smile size={13}/> Enter to send · Shift + Enter for a new line</>}</div>
      </> : <div className="messages-zero"><div><MessageCircle size={28}/></div><h2>Your conversations</h2><p>Choose an accepted connection to chat, call or plan a session.</p></div>}
    </section>
  </div>;
}
