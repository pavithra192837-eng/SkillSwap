import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setError('');
    if (!form.email || !form.password) return setError('Enter your email and password.');
    try {
      setBusy(true); await login(form.email.trim(), form.password);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) { setError(getErrorMessage(err, 'Login failed. Check your email and password.')); }
    finally { setBusy(false); }
  };
  return <main className="auth-page"><section className="auth-card login-layout"><div className="auth-brand-panel"><Link to="/" className="auth-logo">Skill<span>Swap</span></Link><p className="eyebrow">WELCOME BACK</p><h1>Continue your<br /><span>skill journey.</span></h1><p>Sign in to find matches, exchange requests, messages and live sessions.</p></div><div className="auth-form-panel"><div className="auth-heading"><h2>Sign in</h2><p>Use the account you created on SkillSwap.</p></div>{error && <div className="form-alert">{error}</div>}<form onSubmit={submit} className="clean-form"><label>Email<input type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label><label>Password<input type="password" autoComplete="current-password" placeholder="Your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></label><button className="primary-submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button></form><p className="auth-switch">New to SkillSwap? <Link to="/register">Create an account</Link></p></div></section></main>;
}
