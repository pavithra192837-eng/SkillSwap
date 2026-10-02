import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Check, Clock3, MessageCircle, RefreshCw, UserRound, X } from 'lucide-react';
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
  const [scheduleFor, setScheduleFor] = useState(null);
  const [scheduleAt, setScheduleAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);

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

  const schedule = async (requestId) => {
    if (!scheduleAt) return setError('Choose a date and time first.');
    await act(requestId, () => api.post('/sessions', { request_id: requestId, scheduled_at: scheduleAt, duration_minutes: durationMinutes }), 'Could not schedule the session.');
    setScheduleFor(null); setScheduleAt(''); setDurationMinutes(60);
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
          <div className="request-footer"><span><Clock3 size={14}/> {dateText(request.created_at)}</span><div className="request-footer-actions">
            {pending && received && <><button className="request-accept" disabled={busy === request.id} onClick={() => act(request.id, () => api.put(`/requests/${request.id}/accept`), 'Could not accept the request.')}><Check size={15}/> Accept</button><button className="request-decline" disabled={busy === request.id} onClick={() => act(request.id, () => api.put(`/requests/${request.id}/reject`), 'Could not decline the request.')}><X size={15}/> Decline</button></>}
            {pending && !received && <button className="request-decline" disabled={busy === request.id} onClick={() => act(request.id, () => api.delete(`/requests/${request.id}`), 'Could not cancel the request.')}><X size={15}/> Cancel</button>}
            {accepted && <><Link className="request-message" to={`/messages?userId=${person.id}`}><MessageCircle size={15}/> Message</Link>{scheduleFor === request.id ? <div className="schedule-inline"><input type="datetime-local" min={new Date().toISOString().slice(0,16)} value={scheduleAt} onChange={e => setScheduleAt(e.target.value)}/><select value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))} aria-label="Session duration"><option value={30}>30 minutes</option><option value={45}>45 minutes</option><option value={60}>60 minutes</option><option value={90}>90 minutes</option></select><button className="request-accept" disabled={busy === request.id} onClick={() => schedule(request.id)}><CalendarDays size={15}/> Schedule</button><button className="request-decline" onClick={() => {setScheduleFor(null);setScheduleAt('');setDurationMinutes(60)}}>Cancel</button></div> : <button className="request-accept" onClick={() => setScheduleFor(request.id)}><CalendarDays size={15}/> Schedule</button>}</>}
          </div></div>
        </article>;
      })}
    </div>}
  </div>;
}
