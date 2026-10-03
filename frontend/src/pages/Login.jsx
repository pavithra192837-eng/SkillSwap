import { useState } from 'react';
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({});
  const [busy, setBusy] = useState(false);

  const emailError = touched.email && !/^\S+@\S+\.\S+$/.test(form.email) ? 'Enter a valid email address.' : '';
  const passwordError = touched.password && !form.password ? 'Enter your password.' : '';

  const submit = async event => {
    event.preventDefault();
    setTouched({ email: true, password: true });
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(form.email) || !form.password) return;
    try {
      setBusy(true);
      await login(form.email.trim(), form.password);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'We could not sign you in. Check your email and password.'));
    } finally { setBusy(false); }
  };

  return <main className="auth-screen login-screen">
    <div className="auth-orb orb-a"/><div className="auth-orb orb-b"/>
    <section className="auth-shell login-shell">
      <aside className="auth-showcase">
        <Link to="/" className="auth-brand"><span className="brand-symbol">↗</span><b>Skill</b><strong>Swap</strong></Link>
        <div className="showcase-copy"><div className="eyebrow-pill"><Sparkles size={13}/> YOUR LEARNING WORKSPACE</div><h1>Pick up where<br/><em>you left off.</em></h1><p>Return to your matches, conversations, sessions and learning progress without losing your place.</p>
          <div className="showcase-checks"><span><CheckCircle2 size={15}/> Real-time messages</span><span><CheckCircle2 size={15}/> Live voice + video</span><span><CheckCircle2 size={15}/> Session ratings</span></div>
        </div>
        <div className="showcase-mini"><span>SKILLSWAP</span><strong>One account. One connected learning journey.</strong></div>
      </aside>
      <section className="auth-panel">
        <div className="auth-mobile-brand"><Link to="/" className="auth-brand"><span className="brand-symbol">↗</span><b>Skill</b><strong>Swap</strong></Link></div>
        <div className="auth-heading"><span className="auth-kicker">WELCOME BACK</span><h2>Sign in to SkillSwap</h2><p>Your matches, messages and live sessions are waiting.</p></div>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <form className="auth-form" onSubmit={submit} noValidate>
          <label className={`auth-field ${emailError ? 'has-error' : ''} ${touched.email && !emailError && form.email ? 'has-success' : ''}`}>
            <span>Email address</span>
            <div className="input-wrap"><Mail size={17}/><input type="email" autoComplete="email" placeholder="name@college.edu" value={form.email} onBlur={() => setTouched(v => ({...v, email:true}))} onChange={e => setForm(v => ({...v,email:e.target.value}))}/>{touched.email && !emailError && form.email && <CheckCircle2 size={16} className="field-success"/>}</div>
            {emailError && <small>{emailError}</small>}
          </label>
          <label className={`auth-field ${passwordError ? 'has-error' : ''}`}>
            <span>Password</span>
            <div className="input-wrap"><LockKeyhole size={17}/><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={form.password} onBlur={() => setTouched(v => ({...v,password:true}))} onChange={e => setForm(v => ({...v,password:e.target.value}))}/><button type="button" className="input-action" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div>
            {passwordError && <small>{passwordError}</small>}
          </label>
          <button className="auth-submit" disabled={busy}>{busy ? <><span className="spinner"/> Signing you in…</> : <>Continue to workspace <ArrowRight size={17}/></>}</button>
        </form>
        <div className="auth-trust"><ShieldCheck size={15}/><span>Protected API access keeps your profile, sessions and exchange data tied to your authenticated account.</span></div>
        <p className="auth-switch">New to SkillSwap? <Link to="/register">Create your account <ArrowRight size={14}/></Link></p>
      </section>
    </section>
  </main>;
}
