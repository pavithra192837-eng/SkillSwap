import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import SkillSetup from './pages/SkillSetup';
import Login from './pages/Login';
import Register from './pages/Register';
import Explore from './pages/Explore';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Matches from './pages/Matches';
import Requests from './pages/Requests';
import Sessions from './pages/Sessions';
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import Call from './pages/Call';
import Notifications from './pages/Notifications';
import LearningJourney from './pages/LearningJourney';
import PeerProfile from './pages/PeerProfile';

function Home() {
  const navigate = useNavigate();
  return (
    <main className="home">
      <section className="hero-section">
        <div className="hero-content">
          <p className="hero-label">SKILL EXCHANGE PLATFORM</p>
          <h1>Exchange Skills.<br /><span>Grow Together.</span></h1>
          <p className="hero-text">Find students who can teach what you want to learn — and learn from you in return.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => navigate('/register')}>Create account</button>
            <button className="secondary-button" onClick={() => navigate('/explore')}>Explore skills</button>
          </div>
          <div className="hero-stats"><div><strong>Learn</strong><span>new skills</span></div><div><strong>Teach</strong><span>what you know</span></div><div><strong>Connect</strong><span>with students</span></div></div>
        </div>
        <div className="hero-visual"><div className="match-card"><div className="match-header"><span>Skill Match</span><span className="match-status">● Ready</span></div><div className="person-card"><div className="avatar">S</div><div className="person-info"><h3>SkillSwap</h3><p>Learn from peers</p></div></div><div className="skill-section"><div className="skill-column"><span>Teach</span><div className="skill-tag">Python</div><div className="skill-tag">React</div></div><div className="exchange-icon">⇄</div><div className="skill-column"><span>Learn</span><div className="skill-tag">UI/UX</div><div className="skill-tag">Figma</div></div></div><button className="match-button" onClick={() => navigate('/register')}>Get started</button></div></div>
      </section>
      <section id="how-it-works" className="how-section"><div className="section-heading"><p className="section-label">HOW IT WORKS</p><h2>One profile. Real skill exchange.</h2><p>Register, choose your skills, find a compatible learner and start chatting or calling.</p></div><div className="steps"><div className="step-card"><div className="step-number">01</div><h3>Create your profile</h3><p>Add your college, department and interests.</p></div><div className="step-card"><div className="step-number">02</div><h3>Select skills</h3><p>Choose what you can teach and what you want to learn.</p></div><div className="step-card"><div className="step-number">03</div><h3>Exchange knowledge</h3><p>Match, message and use voice/video calls.</p></div></div></section>
    </main>
  );
}

function App() {
  const location = useLocation();
  const publicPath = ['/', '/login', '/register', '/explore'].includes(location.pathname);
  return <>
    {publicPath && <Navbar />}
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/explore" element={<Explore />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/skill-setup" element={<SkillSetup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<PeerProfile />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/voice-call" element={<Call />} />
        <Route path="/video-call" element={<Call />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/learning" element={<LearningJourney />} />
      </Route>
    </Routes>
  </>;
}
export default App;
