import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, CheckCircle2, ChevronRight, CirclePlay, MessageCircle, MonitorPlay, Search, Sparkles, Star, UsersRound, Video, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Home.css';

const flow = [
  { id: 'teach', label: 'I can teach', title: 'Turn your strongest skills into an offer.', text: 'Add the skills you are comfortable sharing and set your real proficiency level.', icon: UsersRound },
  { id: 'learn', label: 'I want to learn', title: 'Define what you want to learn next.', text: 'Build a learning list so matching can find people whose teaching skills fit your goals.', icon: BookOpen },
  { id: 'meet', label: 'We exchange', title: 'Match, message and learn live.', text: 'Accepted partners can chat, schedule a session and meet through voice or video.', icon: Video },
];

export default function Home() {
  const navigate = useNavigate();
  const [activeFlow, setActiveFlow] = useState('teach');
  const [skills, setSkills] = useState([]);
  const [skillQuery, setSkillQuery] = useState('');
  const [loadingSkills, setLoadingSkills] = useState(true);

  useEffect(() => {
    api.get('/skills').then(({ data }) => setSkills(data.skills || [])).catch(() => setSkills([])).finally(() => setLoadingSkills(false));
  }, []);

  const categories = useMemo(() => [...new Set(skills.map(s => s.category_name || 'Other'))].slice(0, 8), [skills]);
  const visibleSkills = useMemo(() => skills.filter(s => `${s.name} ${s.category_name || ''}`.toLowerCase().includes(skillQuery.toLowerCase())).slice(0, 8), [skills, skillQuery]);
  const active = flow.find(item => item.id === activeFlow) || flow[0];
  const ActiveIcon = active.icon;

  return <main className="home-page">
    <section className="home-hero">
      <div className="home-aurora aurora-a"/><div className="home-aurora aurora-b"/><div className="home-grid-noise"/>
      <div className="home-hero-grid">
        <div className="home-copy">
          <div className="home-badge"><span className="live-dot"/> Student-to-student learning network</div>
          <h1>Teach what you know.<br/><span>Learn what matters.</span></h1>
          <p>SkillSwap is a full-stack skill exchange platform where students build real skill profiles, discover reciprocal matches, chat in real time and learn through live sessions.</p>
          <div className="home-actions"><button className="home-primary" onClick={() => navigate('/register')}>Build my skill profile <ArrowRight size={18}/></button><button className="home-secondary" onClick={() => document.getElementById('live-preview')?.scrollIntoView({ behavior: 'smooth' })}><CirclePlay size={17}/> See how it works</button></div>
          <div className="home-proof"><span><CheckCircle2 size={16}/> MySQL-backed profiles</span><span><CheckCircle2 size={16}/> Reciprocal matching</span><span><CheckCircle2 size={16}/> Firebase + WebRTC</span></div>
        </div>

        <div className="home-product" aria-label="SkillSwap product preview">
          <div className="window-chrome"><div className="chrome-dots"><i/><i/><i/></div><span>skillswap / workspace</span><Zap size={15}/></div>
          <div className="product-body">
            <div className="product-head"><div><small>LIVE PROFILE BUILDER</small><h3>What are you bringing to the exchange?</h3></div><div className="product-score"><strong>{skills.length || '—'}</strong><span>skills</span></div></div>
            <div className="product-toggle"><button className={activeFlow === 'teach' ? 'active' : ''} onClick={() => setActiveFlow('teach')}>I can teach</button><button className={activeFlow === 'learn' ? 'active' : ''} onClick={() => setActiveFlow('learn')}>I want to learn</button><button className={activeFlow === 'meet' ? 'active' : ''} onClick={() => setActiveFlow('meet')}>Live exchange</button></div>
            <div className="product-main-card"><div className="product-icon"><ActiveIcon size={21}/></div><div><span>{active.label}</span><strong>{active.title}</strong><p>{active.text}</p></div><ChevronRight size={19}/></div>
            <div className="product-search"><Search size={15}/><input value={skillQuery} onChange={e => setSkillQuery(e.target.value)} placeholder="Search real skills from your catalog"/></div>
            <div className="product-skills">{loadingSkills ? <div className="product-loading">Loading skill catalog…</div> : visibleSkills.length ? visibleSkills.map(skill => <button key={skill.id} onClick={() => navigate(`/skill-setup?skill=${skill.id}&mode=${activeFlow === 'teach' ? 'teach' : 'learn'}`)}><span>{skill.name}</span><small>{skill.category_name || 'Other'}</small></button>) : <div className="product-loading">No skills match your search.</div>}</div>
            <div className="product-footer"><span><MessageCircle size={14}/> realtime chat</span><span><MonitorPlay size={14}/> voice + video</span><span><Star size={14}/> ratings</span></div>
          </div>
        </div>
      </div>
    </section>

    <section className="home-section home-live" id="live-preview">
      <div className="section-heading"><span className="section-kicker">INTERACTIVE FLOW</span><h2>Every step connects to the next.</h2><p>Use the flow below to understand what a student actually does inside SkillSwap. These are real app capabilities, not presentation-only screens.</p></div>
      <div className="flow-layout"><div className="flow-tabs">{flow.map(item => <button key={item.id} className={activeFlow === item.id ? 'active' : ''} onClick={() => setActiveFlow(item.id)}><span>{item.id === 'teach' ? '01' : item.id === 'learn' ? '02' : '03'}</span><div><strong>{item.label}</strong><small>{item.id === 'teach' ? 'Build your offer' : item.id === 'learn' ? 'Set your goal' : 'Meet your partner'}</small></div><ChevronRight size={16}/></button>)}</div><article className="flow-detail"><div className="flow-detail-icon"><ActiveIcon size={25}/></div><span className="section-kicker">{active.label.toUpperCase()}</span><h3>{active.title}</h3><p>{active.text}</p><div className="flow-detail-actions"><button onClick={() => navigate(activeFlow === 'meet' ? '/explore' : `/skill-setup?mode=${activeFlow === 'teach' ? 'teach' : 'learn'}`)}>Open this part <ArrowUpRight size={16}/></button><span><CheckCircle2 size={15}/> Account-backed workflow</span></div></article></div>
    </section>

    <section className="home-section home-catalog">
      <div className="section-heading split"><div><span className="section-kicker">REAL SKILL CATALOG</span><h2>Explore the skills your backend knows about.</h2><p>The home page reads the public skill catalog from your API, so this area grows when your database grows.</p></div><button onClick={() => navigate('/explore')}>Explore all skills <ArrowRight size={16}/></button></div>
      <div className="category-row">{categories.map(category => <button key={category} onClick={() => navigate(`/explore?category=${encodeURIComponent(category)}`)}>{category}</button>)}</div>
      <div className="home-skill-grid">{visibleSkills.slice(0, 6).map(skill => <article key={skill.id}><div className="skill-letter">{skill.name?.[0]?.toUpperCase() || '?'}</div><div><span>{skill.category_name || 'Other'}</span><h3>{skill.name}</h3><p>{skill.description || 'Learn through a practical peer exchange.'}</p></div><button onClick={() => navigate(`/skill-setup?skill=${skill.id}&mode=learn`)} aria-label={`Learn ${skill.name}`}><ArrowUpRight size={16}/></button></article>)}</div>
    </section>

    <section className="home-section home-how" id="how-it-works"><div className="section-heading centered"><span className="section-kicker">HOW IT WORKS</span><h2>A real exchange loop, from profile to progress.</h2></div><div className="how-grid"><article><b>01</b><h3>Create your identity</h3><p>Register, add teaching skills, learning goals and proficiency levels.</p></article><article><b>02</b><h3>Find a reciprocal match</h3><p>The backend compares what students can teach with what they want to learn.</p></article><article><b>03</b><h3>Request the exchange</h3><p>Send an exchange request with a clear offer and learning goal.</p></article><article><b>04</b><h3>Meet and learn</h3><p>Message, schedule and join a live voice or video session.</p></article></div></section>

    <section className="home-cta"><div><span className="section-kicker">READY WHEN YOU ARE</span><h2>Your final-year project should feel like a real product.</h2><p>Build the profile. Find the match. Complete the exchange. Track the learning.</p></div><button onClick={() => navigate('/register')}>Start SkillSwap <ArrowRight size={18}/></button></section>
  </main>;
}
