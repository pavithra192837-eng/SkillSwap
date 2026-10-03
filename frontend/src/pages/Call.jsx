import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Maximize2, MessageCircle, Phone, PhoneOff, Send, ShieldCheck, Video, X } from 'lucide-react';
import { get, onValue, push, ref, remove, serverTimestamp, set, update } from 'firebase/database';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';
import { firebaseAuth, realtimeDb, firebaseConfigured, firebaseStorage } from '../firebase';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import './Call.css';

const randomId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const chatId = (a, b) => [Number(a), Number(b)].sort((x, y) => x - y).join('_');
const initials = (name = 'Student') => name.split(/\s+/).filter(Boolean).map((x) => x[0]).join('').slice(0, 2).toUpperCase() || 'S';
const JITSI_DOMAIN = (import.meta.env.VITE_JITSI_DOMAIN || 'meet.jit.si').replace(/^https?:\/\//, '').replace(/\/$/, '');

async function ensureFirebase() {
  if (!firebaseConfigured || !firebaseAuth || !realtimeDb) throw new Error('Realtime calling is not configured. Add Firebase variables and enable Anonymous Authentication.');
  if (!firebaseAuth.currentUser) await signInAnonymously(firebaseAuth);
}

function loadJitsiApi() {
  if (window.JitsiMeetExternalAPI) return Promise.resolve(window.JitsiMeetExternalAPI);
  const existing = document.querySelector('script[data-skillswap-jitsi]');
  if (existing) return new Promise((resolve, reject) => {
    const timer = window.setInterval(() => {
      if (window.JitsiMeetExternalAPI) { window.clearInterval(timer); resolve(window.JitsiMeetExternalAPI); }
    }, 50);
    window.setTimeout(() => { window.clearInterval(timer); reject(new Error('The video meeting service did not load.')); }, 15000);
  });
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://${JITSI_DOMAIN}/external_api.js`;
    script.async = true;
    script.dataset.skillswapJitsi = 'true';
    script.onload = () => window.JitsiMeetExternalAPI ? resolve(window.JitsiMeetExternalAPI) : reject(new Error('The video meeting API is unavailable.'));
    script.onerror = () => reject(new Error(`Could not load the media server at ${JITSI_DOMAIN}. Check VITE_JITSI_DOMAIN.`));
    document.head.appendChild(script);
  });
}

export default function Call() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const incoming = params.get('incoming') === '1';
  const callId = params.get('callId') || useMemo(randomId, []);
  const targetId = Number(params.get('userId'));
  const targetName = params.get('name') || 'SkillSwap student';
  const sessionId = params.get('sessionId');
  const mode = location.pathname.includes('video-call') ? 'video' : 'audio';
  const callRef = useMemo(() => realtimeDb ? ref(realtimeDb, `calls/${callId}`) : null, [callId]);
  const roomName = useMemo(() => `SkillSwap-${callId.replace(/[^a-zA-Z0-9_-]/g, '')}`, [callId]);

  const jitsiContainerRef = useRef(null);
  const jitsiRef = useRef(null);
  const mountedRef = useRef(true);
  const endedRef = useRef(false);
  const completingRef = useRef(false);
  const startedAtRef = useRef(0);
  const finishRef = useRef(null);
  const [status, setStatus] = useState(incoming ? 'Joining' : 'Calling');
  const [error, setError] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [chatReady, setChatReady] = useState(false);
  const [sessionMeta, setSessionMeta] = useState(null);
  const [sessionRemaining, setSessionRemaining] = useState(null);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [participantCount, setParticipantCount] = useState(incoming ? 1 : 0);

  const cleanupJitsi = useCallback(() => {
    const apiInstance = jitsiRef.current;
    jitsiRef.current = null;
    if (apiInstance) {
      try { apiInstance.dispose(); } catch { /* already closed */ }
    }
  }, []);

  const completeSession = useCallback(async (reason = 'COMPLETED') => {
    if (!sessionId || completingRef.current) return;
    completingRef.current = true;
    try { await api.put(`/sessions/${sessionId}/complete`, { reason }); } catch { /* server may already have completed it */ }
  }, [sessionId]);

  const finish = useCallback(async (remote = false, reason = 'USER_ENDED') => {
    if (endedRef.current) return;
    endedRef.current = true;
    const completesLesson = reason === 'USER_ENDED' || reason === 'TIME_EXPIRED';
    setStatus(reason === 'TIME_EXPIRED' ? 'Time is up' : remote ? 'Participant left' : 'Ending session');

    const apiInstance = jitsiRef.current;
    if (apiInstance) {
      try { apiInstance.executeCommand('hangup'); } catch { /* dispose below */ }
    }

    try {
      if (callRef) await update(callRef, {
        status: 'ENDED',
        endReason: reason,
        endedAt: serverTimestamp(),
        endedBy: Number(user.id),
      });
      if (realtimeDb) {
        await remove(ref(realtimeDb, `incomingCalls/${user.id}/${callId}`));
        if (targetId) await remove(ref(realtimeDb, `incomingCalls/${targetId}/${callId}`));
      }
    } catch { /* cleanup/navigation still proceeds */ }

    if (sessionId && completesLesson) await completeSession(reason);
    const usedSeconds = sessionMeta?.started_at
      ? Math.max(0, Math.floor((Date.now() - new Date(sessionMeta.started_at).getTime()) / 1000))
      : elapsed;
    setSessionSummary(completesLesson ? { reason, duration: usedSeconds } : null);
    cleanupJitsi();
    window.setTimeout(() => navigate(sessionId ? '/sessions' : '/messages', { replace: true }), completesLesson && sessionId ? 2200 : 250);
  }, [callRef, callId, cleanupJitsi, completeSession, elapsed, navigate, sessionId, targetId, user.id, sessionMeta]);

  finishRef.current = finish;

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!sessionId) return undefined;
    let active = true;
    const loadSession = async () => {
      try {
        const r = await api.get(`/sessions/${sessionId}`);
        if (active) setSessionMeta(r.data.session);
      } catch {
        if (active) setError('Could not load the session timer.');
      }
    };
    loadSession();
    const poll = setInterval(loadSession, 5000);
    return () => { active = false; clearInterval(poll); };
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || !sessionMeta || sessionMeta.status === 'COMPLETED' || sessionMeta.status === 'CANCELLED') return;
    const start = new Date(sessionMeta.scheduled_at).getTime();
    if (Date.now() >= start) {
      api.put(`/sessions/${sessionId}/start`)
        .then(() => api.get(`/sessions/${sessionId}`))
        .then((r) => setSessionMeta(r.data.session))
        .catch((e) => {
          if (e?.response?.status !== 400 && e?.response?.status !== 409) setError(e?.response?.data?.message || 'This lesson cannot be started yet.');
        });
    }
  }, [sessionId, sessionMeta?.scheduled_at, sessionMeta?.status]);

  useEffect(() => {
    if (!sessionMeta?.started_at || !sessionMeta?.duration_minutes) return undefined;
    const tick = () => {
      const start = new Date(sessionMeta.started_at).getTime();
      const end = start + Number(sessionMeta.duration_minutes) * 60000;
      const remaining = Math.max(0, end - Date.now());
      setSessionRemaining(Math.ceil(remaining / 1000));
      setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
      if (remaining <= 0 && !endedRef.current) finishRef.current?.(false, 'TIME_EXPIRED');
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [sessionMeta, finish]);

  useEffect(() => {
    if (sessionMeta?.status === 'COMPLETED' && !endedRef.current) finishRef.current?.(true, sessionMeta.end_reason || 'TIME_EXPIRED');
  }, [sessionMeta, finish]);

  // Firebase is now only the lightweight call invitation/lifecycle channel.
  // Audio/video media, NAT traversal, reconnection and conferencing are handled by Jitsi's media infrastructure.
  useEffect(() => {
    let cancelled = false;
    const startCall = async () => {
      try {
        await ensureFirebase();
        if (!callRef || !targetId || !user?.id) throw new Error('The other participant is missing.');

        if (incoming) {
          const existing = await get(callRef);
          const existingCall = existing.val();
          if (existingCall?.status === 'ENDED') throw new Error('This call has already ended. Start a new call from Messages.');
        }

        const callMeta = incoming
          ? { calleeId: Number(user.id), calleeName: user.name, type: mode, status: 'JOINING', joinedAt: serverTimestamp() }
          : { callerId: Number(user.id), calleeId: targetId, callerName: user.name, type: mode, status: 'RINGING', createdAt: serverTimestamp() };
        await update(callRef, callMeta);
        if (cancelled) return;

        if (!incoming) {
          await set(ref(realtimeDb, `incomingCalls/${targetId}/${callId}`), {
            callerId: Number(user.id),
            callerName: user.name,
            type: mode,
            status: 'RINGING',
            createdAt: Date.now(),
          });
        } else {
          await remove(ref(realtimeDb, `incomingCalls/${user.id}/${callId}`));
        }

        const JitsiMeetExternalAPI = await loadJitsiApi();
        if (cancelled || !mountedRef.current || !jitsiContainerRef.current) return;

        const apiInstance = new JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName,
          parentNode: jitsiContainerRef.current,
          width: '100%',
          height: '100%',
          userInfo: { displayName: user.name || 'SkillSwap user' },
          configOverwrite: {
            prejoinConfig: { enabled: false },
            startWithAudioMuted: false,
            startWithVideoMuted: mode !== 'video',
            disableAP: false,
            disableAEC: false,
            disableAGC: false,
            disableNS: false,
            enableNoisyMicDetection: true,
            enableLayerSuspension: true,
            // Use the Jitsi bridge/SFU path instead of direct browser-to-browser media.
            p2p: { enabled: false },
            hideConferenceSubject: true,
          },
          interfaceConfigOverwrite: {
            MOBILE_APP_PROMO: false,
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            HIDE_INVITE_MORE_HEADER: true,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            TILE_VIEW_MAX_COLUMNS: 2,
            TOOLBAR_BUTTONS: ['microphone', 'camera', 'desktop', 'fullscreen', 'hangup', 'chat', 'settings', 'raisehand', 'videoquality'],
          },
        });
        jitsiRef.current = apiInstance;

        apiInstance.addListener('videoConferenceJoined', async () => {
          if (!mountedRef.current || endedRef.current) return;
          setParticipantCount((count) => Math.max(1, count));
          setStatus('Waiting for participant');
          try { await update(callRef, { status: 'JOINED_MEDIA', mediaJoinedAt: serverTimestamp() }); } catch { /* non-fatal */ }
        });
        apiInstance.addListener('participantJoined', () => {
          if (!mountedRef.current || endedRef.current) return;
          startedAtRef.current ||= Date.now();
          setParticipantCount((count) => count + 1);
          setStatus('Connected');
          update(callRef, { status: 'ACTIVE', connectedAt: serverTimestamp() }).catch(() => {});
        });
        apiInstance.addListener('participantLeft', () => {
          setParticipantCount((count) => Math.max(1, count - 1));
          setStatus('Reconnecting…');
        });
        apiInstance.addListener('videoConferenceLeft', () => {
          if (!endedRef.current) finishRef.current?.(false, 'LEFT_CALL_SCREEN');
        });
        apiInstance.addListener('readyToClose', () => {
          if (!endedRef.current) finishRef.current?.(false, 'USER_ENDED');
        });
        apiInstance.addListener('cameraError', (event) => {
          if (!mountedRef.current || endedRef.current || mode !== 'video') return;
          setError(event?.message || 'Camera access failed. Check browser camera permission.');
        });
        apiInstance.addListener('micError', (event) => {
          if (!mountedRef.current || endedRef.current) return;
          setError(event?.message || 'Microphone access failed. Check browser microphone permission.');
        });
        apiInstance.addListener('errorOccurred', (event) => {
          if (!mountedRef.current || endedRef.current) return;
          const message = event?.message || 'The meeting service reported an error.';
          setError(message);
          if (event?.isFatal) setStatus('Connection failed');
        });
      } catch (e) {
        if (!cancelled && mountedRef.current && !endedRef.current) {
          setStatus('Unavailable');
          setError(e?.message || 'Could not start the meeting.');
          try {
            if (callRef) await update(callRef, {
              status: 'ENDED',
              endReason: 'MEDIA_SERVER_UNAVAILABLE',
              endedAt: serverTimestamp(),
              endedBy: Number(user.id),
            });
            if (realtimeDb) {
              await remove(ref(realtimeDb, `incomingCalls/${user.id}/${callId}`));
              if (targetId) await remove(ref(realtimeDb, `incomingCalls/${targetId}/${callId}`));
            }
          } catch { /* cleanup is best effort */ }
        }
      }
    };
    startCall();
    return () => {
      cancelled = true;
      cleanupJitsi();
    };
  }, [callId, callRef, cleanupJitsi, incoming, mode, roomName, targetId, user?.id, user?.name]);

  // If the other side ends the call, close the embedded conference too.
  useEffect(() => {
    if (!callRef) return undefined;
    const unsubscribe = onValue(callRef, (snap) => {
      const data = snap.val();
      if (!data || data.status !== 'ENDED' || endedRef.current) return;
      if (Number(data.endedBy) !== Number(user.id)) finishRef.current?.(true, data.endReason || 'PARTICIPANT_ENDED');
    });
    return unsubscribe;
  }, [callRef, user.id]);

  useEffect(() => {
    if (sessionId) return undefined;
    const timer = setInterval(() => {
      if (startedAtRef.current && !endedRef.current) setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionId]);

  useEffect(() => {
    if (!chatOpen || !targetId) return undefined;
    let active = true;
    let unsubscribe = () => {};
    ensureFirebase().then(() => {
      if (!active) return;
      setChatReady(true);
      unsubscribe = onValue(ref(realtimeDb, `chats/${chatId(user.id, targetId)}/messages`), (snap) => {
        const values = snap.val() || {};
        setMessages(Object.entries(values).map(([id, x]) => ({ id, ...x })).sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0)));
      });
    }).catch((e) => { if (active) setError(e.message || 'Could not open session chat.'); });
    return () => { active = false; setChatReady(false); unsubscribe(); };
  }, [chatOpen, targetId, user.id]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !targetId) return;
    try {
      await ensureFirebase();
      await push(ref(realtimeDb, `chats/${chatId(user.id, targetId)}/messages`), {
        senderId: Number(user.id), senderName: user.name, text: message.trim(), createdAt: Date.now(),
      });
      setMessage('');
    } catch (e2) { setError(e2.message || 'Could not send message.'); }
  };

  const sendAttachment = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !targetId) return;
    try {
      await ensureFirebase();
      if (!firebaseStorage) throw new Error('File sharing is not configured. Enable Firebase Storage.');
      if (file.size > 20 * 1024 * 1024) throw new Error('Files must be 20 MB or smaller.');
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = storageRef(firebaseStorage, `chat-files/${chatId(user.id, targetId)}/${Date.now()}-${safe}`);
      await uploadBytes(path, file, { contentType: file.type || 'application/octet-stream' });
      const attachment = { url: await getDownloadURL(path), name: file.name, size: file.size, type: file.type || 'application/octet-stream' };
      await push(ref(realtimeDb, `chats/${chatId(user.id, targetId)}/messages`), {
        senderId: Number(user.id), senderName: user.name, attachment, createdAt: Date.now(),
      });
    } catch (e2) { setError(e2.message || 'Could not send the file.'); }
  };

  const elapsedText = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;
  const remainingText = sessionRemaining === null ? '—' : `${String(Math.floor(sessionRemaining / 60)).padStart(2, '0')}:${String(sessionRemaining % 60).padStart(2, '0')}`;
  const durationLabel = sessionMeta?.duration_minutes ? `${sessionMeta.duration_minutes} min` : '';

  return <>
    {sessionSummary && <div className="session-summary-overlay"><div className="session-summary-card"><div className="session-summary-check"><Check size={28} /></div><span className="call-overline">SESSION FINISHED</span><h2>{sessionSummary.reason === 'TIME_EXPIRED' ? 'Time is up' : 'Session ended'}</h2><p>Your SkillSwap session has been marked completed for both participants.</p><div className="session-summary-stats"><div><strong>{String(Math.floor(sessionSummary.duration / 60)).padStart(2, '0')}:{String(sessionSummary.duration % 60).padStart(2, '0')}</strong><span>time spent</span></div><div><strong>{durationLabel || 'Session'}</strong><span>scheduled duration</span></div></div><div className="session-summary-note">You can now rate your partner and confirm your learning progress.</div></div></div>}

    <main className={`call-room-v3 ${chatOpen ? 'chat-open' : ''} ${fullscreen ? 'is-fullscreen' : ''}`}>
      <header className="call-top-v3">
        <div className="call-identity-v3">
          <button className="call-icon-btn" onClick={() => finish(false, 'LEFT_CALL_SCREEN')}><ArrowLeft size={18} /></button>
          <div className="call-avatar">{initials(targetName)}</div>
          <div><div className="call-overline">LIVE SKILLSWAP {mode === 'video' ? 'VIDEO' : 'VOICE'} SESSION</div><h1>{targetName}</h1><div className="call-status"><i className={status === 'Connected' ? 'live' : ''} />{status}{status === 'Connected' && <span> · {elapsedText}</span>}</div>{sessionMeta && <div className={`session-countdown ${sessionRemaining !== null && sessionRemaining <= 60 ? 'urgent' : ''}`}><span>TIME LEFT</span><strong>{remainingText}</strong></div>}</div>
        </div>
        <div className="call-top-actions"><div className="secure-label"><ShieldCheck size={14} /> Media server protected</div><span className="participant-chip">{participantCount} participant{participantCount === 1 ? '' : 's'}</span><button className={`call-icon-btn ${chatOpen ? 'active' : ''}`} onClick={() => setChatOpen((v) => !v)}><MessageCircle size={18} /></button><button className="call-icon-btn" onClick={() => setFullscreen((v) => !v)}><Maximize2 size={18} /></button></div>
      </header>

      {error && <div className="call-error-v3"><span>{error}</span><button onClick={() => setError('')}><X size={15} /></button></div>}

      <div className="call-body-v3">
        <section className="call-stage-v3">
          <div ref={jitsiContainerRef} className="jitsi-frame" aria-label="SkillSwap meeting" />
          {status !== 'Connected' && <div className="meeting-loading"><div className="meeting-spinner" /><strong>{status === 'Calling' ? `Calling ${targetName}` : status === 'Waiting for participant' ? `Waiting for ${targetName}` : status === 'Unavailable' ? 'Meeting service unavailable' : 'Joining secure meeting…'}</strong><span>{status === 'Unavailable' ? 'Check VITE_JITSI_DOMAIN and network access' : JITSI_DOMAIN}</span></div>}
          <div className="meeting-brand"><span>SKILLSWAP</span><small>{roomName}</small></div>
        </section>

        {chatOpen && <aside className="call-chat-v3"><div className="call-chat-top"><div><span>SESSION CHAT</span><strong>{targetName}</strong></div><button onClick={() => setChatOpen(false)}><X size={17} /></button></div><div className="call-chat-list">{messages.length ? messages.map((m) => <div className={`call-msg ${Number(m.senderId) === Number(user.id) ? 'mine' : ''}`} key={m.id}>{m.text && <span>{m.text}</span>}{m.attachment && <a className="chat-file" href={m.attachment.url} target="_blank" rel="noreferrer">{m.attachment.type?.startsWith('image/') ? <img src={m.attachment.url} alt={m.attachment.name} /> : <>📎</>}<strong>{m.attachment.name}</strong><small>{Math.max(1, Math.round((m.attachment.size || 0) / 1024))} KB</small></a>}<small>{m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</small></div>) : <div className="chat-empty"><MessageCircle size={25} /><strong>Keep learning while you talk</strong><span>Send links, questions and quick notes without leaving the session.</span></div>}</div><form onSubmit={sendMessage} className="call-composer"><label className="chat-attach" title="Send photo or document">📎<input type="file" onChange={sendAttachment} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv" hidden /></label><input value={message} onChange={(e) => setMessage(e.target.value)} disabled={!chatReady} placeholder={chatReady ? 'Write a message…' : 'Connecting…'} /><button disabled={!message.trim() || !chatReady}><Send size={16} /></button></form></aside>}
      </div>

      <footer className="call-bottom-v3"><div className="media-note"><Phone size={15} /><span>{mode === 'video' ? 'Two-way video + audio' : 'Two-way voice'} · Jitsi media</span></div><button className="call-chat-button" onClick={() => setChatOpen((v) => !v)}><MessageCircle size={18} /><span>Chat</span></button><button className="end-session-btn" onClick={() => finish(false, 'USER_ENDED')}><PhoneOff size={18} /><span>{sessionId ? 'End session' : 'End call'}</span></button></footer>
    </main>
  </>;
}
