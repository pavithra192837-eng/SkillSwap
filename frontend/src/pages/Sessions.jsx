import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, MessageCircle, RefreshCw, Star, Video, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api';
import { useAuth } from '../context/AuthContext';
import './Session.css';

const initials = (name = 'Student') => name.split(/\s+/).filter(Boolean).map(x => x[0]).join('').slice(0, 2).toUpperCase() || 'S';
const dateText = v => { if (!v) return '—'; const d = new Date(v); return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString([], { dateStyle: 'medium' }); };
const timeText = v => { if (!v) return '—'; const d = new Date(v); return Number.isNaN(d.getTime()) ? v : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };

function RatingModal({ session, person, onClose, onDone }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const submit = async e => {
    e.preventDefault();
    if (!rating) return setError('Choose a rating from 1 to 5 stars.');
    try { setSaving(true); setError(''); await api.post('/ratings', { session_id: session.id, reviewee_id: person.id, rating, review: review.trim() || null }); onDone(); }
    catch (err) { setError(getErrorMessage(err, 'Could not submit your rating.')); }
    finally { setSaving(false); }
  };
  return <div className="rating-modal-backdrop" role="presentation" onMouseDown={onClose}><div className="rating-modal" onMouseDown={e => e.stopPropagation()}>
    <button className="rating-close" onClick={onClose}><X size={18}/></button>
    <div className="rating-icon"><Star size={21}/></div><span className="session-label">SESSION FEEDBACK</span><h2>How was your exchange with {person.name}?</h2><p>Your rating becomes part of their real SkillSwap profile reputation.</p>
    <form onSubmit={submit}>
      <div className="star-picker" onMouseLeave={() => setHover(0)}>{[1,2,3,4,5].map(n => <button type="button" key={n} aria-label={`${n} stars`} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)}><Star size={31} fill={(hover || rating) >= n ? 'currentColor' : 'none'} /></button>)}</div>
      <div className="rating-caption">{(hover || rating) ? `${hover || rating} out of 5` : 'Select a rating'}</div>
      <textarea value={review} onChange={e => setReview(e.target.value)} maxLength={400} placeholder="What did you enjoy about the session? Optional feedback…" />
      {error && <div className="rating-error">{error}</div>}
      <button className="rating-submit" disabled={saving}>{saving ? 'Submitting…' : 'Submit feedback'}</button>
    </form>
  </div></div>;
}

export default function Sessions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [tab, setTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [ratingSession, setRatingSession] = useState(null);

  const load = async () => { try { setError(''); const r = await api.get('/sessions'); setSessions(r.data.sessions || []); } catch (e) { setError(getErrorMessage(e, 'Could not load sessions.')); } finally { setLoading(false); } };
  useEffect(() => { load(); const timer = setInterval(load, 7000); return () => clearInterval(timer); }, []);
  const upcoming = useMemo(() => sessions.filter(s => ['SCHEDULED','ONGOING'].includes(s.status)), [sessions]);
  const history = useMemo(() => sessions.filter(s => ['COMPLETED','CANCELLED'].includes(s.status)), [sessions]);
  const displayed = tab === 'upcoming' ? upcoming : history;

  const cancel = async id => { if (confirming !== id) { setConfirming(id); return; } try { setBusy(id); await api.delete(`/sessions/${id}`); await load(); } catch (e) { setError(getErrorMessage(e, 'Could not cancel the session.')); } finally { setBusy(null); setConfirming(null); } };
  const join = async s => { const isOne = Number(s.user1_id) === Number(user?.id); const otherId = isOne ? s.user2_id : s.user1_id; const otherName = isOne ? s.user2_name : s.user1_name; try { setBusy(s.id); if (s.status === 'SCHEDULED') await api.put(`/sessions/${s.id}/start`); navigate(`/video-call?userId=${otherId}&name=${encodeURIComponent(otherName || 'SkillSwap student')}&sessionId=${s.id}`); } catch (e) { setError(getErrorMessage(e, 'Could not start the session.')); } finally { setBusy(null); } };

  return <main className="sessions-page"><div className="sessions-shell">
    <button className="sessions-back-button" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
    <header className="sessions-header"><div><span className="session-label">LEARNING SESSIONS</span><h1>Meet, learn, exchange.</h1><p>Every session is connected to an accepted exchange request, your realtime room and your learning progress.</p></div><div className="session-count"><strong>{upcoming.length}</strong><span>upcoming</span></div></header>
    <div className="session-toolbar"><div className="session-tabs"><button className={tab === 'upcoming' ? 'active' : ''} onClick={() => setTab('upcoming')}>Upcoming <b>{upcoming.length}</b></button><button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>History <b>{history.length}</b></button></div><button className="session-refresh" onClick={load} disabled={loading}><RefreshCw size={15} className={loading ? 'spin' : ''}/> Refresh</button></div>
    {error && <div className="session-alert">{error}</div>}
    {loading ? <div className="empty-sessions"><Clock3/><h3>Loading your sessions</h3><p>Syncing with the backend…</p></div> : displayed.length ? <div className="sessions-list">{displayed.map(s => {
      const isOne = Number(s.user1_id) === Number(user?.id); const otherId = isOne ? s.user2_id : s.user1_id; const otherName = isOne ? s.user2_name : s.user1_name; const canRate = s.status === 'COMPLETED' && !Number(s.rated_by_me);
      return <article className="session-card" key={s.id}>
        <div className="session-card-head"><div className="session-partner"><div className="partner-avatar">{initials(otherName)}</div><div><span className="session-label">EXCHANGE PARTNER</span><h3>{otherName}</h3><p>{s.offered_skill_name || 'Skill'} <b>↔</b> {s.requested_skill_name || 'Skill'}</p></div></div><span className={`session-status status-${String(s.status).toLowerCase()}`}>{s.status}</span></div>
        <div className="session-info-grid"><div><CalendarDays size={17}/><span><small>Date</small><strong>{dateText(s.scheduled_at)}</strong></span></div><div><Clock3 size={17}/><span><small>Time</small><strong>{timeText(s.scheduled_at)}</strong></span></div><div><Clock3 size={17}/><span><small>Duration</small><strong>{s.duration_minutes || 60} min</strong></span></div><div><CheckCircle2 size={17}/><span><small>Session</small><strong>#{s.id}</strong></span></div></div>
        <div className="session-actions"><button className="secondary-session" onClick={() => navigate(`/messages?userId=${otherId}`)}><MessageCircle size={15}/> Message</button>{['SCHEDULED','ONGOING'].includes(s.status) && <button className="join-button" disabled={busy === s.id} onClick={() => join(s)}><Video size={15}/>{busy === s.id ? 'Opening…' : 'Join live room'}</button>}{s.status === 'SCHEDULED' && <button className="cancel-button" disabled={busy === s.id} onClick={() => cancel(s.id)}><X size={15}/>{confirming === s.id ? 'Click again' : 'Cancel'}</button>}{canRate && <button className="rate-button" onClick={() => setRatingSession(s)}><Star size={15}/> Rate partner</button>}{s.status === 'COMPLETED' && !canRate && <span className="rated-badge"><Star size={14} fill="currentColor"/> {s.my_rating}/5 rated</span>}</div>
      </article>;
    })}</div> : <div className="empty-sessions"><CalendarDays/><h3>No {tab === 'upcoming' ? 'upcoming' : 'past'} sessions</h3><p>{tab === 'upcoming' ? 'Accept an exchange request and schedule a session to begin.' : 'Completed and cancelled sessions will appear here.'}</p><button onClick={() => navigate(tab === 'upcoming' ? '/requests' : '/matches')}>{tab === 'upcoming' ? 'View requests' : 'Find matches'}</button></div>}
    {ratingSession && <RatingModal session={ratingSession} person={{ id: Number(ratingSession.user1_id) === Number(user?.id) ? ratingSession.user2_id : ratingSession.user1_id, name: Number(ratingSession.user1_id) === Number(user?.id) ? ratingSession.user2_name : ratingSession.user1_name }} onClose={() => setRatingSession(null)} onDone={async () => { setRatingSession(null); await load(); }} />}
  </div></main>;
}
