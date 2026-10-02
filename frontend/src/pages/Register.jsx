import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api';
import './Register.css';

const departments = ['CSE','IT','ECE','EEE','ME','CE','AI & DS','AI & ML','Cyber Security','CSBS','CSD','EIE','BME','BT','IBT','Chemical','Aeronautical','Aerospace','Automobile','Mechatronics','Robotics & Automation','Industrial','Manufacturing','Production','Instrumentation & Control','Environmental','Agricultural'];

export default function Register() {
  const { register } = useAuth(); const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', phone:'', college:'', roll_no:'', department:'', password:'', confirmPassword:'' });
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const change = (name, value) => setForm(v => ({ ...v, [name]: value }));
  const submit = async e => {
    e.preventDefault(); setError('');
    if (form.password.length < 8) return setError('Password must contain at least 8 characters.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    if (!/^\d{10}$/.test(form.phone)) return setError('Phone number must contain exactly 10 digits.');
    if (!form.department) return setError('Please select your department.');
    try {
      setBusy(true);
      await register({ name: form.name.trim(), email: form.email.trim(), phone: form.phone, college: form.college.trim(), roll_no: form.roll_no.trim(), department: form.department, password: form.password });
      navigate('/skill-setup', { replace: true });
    } catch (err) { setError(getErrorMessage(err, 'Registration failed.')); }
    finally { setBusy(false); }
  };
  return <main className="auth-page register-page-new"><section className="auth-card register-layout"><div className="auth-brand-panel"><Link to="/" className="auth-logo">Skill<span>Swap</span></Link><p className="eyebrow">CREATE YOUR PROFILE</p><h1>Learn. Teach.<br /><span>Grow together.</span></h1><p>Your account is saved in MySQL. After registration you will choose your real skills from the database.</p><div className="register-steps"><div><b>1</b><span>Account details</span></div><div><b>2</b><span>Choose skills</span></div><div><b>3</b><span>Find matches</span></div></div></div><div className="auth-form-panel register-form-panel"><div className="auth-heading"><h2>Create account</h2><p>All fields marked below are required.</p></div>{error && <div className="form-alert">{error}</div>}<form onSubmit={submit} className="register-grid-form">
    <label>Full name<input value={form.name} onChange={e=>change('name',e.target.value)} placeholder="Your full name" required /></label>
    <label>Email<input type="email" value={form.email} onChange={e=>change('email',e.target.value)} placeholder="you@example.com" required /></label>
    <label>Phone<input inputMode="numeric" maxLength="10" value={form.phone} onChange={e=>change('phone',e.target.value.replace(/\D/g,''))} placeholder="10 digit number" required /></label>
    <label>College<input value={form.college} onChange={e=>change('college',e.target.value)} placeholder="College / University" required /></label>
    <label>Register number<input value={form.roll_no} onChange={e=>change('roll_no',e.target.value)} placeholder="Register number" required /></label>
    <label>Department<select value={form.department} onChange={e=>change('department',e.target.value)} required><option value="">Select department</option>{departments.map(d=><option key={d}>{d}</option>)}</select></label>
    <label>Password<input type="password" autoComplete="new-password" value={form.password} onChange={e=>change('password',e.target.value)} placeholder="Minimum 8 characters" required /></label>
    <label>Confirm password<input type="password" autoComplete="new-password" value={form.confirmPassword} onChange={e=>change('confirmPassword',e.target.value)} placeholder="Repeat password" required /></label>
    <button className="primary-submit full-width" disabled={busy}>{busy ? 'Creating account…' : 'Create account & choose skills'}</button>
  </form><p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p></div></section></main>;
}
