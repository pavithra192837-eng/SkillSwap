import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, ChevronRight, Search, Sparkles, UsersRound } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { getErrorMessage } from '../api';
import './Explore.css';

export default function Explore() {
  const navigate=useNavigate(); const {user}=useAuth(); const [params,setParams]=useSearchParams();
  const [skills,setSkills]=useState([]); const [query,setQuery]=useState(''); const [category,setCategory]=useState(params.get('category') || 'ALL'); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
  useEffect(()=>{api.get('/skills').then(({data})=>setSkills(data.skills||[])).catch(e=>setError(getErrorMessage(e,'Could not load the skill catalog.'))).finally(()=>setLoading(false));},[]);
  const categories=useMemo(()=>['ALL',...new Set(skills.map(s=>s.category_name||'Other'))],[skills]);
  const filtered=useMemo(()=>skills.filter(s=>`${s.name} ${s.category_name||''} ${s.description||''}`.toLowerCase().includes(query.toLowerCase()) && (category==='ALL'||(s.category_name||'Other')===category)),[skills,query,category]);
  const chooseCategory=c=>{setCategory(c);setParams(c==='ALL'?{}:{category:c});};
  const add=(skillId,mode)=>{if(user) navigate(`/skill-setup?skill=${skillId}&mode=${mode}`); else navigate('/register');};
  return <main className="explore-page"><div className="explore-shell">
    <button className="explore-back" onClick={()=>navigate(user?'/dashboard':'/')}><ChevronRight size={15} style={{transform:'rotate(180deg)'}}/> {user?'Back to dashboard':'Back home'}</button>
    <header className="explore-hero"><div><span className="explore-kicker">LIVE SKILL CATALOG</span><h1>Find something worth learning.</h1><p>Search the real SkillSwap catalog. Choose a skill to teach, a skill to learn, or use the catalog to shape your profile.</p></div><div className="explore-catalog-stat"><strong>{skills.length}</strong><span>skills available</span></div></header>
    {error&&<div className="explore-alert">{error}</div>}
    <div className="explore-categories">{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>chooseCategory(c)}>{c==='ALL'?'All skills':c}</button>)}</div>
    <section className="explore-toolbar"><label className="explore-search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search a skill or category…"/></label><span>{filtered.length} matching skills</span></section>
    {loading?<div className="explore-empty"><Sparkles className="spin"/><h3>Loading the catalog</h3><p>Fetching current skills from your backend.</p></div>:filtered.length?<div className="explore-grid">{filtered.map(skill=><article className="explore-skill-card" key={skill.id}><div className="explore-skill-top"><div className="explore-skill-icon">{skill.name?.[0]?.toUpperCase()}</div><span>{skill.category_name||'Other'}</span></div><h2>{skill.name}</h2><p>{skill.description||'Build practical knowledge through a student-to-student exchange.'}</p><div className="explore-skill-actions"><button onClick={()=>add(skill.id,'learn')}><BookOpen size={15}/> I want to learn</button><button onClick={()=>add(skill.id,'teach')}><UsersRound size={15}/> I can teach</button></div></article>)}</div>:<div className="explore-empty"><Search/><h3>No matching skills</h3><p>Try another keyword or category.</p></div>}
    <section className="explore-bottom-card"><div><span>YOUR NEXT STEP</span><h2>{user?'Complete both sides of your profile.':'Create your profile and start matching.'}</h2><p>{user?'Teaching skills describe your offer. Learning skills describe your goal. SkillSwap uses both to find reciprocal exchanges.':'Your account unlocks skill selection, reciprocal matching, requests, realtime chat and live sessions.'}</p></div><button onClick={()=>navigate(user?'/skill-setup':'/register')}>{user?'Open My Skills':'Create account'} <ArrowRight size={17}/></button></section>
  </div></main>;
}
