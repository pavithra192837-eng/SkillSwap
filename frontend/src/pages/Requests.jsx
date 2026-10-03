import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Clock3, Layers3, MessageCircle, RefreshCw, X } from 'lucide-react';
import api, { getErrorMessage } from '../api';
import './Requests.css';

function initials(name = 'Student') { return name.split(/\s+/).filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'S'; }
function dateText(v) { if (!v) return '—'; const d = new Date(v); return Number.isNaN(d.getTime()) ? v : d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }); }

export default function Requests() {
  const [tab, setTab] = useState('received');
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    try {
      setError('');
      const [a, b] = await Promise.all([api.get('/requests/incoming'), api.get('/requests/outgoing')]);
      setIncoming(a.data.requests || []);
      setOutgoing(b.data.requests || []);
    } catch (e) { setError(getErrorMessage(e, 'Could not load your requests.')); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 5000);
    const refresh = () => load();
    window.addEventListener('skillswap:refresh', refresh);
    return () => { clearInterval(timer); window.removeEventListener('skillswap:refresh', refresh); };
  }, [load]);

  const pendingReceived = useMemo(() => incoming.filter(r => r.status === 'PENDING').length, [incoming]);
  const pendingSent = useMemo(() => outgoing.filter(r => r.status === 'PENDING').length, [outgoing]);
  const list = tab === 'received' ? incoming : outgoing;

  const act = async (id, action, message) => {
    try { setBusy(id); setError(''); await action(); await load(); }
    catch (e) { setError(getErrorMessage(e, message)); }
    finally { setBusy(null); }
  };

  return <div className="requests-modern">
    <section className="requests-intro"><div><span className="page-eyebrow">CONNECTIONS</span><h2>Exchange requests</h2><p>Review real requests from students, accept the right exchange and move into a shared learning session.</p></div><button className="outline-action" onClick={load}><RefreshCw size={16}/> Refresh</button></section>

    <div className="request-tabs"><button className={tab === 'received' ? 'active' : ''} onClick={() => setTab('received')}><span>Received</span><b>{pendingReceived}</b></button><button className={tab === 'sent' ? 'active' : ''} onClick={() => setTab('sent')}><span>Sent</span><b>{pendingSent}</b></button></div>
    {error && <div className="request-alert">{error}</div>}

    {loading ? <div className="requests-modern-empty"><RefreshCw className="spin"/><h3>Loading requests</h3><p>Syncing with your account…</p></div> : !list.length ? <div className="requests-modern-empty"><MessageCircle size={30}/><h3>{tab === 'received' ? 'No requests yet' : 'Nothing sent yet'}</h3><p>{tab === 'received' ? 'When another student wants to exchange skills with you, their request will appear here.' : 'Find a reciprocal match and send your first exchange request.'}</p><Link to={tab === 'received' ? '/matches' : '/matches'} className="empty-link">Explore matches <ArrowRight size={14}/></Link></div> : <div className="request-list-modern">
      {list.map(request => {
        const received = tab === 'received';
        const person = received ? { id: request.sender_id, name: request.sender_name, department: request.sender_department, college: request.sender_college, bio: request.sender_bio } : { id: request.receiver_id, name: request.receiver_name, department: request.receiver_department, college: request.receiver_college, bio: request.receiver_bio };
        const pending = request.status === 'PENDING';
        const accepted = request.status === 'ACCEPTED';
        return <article className="request-modern-card" key={request.id}>
          <div className="request-card-top"><Link to={`/profile/${person.id}`} className="request-person-modern"><div className="request-avatar-modern">{initials(person.name)}</div><div><strong>{person.name}</strong><span>{person.department || 'Student'}{person.college ? ` · ${person.college}` : ''}</span></div></Link><span className={`request-state ${String(request.status).toLowerCase()}`}>{request.status}</span></div>
          <div className="exchange-strip"><div><small>{received ? 'THEY OFFER' : 'YOU OFFER'}</small><strong>{request.offered_skill_name}</strong></div><div className="exchange-symbol">⇄</div><div><small>{received ? 'THEY WANT' : 'YOU WANT'}</small><strong>{request.requested_skill_name}</strong></div></div>
          {request.message && <div className="request-quote">“{request.message}”</div>}
          {accepted && <div className="request-plan-hint"><Layers3 size={14}/> Learning plan: {request.planned_learning_sessions || 1} lessons to learn · {request.planned_teaching_sessions || 1} lessons to teach · schedule them from Sessions.</div>}
          <div className="request-footer"><span><Clock3 size={14}/> {dateText(request.created_at)}</span><div className="request-footer-actions">
            {pending && received && <><button className="request-accept" disabled={busy === request.id} onClick={() => act(request.id, () => api.put(`/requests/${request.id}/accept`), 'Could not accept the request.')}><Check size={15}/> Accept</button><button className="request-decline" disabled={busy === request.id} onClick={() => act(request.id, () => api.put(`/requests/${request.id}/reject`), 'Could not decline the request.')}><X size={15}/> Decline</button></>}
            {pending && !received && <button className="request-decline" disabled={busy === request.id} onClick={() => act(request.id, () => api.delete(`/requests/${request.id}`), 'Could not cancel the request.')}><X size={15}/> Cancel</button>}
            {accepted && <><Link className="request-message" to={`/messages?userId=${person.id}`}><MessageCircle size={15}/> Message</Link><Link className="request-accept" to={`/sessions?exchange=${request.id}`}><Layers3 size={15}/> Open lesson plan</Link></>}
          </div></div>
        </article>;
      })}
    </div>}
  </div>;
}
