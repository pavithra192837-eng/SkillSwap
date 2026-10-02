import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api';
import './SkillSetup.css';

const LEVELS = [
  { value: 'BEGINNER', label: 'Beginner', help: 'I know the basics' },
  { value: 'INTERMEDIATE', label: 'Intermediate', help: 'I can use it independently' },
  { value: 'PROFICIENT', label: 'Proficient', help: 'I can teach it confidently' },
];

export default function SkillSetup() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState([]);
  const [teach, setTeach] = useState({});
  const [learn, setLearn] = useState({});
  const [mode, setMode] = useState('teach');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/skills').then(({ data }) => setCatalog(data.skills || [])).catch(e => setError(getErrorMessage(e, 'Could not load the skill catalog.'))).finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ['ALL', ...new Set(catalog.map(s => s.category_name || 'Other'))], [catalog]);
  const filtered = useMemo(() => catalog.filter(s => {
    const matchesText = `${s.name} ${s.category_name || ''}`.toLowerCase().includes(query.toLowerCase());
    return matchesText && (category === 'ALL' || (s.category_name || 'Other') === category);
  }), [catalog, query, category]);

  const selected = mode === 'teach' ? teach : learn;
  const setSelected = mode === 'teach' ? setTeach : setLearn;
  const toggle = (skill) => setSelected(prev => {
    const next = { ...prev };
    if (next[skill.id]) delete next[skill.id];
    else next[skill.id] = 'BEGINNER';
    return next;
  });
  const setLevel = (id, level) => setSelected(prev => ({ ...prev, [id]: level }));

  const save = async () => {
    setError('');
    if (!Object.keys(teach).length) return setError('Choose at least one skill you can teach.');
    if (!Object.keys(learn).length) return setError('Choose at least one skill you want to learn.');
    const overlap = Object.keys(teach).some(id => learn[id]);
    if (overlap) return setError('A skill cannot be selected for both learning and teaching during initial setup.');
    try {
      setSaving(true);
      await Promise.all([
        ...Object.entries(teach).map(([skill_id, level]) => api.post('/users/me/skills', { skill_id: Number(skill_id), type: 'TEACH', level })),
        ...Object.entries(learn).map(([skill_id, level]) => api.post('/users/me/skills', { skill_id: Number(skill_id), type: 'LEARN', level })),
      ]);
      navigate('/dashboard', { replace: true });
    } catch (e) { setError(getErrorMessage(e, 'Could not save your skills.')); }
    finally { setSaving(false); }
  };

  const names = (map) => Object.keys(map).map(id => catalog.find(s => String(s.id) === String(id))).filter(Boolean);

  return <main className="skill-setup-page">
    <div className="skill-setup-shell">
      <header className="journey-header">
        <div><span className="eyebrow">STEP 2 OF 3 · YOUR SKILL IDENTITY</span><h1>Tell SkillSwap what you know <span>and what you want to learn.</span></h1><p>Your teaching skills help other students find you. Your learning skills help us find the right teachers for you.</p></div>
        <div className="journey-progress"><b>2 / 3</b><div><i style={{ width: '66%' }} /></div><span>Profile → Skills → Matches</span></div>
      </header>

      <div className="skill-role-switch"><button className={mode === 'teach' ? 'active teach' : ''} onClick={() => setMode('teach')}><strong>I CAN TEACH</strong><span>Skills I already know</span><b>{Object.keys(teach).length}</b></button><button className={mode === 'learn' ? 'active learn' : ''} onClick={() => setMode('learn')}><strong>I WANT TO LEARN</strong><span>Skills I want to gain</span><b>{Object.keys(learn).length}</b></button></div>

      {error && <div className="form-alert">{error}</div>}
      <section className="catalog-card">
        <div className="catalog-head"><div><span className="section-kicker">{mode === 'teach' ? 'TEACHING PROFILE' : 'LEARNING GOALS'}</span><h2>{mode === 'teach' ? 'Choose what you can teach' : 'Choose what you want to learn'}</h2><p>Select skills and set a level for each one.</p></div><div className="catalog-count"><b>{Object.keys(selected).length}</b><span>selected</span></div></div>
        <div className="catalog-tools"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search Python, React, Figma…" /><select value={category} onChange={e => setCategory(e.target.value)}>{categories.map(c => <option key={c} value={c}>{c === 'ALL' ? 'All categories' : c}</option>)}</select></div>
        {loading ? <div className="empty-state">Loading skills from your backend…</div> : <div className="catalog-grid">{filtered.map(skill => { const chosen = selected[skill.id]; return <article key={skill.id} className={`catalog-skill ${chosen ? 'chosen' : ''}`}><button type="button" className="skill-select" onClick={() => toggle(skill)}><span className="skill-icon">{skill.name.slice(0,1)}</span><span><strong>{skill.name}</strong><small>{skill.category_name || 'Other'}</small></span><i>{chosen ? '✓' : '+'}</i></button>{chosen && <div className="level-picker">{LEVELS.map(level => <button type="button" key={level.value} className={chosen === level.value ? 'selected' : ''} onClick={() => setLevel(skill.id, level.value)}><b>{level.label}</b><small>{level.help}</small></button>)}</div>}</article>; })}</div>}
      </section>

      <section className="selected-summary"><div><span>YOUR PLAN</span><h2>{names(teach).length} teaching skills <em>⇄</em> {names(learn).length} learning goals</h2><p>After an exchange session is fully completed, a learner can confirm the skill and add it to their profile.</p></div><button className="primary-submit" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save skills & continue →'}</button></section>
    </div>
  </main>;
}
