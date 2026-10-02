import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, Edit3, GraduationCap, Mail, MessageCircle, School, Star, Trophy, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const initials = (name = 'Student') => name.split(/\s+/).filter(Boolean).map(x => x[0]).join('').slice(0, 2).toUpperCase() || 'S';
const levelLabel = v => v === 'ADVANCED' ? 'PROFICIENT' : v || 'BEGINNER';

function Stars({ value = 0, size = 15 }) { return <span className="profile-stars" aria-label={`${value} out of 5 stars`}>{[1,2,3,4,5].map(n => <Star key={n} size={size} fill={value >= n ? 'currentColor' : 'none'} />)}</span>; }

export default function Profile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [ratingSummary, setRatingSummary] = useState({ average_rating: 0, total_ratings: 0 });
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [learningHistory, setLearningHistory] = useState([]);

  const load = async () => {
    try {
      setError('');
      const [p, s, r, learning] = await Promise.all([api.get('/users/me'), api.get('/users/me/skills'), api.get(`/users/${user?.id}/ratings`), api.get('/learning')]);
      const next = { ...(p.data.user || {}), teachSkills: s.data.teach || [], learnSkills: s.data.learn || [] };
      setProfile(next); setEditData(next); setRatings(r.data.ratings || []); setRatingSummary(r.data.summary || { average_rating: 0, total_ratings: 0 }); setLearningHistory(learning.data.progress || []); setUser?.(old => ({ ...(old || {}), ...(p.data.user || {}) }));
    } catch (e) { setError(getErrorMessage(e, 'Could not load your profile.')); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); const timer = setInterval(load, 12000); return () => clearInterval(timer); }, [user?.id]);

  const completion = useMemo(() => { if (!profile) return 0; const values = [profile.name, profile.email, profile.college, profile.roll_no, profile.department, profile.bio, profile.teachSkills?.length, profile.learnSkills?.length, learningHistory.length]; return Math.round(values.filter(Boolean).length / values.length * 100); }, [profile]);
  const update = (key, value) => { setEditData(x => ({ ...x, [key]: value })); setSaved(''); };
  const save = async e => { e.preventDefault(); if (!editData.name?.trim()) return setError('Name is required.'); try { setSaving(true); const r = await api.put('/users/me', { name: editData.name.trim(), phone: editData.phone?.trim() || null, college: editData.college?.trim() || null, roll_no: editData.roll_no?.trim() || null, department: editData.department?.trim() || null, bio: editData.bio?.trim() || null }); setProfile(p => ({ ...p, ...r.data.user })); setEditData(p => ({ ...p, ...r.data.user })); setUser?.(old => ({ ...(old || {}), ...(r.data.user || {}) })); setEditMode(false); setSaved('Profile saved successfully.'); } catch (e) { setError(getErrorMessage(e, 'Could not save your profile.')); } finally { setSaving(false); } };

  if (loading) return <main className="profile-page"><div className="profile-shell"><div className="profile-loading">Loading your profile…</div></div></main>;
  if (!profile) return <main className="profile-page"><div className="profile-shell"><div className="profile-alert">{error || 'Profile unavailable.'}</div></div></main>;
  const average = Number(ratingSummary.average_rating || profile.reputation?.rating || 0);
  const completed = Number(profile.reputation?.completed_sessions || 0);
  const learnedSkills = learningHistory.filter(item => item.status === 'ADDED_TO_PROFILE');

  return <main className="profile-page"><div className="profile-shell">
    <Link to="/dashboard" className="profile-back">← Back to Dashboard</Link>
    {error && <div className="profile-alert">{error}</div>}{saved && <div className="profile-success">{saved}</div>}
    <section className="profile-hero"><div className="profile-avatar">{initials(profile.name)}</div><div className="profile-identity"><span className="profile-kicker">SKILLSWAP MEMBER</span><h1>{profile.name}</h1><p>{profile.department || 'Student'}{profile.college ? ` · ${profile.college}` : ''}</p><div className="profile-meta"><span><Mail size={14}/>{profile.email}</span><span><School size={14}/>{profile.college || 'College not added'}</span></div></div><button className="profile-edit" onClick={() => setEditMode(true)}><Edit3 size={15}/> Edit profile</button></section>

    <section className="profile-metrics"><div><span>REPUTATION</span><strong>{average ? average.toFixed(1) : 'New'}</strong><div>{average ? <Stars value={average} /> : <small>No ratings yet</small>}<small>{ratingSummary.total_ratings} rating{ratingSummary.total_ratings === 1 ? '' : 's'}</small></div></div><div><span>COMPLETED SESSIONS</span><strong>{completed}</strong><p><CheckCircle2 size={14}/> Exchanges completed</p></div><div><span>PROFILE COMPLETION</span><strong>{completion}%</strong><div className="completion-bar"><i style={{ width: `${completion}%` }}/></div></div><div><span>SKILL FOOTPRINT</span><strong>{profile.teachSkills.length + profile.learnSkills.length + learnedSkills.length}</strong><p><Trophy size={14}/> {profile.teachSkills.length} teach · {profile.learnSkills.length} goals · {learnedSkills.length} learned</p></div></section>

    {editMode ? <form className="profile-edit-card" onSubmit={save}><div className="edit-header"><div><span className="profile-kicker">EDIT PROFILE</span><h2>Keep your student profile current.</h2></div></div><div className="edit-grid">{[['name','Name'],['email','Email'],['college','College'],['department','Department'],['roll_no','Register number'],['phone','Phone']].map(([key,label]) => <label key={key}>{label}<input disabled={key === 'email'} value={editData[key] || ''} onChange={e => update(key, key === 'phone' ? e.target.value.replace(/\D/g,'').slice(0,10) : e.target.value)}/></label>)}</div><label className="edit-full">About me<textarea maxLength={500} value={editData.bio || ''} onChange={e => update('bio', e.target.value)}/><small>{(editData.bio || '').length}/500</small></label><div className="edit-actions"><button type="button" onClick={() => setEditMode(false)}>Cancel</button><button className="save" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button></div></form> : <>
      <div className="profile-grid"><div className="profile-main-column">
        <section className="profile-panel"><div className="panel-title"><div><span>ABOUT</span><h2>About me</h2></div></div><p className="profile-bio">{profile.bio || 'Add a short introduction so students know what you enjoy teaching and learning.'}</p></section>
        <section className="profile-panel"><div className="panel-title"><div><span>TEACHING</span><h2>Skills I can teach</h2></div><Link to="/skill-setup">Manage skills</Link></div><div className="skill-profile-grid">{profile.teachSkills.length ? profile.teachSkills.map(s => <article key={s.id} className="profile-skill teach"><div><strong>{s.name}</strong><span>{s.category_name || 'Skill'}</span></div><b>{levelLabel(s.level)}</b><div className="skill-meter"><i style={{ width: `${levelLabel(s.level) === 'PROFICIENT' ? 92 : levelLabel(s.level) === 'INTERMEDIATE' ? 66 : 35}%` }}/></div></article>) : <div className="profile-empty">No teaching skills yet. <Link to="/skill-setup">Add your first skill</Link></div>}</div></section>
        <section className="profile-panel"><div className="panel-title"><div><span>LEARNING</span><h2>Skills I want to learn</h2></div><Link to="/skill-setup">Manage goals</Link></div><div className="skill-profile-grid">{profile.learnSkills.length ? profile.learnSkills.map(s => <article key={s.id} className="profile-skill learn"><div><strong>{s.name}</strong><span>{s.category_name || 'Learning goal'}</span></div><b>{levelLabel(s.level)}</b><div className="skill-meter"><i style={{ width: `${levelLabel(s.level) === 'PROFICIENT' ? 92 : levelLabel(s.level) === 'INTERMEDIATE' ? 66 : 35}%` }}/></div></article>) : <div className="profile-empty">No learning goals yet. <Link to="/skill-setup">Add a learning goal</Link></div>}</div></section>
        <section className="profile-panel learned-skills-panel"><div className="panel-title"><div><span>LEARNED SKILLS</span><h2>Skills earned through sessions</h2></div><Link to="/learning">View journey</Link></div><p className="profile-bio learned-intro">Every completed learning journey you add to your profile appears here with the level you reached.</p><div className="learned-skill-grid">{learnedSkills.length ? learnedSkills.map(item => <article key={item.id} className="learned-skill-card"><div className="learned-skill-icon"><GraduationCap size={17}/></div><div className="learned-skill-copy"><strong>{item.skill_name}</strong><span>Learned from {item.teacher_name}</span><small>{levelLabel(item.level || 'BEGINNER')} · {item.added_to_profile_at ? new Date(item.added_to_profile_at).toLocaleDateString() : 'Recently added'}</small></div><CheckCircle2 size={17} className="learned-check"/></article>) : <div className="profile-empty learned-empty"><GraduationCap size={19}/><div><strong>No learned skills yet</strong><span>Complete a learning session, confirm what you learned, then add it to your profile.</span></div><Link to="/learning">Open learning journey</Link></div>}</div></section>
      </div><aside className="profile-side-column">
        <section className="profile-panel profile-info-panel"><div className="panel-title"><div><span>ACCOUNT</span><h2>Student details</h2></div></div><div className="profile-info-list"><div><UserRound size={15}/><span>Name<strong>{profile.name}</strong></span></div><div><Mail size={15}/><span>Email<strong>{profile.email}</strong></span></div><div><School size={15}/><span>Department<strong>{profile.department || 'Not added'}</strong></span></div><div><BookOpen size={15}/><span>Register number<strong>{profile.roll_no || 'Not added'}</strong></span></div></div></section>
        <section className="profile-panel"><div className="panel-title"><div><span>RATINGS</span><h2>What students say</h2></div><strong className="rating-big">{average ? average.toFixed(1) : '—'}</strong></div>{ratings.length ? <div className="review-list">{ratings.slice(0,5).map(r => <article key={r.id}><div className="review-head"><div className="review-avatar">{initials(r.reviewer_name)}</div><div><strong>{r.reviewer_name}</strong><span><Stars value={Number(r.rating)} size={12}/>{new Date(r.created_at).toLocaleDateString()}</span></div></div><p>{r.review || 'No written comment was left.'}</p></article>)}</div> : <div className="profile-empty"><Star size={20}/><p>Your first completed exchange can earn your first rating.</p></div>}</section>
        <section className="profile-panel profile-actions-panel"><Link to="/matches"><UsersRoundIcon/> Find reciprocal matches</Link><Link to="/messages"><MessageCircle size={17}/> Open messages</Link></section>
      </aside></div>
    </>}
    {false && <div />}
  </div></main>;
}

function UsersRoundIcon(){ return <span className="fake-users-icon">↔</span>; }
