import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Camera, CameraOff, Check, Maximize2, MessageCircle, Mic, MicOff, PhoneOff, Send, ShieldCheck, Volume2, X } from 'lucide-react';
import { get, onChildAdded, onValue, push, ref, remove, serverTimestamp, set, update } from 'firebase/database';
import { signInAnonymously } from 'firebase/auth';
import { firebaseAuth, realtimeDb, firebaseConfigured } from '../firebase';
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

// Session timestamps come from the API as UTC ISO strings (or Date values).
// Never let a mobile browser guess the timezone of a MySQL DATETIME string.
function parseServerTime(value) {
  if (!value) return NaN;
  if (value instanceof Date) return value.getTime();
  const raw = String(value).trim();
  if (!raw) return NaN;

  // ISO timestamps with Z/offset are safe to parse directly.
  if (/Z$|[+-]\d{2}:?\d{2}$/.test(raw)) {
    const time = Date.parse(raw);
    return Number.isFinite(time) ? time : NaN;
  }

  // Defensive fallback for a UTC MySQL DATETIME returned without timezone.
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/);
  if (!match) return NaN;
  const [, y, mo, d, h, mi, sec = '0'] = match;
  return Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(sec));
}

function getMediaErrorMessage(error, mode) {
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    return 'Microphone access requires HTTPS on a phone. Open SkillSwap using the HTTPS link, not an HTTP link.';
  }
  if (!navigator?.mediaDevices?.getUserMedia) {
    return 'This browser cannot access the microphone. Use the latest Chrome, Edge, Safari, or Firefox and allow microphone access.';
  }

  switch (error?.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return 'Microphone permission is blocked. On your phone, open browser/site settings, allow Microphone' +
        (mode === 'video' ? ' and Camera' : '') +
        ', then reload this page and join again.';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'No microphone' + (mode === 'video' ? ' or camera' : '') + ' was found. Check that the device is available and try again.';
    case 'NotReadableError':
    case 'TrackStartError':
      return 'The microphone is already being used by another app or browser tab. Close it and try again.';
    case 'SecurityError':
      return 'The browser blocked microphone access for security reasons. Use the HTTPS SkillSwap link and allow microphone access.';
    case 'AbortError':
      return 'Microphone access was interrupted. Please try joining the session again.';
    default:
      return error?.message || 'Could not access the microphone. Check browser permissions and try again.';
  }
}

export default function Call() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const incoming = params.get('incoming') === '1';
  const targetId = Number(params.get('userId'));
  const targetName = params.get('name') || 'SkillSwap student';
  const sessionId = params.get('sessionId');
  const generatedCallId = useMemo(randomId, []);
  // A scheduled lesson gets one deterministic room ID. Both participants can
  // enter from the Sessions page without accidentally creating two call rooms.
  const callId = params.get('callId') || (sessionId ? `session-${sessionId}` : generatedCallId);
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
  const lastRemoteDescriptionRef = useRef(null);
  const candidateQueueRef = useRef([]);
  const politeRef = useRef(incoming);
  const startedAtRef = useRef(0);
  const finishRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  const [status, setStatus] = useState(sessionId ? 'Waiting for participant' : (incoming ? 'Joining' : 'Calling'));
  const [roomParticipants, setRoomParticipants] = useState(sessionId ? 1 : 0);
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
  // Session rooms use a deterministic tie-breaker so two people joining
  // from the Sessions page can negotiate even if neither uses the incoming-call popup.
  politeRef.current = sessionId ? Number(user?.id) > Number(targetId) : incoming;

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
    lastRemoteDescriptionRef.current = null;
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
      if (realtimeDb && sessionId) await remove(ref(realtimeDb, `calls/${callId}/participants/${Number(user.id)}`));
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
    if (Date.now() >= start && sessionMeta.status === 'SCHEDULED') {
      api.put(`/sessions/${sessionId}/start`).then(() => api.get(`/sessions/${sessionId}`)).then((r) => setSessionMeta(r.data.session)).catch((e) => {
        if (e?.response?.status !== 400 && e?.response?.status !== 409) setError(e?.response?.data?.message || 'This lesson cannot be started yet.');
      });
    }
  }, [sessionId, sessionMeta?.scheduled_at, sessionMeta?.status]);

  useEffect(() => {
    if (!sessionMeta?.scheduled_at) return undefined;

    // Prefer the server-calculated ends_at. This prevents a phone/browser
    // timezone interpretation from shortening or extending the lesson.
    const start = parseServerTime(sessionMeta.scheduled_at);
    const explicitEnd = parseServerTime(sessionMeta.ends_at);
    const end = Number.isFinite(explicitEnd)
      ? explicitEnd
      : (Number.isFinite(start) && Number(sessionMeta.duration_minutes)
        ? start + Number(sessionMeta.duration_minutes) * 60000
        : NaN);

    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      setError('The session time received from the server is invalid. Please refresh and try again.');
      return undefined;
    }

    const tick = () => {
      const remaining = Math.max(0, end - Date.now());
      setSessionRemaining(Math.ceil(remaining / 1000));
      setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));

      // Only the actual server-defined end time can complete the lesson.
      if (remaining <= 0 && !endedRef.current && sessionMeta.status !== 'COMPLETED') {
        finishRef.current?.(false, 'TIME_EXPIRED');
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [sessionMeta?.scheduled_at, sessionMeta?.ends_at, sessionMeta?.duration_minutes]);

  const startNativeCall = useCallback(async () => {
    await ensureFirebase();
    if (!callRef || !signalRef || !targetId || !user?.id) throw new Error('The other participant is missing.');
    const generation = ++generationRef.current;
    const alive = () => mountedRef.current && !endedRef.current && generationRef.current === generation;

    // A scheduled lesson is a meeting room, not a person-to-person call.
    // The first participant must enter a waiting room; we only start WebRTC
    // after the second participant has entered the same session room.
    if (sessionId) {
      const participantsRef = ref(realtimeDb, `calls/${callId}/participants`);
      const myParticipantRef = ref(realtimeDb, `calls/${callId}/participants/${Number(user.id)}`);
      await set(myParticipantRef, {
        userId: Number(user.id),
        name: user.name || 'Student',
        joinedAt: serverTimestamp(),
      });
      await update(callRef, {
        sessionId,
        type: mode,
        status: 'WAITING',
        roomReady: false,
      });
      setStatus('Waiting for participant');

      // Do not notify/ring the other user. They enter the room themselves
      // from the scheduled lesson card, just like a meeting link.
      while (alive()) {
        const snapshot = await get(participantsRef);
        const participants = snapshot.val() || {};
        const count = Object.keys(participants).length;
        setRoomParticipants(count);
        if (count >= 2) break;
        await new Promise((resolve) => setTimeout(resolve, 900));
      }
      if (!alive()) return;
      setStatus('Connecting…');
      await update(callRef, { roomReady: true });
    }

    if (incoming) {
      const existing = await get(callRef);
      const existingCall = existing.val();
      if (!existingCall || existingCall.status === 'ENDED') throw new Error('This call has already ended. Start a new call from Messages.');
    }

    if (typeof window !== 'undefined' && !window.isSecureContext) {
      const error = new Error('Microphone access requires HTTPS on a phone.');
      error.name = 'SecurityError';
      throw error;
    }
    if (!navigator?.mediaDevices?.getUserMedia) {
      const error = new Error('This browser does not support microphone access.');
      error.name = 'NotSupportedError';
      throw error;
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

        // Firebase keeps signalling records, so a newly created RTCPeerConnection
        // can see an SDP message from an earlier negotiation. Never apply an old
        // answer while the peer is already stable: doing so throws
        // "Called in wrong state: stable".
        const descriptionKey = `${description.type}:${description.sdp || ''}`;
        if (lastRemoteDescriptionRef.current === descriptionKey) return;

        // An answer is valid only after we created a local offer. Ignore stale or
        // duplicate answers instead of putting the peer connection into an invalid
        // signalling state.
        if (description.type === 'answer' && pc.signalingState !== 'have-local-offer') return;

        const offerCollision = description.type === 'offer' &&
          (makingOfferRef.current || pc.signalingState !== 'stable');
        ignoreOfferRef.current = !politeRef.current && offerCollision;
        if (ignoreOfferRef.current) return;

        // Perfect-negotiation rollback: if both sides created an offer at the same
        // time, the polite side rolls back before accepting the incoming offer.
        if (description.type === 'offer' && offerCollision && politeRef.current) {
          await pc.setLocalDescription({ type: 'rollback' });
        }

        await pc.setRemoteDescription(description);
        lastRemoteDescriptionRef.current = descriptionKey;
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
    const callMeta = sessionId
      ? { sessionId, type: mode, status: 'WAITING', roomReady: true }
      : (incoming
        ? { calleeId: Number(user.id), calleeName: user.name, type: mode, status: 'JOINING', joinedAt: serverTimestamp(), sessionId: null }
        : { callerId: Number(user.id), calleeId: targetId, callerName: user.name, type: mode, status: 'RINGING', createdAt: serverTimestamp(), sessionId: null });
    await update(callRef, callMeta);
    if (!alive()) { unsubscribeSignals(); return; }
    if (!incoming && !sessionId) {
      await set(ref(realtimeDb, `incomingCalls/${targetId}/${callId}`), { callerId: Number(user.id), callerName: user.name, type: mode, status: 'RINGING', createdAt: Date.now(), sessionId: null });
    } else if (incoming) {
      await remove(ref(realtimeDb, `incomingCalls/${user.id}/${callId}`));
    }

    cleanupRef.current = () => { try { unsubscribeSignals(); } catch {} };
  }, [callId, callRef, incoming, mode, sessionId, signalRef, targetId, user?.id, user?.name]);

  useEffect(() => {
    let cancelled = false;
    startNativeCall().catch((e) => {
      if (cancelled || endedRef.current || !mountedRef.current) return;
      setStatus('Unavailable');
      setError(getMediaErrorMessage(e, mode));
    });
    return () => {
      cancelled = true;
      generationRef.current += 1;
      try { cleanupRef.current?.(); } catch {}
      cleanupPeer();
      cleanupMedia();
      if (sessionId && realtimeDb && user?.id) {
        remove(ref(realtimeDb, `calls/${callId}/participants/${Number(user.id)}`)).catch(() => {});
      }
    };
  }, [cleanupMedia, cleanupPeer, startNativeCall]);

  useEffect(() => {
    if (!callRef) return undefined;
    return onValue(callRef, (snap) => {
      const data = snap.val();
      if (!data) return;
      if (sessionId && data.participants) setRoomParticipants(Object.keys(data.participants).length);
      if (data.status !== 'ENDED' || endedRef.current) return;
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
    if (file.size > 20 * 1024 * 1024) { setError('Files must be 20 MB or smaller.'); return; }
    try {
      const conversationId = chatId(user.id, targetId);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('recipientId', String(targetId));
      formData.append('conversationId', conversationId);
      const response = await api.post('/uploads/chat', formData);
      const attachment = response.data.attachment;
      await ensureFirebase();
      await push(ref(realtimeDb, `chats/${conversationId}/messages`), { senderId: Number(user.id), senderName: user.name, attachment, createdAt: Date.now() });
    } catch (e2) { setError(e2?.response?.data?.message || e2.message || 'Could not send the file.'); }
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
        <div className="call-identity-v3"><button className="call-icon-btn" onClick={() => finish(false, 'LEFT_CALL_SCREEN')}><ArrowLeft size={18} /></button><div className="call-avatar">{initials(targetName)}</div><div><div className="call-overline">SKILLSWAP {mode === 'video' ? 'VIDEO' : 'VOICE'} CALL</div><h1>{targetName}</h1><div className="call-status"><i className={status === 'Connected' ? 'live' : ''} />{status}{status === 'Connected' && <span> · {elapsedText}</span>}</div>{sessionMeta && <div className={`session-countdown ${sessionRemaining !== null && sessionRemaining <= 60 ? 'urgent' : ''}`}><span>TIME LEFT</span><strong>{remainingText}</strong></div>}{sessionId && <div className="meeting-room-pill"><span>{roomParticipants}/2 in room</span></div>}</div></div>
        <div className="call-top-actions"><div className="secure-label"><ShieldCheck size={14} /> End-to-end WebRTC media</div><span className="participant-chip">{connectionType}</span><button className={`call-icon-btn ${chatOpen ? 'active' : ''}`} onClick={() => setChatOpen((v) => !v)}><MessageCircle size={18} /></button><button className="call-icon-btn" onClick={() => setFullscreen((v) => !v)}><Maximize2 size={18} /></button></div>
      </header>
      {error && <div className="call-error-v3"><span>{error}</span><button onClick={() => setError('')}><X size={15} /></button></div>}
      <div className="call-body-v3">
        <section className={`call-stage-v3 native-stage ${mode === 'audio' ? 'audio-stage' : ''}`}>
          {mode === 'video' ? <><video ref={remoteVideoRef} className="remote-video" autoPlay playsInline /><video ref={localVideoRef} className="local-video" autoPlay muted playsInline /><div className="video-fallback"><div className="call-avatar large">{initials(targetName)}</div><strong>{targetName}</strong><span>{remoteReady ? 'Camera connected' : status}</span></div></> : <div className="voice-stage"><div className="voice-avatar">{initials(targetName)}</div><strong>{targetName}</strong><span>{status}</span><small>{connectionType}</small></div>}
          <audio ref={remoteAudioRef} autoPlay playsInline />
          {status !== 'Connected' && <div className="meeting-loading"><div className="meeting-spinner" /><strong>{sessionId ? (roomParticipants < 2 ? 'Waiting for your learning partner' : 'Connecting both participants…') : (status === 'Calling' ? `Calling ${targetName}` : status === 'Unavailable' ? 'Call could not start' : status)}</strong><span>{error || (sessionId ? (roomParticipants < 2 ? 'You are in the scheduled meeting room. The session will start when the other participant joins.' : 'Both participants are here. Setting up the secure video connection…') : 'Establishing a secure media connection…')}</span>{sessionId && roomParticipants < 2 && <small className="meeting-room-note">Meeting room · {durationLabel || '60 min'} · Session time is fixed</small>}</div>}
          <div className="meeting-brand"><span>SKILLSWAP</span><small>Private two-person call</small></div>
        </section>
        {chatOpen && <aside className="call-chat-v3"><div className="call-chat-top"><div><span>CALL CHAT</span><strong>{targetName}</strong></div><button onClick={() => setChatOpen(false)}><X size={17} /></button></div><div className="call-chat-list">{messages.length ? messages.map((m) => <div className={`call-msg ${Number(m.senderId) === Number(user.id) ? 'mine' : ''}`} key={m.id}>{m.text && <span>{m.text}</span>}{m.attachment && <a className="chat-file" href={m.attachment.url} target="_blank" rel="noreferrer">📎 <strong>{m.attachment.name}</strong></a>}<small>{m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</small></div>) : <div className="chat-empty"><MessageCircle size={25} /><strong>Keep talking while you learn</strong><span>Send a message without leaving the call.</span></div>}</div><form onSubmit={sendMessage} className="call-composer"><label className="chat-attach" title="Send photo or document">📎<input type="file" onChange={sendAttachment} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv" hidden /></label><input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message…" /><button type="submit"><Send size={16} /></button></form></aside>}
      </div>
      <footer className="call-bottom-v3"><div className="media-note"><ShieldCheck size={15} /><span>Private WebRTC · {connectionType}</span></div><button className={`media-control ${muted ? 'off' : ''}`} onClick={toggleMute}>{muted ? <MicOff size={19} /> : <Mic size={19} />}<span>{muted ? 'Unmute' : 'Mute'}</span></button>{mode === 'video' && <button className={`media-control ${cameraOff ? 'off' : ''}`} onClick={toggleCamera}>{cameraOff ? <CameraOff size={19} /> : <Camera size={19} />}<span>{cameraOff ? 'Camera on' : 'Camera'}</span></button>}<button className="media-control" onClick={toggleSpeaker}><Volume2 size={19} /><span>{speaker ? 'Speaker' : 'Audio'}</span></button><button className="call-chat-button" onClick={() => setChatOpen((v) => !v)}><MessageCircle size={18} /><span>Chat</span></button><button className="end-session-btn" onClick={() => finish(false, 'USER_ENDED')}><PhoneOff size={18} /><span>{sessionId ? 'End session' : 'End call'}</span></button></footer>
    </main>
  </>;
}
