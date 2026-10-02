import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api';
import './Matches.css';

export default function Matches(){
 const [matches,setMatches]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
 useEffect(()=>{api.get('/matches').then(r=>setMatches(r.data.matches||[])).catch(e=>setError(getErrorMessage(e,'Could not load matches.'))).finally(()=>setLoading(false))},[]);
 return <main className="matches-page"><div className="matches-container"><header className="matches-header"><p className="matches-label">RECIPROCAL MATCHES</p><h1>Students who can teach you — and learn from you.</h1><p className="matches-subtitle">These matches come from your real teaching and learning skills in MySQL.</p></header>{error&&<div className="form-alert">{error}</div>}{loading?<div className="no-matches"><h2>Finding reciprocal matches…</h2></div>:matches.length?<div className="matches-grid">{matches.map(m=><article className="match-card" key={m.id}><div className="match-user-header"><div className="match-avatar">{m.name.split(' ').map(x=>x[0]).join('').slice(0,2)}</div><div><h2>{m.name}</h2><p>{m.department||'Student'} · {m.college||'College'}</p></div></div><div className="match-stats"><div><span>Can teach</span><strong>{m.skills_they_can_teach}</strong></div><div><span>Wants to learn</span><strong>{m.skills_they_want_to_learn}</strong></div></div><Link className="connect-button" to={`/profile/${m.id}`}>View profile & connect</Link></article>)}</div>:<div className="no-matches"><div className="no-matches-icon">↔</div><h2>No reciprocal matches yet</h2><p>Add more teaching or learning skills to increase your matching opportunities.</p><Link className="back-explore-button" to="/skill-setup">Update my skills</Link></div>}</div></main>;
}
