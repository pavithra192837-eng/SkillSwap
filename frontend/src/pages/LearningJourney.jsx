import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, GraduationCap } from 'lucide-react';
import api, { getErrorMessage } from '../api';
import './LearningJourney.css';

const courseKey = item => `${item.skill_id ?? item.skill_name}:${item.teacher_id ?? item.teacher_name}`;
const sessionIsComplete = item => ['COMPLETED', 'ADDED_TO_PROFILE'].includes(String(item.status || '').toUpperCase()) && String(item.session_status || '').toUpperCase() === 'COMPLETED';

export default function LearningJourney() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const response = await api.get('/learning');
      setItems(response.data.progress || []);
      setError('');
    } catch (e) {
      setError(getErrorMessage(e, 'Could not load your learning journey.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // One course card represents the whole skill plan with this teacher, not each individual session.
  const courses = useMemo(() => {
    const groups = new Map();
    for (const item of items) {
      const key = courseKey(item);
      if (!groups.has(key)) groups.set(key, { ...item, sessions: [] });
      groups.get(key).sessions.push(item);
    }
    return [...groups.values()].map(course => {
      const uniqueSessions = [...new Map(course.sessions.map(s => [String(s.session_id), s])).values()];
      const completed = uniqueSessions.filter(s => String(s.session_status).toUpperCase() === 'COMPLETED').length;
      const total = uniqueSessions.length;
      const earned = total > 0 && completed === total && course.sessions.every(s => s.status === 'ADDED_TO_PROFILE');
      return { ...course, total, completed, earned, percent: total ? Math.round(completed * 100 / total) : 0 };
    }).sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
  }, [items]);

  return <main className="learning-page"><div className="learning-shell">
    <header className="learning-header"><div><span className="eyebrow">YOUR LEARNING JOURNEY</span><h1>Turn every exchange into a <span>real skill.</span></h1><p>A skill is earned only after every planned session for that course is completed. Individual sessions update your progress; the skill is added to your profile when the course is finished.</p></div><div className="journey-map"><div className="done">1<span>Match</span></div><i/><div className="done">2<span>Sessions</span></div><i/><div>3<span>Skill earned</span></div></div></header>
    {error && <div className="form-alert">{error}</div>}
    {loading ? <div className="learning-empty">Loading your learning records…</div> : courses.length === 0 ? <div className="learning-empty"><GraduationCap size={44}/><h2>No learning journeys yet</h2><p>Find a match, exchange knowledge and your course progress will appear here.</p></div> : <div className="learning-list">{courses.map(course => <article className="learning-card" key={courseKey(course)}>
      <div className="learning-icon"><GraduationCap/></div><div className="learning-main">
        <div className="learning-top"><div><span className="skill-label">COURSE</span><h2>{course.skill_name}</h2><p>Learning from <strong>{course.teacher_name}</strong>{course.teacher_department ? ` · ${course.teacher_department}` : ''}</p></div>
          <span className={`progress-pill ${course.earned ? 'added_to_profile' : course.completed === course.total ? 'completed' : 'in_progress'}`}>{course.earned ? <CheckCircle2 size={14}/> : <Clock3 size={14}/>} {course.earned ? 'Skill earned' : 'In progress'}</span></div>
        <div className="learning-meta"><span>{course.completed} of {course.total} sessions completed</span><span>{course.percent}%</span></div>
        <div style={{height:8,background:'var(--surface-muted, #e9edf2)',borderRadius:999,overflow:'hidden',margin:'10px 0 14px'}}><div style={{height:'100%',width:`${course.percent}%`,background:course.earned?'#16a34a':'#6366f1',borderRadius:999,transition:'width .2s ease'}}/></div>
        <div className="learning-actions">{course.earned ? <span className="profile-added"><CheckCircle2 size={16}/> All sessions completed · Skill added to profile</span> : <span><Clock3 size={16}/> Complete all {course.total} sessions to earn {course.skill_name}</span>}</div>
        <details style={{marginTop:12}}><summary style={{cursor:'pointer',fontSize:13}}>View session progress</summary><div style={{display:'grid',gap:6,marginTop:10}}>{[...new Map(course.sessions.map(s=>[String(s.session_id),s])).values()].sort((a,b)=>Number(a.session_id)-Number(b.session_id)).map((session,index)=><div key={session.session_id} style={{display:'flex',justifyContent:'space-between',gap:12,fontSize:13,padding:'8px 10px',borderRadius:8,background:'var(--surface-muted, #f6f7f9)'}}><span>Session {index+1}</span><span>{String(session.session_status).toUpperCase()==='COMPLETED' ? 'Completed' : String(session.session_status || 'IN_PROGRESS').replaceAll('_',' ')}</span></div>)}</div></details>
      </div></article>)}</div>}
  </div></main>;
}
