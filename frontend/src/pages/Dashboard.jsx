import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, Clock3, MessageCircle, Sparkles, UsersRound } from 'lucide-react';
import api, { getErrorMessage } from '../api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

function initials(name = 'Student') { return name.split(/\s+/).filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'S'; }
function dateText(v) { if (!v) return 'Not scheduled'; const d = new Date(v); return Number.isNaN(d.getTime()) ? v : d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }); }

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const response = await api.get('/dashboard');
      setData(response.data);
      if (response.data.user) setUser(previous => ({ ...(previous || {}), ...response.data.user }));
    } catch (e) {
      setError(getErrorMessage(e, 'Could not load your dashboard.'));
    } finally { setLoading(false); }
  }, [setUser]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 8000);
    const refresh = () => load();
    window.addEventListener('skillswap:refresh', refresh);
    return () => { clearInterval(timer); window.removeEventListener('skillswap:refresh', refresh); };
  }, [load]);

  const skills = data?.skills || [];
  const teach = useMemo(() => skills.filter(s => s.type === 'TEACH'), [skills]);
  const learn = useMemo(() => skills.filter(s => s.type === 'LEARN'), [skills]);
  const stats = data?.statistics || {};
  const upcoming = data?.upcoming_sessions || [];
  const requests = data?.recent_requests || [];
  const notifications = data?.notifications || [];

  if (loading) return <div className="dashboard-modern-loading"><div className="loading-orb"/><h2>Preparing your workspace</h2><p>Loading your skills, connections and sessions…</p></div>;
  if (error) return <div className="dashboard-error"><h2>We couldn't load your workspace</h2><p>{error}</p><button onClick={load}>Try again</button></div>;

  return <div className="dashboard-modern">
    <section className="welcome-panel">
      <div><span className="dashboard-eyebrow">YOUR LEARNING WORKSPACE</span><h2>Welcome back, {user?.name?.split(' ')[0] || 'student'}.</h2><p>Your profile, matches, requests and learning progress are all connected here.</p></div>
      <div className="welcome-actions"><Link to="/matches" className="dash-primary"><UsersRound size={17}/> Find matches</Link><Link to="/skill-setup" className="dash-secondary"><Sparkles size={17}/> Update skills</Link></div>
    </section>

    <section className="dashboard-grid stats-grid">
      <article className="metric-card"><div className="metric-icon blue"><Sparkles size={19}/></div><div><span>Teaching skills</span><strong>{teach.length}</strong><small>{teach.length ? 'Ready to share' : 'Add your first skill'}</small></div></article>
      <article className="metric-card"><div className="metric-icon purple"><BookOpen size={19}/></div><div><span>Learning goals</span><strong>{learn.length}</strong><small>{learn.length ? 'Skills you want to learn' : 'Choose a learning goal'}</small></div></article>
      <article className="metric-card"><div className="metric-icon orange"><Clock3 size={19}/></div><div><span>Pending requests</span><strong>{Number(stats.incoming_pending_requests || 0)}</strong><small>{Number(stats.incoming_pending_requests || 0) ? 'Needs your response' : 'You are all caught up'}</small></div></article>
      <article className="metric-card"><div className="metric-icon green"><CheckCircle2 size={19}/></div><div><span>Accepted exchanges</span><strong>{Number(stats.accepted_requests || 0)}</strong><small>Active connections</small></div></article>
    </section>

    <div className="dashboard-columns">
      <section className="dashboard-card wide">
        <div className="card-heading"><div><span>YOUR SKILL PROFILE</span><h3>What you teach & want to learn</h3></div><Link to="/skill-setup">Edit skills <ArrowRight size={15}/></Link></div>
        <div className="skill-overview">
          <div className="skill-column"><div className="skill-column-title"><span className="dot teach-dot"/>Teaching</div>{teach.length ? teach.slice(0, 6).map(s => <div className="skill-row" key={s.id}><span>{s.name}</span><b>{s.level === 'ADVANCED' ? 'PROFICIENT' : s.level}</b></div>) : <div className="soft-empty">Nothing added yet. <Link to="/skill-setup">Add teaching skills</Link></div>}</div>
          <div className="skill-divider"/>
          <div className="skill-column"><div className="skill-column-title"><span className="dot learn-dot"/>Learning</div>{learn.length ? learn.slice(0, 6).map(s => <div className="skill-row" key={s.id}><span>{s.name}</span><b>{s.level === 'ADVANCED' ? 'PROFICIENT' : s.level}</b></div>) : <div className="soft-empty">Nothing added yet. <Link to="/skill-setup">Add learning goals</Link></div>}</div>
        </div>
      </section>

      <section className="dashboard-card">
        <div className="card-heading"><div><span>UP NEXT</span><h3>Sessions</h3></div><Link to="/sessions">View all <ArrowRight size={15}/></Link></div>
        {upcoming.length ? upcoming.slice(0, 3).map(s => { const other = Number(s.user1_id) === Number(user?.id) ? s.user2_name : s.user1_name; return <button className="mini-session" key={s.id} onClick={() => navigate('/sessions')}><div className="mini-avatar">{initials(other)}</div><div><strong>{other || 'Connection'}</strong><span>{dateText(s.scheduled_at)}</span></div><CalendarDays size={16}/></button>; }) : <div className="card-empty"><CalendarDays size={27}/><strong>No sessions scheduled</strong><span>Accept a request to start planning your first exchange.</span><Link to="/requests">View requests</Link></div>}
      </section>

      <section className="dashboard-card wide">
        <div className="card-heading"><div><span>ACTIVITY</span><h3>Recent exchanges</h3></div><Link to="/requests">Manage requests <ArrowRight size={15}/></Link></div>
        {requests.length ? <div className="activity-list">{requests.map(r => { const isReceiver = Number(r.receiver_id) === Number(user?.id); const person = isReceiver ? r.sender_name : r.receiver_name; return <div className="activity-row" key={r.id}><div className="activity-avatar">{initials(person)}</div><div className="activity-copy"><strong>{person}</strong><span>{r.offered_skill_name} ↔ {r.requested_skill_name}</span></div><span className={`status-pill ${String(r.status).toLowerCase()}`}>{r.status}</span></div>; })}</div> : <div className="soft-empty">Your exchange activity will appear here.</div>}
      </section>

      <section className="dashboard-card">
        <div className="card-heading"><div><span>NOTIFICATIONS</span><h3>Latest updates</h3></div><Link to="/notifications">See all <ArrowRight size={15}/></Link></div>
        {notifications.length ? notifications.slice(0, 4).map(n => <div className="notification-row" key={n.id}><div className="notification-icon"><MessageCircle size={15}/></div><div><strong>{n.title}</strong><span>{n.message}</span></div></div>) : <div className="card-empty"><MessageCircle size={27}/><strong>No new notifications</strong><span>You're up to date.</span></div>}
      </section>
    </div>
  </div>;
}
