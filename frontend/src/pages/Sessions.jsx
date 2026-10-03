import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, MessageCircle, MoreHorizontal, Plus, RefreshCw, RotateCcw, Video, X, UsersRound } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api, { getErrorMessage } from '../api';
import { useAuth } from '../context/AuthContext';
import './Session.css';

const initials = (name = 'Student') => name.split(/\s+/).filter(Boolean).map(x => x[0]).join('').slice(0, 2).toUpperCase() || 'S';
const dateTime = value => { const d = new Date(value); return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }); };
const localInput = value => { const d = value ? new Date(value) : new Date(Date.now() + 60 * 60 * 1000); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };

function LessonModal({ exchange, onClose, onDone }) {
  const [when, setWhen] = useState(localInput());
  const [duration, setDuration] = useState(60);
  const [lessonType, setLessonType] = useState(exchange.learning_remaining > 0 ? 'LEARNING' : 'TEACHING');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async e => { e.preventDefault(); try { setBusy(true); setError(''); await api.post('/sessions', { request_id: exchange.request_id, scheduled_at: when, duration_minutes: duration, lesson_type: lessonType, schedule_note: note.trim() || null }); onDone(); } catch (e) { setError(getErrorMessage(e, 'Could not schedule the lesson.')); } finally { setBusy(false); } };
  return <div className="planner-modal-backdrop" onMouseDown={onClose}><div className="planner-modal" onMouseDown={e => e.stopPropagation()}><button className="planner-close" onClick={onClose}><X size={18}/></button><span className="session-label">ADD LESSON</span><h2>Plan the next lesson</h2><p>{exchange.partner_name} · {exchange.requested_skill_name} ↔ {exchange.offered_skill_name}</p><div className="lesson-direction-preview"><div className={lessonType==='LEARNING'?'selected':''}><strong>Learning</strong><span>You learn <b>{exchange.requested_skill_name}</b> from {exchange.partner_name}</span></div><div className={lessonType==='TEACHING'?'selected':''}><strong>Teaching</strong><span>You teach <b>{exchange.offered_skill_name}</b> to {exchange.partner_name}</span></div></div><form onSubmit={submit}><label>Lesson direction<select value={lessonType} onChange={e=>setLessonType(e.target.value)}><option value="LEARNING">I am learning</option><option value="TEACHING">I am teaching</option></select></label><label>Date & time<input type="datetime-local" min={localInput()} value={when} onChange={e => setWhen(e.target.value)} required /></label><label>Duration<select value={duration} onChange={e => setDuration(Number(e.target.value))}><option value={30}>30 minutes</option><option value={45}>45 minutes</option><option value={60}>60 minutes</option><option value={90}>90 minutes</option></select></label><label>Lesson note <textarea value={note} onChange={e => setNote(e.target.value)} maxLength={300} placeholder="Optional: what will you cover?" /></label>{error && <div className="planner-error">{error}</div>}<button className="planner-submit" disabled={busy}>{busy ? 'Scheduling…' : 'Schedule lesson'}</button></form></div></div>;
}

function MoveLessonModal({ session, onClose, onDone }) {
  const [when, setWhen] = useState(localInput());
  const [duration, setDuration] = useState(session.duration_minutes || 60);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async e => { e.preventDefault(); try { setBusy(true); setError(''); await api.post(`/sessions/${session.id}/reschedule`, { scheduled_at: when, duration_minutes: duration, schedule_note: 'Moved by participant' }); onDone(); } catch (e) { setError(getErrorMessage(e, 'Could not move this lesson.')); } finally { setBusy(false); } };
  return <div className="planner-modal-backdrop" onMouseDown={onClose}><div className="planner-modal" onMouseDown={e => e.stopPropagation()}><button className="planner-close" onClick={onClose}><X size={18}/></button><span className="session-label">CAN'T ATTEND?</span><h2>Move this lesson</h2><p>The old booking stays in history and a new lesson is created. Your exchange is not cancelled.</p><form onSubmit={submit}><label>New date & time<input type="datetime-local" min={localInput()} value={when} onChange={e => setWhen(e.target.value)} required /></label><label>Duration<select value={duration} onChange={e => setDuration(Number(e.target.value))}><option value={30}>30 minutes</option><option value={45}>45 minutes</option><option value={60}>60 minutes</option><option value={90}>90 minutes</option></select></label>{error && <div className="planner-error">{error}</div>}<button className="planner-submit" disabled={busy}>{busy ? 'Moving…' : 'Confirm new time'}</button></form></div></div>;
}

export default function Sessions() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [tab, setTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lessonFor, setLessonFor] = useState(null);
  const [moveFor, setMoveFor] = useState(null);
  const [busy, setBusy] = useState(null);
  const [menuFor, setMenuFor] = useState(null);

  const load = useCallback(async () => { try { setError(''); const [s, e] = await Promise.all([api.get('/sessions'), api.get('/sessions/planning')]); setSessions(s.data.sessions || []); setExchanges(e.data.exchanges || []); } catch (e) { setError(getErrorMessage(e, 'Could not load your lesson workspace.')); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); const timer = setInterval(load, 7000); return () => clearInterval(timer); }, [load]);

  const upcoming = useMemo(() => sessions.filter(s => ['SCHEDULED', 'ONGOING'].includes(s.status)), [sessions]);
  const history = useMemo(() => sessions.filter(s => ['COMPLETED', 'CANCELLED'].includes(s.status)), [sessions]);
  const shown = tab === 'upcoming' ? upcoming : history;
  const focused = exchanges.find(x => String(x.request_id) === String(params.get('exchange')));

  const canJoin = session => {
    if (session.status === 'ONGOING') return true;
    if (session.status !== 'SCHEDULED') return false;
    const start = new Date(session.scheduled_at).getTime();
    const end = start + Number(session.duration_minutes || 60) * 60000;
    const now = Date.now();
    return Number.isFinite(start) && now >= start && now < end;
  };

  const join = async session => {
    const me = Number(user?.id); const otherId = Number(session.user1_id) === me ? session.user2_id : session.user1_id; const otherName = Number(session.user1_id) === me ? session.user2_name : session.user1_name;
    if (!canJoin(session)) { setError('This lesson can be joined only during its scheduled time.'); return; }
    try { setBusy(session.id); if (session.status === 'SCHEDULED') await api.put(`/sessions/${session.id}/start`); navigate(`/video-call?userId=${otherId}&name=${encodeURIComponent(otherName || 'SkillSwap student')}&sessionId=${session.id}`); } catch (e) { setError(getErrorMessage(e, 'You cannot join this lesson yet.')); } finally { setBusy(null); }
  };

  const cancel = async id => { try { setBusy(id); await api.delete(`/sessions/${id}`); await load(); } catch (e) { setError(getErrorMessage(e, 'Could not cancel the lesson.')); } finally { setBusy(null); } };

  const endExchange = async exchange => {
    const ok = window.confirm(`End the exchange with ${exchange.partner_name}?\n\nFuture lessons will be cancelled and the active lesson plan will disappear for both participants. Completed lesson history and earned skills will remain.`);
    if (!ok) return;
    try { setBusy(`exchange-${exchange.request_id}`); setError(''); await api.delete(`/connections/${exchange.request_id}`); setMenuFor(null); await load(); }
    catch (e) { setError(getErrorMessage(e, 'Could not end this exchange.')); }
    finally { setBusy(null); }
  };

  if (loading) return <main className="sessions-page"><div className="sessions-shell"><div className="empty-sessions"><Clock3/><h3>Preparing your lesson workspace</h3><p>Loading exchanges, lesson counts and schedules…</p></div></div></main>;

  return <main className="sessions-page"><div className="sessions-shell">
    <button className="sessions-back-button" onClick={() => navigate('/dashboard')}><ArrowLeft size={15}/> Dashboard</button>
    <header className="sessions-header"><div><span className="session-label">LESSON WORKSPACE</span><h1>Plan the learning, not just the call.</h1><p>Requests create the relationship. Sessions are where you schedule, attend, miss, move and complete individual lessons.</p></div><div className="session-count"><strong>{upcoming.length}</strong><span>upcoming lessons</span></div></header>
    {error && <div className="session-alert">{error}</div>}
    {focused && <section className="exchange-focus"><div><span className="session-label">ACTIVE EXCHANGE</span><h2>{focused.partner_name}</h2><p>{focused.requested_skill_name} ↔ {focused.offered_skill_name}</p><div className="exchange-role-strip"><span>YOU LEARN: <b>{focused.requested_skill_name}</b> from {focused.partner_name} · {focused.learning_remaining} left</span><span>YOU TEACH: <b>{focused.offered_skill_name}</b> to {focused.partner_name} · {focused.teaching_remaining} left</span></div></div><button className="join-button" onClick={() => setLessonFor(focused)}><Plus size={15}/> Add lesson</button></section>}

    <section className="planner-grid"><div>
      <div className="session-toolbar"><div className="session-tabs"><button className={tab === 'upcoming' ? 'active' : ''} onClick={() => setTab('upcoming')}>Upcoming <b>{upcoming.length}</b></button><button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>History <b>{history.length}</b></button></div><button className="session-refresh" onClick={load}><RefreshCw size={15}/> Refresh</button></div>
      {shown.length ? <div className="sessions-list">{shown.map(s => { const me = Number(user?.id); const otherId = Number(s.user1_id) === me ? s.user2_id : s.user1_id; const otherName = Number(s.user1_id) === me ? s.user2_name : s.user1_name; return <article className="session-card" key={s.id}>
        <div className="session-card-head"><div className="session-partner"><div className="partner-avatar">{initials(otherName)}</div><div><span className="session-label">LESSON {s.session_number || s.id}</span><h3>{otherName}</h3><p>{s.lesson_type==='LEARNING' ? <>You learn <b>{s.lesson_skill_name || s.requested_skill_name || 'Skill'}</b> from {s.teacher_name || otherName}</> : s.lesson_type==='TEACHING' ? <>You teach <b>{s.lesson_skill_name || s.offered_skill_name || 'Skill'}</b> to {s.learner_name || otherName}</> : <>{s.offered_skill_name || 'Skill'} <b>↔</b> {s.requested_skill_name || 'Skill'}</>}</p></div></div><span className={`session-status status-${String(s.status).toLowerCase()}`}>{s.status}</span></div>
        <div className="session-info-grid"><div><CalendarDays size={17}/><span><small>Date & time</small><strong>{dateTime(s.scheduled_at)}</strong></span></div><div><Clock3 size={17}/><span><small>Duration</small><strong>{s.duration_minutes || 60} min</strong></span></div><div><CheckCircle2 size={17}/><span><small>Lesson</small><strong>#{s.session_number || s.id}</strong></span></div><div><UsersRound size={17}/><span><small>Direction</small><strong>{s.lesson_type==='LEARNING'?'You learn':s.lesson_type==='TEACHING'?'You teach':'Both'}</strong></span></div><div><RotateCcw size={17}/><span><small>History</small><strong>{s.rescheduled_from_id ? 'Moved lesson' : 'Original slot'}</strong></span></div></div>
        <div className="session-actions">{['SCHEDULED','ONGOING'].includes(s.status) && <><button className="secondary-session" onClick={() => navigate(`/messages?userId=${otherId}`)}><MessageCircle size={15}/> Message</button><button className="join-button" disabled={busy === s.id || !canJoin(s)} onClick={() => join(s)}><Video size={15}/>{busy === s.id ? 'Opening…' : s.status === 'ONGOING' ? 'Rejoin lesson' : canJoin(s) ? 'Join lesson' : 'Not started'}</button>{s.status === 'SCHEDULED' && <button className="secondary-session" onClick={() => setMoveFor(s)}><RotateCcw size={15}/> Can't attend</button>}<button className="cancel-button" disabled={busy === s.id} onClick={() => cancel(s.id)}><X size={15}/> Cancel</button></>}{s.status === 'COMPLETED' && <span className="completed-badge"><CheckCircle2 size={14}/> Completed</span>}{s.status === 'CANCELLED' && <span className="completed-badge muted"><X size={14}/> Kept in history</span>}</div>
      </article>; })}</div> : <div className="empty-sessions"><CalendarDays/><h3>{tab === 'upcoming' ? 'No lessons scheduled' : 'No lesson history'}</h3><p>{tab === 'upcoming' ? 'Pick an active exchange from the right and add your next lesson.' : 'Completed, cancelled and moved lessons stay here for a clear history.'}</p></div>}
    </div>
    <aside className="exchange-sidebar"><div className="sidebar-heading"><div><span className="session-label">ACTIVE EXCHANGES</span><h3>Lesson plans</h3></div><button onClick={() => navigate('/matches')}>Find partner</button></div>{exchanges.length ? exchanges.map(x => { const learningTotal=Number(x.planned_learning_sessions||0), teachingTotal=Number(x.planned_teaching_sessions||0); const learningDone=Number(x.completed_learning||0), teachingDone=Number(x.completed_teaching||0); const learningScheduled=Number(x.scheduled_learning||0), teachingScheduled=Number(x.scheduled_teaching||0); const learningRemaining=Math.max(learningTotal-learningDone-learningScheduled,0), teachingRemaining=Math.max(teachingTotal-teachingDone-teachingScheduled,0); const total=learningTotal+teachingTotal, done=learningDone+teachingDone, scheduled=learningScheduled+teachingScheduled, remaining=learningRemaining+teachingRemaining; const progress=Math.min(100,Math.round(done/Math.max(total,1)*100)); const canAdd=remaining>0; return <article className={`exchange-plan ${String(x.request_id) === String(params.get('exchange')) ? 'focused' : ''}`} key={x.request_id}><div className="exchange-plan-top"><div className="mini-avatar">{initials(x.partner_name)}</div><div><strong>{x.partner_name}</strong><span>{x.requested_skill_name} ↔ {x.offered_skill_name}</span></div><div className="exchange-menu"><button aria-label="Exchange options" onClick={() => setMenuFor(menuFor === x.request_id ? null : x.request_id)}><MoreHorizontal size={17}/></button>{menuFor === x.request_id && <div className="exchange-menu-popover"><button disabled={busy === `exchange-${x.request_id}`} onClick={() => endExchange(x)}><X size={14}/> End exchange</button></div>}</div></div><div className="plan-stats"><span><b>{done}/{total}</b> completed</span><span><b>{scheduled}</b> scheduled</span><span><b>{remaining}</b> to plan</span></div><div className="plan-progress"><i style={{ width: `${progress}%` }}/></div><div className="plan-foot"><small>Learn {learningDone}/{learningTotal} · Teach {teachingDone}/{teachingTotal}</small><button disabled={!canAdd} title={canAdd ? 'Schedule the next lesson' : 'All planned lessons are scheduled or completed'} onClick={() => canAdd && setLessonFor(x)}><Plus size={14}/> {canAdd ? 'Add lesson' : 'Plan complete'}</button></div>{(x.next_learning_at || x.next_teaching_at) && <div className="next-session-link"><b>Next lessons</b>{x.next_learning_at && <span>Learning · {dateTime(x.next_learning_at)}</span>}{x.next_teaching_at && <span>Teaching · {dateTime(x.next_teaching_at)}</span>}</div>}</article>; }) : <div className="sidebar-empty">Accepted exchanges will appear here. Each one can contain many lessons.</div>}</aside></section>
    {lessonFor && <LessonModal exchange={lessonFor} onClose={() => setLessonFor(null)} onDone={async () => { setLessonFor(null); await load(); }}/>} {moveFor && <MoveLessonModal session={moveFor} onClose={() => setMoveFor(null)} onDone={async () => { setMoveFor(null); await load(); }}/>}</div></main>;
}
