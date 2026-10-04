import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ChevronDown, Plus, Search, Sparkles, Trash2, UsersRound, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api, { getErrorMessage } from '../api';
import './SkillSetup.css';

const LEVELS = [
  { value:'BEGINNER', label:'Beginner', desc:'I know the basics', meter:35 },
  { value:'INTERMEDIATE', label:'Intermediate', desc:'I can work independently', meter:65 },
  { value:'PROFICIENT', label:'Proficient', desc:'I can teach this confidently', meter:90 },
];
const normalizeLevel = value => value === 'ADVANCED' ? 'PROFICIENT' : value;

export default function SkillSetup() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requestedSkill = params.get('skill');
  const [catalog,setCatalog] = useState([]); const [rows,setRows] = useState([]);
  const [mode,setMode] = useState(params.get('mode') === 'teach' ? 'TEACH' : 'LEARN');
  const [query,setQuery] = useState(''); const [category,setCategory] = useState('ALL'); const [categoryOpen,setCategoryOpen] = useState(false);
  const [loading,setLoading] = useState(true); const [error,setError] = useState(''); const [notice,setNotice] = useState('');
  const [adding,setAdding] = useState(null); const [highlight,setHighlight] = useState(requestedSkill ? Number(requestedSkill) : null);

  const load = async () => {
    try { const [catalogRes,mineRes] = await Promise.all([api.get('/skills'),api.get('/users/me/skills')]); setCatalog(catalogRes.data.skills || []); setRows(mineRes.data.skills || []); }
    catch(e){ setError(getErrorMessage(e,'Could not load your skills.')); } finally { setLoading(false); }
  };
  useEffect(()=>{load();},[]);

  const categories = useMemo(()=>['ALL',...new Set(catalog.map(s=>s.category_name || 'Other'))],[catalog]);
  const existing = useMemo(()=>rows.filter(s=>s.type===mode),[rows,mode]);
  const selectedIds = useMemo(()=>new Set(existing.map(s=>Number(s.skill_id))),[existing]);
  const oppositeType = mode === 'TEACH' ? 'LEARN' : 'TEACH';
  const oppositeIds = useMemo(()=>new Set(rows.filter(s=>s.type===oppositeType).map(s=>Number(s.skill_id))),[rows,oppositeType]);
  const filtered = useMemo(()=>catalog.filter(s=>`${s.name} ${s.category_name || ''} ${s.description || ''}`.toLowerCase().includes(query.toLowerCase()) && (category==='ALL' || (s.category_name || 'Other')===category)),[catalog,query,category]);
  const teachCount = rows.filter(s=>s.type==='TEACH').length; const learnCount = rows.filter(s=>s.type==='LEARN').length;

  useEffect(()=>{
    if (!requestedSkill || !catalog.length || !rows.length && !selectedIds.has(Number(requestedSkill))) return;
    const skill = catalog.find(s=>Number(s.id)===Number(requestedSkill));
    if (skill && !selectedIds.has(Number(skill.id))) setHighlight(Number(skill.id));
  },[requestedSkill,catalog,selectedIds,rows.length]);

  const addSkill = async skill => {
    if (selectedIds.has(Number(skill.id)) || oppositeIds.has(Number(skill.id))) { setNotice(`${skill.name} is already in your ${oppositeType==='TEACH'?'teaching':'learning'} list. A skill can only have one purpose in your profile.`); return; }
    try { setAdding(skill.id); setError(''); const response=await api.post('/users/me/skills',{skill_id:Number(skill.id),type:mode,level:'BEGINNER'}); setRows(prev=>[...prev,response.data.user_skill]); setNotice(`${skill.name} added to your ${mode==='TEACH'?'teaching':'learning'} list.`); setHighlight(null); }
    catch(e){setError(getErrorMessage(e,'Could not add this skill.'));} finally{setAdding(null);}
  };
  const updateLevel = async(row,level)=>{try{setError('');await api.put(`/users/me/skills/${row.id}`,{level});setRows(prev=>prev.map(item=>item.id===row.id?{...item,level}:item));setNotice(`${row.name} level updated.`);}catch(e){setError(getErrorMessage(e,'Could not update the skill level.'));}};
  const removeSkill = async row=>{try{setError('');await api.delete(`/users/me/skills/${row.id}`);setRows(prev=>prev.filter(item=>item.id!==row.id));setNotice(`${row.name} removed.`);}catch(e){setError(getErrorMessage(e,'Could not remove the skill.'));}};
  const switchMode = next=>{setMode(next);setQuery('');setCategory('ALL');setCategoryOpen(false);setNotice('');setError('');};

  return <main className="skill-page"><div className="skill-shell">
    <button className="skill-back" onClick={()=>navigate('/dashboard')}><ArrowLeft size={16}/> Back to dashboard</button>
    <header className="skill-hero"><div><span className="skill-kicker"><Sparkles size={13}/> SKILL IDENTITY</span><h1>Tell SkillSwap what you can give and what you want next.</h1><p>Your teaching and learning lists power reciprocal matching. Pick real skills, set an honest level and save them to your account.</p></div><div className="skill-count-card"><div><strong>{teachCount}</strong><span>Teaching</span></div><i>⇄</i><div><strong>{learnCount}</strong><span>Learning</span></div></div></header>
    <div className="skill-progress"><div className={teachCount?'done':''}><b>{teachCount? <Check size={13}/>:'01'}</b><span>What I teach</span></div><i/><div className={learnCount?'done':''}><b>{learnCount?<Check size={13}/>:'02'}</b><span>What I learn</span></div><i/><div><b>03</b><span>Find matches</span></div></div>
    {error && <div className="skill-alert error">{error}<button onClick={()=>setError('')}><X size={14}/></button></div>}{notice && <div className="skill-alert success"><CheckCircle2 size={15}/>{notice}<button onClick={()=>setNotice('')}><X size={14}/></button></div>}
    <div className="skill-mode-tabs"><button className={mode==='TEACH'?'active teach':''} onClick={()=>switchMode('TEACH')}><span className="mode-icon"><UsersRound size={20}/></span><div><strong>I CAN TEACH</strong><small>Skills I can share with another student</small></div><b>{teachCount}</b></button><button className={mode==='LEARN'?'active learn':''} onClick={()=>switchMode('LEARN')}><span className="mode-icon"><BookOpen size={20}/></span><div><strong>I WANT TO LEARN</strong><small>Skills I want to develop through an exchange</small></div><b>{learnCount}</b></button></div>
    <section className="skill-workspace">
      <div className="skill-catalog-panel"><div className="panel-heading"><div><span>1 · CHOOSE A SKILL</span><h2>{mode==='TEACH'?'What can you teach?':'What do you want to learn?'}</h2><p>Search the live skill catalog from your backend.</p></div><strong>{filtered.length} results</strong></div><div className="skill-filters"><label className="skill-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search Python, UI design, communication…"/></label><div className="skill-category-picker"><button type="button" className="skill-category-trigger" aria-haspopup="listbox" aria-expanded={categoryOpen} onClick={()=>setCategoryOpen(v=>!v)}><span>{category==='ALL'?'All categories':category}</span><ChevronDown size={15} className={categoryOpen?'open':''}/></button>{categoryOpen&&<div className="skill-category-menu" role="listbox" aria-label="Skill category">{categories.map(c=><button type="button" role="option" aria-selected={category===c} className={category===c?'selected':''} key={c} onClick={()=>{setCategory(c);setCategoryOpen(false)}}><span>{c==='ALL'?'All categories':c}</span>{category===c&&<Check size={14}/>}</button>)}</div>}</div></div>
        {loading?<div className="skill-empty"><Sparkles className="spin"/><h3>Loading your catalog…</h3><p>Getting the latest skills from MySQL.</p></div>:filtered.length?<div className="catalog-list">{filtered.map(skill=>{const selected=selectedIds.has(Number(skill.id));const opposite=oppositeIds.has(Number(skill.id));const isHighlight=highlight===Number(skill.id);return <article key={skill.id} className={`catalog-item ${selected?'selected':''} ${opposite?'opposite-selected':''} ${isHighlight?'highlight':''}`}><div className="catalog-icon">{skill.name?.[0]?.toUpperCase()}</div><div className="catalog-copy"><strong>{skill.name}</strong><small>{skill.category_name||'Other'}</small><p>{skill.description||'Build practical knowledge through peer exchange.'}</p></div>{selected?<span className="selected-pill"><Check size={14}/> Added</span>:opposite?<span className="selected-pill blocked"><X size={14}/> Already {oppositeType==='TEACH'?'teaching':'learning'}</span>:<button onClick={()=>addSkill(skill)} disabled={adding===skill.id}>{adding===skill.id?<span className="mini-spinner"/>:<Plus size={16}/>} {adding===skill.id?'Adding':'Add'}</button>}</article>})}</div>:<div className="skill-empty"><Search/><h3>No skills found</h3><p>Try a different search or category.</p></div>}
      </div>
      <aside className="skill-plan-panel"><div className="plan-heading"><div><span>2 · YOUR {mode==='TEACH'?'TEACHING':'LEARNING'} LIST</span><h2>{existing.length ? `${existing.length} selected` : 'Nothing selected yet'}</h2></div><div className="plan-ring">{existing.length}</div></div>{!existing.length?<div className="plan-empty"><div className="plan-empty-icon">{mode==='TEACH'?<UsersRound size={24}/>:<BookOpen size={24}/>}</div><h3>{mode==='TEACH'?'Add what you know':'Add a learning goal'}</h3><p>Select a skill on the left. It will appear here and become part of your real profile.</p></div>:<div className="plan-list">{existing.map(row=><article className="plan-card" key={row.id}><div className="plan-card-top"><div><strong>{row.name}</strong><span>{row.category_name||'Other'}</span></div><button onClick={()=>removeSkill(row)} title="Remove skill"><Trash2 size={15}/></button></div><div className="level-label"><span>Proficiency</span><b>{normalizeLevel(row.level)}</b></div><div className="level-options">{LEVELS.map(level=><button key={level.value} className={normalizeLevel(row.level)===level.value?'active':''} onClick={()=>updateLevel(row,level.value)}><div><strong>{level.label}</strong><small>{level.desc}</small></div><i><em style={{width:`${level.meter}%`}}/></i></button>)}</div></article>)}</div>}<div className="skill-save-note"><CheckCircle2 size={15}/><span>Every add, remove and proficiency change is saved to your account.</span></div></aside>
    </section>
    <section className="skill-guidance"><div><span>3 · WHAT HAPPENS NEXT</span><h3>Once both sides are filled, SkillSwap can find reciprocal partners.</h3><p>Example: you teach a skill they want, and they teach a skill you want. That two-way relationship is what powers the match.</p></div><button onClick={()=>navigate('/matches')}>See my matches <ArrowRight size={16}/></button></section>
  </div></main>;
}
