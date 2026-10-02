import { useEffect, useState } from 'react';
import { Phone, Video, X } from 'lucide-react';
import { onValue, ref, remove, update } from 'firebase/database';
import { signInAnonymously } from 'firebase/auth';
import { firebaseAuth, realtimeDb, firebaseConfigured } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import './RealtimeCallManager.css';

export default function RealtimeCallManager() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [incoming, setIncoming] = useState(null);

  useEffect(() => {
    if (!user?.id || !firebaseConfigured || !firebaseAuth || !realtimeDb) return undefined;
    let unsubscribe = () => {};
    let alive = true;
    (async () => {
      try {
        if (!firebaseAuth.currentUser) await signInAnonymously(firebaseAuth);
        if (!alive) return;
        unsubscribe = onValue(ref(realtimeDb, `incomingCalls/${user.id}`), snap => {
          const calls = snap.val() || {};
          const entry = Object.entries(calls).find(([, call]) => call?.status === 'RINGING');
          if (!entry || location.pathname.endsWith('-call')) return;
          const [callId, call] = entry;
          setIncoming({ callId, ...call });
        });
      } catch (error) {
        console.warn('Incoming call listener unavailable:', error.message);
      }
    })();
    return () => { alive = false; unsubscribe(); };
  }, [user?.id, location.pathname]);

  if (!incoming || location.pathname.endsWith('-call')) return null;

  const decline = async () => {
    try {
      await update(ref(realtimeDb, `calls/${incoming.callId}`), { status: 'ENDED', endReason: 'DECLINED', endedAt: Date.now(), endedBy: Number(user.id) });
      await remove(ref(realtimeDb, `incomingCalls/${user.id}/${incoming.callId}`));
    } finally { setIncoming(null); }
  };

  const accept = () => {
    setIncoming(null);
    navigate(`/${incoming.type === 'video' ? 'video' : 'voice'}-call?incoming=1&callId=${encodeURIComponent(incoming.callId)}&userId=${encodeURIComponent(incoming.callerId)}&callerId=${encodeURIComponent(incoming.callerId)}&name=${encodeURIComponent(incoming.callerName || 'SkillSwap user')}`);
  };

  return <div className="incoming-call-toast">
    <div className="incoming-icon">{incoming.type === 'video' ? <Video size={20}/> : <Phone size={20}/>}</div>
    <div className="incoming-copy"><span>Incoming {incoming.type === 'video' ? 'video' : 'voice'} call</span><strong>{incoming.callerName || 'SkillSwap user'}</strong></div>
    <button className="incoming-decline" onClick={decline} title="Decline"><X size={18}/></button>
    <button className="incoming-accept" onClick={accept}>{incoming.type === 'video' ? <Video size={16}/> : <Phone size={16}/>} Accept</button>
  </div>;
}
