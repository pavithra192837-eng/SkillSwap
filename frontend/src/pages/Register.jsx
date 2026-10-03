import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Eye, EyeOff, GraduationCap, Hash, LockKeyhole, Mail, Phone, Sparkles, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api';
import './Register.css';

const departments = ['CSE','IT','ECE','EEE','ME','CE','AI & DS','AI & ML','Cyber Security','CSBS','CSD','EIE','BME','BT','IBT','Chemical','Aeronautical','Aerospace','Automobile','Mechatronics','Robotics & Automation','Industrial','Manufacturing','Production','Instrumentation & Control','Environmental','Agricultural'];

function RegisterField({ icon: Icon, label, value, onChange, onBlur, invalid, required=true, type='text', ...props }) {
  return (
    <label className={`reg-field ${invalid ? 'invalid' : ''}`}>
      <span>{label}{required && <i>*</i>}</span>
      <div className="reg-input">
        <Icon size={16}/>
        <input
          type={type}
          value={value}
          onBlur={onBlur}
          onChange={onChange}
          {...props}
        />
        {value && !invalid && <CheckCircle2 size={15} className="field-ok"/>}
      </div>
      {invalid && <small>This field is required.</small>}
    </label>
  );
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState({});
  const [form, setForm] = useState({ name:'', email:'', phone:'', college:'', roll_no:'', department:'', password:'', confirmPassword:'' });
  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const touch = key => setTouched(prev => ({ ...prev, [key]: true }));

  const profileValid = useMemo(() => Boolean(form.name.trim() && /^\S+@\S+\.\S+$/.test(form.email) && /^\d{10}$/.test(form.phone) && form.college.trim() && form.roll_no.trim() && form.department), [form]);
  const passwordScore = useMemo(() => {
    let score = 0;
    if (form.password.length >= 8) score++;
    if (/[A-Z]/.test(form.password)) score++;
    if (/\d/.test(form.password)) score++;
    if (/[^A-Za-z0-9]/.test(form.password)) score++;
    return score;
  }, [form.password]);

  const next = event => {
    event.preventDefault();
    setError('');
    if (!profileValid) {
      setTouched({ name:true, email:true, phone:true, college:true, roll_no:true, department:true });
      return setError('Complete the highlighted profile fields before continuing.');
    }
    setStep(2);
  };

  const submit = async event => {
    event.preventDefault();
    setError('');
    setTouched({ password:true, confirmPassword:true });
    if (form.password.length < 8) return setError('Use at least 8 characters for your password.');
    if (form.password !== form.confirmPassword) return setError('Your passwords do not match.');
    try {
      setBusy(true);
      await register({ ...form, name: form.name.trim(), email: form.email.trim(), college: form.college.trim(), roll_no: form.roll_no.trim() });
      navigate('/skill-setup', { replace:true });
    } catch (err) { setError(getErrorMessage(err, 'Registration failed. Please check your details and try again.')); }
    finally { setBusy(false); }
  };



  return <main className="auth-screen register-screen">
    <div className="auth-orb orb-a"/><div className="auth-orb orb-b"/>
    <section className="auth-shell register-shell">
      <aside className="auth-showcase"><Link to="/" className="auth-brand"><span className="brand-symbol">↗</span><b>Skill</b><strong>Swap</strong></Link><div className="showcase-copy"><div className="eyebrow-pill"><Sparkles size={13}/> START YOUR EXCHANGE</div><h1>Build a skill identity that actually <em>matches.</em></h1><p>Your profile becomes the bridge between what you can teach and what another student wants to learn.</p><div className="register-benefit-list"><div><b><Check size={13}/></b><span>Real student profile data</span></div><div><b><Check size={13}/></b><span>Teaching + learning skills</span></div><div><b><Check size={13}/></b><span>Realtime sessions and ratings</span></div></div></div></aside>
      <section className="auth-panel"><div className="auth-mobile-brand"><Link to="/" className="auth-brand"><span className="brand-symbol">↗</span><b>Skill</b><strong>Swap</strong></Link></div>
        <div className="register-progress"><div className={step >= 1 ? 'active' : ''}><b>1</b><span>Profile</span></div><i/><div className={step >= 2 ? 'active' : ''}><b>2</b><span>Security</span></div><i/><div><b>3</b><span>Skills</span></div></div>
        <div className="auth-heading"><span className="auth-kicker">CREATE YOUR ACCOUNT</span><h2>{step === 1 ? 'Start with your student profile' : 'Secure your account'}</h2><p>{step === 1 ? 'These details identify you to your exchange partners.' : 'Your account is ready for the next step: choosing what you teach and learn.'}</p></div>
        {error && <div className="auth-error">{error}</div>}
        <form className="register-form" onSubmit={step === 1 ? next : submit} noValidate>
          {step === 1 ? <div className="reg-grid">
            <RegisterField icon={UserRound} label="Full name" k="name" value={form.name} invalid={touched.name && !form.name} onBlur={() => touch('name')} onChange={e => set('name', e.target.value)} placeholder="Your full name" autoComplete="name"/>
            <RegisterField icon={Mail} label="Email address" k="email" type="email" value={form.email} invalid={touched.email && !form.email} onBlur={() => touch('email')} onChange={e => set('email', e.target.value)} placeholder="name@college.edu" autoComplete="email"/>
            <RegisterField icon={Phone} label="Phone number" k="phone" value={form.phone} invalid={touched.phone && !form.phone} onBlur={() => touch('phone')} onChange={e => set('phone', e.target.value.replace(/\D/g,'').slice(0,10))} inputMode="numeric" maxLength="10" placeholder="10 digit number"/>
            <RegisterField icon={GraduationCap} label="College / university" k="college" value={form.college} invalid={touched.college && !form.college} onBlur={() => touch('college')} onChange={e => set('college', e.target.value)} placeholder="Your institution"/>
            <RegisterField icon={Hash} label="Register number" k="roll_no" value={form.roll_no} invalid={touched.roll_no && !form.roll_no} onBlur={() => touch('roll_no')} onChange={e => set('roll_no', e.target.value)} placeholder="University register number"/>
            <label className={`reg-field ${touched.department && !form.department ? 'invalid' : ''}`}><span>Department<i>*</i></span><div className="reg-input"><GraduationCap size={16}/><select value={form.department} onBlur={() => touch('department')} onChange={e => set('department',e.target.value)}><option value="">Select your department</option>{departments.map(d => <option key={d} value={d}>{d}</option>)}</select></div>{touched.department && !form.department && <small>Choose your department.</small>}</label>
          </div> : <div className="security-step">
            <label className={`reg-field ${touched.password && form.password.length < 8 ? 'invalid' : ''}`}><span>Password<i>*</i></span><div className="reg-input"><LockKeyhole size={16}/><input type={show ? 'text' : 'password'} value={form.password} onChange={e => set('password',e.target.value)} onBlur={() => touch('password')} placeholder="Create a strong password" autoComplete="new-password"/><button type="button" className="reg-eye" onClick={() => setShow(v => !v)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div></label>
            <div className="password-strength"><div className="strength-bars">{[1,2,3,4].map(n => <i key={n} className={passwordScore >= n ? 'on' : ''}/>)}</div><span>{passwordScore <= 1 ? 'Needs improvement' : passwordScore === 2 ? 'Fair' : passwordScore === 3 ? 'Good' : 'Strong'}</span></div>
            <label className={`reg-field ${touched.confirmPassword && form.confirmPassword !== form.password ? 'invalid' : ''}`}><span>Confirm password<i>*</i></span><div className="reg-input"><LockKeyhole size={16}/><input type={show ? 'text' : 'password'} value={form.confirmPassword} onChange={e => set('confirmPassword',e.target.value)} onBlur={() => touch('confirmPassword')} placeholder="Repeat your password" autoComplete="new-password"/></div>{touched.confirmPassword && form.confirmPassword !== form.password && <small>Passwords do not match.</small>}</label>
            <div className="password-rules"><span><Check size={14}/> 8+ characters</span><span><Check size={14}/> Uppercase + number recommended</span><span><Check size={14}/> You choose your own password</span></div>
          </div>}
          <div className="register-actions">{step === 2 && <button type="button" className="secondary-auth" onClick={() => {setError('');setStep(1)}}><ArrowLeft size={16}/> Back</button>}<button className="auth-submit" disabled={busy}>{busy ? <><span className="spinner"/> Creating account…</> : <>{step === 1 ? 'Continue to security' : 'Create account & choose skills'} <ArrowRight size={17}/></>}</button></div>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in <ArrowRight size={14}/></Link></p>
      </section>
    </section>
  </main>;
}
