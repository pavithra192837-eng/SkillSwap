import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import AppShell from './components/AppShell';
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
import Home from './pages/Home';

export default function App() {
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
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<PeerProfile />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/learning" element={<LearningJourney />} />
          <Route path="/skill-setup" element={<SkillSetup />} />
        </Route>
        <Route path="/voice-call" element={<Call />} />
        <Route path="/video-call" element={<Call />} />
      </Route>
    </Routes>
  </>;
}
