import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, Bell, BookOpen, CalendarDays, CheckCircle2, ChevronRight,
  Clock3, Compass, MessageCircle, Plus, Sparkles, Target, TrendingUp,
  UsersRound, Video, Zap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const initials = (name='Student') => name.split(/\s+/).filter(Boolean).map(p=>p[0]).join('').slice(0,2).toUpperCase() || 'S';
const dateText = value => { if(!value)return 'Not scheduled'; const d=new Date(value); return Number.isNaN(d.getTime()) ? value : d.toLocaleString([], {dateStyle:'medium',timeStyle:'short'}); };
const relativeDay = value => { if(!value)return ''; const d=new Date(value); const now=new Date(); const diff=Math.round((d-now)/86400000); if(diff===0)return 'Today'; if(diff===1)return 'Tomorrow'; if(diff===-1)return 'Yesterday'; return d.toLocaleDateString([], {month:'short',day:'numeric'}); };

export default function Dashboard(){
 const {user,setUser}=useAuth();
 const navigate=useNavigate();
 const [data,setData]=useState(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const load=useCallback(async()=>{try{setError('');const r=await api.get('/dashboard');setData(r.data);if(r.data.user)setUser(p=>({...p,...r.data.user}));}catch(e){setError(getErrorMessage(e,'Could not load your dashboard.'));}finally{setLoading(false);}},[setUser]);
 useEffect(()=>{load();const t=setInterval(load,10000);return()=>clearInterval(t)},[load]);

 const skills=data?.skills||[];
 const teach=useMemo(()=>skills.filter(s=>s.type==='TEACH'),[skills]);
 const learn=useMemo(()=>skills.filter(s=>s.type==='LEARN'),[skills]);
 const stats=data?.statistics||{};
 const exchanges=data?.active_exchanges||[];
 const sessions=data?.upcoming_sessions||[];
 const notifications=data?.notifications||[];
 const requests=data?.recent_requests||[];
 const next=sessions[0];
 const totalPlanned=exchanges.reduce((n,x)=>n+Number(x.planned_learning_sessions||0)+Number(x.planned_teaching_sessions||0),0);
 const totalCompleted=exchanges.reduce((n,x)=>n+Number(x.completed_learning||0)+Number(x.completed_teaching||0),0);
 const totalScheduled=exchanges.reduce((n,x)=>n+Number(x.scheduled_learning||0)+Number(x.scheduled_teaching||0),0);
 const totalToPlan=Math.max(0,totalPlanned-totalCompleted-totalScheduled);
 const overallProgress=totalPlanned?Math.min(100,Math.round(totalCompleted/totalPlanned*100)):0;
 const pendingRequests=Number(stats.incoming_pending_requests||0);
 const nextPartner=next ? (Number(next.learner_id)===Number(user?.id)?next.teacher_name:next.learner_name) : '';
 const nextRole=next ? (Number(next.learner_id)===Number(user?.id)?'You learn':'You teach') : '';
 const nextSkill=next?.lesson_skill_name || (nextRole==='You learn' ? next?.requested_skill_name : next?.offered_skill_name) || 'Skill lesson';

 if(loading)return <div className="dashboard-modern-loading"><div className="loading-orb"/><h2>Building your learning workspace</h2><p>Loading your matches, lesson plans and next steps…</p></div>;
 if(error)return <div className="dashboard-error"><h2>We couldn't load your workspace</h2><p>{error}</p><button onClick={load}>Try again</button></div>;

 return <div className="dashboard-modern">
  <section className="dash-hero">
   <div className="hero-copy">
    <span className="dashboard-eyebrow">YOUR LEARNING HUB</span>
    <h2>Good to see you, {user?.name?.split(' ')[0]||'student'}.</h2>
    <p>Learn from people around you, teach what you know, and keep every exchange moving from one place.</p>
    <div className="hero-actions"><Link to="/matches" className="dash-primary"><UsersRound size={17}/> Find a skill partner</Link><Link to="/sessions" className="dash-secondary"><CalendarDays size={17}/> Plan a lesson</Link></div>
   </div>
   <div className="hero-progress">
    <div className="hero-progress-top"><span>Learning progress</span><strong>{overallProgress}%</strong></div>
    <div className="hero-progress-track"><i style={{width:`${overallProgress}%`}}/></div>
    <div className="hero-progress-meta"><span>{totalCompleted} completed</span><span>{totalToPlan} still to schedule</span></div>
    <Link to="/learning" className="hero-progress-link">Open learning journey <ArrowRight size={14}/></Link>
   </div>
  </section>

  <section className="dashboard-grid stats-grid">
   <article className="metric-card metric-feature"><div className="metric-icon blue"><Target/></div><div><span>Learning goals</span><strong>{learn.length}</strong><small>{learn.length ? "Skills you\'re working toward" : "Add a learning goal"}</small></div><ChevronRight/></article>
   <article className="metric-card"><div className="metric-icon purple"><Sparkles/></div><div><span>Teaching skills</span><strong>{teach.length}</strong><small>{teach.length?'Ready to share':'Add what you know'}</small></div></article>
   <article className="metric-card"><div className="metric-icon green"><TrendingUp/></div><div><span>Active exchanges</span><strong>{exchanges.length}</strong><small>{totalScheduled} lessons scheduled</small></div></article>
   <article className="metric-card"><div className="metric-icon orange"><Bell/></div><div><span>Needs attention</span><strong>{pendingRequests}</strong><small>{pendingRequests?'Requests waiting for you':'All caught up'}</small></div></article>
  </section>

  <div className="dashboard-columns dashboard-main-grid">
   <section className="dashboard-card next-card featured-card">
    <div className="card-heading"><div><span>UP NEXT</span><h3>{next?'Your next lesson':'Nothing scheduled yet'}</h3></div><Link to="/sessions">All sessions <ArrowRight size={15}/></Link></div>
    {next ? <div className="next-session-large">
      <div className="next-session-avatar">{initials(nextPartner)}</div>
      <div className="next-session-copy"><div className="session-role-pill"><span className={nextRole==='You learn'?'learn-pill':'teach-pill'}>{nextRole}</span><b>{relativeDay(next.scheduled_at)}</b></div><strong>{nextSkill}</strong><span>{nextPartner} · {dateText(next.scheduled_at)}</span><small>{next.duration_minutes||60} min · Lesson #{next.session_number||next.id}</small></div>
      <button onClick={()=>navigate('/sessions')}><Video size={16}/> Open lesson</button>
    </div> : <div className="next-empty"><Clock3/><strong>Your next lesson goes here</strong><span>Open an active exchange and schedule your first learning or teaching slot.</span><Link to="/sessions">Open lesson planner <ArrowRight size={14}/></Link></div>}
   </section>

   <section className="dashboard-card daily-card">
    <div className="card-heading"><div><span>TODAY'S FOCUS</span><h3>Keep your momentum</h3></div><Zap size={17} className="focus-zap"/></div>
    <div className="focus-list">
      <Link to={pendingRequests?'/requests':'/matches'}><div className="focus-icon"><UsersRound size={16}/></div><span><b>{pendingRequests?`${pendingRequests} request${pendingRequests>1?'s':''} waiting`:'Discover a new partner'}</b><small>{pendingRequests?'Review and respond to incoming exchanges':'Find someone who can teach what you want'}</small></span><ArrowRight size={15}/></Link>
      <Link to="/sessions"><div className="focus-icon"><CalendarDays size={16}/></div><span><b>{totalToPlan?`${totalToPlan} lesson${totalToPlan>1?'s':''} to schedule`:'Review your lesson plans'}</b><small>{totalToPlan?'Choose dates for your active exchanges':'Keep learning and teaching balanced'}</small></span><ArrowRight size={15}/></Link>
      <Link to="/skill-setup"><div className="focus-icon"><Sparkles size={16}/></div><span><b>Improve your skill profile</b><small>{skills.length?`${skills.length} skills currently listed`:'Add skills to improve matching'}</small></span><ArrowRight size={15}/></Link>
    </div>
   </section>

   <section className="dashboard-card wide exchange-card">
    <div className="card-heading"><div><span>YOUR EXCHANGES</span><h3>Learning partners & progress</h3></div><Link to="/sessions">Manage exchanges <ArrowRight size={15}/></Link></div>
    {exchanges.length?<div className="dashboard-exchanges">{exchanges.slice(0,4).map(x=>{const plannedLearn=Number(x.planned_learning_sessions||0);const plannedTeach=Number(x.planned_teaching_sessions||0);const doneLearn=Number(x.completed_learning||0);const doneTeach=Number(x.completed_teaching||0);const scheduledLearn=Number(x.scheduled_learning||0);const scheduledTeach=Number(x.scheduled_teaching||0);const total=plannedLearn+plannedTeach;const done=doneLearn+doneTeach;const scheduled=scheduledLearn+scheduledTeach;const progress=total?Math.min(100,Math.round(done/total*100)):0;return <article className="dash-exchange" key={x.request_id}>
      <div className="dash-exchange-head"><div className="mini-avatar">{initials(x.partner_name)}</div><div><strong>{x.partner_name}</strong><span>{x.learn_skill_name} ↔ {x.teach_skill_name}</span></div><button onClick={()=>navigate(`/sessions?exchange=${x.request_id}`)}>Open</button></div>
      <div className="exchange-direction-grid"><div><small>YOU LEARN</small><b>{x.learn_skill_name}</b><span>{doneLearn}/{plannedLearn} complete</span></div><div><small>YOU TEACH</small><b>{x.teach_skill_name}</b><span>{doneTeach}/{plannedTeach} complete</span></div></div>
      <div className="dash-plan-row"><span>{done}/{total} lessons complete</span><span>{scheduled} scheduled</span><b>{progress}%</b></div><div className="plan-progress"><i style={{width:`${progress}%`}}/></div>
      <div className="dash-exchange-foot">{x.next_learning_at||x.next_teaching_at?<span>Next {dateText(x.next_learning_at||x.next_teaching_at)}</span>:<span>Plan your next lesson</span>}<button onClick={()=>navigate(`/sessions?exchange=${x.request_id}`)}><Plus size={13}/> {totalToPlan?'Add lesson':'Manage'}</button></div>
    </article>})}</div>:<div className="card-empty"><UsersRound/><strong>No active exchanges yet</strong><span>Your dashboard will become your learning hub once you connect with a student.</span><Link to="/matches">Explore matches</Link></div>}
   </section>

   <section className="dashboard-card skill-card"><div className="card-heading"><div><span>MY SKILLS</span><h3>Teach & learn</h3></div><Link to="/skill-setup">Edit <ArrowRight size={15}/></Link></div><div className="dashboard-skill-columns"><div className="skill-block teach-block"><div className="skill-block-title"><span className="skill-dot teach-dot"/> I can teach <small>{teach.length}</small></div>{teach.slice(0,5).map(s=><span key={s.id}>{s.name}<b>{s.level==='ADVANCED'?'PROFICIENT':s.level}</b></span>)}{!teach.length&&<span className="muted-row">Add a skill you can share.</span>}</div><div className="skill-block learn-block"><div className="skill-block-title"><span className="skill-dot learn-dot"/> I want to learn <small>{learn.length}</small></div>{learn.slice(0,5).map(s=><span key={s.id}>{s.name}<b>{s.level==='ADVANCED'?'PROFICIENT':s.level}</b></span>)}{!learn.length&&<span className="muted-row">Choose your next skill.</span>}</div></div></section>

   <section className="dashboard-card inbox-card"><div className="card-heading"><div><span>INBOX</span><h3>Recent activity</h3></div><Link to="/notifications">View all <ArrowRight size={15}/></Link></div>{notifications.slice(0,3).map(n=><div className="notification-row" key={n.id}><div className="notification-icon"><MessageCircle size={15}/></div><div><strong>{n.title}</strong><span>{n.message}</span></div></div>)}{!notifications.length&&requests.slice(0,3).map(r=><div className="notification-row" key={r.id}><div className="notification-icon"><UsersRound size={15}/></div><div><strong>{r.status==='ACCEPTED'?'Exchange accepted':'Exchange activity'}</strong><span>{r.sender_id===user?.id?'You sent a request':'A student sent you a request'} · {r.requested_skill_name} ↔ {r.offered_skill_name}</span></div></div>)}{!notifications.length&&!requests.length&&<div className="card-empty"><Bell/><strong>No new activity</strong><span>You're up to date.</span></div>}</section>
  </div>

  <section className="dashboard-footer-cta"><div><span>READY FOR YOUR NEXT EXCHANGE?</span><h3>Find someone who complements your skills.</h3><p>SkillSwap works best when you teach one thing and learn another.</p></div><Link to="/matches">Explore smart matches <ArrowRight size={16}/></Link></section>
 </div>;
}
