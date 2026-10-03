import { useEffect, useState } from 'react';
import { ArrowRight, Search, Sparkles, Star, UsersRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api';
import './Matches.css';

const initials = (name='Student') => name.split(/\s+/).filter(Boolean).map(x=>x[0]).join('').slice(0,2).toUpperCase() || 'S';

export default function Matches(){
 const navigate=useNavigate(); const [matches,setMatches]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(''); const [query,setQuery]=useState('');
 const load=async()=>{try{setError('');const r=await api.get('/matches');setMatches(r.data.matches||[]);}catch(e){setError(getErrorMessage(e,'Could not load matches.'));}finally{setLoading(false);}};
 useEffect(()=>{load();const t=setInterval(load,9000);return()=>clearInterval(t)},[]);
 const filtered=matches.filter(m=>`${m.name} ${m.department||''} ${m.college||''}`.toLowerCase().includes(query.toLowerCase()));
 return <main className="matches-page"><div className="matches-shell"><button className="matches-back" onClick={()=>navigate('/dashboard')}>← Back to Dashboard</button><header className="matches-header"><div><span>MATCH DISCOVERY</span><h1>Find your learning partner.</h1><p>These students are real reciprocal matches from your teaching and learning skills.</p></div><div className="matches-count"><strong>{matches.length}</strong><small>matches</small></div></header>{error&&<div className="matches-alert">{error}</div>}
 <div className="matches-toolbar"><div><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by student, department or college…"/></div><button onClick={()=>navigate('/skill-setup')}><Sparkles size={15}/> Improve my skill profile</button></div>
 {loading?<div className="matches-empty"><Sparkles className="spin"/><h3>Finding reciprocal matches</h3><p>Comparing your real skills with the network…</p></div>:filtered.length?<div className="matches-grid">{filtered.map(m=><article className="match-card" key={m.id}><div className="match-card-head"><div className="match-avatar">{initials(m.name)}</div><div className="match-person"><h2>{m.name}</h2><p>{m.department||'Student'}{m.college?` · ${m.college}`:''}</p></div><div className="match-rating"><Star size={14} fill={Number(m.average_rating)>0?'currentColor':'none'}/><strong>{Number(m.average_rating)?Number(m.average_rating).toFixed(1):'New'}</strong><small>{m.rating_count||0} ratings</small></div></div><div className="match-exchange"><div><span>CAN TEACH YOU</span><strong>{m.skills_they_can_teach} matching skill{Number(m.skills_they_can_teach)===1?'':'s'}</strong></div><b>⇄</b><div><span>WANTS TO LEARN FROM YOU</span><strong>{m.skills_they_want_to_learn} matching skill{Number(m.skills_they_want_to_learn)===1?'':'s'}</strong></div></div><div className="match-bio">{m.bio||'This student is ready for a reciprocal skill exchange.'}</div><div className="match-actions"><Link to={`/profile/${m.id}`}>View profile <ArrowRight size={15}/></Link></div></article>)}</div>:<div className="matches-empty"><UsersRound/><h3>{matches.length?'No students match your search':'No reciprocal matches yet'}</h3><p>{matches.length?'Try a different search.':'Add or refine teaching and learning skills so SkillSwap can find a two-way exchange.'}</p><button onClick={()=>navigate('/skill-setup')}>Update my skills</button></div>}
 </div></main>;
}
