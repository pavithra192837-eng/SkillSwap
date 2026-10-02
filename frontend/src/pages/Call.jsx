import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  onChildAdded, onValue, onDisconnect, push, ref, remove, set, update
} from "firebase/database";
import { signInAnonymously } from "firebase/auth";
import { Mic, MicOff, Video, VideoOff, PhoneOff, ShieldCheck } from "lucide-react";
import { firebaseAuth, realtimeDb, firebaseConfigured } from "../firebase";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import "./Call.css";

async function ensureAuth() {
  if (!firebaseConfigured || !firebaseAuth || !realtimeDb) {
    throw new Error("Realtime calling is not configured. Add the VITE_FIREBASE_* values to frontend/.env.");
  }
  if (!firebaseAuth.currentUser) await signInAnonymously(firebaseAuth);
}

export default function Call() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const callIdParam = params.get("callId");
  const callerIdParam = params.get("callerId");
  const incoming = Boolean(callIdParam);
  const targetId = Number(params.get("userId"));
  const targetName = params.get("name") || "SkillSwap user";
  const sessionId = Number(params.get("sessionId")) || null;
  const type = location.pathname === "/video-call" ? "video" : "voice";
  const callIdRef = useRef(callIdParam || `${user.id}_${targetId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const cleanupRef = useRef(() => {});
  const endedRef = useRef(false);
  const [status, setStatus] = useState(incoming ? "Connecting…" : "Calling…");
  const connectedRef = useRef(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [error, setError] = useState("");

  const finish = useCallback(async (goBack = true, reason = "USER_ENDED") => {
    if (endedRef.current) {
      if (goBack) navigate("/messages");
      return;
    }
    endedRef.current = true;
    setStatus("Call ended");

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    if (pcRef.current) {
      pcRef.current.ontrack = null;
      pcRef.current.onicecandidate = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }

    if (sessionId && ["USER_ENDED", "REMOTE_ENDED"].includes(reason)) {
      try { await api.put(`/sessions/${sessionId}/complete`); } catch (e) { console.warn("Session completion sync failed:", e.message); }
    }

    if (firebaseConfigured && realtimeDb) {
      try {
        const callId = callIdRef.current;
        const callRef = ref(realtimeDb, `calls/${callId}`);
        await update(callRef, { status: "ENDED", endReason: reason, endedAt: Date.now() });
        await remove(ref(realtimeDb, `incomingCalls/${user.id}/${callId}`));
        if (targetId) await remove(ref(realtimeDb, `incomingCalls/${targetId}/${callId}`));
      } catch (e) {
        console.warn("Call cleanup failed:", e.message);
      }
    }
    cleanupRef.current?.();
    cleanupRef.current = () => {};
    if (goBack) navigate("/messages", { replace: true });
  }, [navigate, sessionId, targetId, user.id]);

  useEffect(() => {
    let disposed = false;
    const localCleanups = [];

    const run = async () => {
      try {
        await ensureAuth();
        if (disposed) return;

        const callId = callIdRef.current;
        const callRef = ref(realtimeDb, `calls/${callId}`);
        const receiverId = incoming ? Number(callerIdParam || params.get("userId")) : targetId;
        if (!receiverId) throw new Error("The other participant could not be identified.");

        const iceServers = [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ];
        if (import.meta.env.VITE_TURN_URL && import.meta.env.VITE_TURN_USERNAME && import.meta.env.VITE_TURN_CREDENTIAL) {
          iceServers.push({
            urls: import.meta.env.VITE_TURN_URL,
            username: import.meta.env.VITE_TURN_USERNAME,
            credential: import.meta.env.VITE_TURN_CREDENTIAL,
          });
        }
        const pc = new RTCPeerConnection({ iceServers });
        pcRef.current = pc;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: type === "video" });
        if (disposed || endedRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        localStreamRef.current = stream;
        const localVideo = document.getElementById("local-call-video");
        if (localVideo) localVideo.srcObject = stream;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          const remoteStream = event.streams[0];
          const remoteVideo = document.getElementById("remote-call-video");
          const remoteAudio = document.getElementById("remote-call-audio");
          if (remoteVideo) remoteVideo.srcObject = remoteStream;
          if (remoteAudio) remoteAudio.srcObject = remoteStream;
        };

        pc.onconnectionstatechange = () => {
          if (["connected"].includes(pc.connectionState)) { connectedRef.current = true; setStatus("Connected"); }
          if (["failed", "closed"].includes(pc.connectionState) && !endedRef.current) finish(true, "CONNECTION_LOST");
        };

        const ownCandidatesPath = incoming ? "receiverCandidates" : "callerCandidates";
        const otherCandidatesPath = incoming ? "callerCandidates" : "receiverCandidates";
        pc.onicecandidate = (event) => {
          if (event.candidate && !endedRef.current) {
            push(ref(realtimeDb, `calls/${callId}/${ownCandidatesPath}`), event.candidate.toJSON()).catch(() => {});
          }
        };

        // If the browser/network disappears, Firebase marks this call ended for the other user.
        await onDisconnect(callRef).update({ status: "ENDED", endReason: "DISCONNECTED", endedAt: Date.now() });
        await onDisconnect(ref(realtimeDb, `incomingCalls/${incoming ? user.id : receiverId}/${callId}`)).remove();

        const statusUnsub = onValue(callRef, async (snap) => {
          const data = snap.val();
          if (!data) return;
          if (data.status === "ENDED" && !endedRef.current) {
            await finish(true, data.endReason || "REMOTE_ENDED");
          }
        });
        localCleanups.push(statusUnsub);

        if (!incoming) {
          const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: type === "video" });
          await pc.setLocalDescription(offer);
          await set(callRef, {
            callerId: Number(user.id),
            callerName: user.name,
            receiverId,
            receiverName: targetName,
            type,
            status: "RINGING",
            offer: { type: offer.type, sdp: offer.sdp },
            createdAt: Date.now(),
          });
          await set(ref(realtimeDb, `incomingCalls/${receiverId}/${callId}`), {
            callerId: Number(user.id),
            callerName: user.name,
            receiverId,
            receiverName: targetName,
            type,
            status: "RINGING",
            createdAt: Date.now(),
          });
          setStatus("Ringing…");
        } else {
          // Wait for either an offer or an already-ended call.
          const data = await new Promise((resolve, reject) => {
            let done = false;
            const unsub = onValue(callRef, (snap) => {
              const value = snap.val();
              if (value?.status === "ENDED") {
                done = true;
                unsub();
                reject(new Error("This call has already ended."));
              } else if (value?.offer) {
                done = true;
                unsub();
                resolve(value);
              }
            });
            setTimeout(() => {
              if (!done) {
                unsub();
                reject(new Error("The call invitation expired."));
              }
            }, 30000);
          });
          if (endedRef.current) return;
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          connectedRef.current = true;
          await update(callRef, { answer: { type: answer.type, sdp: answer.sdp }, status: "CONNECTED" });
          await remove(ref(realtimeDb, `incomingCalls/${user.id}/${callId}`));
          setStatus("Connected");
        }

        const candidateUnsub = onChildAdded(ref(realtimeDb, `calls/${callId}/${otherCandidatesPath}`), (snap) => {
          const candidate = snap.val();
          if (candidate && !endedRef.current) pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
        });
        localCleanups.push(candidateUnsub);

        const timeout = setTimeout(() => {
          if (!endedRef.current && !connectedRef.current) finish(true, "NO_ANSWER");
        }, 30000);
        localCleanups.push(() => clearTimeout(timeout));
      } catch (e) {
        if (disposed || endedRef.current) return;
        setError(e.message || "Could not start the call.");
        setStatus("Call unavailable");
      }
    };

    run();
    cleanupRef.current = () => localCleanups.splice(0).forEach((cleanup) => { try { cleanup(); } catch {} });

    return () => {
      disposed = true;
      cleanupRef.current?.();
      if (!endedRef.current) finish(false, "LEFT_CALL_SCREEN");
    };
  }, [finish, incoming, callerIdParam, callIdParam, targetId, targetName, type, user.id, user.name]);

  const toggleMute = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMuted(!track.enabled);
  };

  const toggleCamera = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setCameraOff(!track.enabled);
  };

  return (
    <main className={`call-page-real ${type}`}>
      <header className="call-topbar">
        <div><span className="call-eyebrow">{type === "video" ? "VIDEO SESSION" : "VOICE SESSION"}</span><h1>{targetName}</h1><p><span className={`call-dot ${status === "Connected" ? "live" : ""}`} />{status}</p></div>
        <div className="call-secure"><ShieldCheck size={17} /> Private session</div>
      </header>
      {error && <div className="call-error">{error}</div>}
      <section className="call-stage">
        {type === "video" ? <><video id="remote-call-video" autoPlay playsInline className="remote-video-real" /><div className="remote-placeholder"><div>{targetName[0]}</div><span>{status}</span></div><video id="local-call-video" autoPlay playsInline muted className="local-video-real" /></> : <div className="voice-center"><div className="voice-avatar">{targetName[0]?.toUpperCase()}</div><h2>{targetName}</h2><p>{status}</p><audio id="remote-call-audio" autoPlay /></div>}
      </section>
      <footer className="call-controls-real">
        <button className={`round-control ${muted ? "active" : ""}`} onClick={toggleMute}>{muted ? <MicOff /> : <Mic />}<span>{muted ? "Unmute" : "Mute"}</span></button>
        {type === "video" && <button className={`round-control ${cameraOff ? "active" : ""}`} onClick={toggleCamera}>{cameraOff ? <VideoOff /> : <Video />}<span>{cameraOff ? "Camera on" : "Camera off"}</span></button>}
        <button className="end-call-control" onClick={() => finish(true, "USER_ENDED")}><PhoneOff /><span>End call</span></button>
      </footer>
    </main>
  );
}
