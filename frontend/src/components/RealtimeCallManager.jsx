import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { onValue, ref } from "firebase/database";
import { signInAnonymously } from "firebase/auth";
import { firebaseAuth, realtimeDb, firebaseConfigured } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function RealtimeCallManager() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user?.id || !firebaseConfigured || !firebaseAuth || !realtimeDb) return undefined;
    let unsubscribe = () => {};
    let active = true;
    (async () => {
      try {
        if (!firebaseAuth.currentUser) await signInAnonymously(firebaseAuth);
        if (!active) return;
        unsubscribe = onValue(ref(realtimeDb, `incomingCalls/${user.id}`), async (snap) => {
          const calls = snap.val() || {};
          const entry = Object.entries(calls).find(([, call]) => call?.status === "RINGING");
          if (!entry) return;
          const [callId, call] = entry;
          if (location.pathname === "/voice-call" || location.pathname === "/video-call") return;
          navigate(`${call.type === "video" ? "/video-call" : "/voice-call"}?callId=${encodeURIComponent(callId)}&userId=${encodeURIComponent(call.callerId)}&callerId=${encodeURIComponent(call.callerId)}&name=${encodeURIComponent(call.callerName || "SkillSwap user")}`, { replace: true });
        });
      } catch (error) {
        console.warn("Global call listener unavailable:", error.message);
      }
    })();
    return () => { active = false; unsubscribe(); };
  }, [user?.id, navigate, location.pathname]);

  return null;
}
