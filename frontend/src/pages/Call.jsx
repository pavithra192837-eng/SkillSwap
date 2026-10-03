import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Camera, CameraOff, Check, Maximize2, MessageCircle, Mic, MicOff, PhoneOff, Send, ShieldCheck, Volume2, X } from 'lucide-react';
import { get, onChildAdded, onValue, push, ref, remove, serverTimestamp, set, update } from 'firebase/database';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';
import { firebaseAuth, realtimeDb, firebaseConfigured, firebaseStorage } from '../firebase';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import './Call.css';

const randomId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const chatId = (a, b) => [Number(a), Number(b)].sort((x, y) => x - y).join('_');
const initials = (name = 'Student') => name.split(/\s+/).filter(Boolean).map((x) => x[0]).join('').slice(0, 2).toUpperCase() || 'S';

const parseTurnUrls = () => (import.meta.env.VITE_TURN_URL || '').split(',').map((x) => x.trim()).filter(Boolean);
const iceServers = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
  ...(parseTurnUrls().length && import.meta.env.VITE_TURN_USERNAME && import.meta.env.VITE_TURN_CREDENTIAL
    ? [{ urls: parseTurnUrls(), username: import.meta.env.VITE_TURN_USERNAME, credential: import.meta.env.VITE_TURN_CREDENTIAL }]
    : []),
];

async function ensureFirebase() {
  if (!firebaseConfigured || !firebaseAuth || !realtimeDb) throw new Error('Realtime calling is not configured. Add Firebase variables and enable Anonymous Authentication.');
  if (!firebaseAuth.currentUser) await signInAnonymously(firebaseAuth);
}

function safePlay(element) {
  if (!element) return;
  const result = element.play?.();
  if (result?.catch) result.catch(() => {});
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
  const signalRef = useMemo(() => realtimeDb ? ref(realtimeDb, `calls/${callId}/signals`) : null, [callId]);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const cleanupRef = useRef(() => {});
  const generationRef = useRef(0);
  const mountedRef = useRef(true);
  const endedRef = useRef(false);
  const completingRef = useRef(false);
  const makingOfferRef = useRef(false);
  const ignoreOfferRef = useRef(false);
  const remoteDescriptionReadyRef = useRef(false);
  const candidateQueueRef = useRef([]);
  const politeRef = useRef(incoming);
  const startedAtRef = useRef(0);
  const finishRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  const [status, setStatus] = useState(incoming ? 'Joining' : 'Calling');
  const [error, setError] = useState('');
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(mode !== 'video');
  const [speaker, setSpeaker] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [sessionMeta, setSessionMeta] = useState(null);
  const [sessionRemaining, setSessionRemaining] = useState(null);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [remoteReady, setRemoteReady] = useState(false);
  const [connectionType, setConnectionType] = useState('Checking connection');

  const cleanupMedia = useCallback(() => {
    const stream = localStreamRef.current;
    localStreamRef.current = null;
    if (stream) stream.getTracks().forEach((track) => { try { track.stop(); } catch {} });
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    remoteStreamRef.current = null;
  }, []);

  const cleanupPeer = useCallback(() => {
    const pc = pcRef.current;
    pcRef.current = null;
    if (pc) {
      pc.ontrack = null;
      pc.onicecandidate = null;
      pc.onnegotiationneeded = null;
      pc.onconnectionstatechange = null;
      pc.oniceconnectionstatechange = null;
      pc.onsignalingstatechange = null;
      try { pc.close(); } catch {}
    }
    makingOfferRef.current = false;
    remoteDescriptionReadyRef.current = false;
    candidateQueueRef.current = [];
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    reconnectTimerRef.current = null;
  }, []);

  const completeSession = useCallback(async (reason = 'COMPLETED') => {
    if (!sessionId || completingRef.current) return;
    completingRef.current = true;
    try { await api.put(`/sessions/${sessionId}/complete`, { reason }); } catch {}
  }, [sessionId]);

  const finish = useCallback(async (remote = false, reason = 'USER_ENDED') => {
    if (endedRef.current) return;
    endedRef.current = true;
    const completesLesson = reason === 'USER_ENDED' || reason === 'TIME_EXPIRED';
    setStatus(reason === 'TIME_EXPIRED' ? 'Time is up' : remote ? 'Participant left' : 'Ending call');
    generationRef.current += 1;
    cleanupPeer();
    cleanupMedia();

    try {
      if (callRef) await update(callRef, { status: 'ENDED', endReason: reason, endedAt: serverTimestamp(), endedBy: Number(user.id) });
      if (realtimeDb) {
        await remove(ref(realtimeDb, `incomingCalls/${user.id}/${callId}`));
        if (targetId) await remove(ref(realtimeDb, `incomingCalls/${targetId}/${callId}`));
      }
    } catch {}

    if (sessionId && completesLesson) await completeSession(reason);
    const duration = startedAtRef.current ? Math.max(0, Math.floor((Date.now() - startedAtRef.current) / 1000)) : elapsed;
    setSessionSummary(completesLesson ? { reason, duration } : null);
    window.setTimeout(() => navigate(sessionId ? '/sessions' : '/messages', { replace: true }), completesLesson && sessionId ? 2200 : 350);
  }, [callRef, callId, cleanupMedia, cleanupPeer, completeSession, elapsed, navigate, sessionId, targetId, user.id]);

  finishRef.current = finish;

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; generationRef.current += 1; cleanupPeer(); cleanupMedia(); };
  }, [cleanupMedia, cleanupPeer]);

  useEffect(() => {
    if (!sessionId) return undefined;
    let active = true;
    const loadSession = async () => {
      try {
        const r = await api.get(`/sessions/${sessionId}`);
        if (active) setSessionMeta(r.data.session);
      } catch { if (active) setError('Could not load the session timer.'); }
    };
    loadSession();
    const poll = setInterval(loadSession, 5000);
    return () => { active = false; clearInterval(poll); };
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || !sessionMeta || ['COMPLETED', 'CANCELLED'].includes(sessionMeta.status)) return undefined;
    const start = new Date(sessionMeta.scheduled_at).getTime();
    if (Date.now() >= start && sessionMeta.status !== 'IN_PROGRESS') {
      api.put(`/sessions/${sessionId}/start`).then(() => api.get(`/sessions/${sessionId}`)).then((r) => setSessionMeta(r.data.session)).catch((e) => {
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
  }, [sessionMeta]);

  const startNativeCall = useCallback(async () => {
    await ensureFirebase();
    if (!callRef || !signalRef || !targetId || !user?.id) throw new Error('The other participant is missing.');
    const generation = ++generationRef.current;
    const alive = () => mountedRef.current && !endedRef.current && generationRef.current === generation;

    if (incoming) {
      const existing = await get(callRef);
      const existingCall = existing.val();
      if (!existingCall || existingCall.status === 'ENDED') throw new Error('This call has already ended. Start a new call from Messages.');
    }

    const media = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
      video: mode === 'video' ? { width: { ideal: 1280, max: 1920 }, height: { ideal: 720, max: 1080 }, frameRate: { ideal: 30, max: 30 }, facingMode: 'user' } : false,
    });
    if (!alive()) { media.getTracks().forEach((t) => t.stop()); return; }
    localStreamRef.current = media;
    if (localVideoRef.current && mode === 'video') { localVideoRef.current.srcObject = media; safePlay(localVideoRef.current); }

    const pc = new RTCPeerConnection({ iceServers, bundlePolicy: 'max-bundle', rtcpMuxPolicy: 'require' });
    pcRef.current = pc;
    remoteStreamRef.current = new MediaStream();
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStreamRef.current;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStreamRef.current;
    media.getTracks().forEach((track) => pc.addTrack(track, media));

    const sendSignal = async (payload) => {
      if (!alive() || !signalRef) return;
      await push(signalRef, { ...payload, from: Number(user.id), createdAt: serverTimestamp() });
    };

    const flushCandidates = async () => {
      if (!alive() || !remoteDescriptionReadyRef.current) return;
      const queued = candidateQueueRef.current.splice(0);
      for (const candidate of queued) {
        try { await pc.addIceCandidate(candidate); } catch (e) { if (!ignoreOfferRef.current) console.warn('ICE candidate rejected:', e); }
      }
    };

    pc.ontrack = (event) => {
      if (!alive()) return;
      const stream = remoteStreamRef.current || new MediaStream();
      remoteStreamRef.current = stream;
      if (event.streams?.[0]) {
        event.streams[0].getTracks().forEach((track) => {
          if (!stream.getTracks().some((existing) => existing.id === track.id)) stream.addTrack(track);
        });
      } else if (!stream.getTracks().some((existing) => existing.id === event.track.id)) stream.addTrack(event.track);
      if (mode === 'video' && remoteVideoRef.current) { remoteVideoRef.current.srcObject = stream; remoteVideoRef.current.muted = false; safePlay(remoteVideoRef.current); }
      if (mode === 'audio' && remoteAudioRef.current) { remoteAudioRef.current.srcObject = stream; remoteAudioRef.current.muted = false; safePlay(remoteAudioRef.current); }
      setRemoteReady(true);
    };

    pc.onicecandidate = (event) => { if (event.candidate) sendSignal({ kind: 'candidate', candidate: event.candidate.toJSON ? event.candidate.toJSON() : event.candidate }).catch(() => {}); };

    pc.onconnectionstatechange = () => {
      if (!alive()) return;
      const state = pc.connectionState;
      if (state === 'connected') {
        startedAtRef.current ||= Date.now();
        setStatus('Connected');
        setConnectionType(pc.iceConnectionState === 'connected' ? 'Connected' : 'Connected · secure WebRTC');
        update(callRef, { status: 'ACTIVE', connectedAt: serverTimestamp() }).catch(() => {});
      } else if (state === 'connecting') setStatus('Connecting…');
      else if (state === 'disconnected') {
        setStatus('Reconnecting…');
        if (!reconnectTimerRef.current) reconnectTimerRef.current = setTimeout(() => {
          reconnectTimerRef.current = null;
          if (!alive() || pc.connectionState === 'closed') return;
          try { pc.restartIce(); } catch {}
        }, 1200);
      } else if (state === 'failed') {
        setStatus('Reconnecting…');
        try { pc.restartIce(); } catch {}
        window.setTimeout(() => {
          if (alive() && pc.connectionState === 'failed') setError('The network could not establish a media path. A TURN server is required for some mobile/college networks.');
        }, 6000);
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (!alive()) return;
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') setConnectionType('Connected · ICE');
      if (pc.iceConnectionState === 'checking') setConnectionType('Finding best network path…');
      if (pc.iceConnectionState === 'failed') { try { pc.restartIce(); } catch {} }
    };

    pc.onnegotiationneeded = async () => {
      if (!alive() || makingOfferRef.current || pc.signalingState !== 'stable') return;
      try {
        makingOfferRef.current = true;
        await pc.setLocalDescription();
        if (!alive() || pc.signalingState === 'closed') return;
        await sendSignal({ kind: 'description', description: pc.localDescription.toJSON ? pc.localDescription.toJSON() : pc.localDescription });
      } catch (e) {
        if (alive() && pc.signalingState !== 'closed') setError(`Negotiation failed: ${e?.message || 'connection setup failed'}`);
      } finally { makingOfferRef.current = false; }
    };

    const handleSignal = async (snap) => {
      const signal = snap.val();
      if (!signal || signal.from === Number(user.id) || !alive()) return;
      try {
        if (signal.kind === 'candidate') {
          const candidate = signal.candidate;
          if (!candidate) return;
          if (!remoteDescriptionReadyRef.current) candidateQueueRef.current.push(candidate);
          else if (pc.signalingState !== 'closed') await pc.addIceCandidate(candidate);
          return;
        }
        if (signal.kind !== 'description' || !signal.description || pc.signalingState === 'closed') return;
        const description = signal.description;
        const offerCollision = description.type === 'offer' && (makingOfferRef.current || pc.signalingState !== 'stable');
        ignoreOfferRef.current = !politeRef.current && offerCollision;
        if (ignoreOfferRef.current) return;
        await pc.setRemoteDescription(description);
        remoteDescriptionReadyRef.current = true;
        await flushCandidates();
        if (description.type === 'offer') {
          if (!alive() || pc.signalingState === 'closed') return;
          await pc.setLocalDescription();
          if (!alive() || pc.signalingState === 'closed') return;
          await sendSignal({ kind: 'description', description: pc.localDescription.toJSON ? pc.localDescription.toJSON() : pc.localDescription });
        }
      } catch (e) {
        if (alive() && pc.signalingState !== 'closed' && !ignoreOfferRef.current) setError(`Connection negotiation error: ${e?.message || 'try the call again'}`);
      }
    };

    const unsubscribeSignals = onChildAdded(signalRef, handleSignal);
    const callMeta = incoming
      ? { calleeId: Number(user.id), calleeName: user.name, type: mode, status: 'JOINING', joinedAt: serverTimestamp() }
      : { callerId: Number(user.id), calleeId: targetId, callerName: user.name, type: mode, status: 'RINGING', createdAt: serverTimestamp() };
    await update(callRef, callMeta);
    if (!alive()) { unsubscribeSignals(); return; }
    if (!incoming) {
      await set(ref(realtimeDb, `incomingCalls/${targetId}/${callId}`), { callerId: Number(user.id), callerName: user.name, type: mode, status: 'RINGING', createdAt: Date.now() });
    } else {
      await remove(ref(realtimeDb, `incomingCalls/${user.id}/${callId}`));
    }

    cleanupRef.current = () => { try { unsubscribeSignals(); } catch {} };
  }, [callId, callRef, incoming, mode, signalRef, targetId, user?.id, user?.name]);

  useEffect(() => {
    let cancelled = false;
    startNativeCall().catch((e) => {
      if (cancelled || endedRef.current || !mountedRef.current) return;
      setStatus('Unavailable');
      setError(e?.name === 'NotAllowedError' ? 'Microphone/camera permission was denied. Allow permission and try again.' : e?.message || 'Could not start the call.');
    });
    return () => {
      cancelled = true;
      generationRef.current += 1;
      try { cleanupRef.current?.(); } catch {}
      cleanupPeer();
      cleanupMedia();
    };
  }, [cleanupMedia, cleanupPeer, startNativeCall]);

  useEffect(() => {
    if (!callRef) return undefined;
    return onValue(callRef, (snap) => {
      const data = snap.val();
      if (!data || data.status !== 'ENDED' || endedRef.current) return;
      if (Number(data.endedBy) !== Number(user.id)) finishRef.current?.(true, data.endReason || 'PARTICIPANT_ENDED');
    });
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
      unsubscribe = onValue(ref(realtimeDb, `chats/${chatId(user.id, targetId)}/messages`), (snap) => {
        const values = snap.val() || {};
        setMessages(Object.entries(values).map(([id, x]) => ({ id, ...x })).sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0)));
      });
    }).catch((e) => { if (active) setError(e.message || 'Could not open session chat.'); });
    return () => { active = false; unsubscribe(); };
  }, [chatOpen, targetId, user.id]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !targetId) return;
    try {
      await ensureFirebase();
      await push(ref(realtimeDb, `chats/${chatId(user.id, targetId)}/messages`), { senderId: Number(user.id), senderName: user.name, text: message.trim(), createdAt: Date.now() });
      setMessage('');
    } catch (e2) { setError(e2.message || 'Could not send message.'); }
  };

  const sendAttachment = async (e) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file || !targetId) return;
    try {
      await ensureFirebase();
      if (!firebaseStorage) throw new Error('File sharing is not configured. Enable Firebase Storage.');
      if (file.size > 20 * 1024 * 1024) throw new Error('Files must be 20 MB or smaller.');
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = storageRef(firebaseStorage, `chat-files/${chatId(user.id, targetId)}/${Date.now()}-${safe}`);
      await uploadBytes(path, file, { contentType: file.type || 'application/octet-stream' });
      const attachment = { url: await getDownloadURL(path), name: file.name, size: file.size, type: file.type || 'application/octet-stream' };
      await push(ref(realtimeDb, `chats/${chatId(user.id, targetId)}/messages`), { senderId: Number(user.id), senderName: user.name, attachment, createdAt: Date.now() });
    } catch (e2) { setError(e2.message || 'Could not send the file.'); }
  };

  const toggleMute = () => {
    const track = localStreamRef.current?.getAudioTracks?.()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMuted(!track.enabled);
  };
  const toggleCamera = () => {
    const track = localStreamRef.current?.getVideoTracks?.()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setCameraOff(!track.enabled);
  };
  const toggleSpeaker = () => {
    const elements = [remoteAudioRef.current, remoteVideoRef.current].filter(Boolean);
    if (!elements.length) return;
    const next = !speaker;
    elements.forEach((element) => { element.muted = !next; });
    setSpeaker(next);
    if (next) elements.forEach(safePlay);
  };

  const elapsedText = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;
  const remainingText = sessionRemaining === null ? '—' : `${String(Math.floor(sessionRemaining / 60)).padStart(2, '0')}:${String(sessionRemaining % 60).padStart(2, '0')}`;
  const durationLabel = sessionMeta?.duration_minutes ? `${sessionMeta.duration_minutes} min` : '';

  return <>
    {sessionSummary && <div className="session-summary-overlay"><div className="session-summary-card"><div className="session-summary-check"><Check size={28} /></div><span className="call-overline">SESSION FINISHED</span><h2>{sessionSummary.reason === 'TIME_EXPIRED' ? 'Time is up' : 'Session ended'}</h2><p>Your SkillSwap session has been marked completed for both participants.</p><div className="session-summary-stats"><div><strong>{String(Math.floor(sessionSummary.duration / 60)).padStart(2, '0')}:{String(sessionSummary.duration % 60).padStart(2, '0')}</strong><span>time spent</span></div><div><strong>{durationLabel || 'Session'}</strong><span>scheduled duration</span></div></div></div></div>}
    <main className={`call-room-v3 ${chatOpen ? 'chat-open' : ''} ${fullscreen ? 'is-fullscreen' : ''}`}>
      <header className="call-top-v3">
        <div className="call-identity-v3"><button className="call-icon-btn" onClick={() => finish(false, 'LEFT_CALL_SCREEN')}><ArrowLeft size={18} /></button><div className="call-avatar">{initials(targetName)}</div><div><div className="call-overline">SKILLSWAP {mode === 'video' ? 'VIDEO' : 'VOICE'} CALL</div><h1>{targetName}</h1><div className="call-status"><i className={status === 'Connected' ? 'live' : ''} />{status}{status === 'Connected' && <span> · {elapsedText}</span>}</div>{sessionMeta && <div className={`session-countdown ${sessionRemaining !== null && sessionRemaining <= 60 ? 'urgent' : ''}`}><span>TIME LEFT</span><strong>{remainingText}</strong></div>}</div></div>
        <div className="call-top-actions"><div className="secure-label"><ShieldCheck size={14} /> End-to-end WebRTC media</div><span className="participant-chip">{connectionType}</span><button className={`call-icon-btn ${chatOpen ? 'active' : ''}`} onClick={() => setChatOpen((v) => !v)}><MessageCircle size={18} /></button><button className="call-icon-btn" onClick={() => setFullscreen((v) => !v)}><Maximize2 size={18} /></button></div>
      </header>
      {error && <div className="call-error-v3"><span>{error}</span><button onClick={() => setError('')}><X size={15} /></button></div>}
      <div className="call-body-v3">
        <section className={`call-stage-v3 native-stage ${mode === 'audio' ? 'audio-stage' : ''}`}>
          {mode === 'video' ? <><video ref={remoteVideoRef} className="remote-video" autoPlay playsInline /><video ref={localVideoRef} className="local-video" autoPlay muted playsInline /><div className="video-fallback"><div className="call-avatar large">{initials(targetName)}</div><strong>{targetName}</strong><span>{remoteReady ? 'Camera connected' : status}</span></div></> : <div className="voice-stage"><div className="voice-avatar">{initials(targetName)}</div><strong>{targetName}</strong><span>{status}</span><small>{connectionType}</small></div>}
          <audio ref={remoteAudioRef} autoPlay playsInline />
          {status !== 'Connected' && <div className="meeting-loading"><div className="meeting-spinner" /><strong>{status === 'Calling' ? `Calling ${targetName}` : status === 'Unavailable' ? 'Call could not start' : status}</strong><span>{error || 'Establishing a secure media connection…'}</span></div>}
          <div className="meeting-brand"><span>SKILLSWAP</span><small>Private two-person call</small></div>
        </section>
        {chatOpen && <aside className="call-chat-v3"><div className="call-chat-top"><div><span>CALL CHAT</span><strong>{targetName}</strong></div><button onClick={() => setChatOpen(false)}><X size={17} /></button></div><div className="call-chat-list">{messages.length ? messages.map((m) => <div className={`call-msg ${Number(m.senderId) === Number(user.id) ? 'mine' : ''}`} key={m.id}>{m.text && <span>{m.text}</span>}{m.attachment && <a className="chat-file" href={m.attachment.url} target="_blank" rel="noreferrer">📎 <strong>{m.attachment.name}</strong></a>}<small>{m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</small></div>) : <div className="chat-empty"><MessageCircle size={25} /><strong>Keep talking while you learn</strong><span>Send a message without leaving the call.</span></div>}</div><form onSubmit={sendMessage} className="call-composer"><label className="chat-attach" title="Send photo or document">📎<input type="file" onChange={sendAttachment} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv" hidden /></label><input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message…" /><button type="submit"><Send size={16} /></button></form></aside>}
      </div>
      <footer className="call-bottom-v3"><div className="media-note"><ShieldCheck size={15} /><span>Private WebRTC · {connectionType}</span></div><button className={`media-control ${muted ? 'off' : ''}`} onClick={toggleMute}>{muted ? <MicOff size={19} /> : <Mic size={19} />}<span>{muted ? 'Unmute' : 'Mute'}</span></button>{mode === 'video' && <button className={`media-control ${cameraOff ? 'off' : ''}`} onClick={toggleCamera}>{cameraOff ? <CameraOff size={19} /> : <Camera size={19} />}<span>{cameraOff ? 'Camera on' : 'Camera'}</span></button>}<button className="media-control" onClick={toggleSpeaker}><Volume2 size={19} /><span>{speaker ? 'Speaker' : 'Audio'}</span></button><button className="call-chat-button" onClick={() => setChatOpen((v) => !v)}><MessageCircle size={18} /><span>Chat</span></button><button className="end-session-btn" onClick={() => finish(false, 'USER_ENDED')}><PhoneOff size={18} /><span>{sessionId ? 'End session' : 'End call'}</span></button></footer>
    </main>
  </>;
}
