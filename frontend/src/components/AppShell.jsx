import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Bell, BookOpen, CalendarDays, ChevronRight,
  Compass, Home, LogOut, Menu, MessageCircle, RefreshCw, Settings,
  Sparkles, UserRound, UsersRound
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import RealtimeCallManager from './RealtimeCallManager';
import './AppShell.css';

const navGroups = [
  { label: 'Workspace', items: [
    ['/dashboard', Home, 'Dashboard'],
    ['/matches', UsersRound, 'Matches'],
    ['/requests', ArrowRight, 'Requests'],
    ['/messages', MessageCircle, 'Messages'],
    ['/sessions', CalendarDays, 'Sessions'],
  ]},
  { label: 'Growth', items: [
    ['/skill-setup', Sparkles, 'My skills'],
    ['/learning', BookOpen, 'Learning journey'],
    ['/explore', Compass, 'Explore skills'],
  ]},
];

function initials(name = 'Student') {
  return name.split(/\s+/).filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'S';
}

function SkillSwapMark({ size = 36 }) {
  return (
    <span className="skillswap-mark" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 40 40" width={size * 0.58} height={size * 0.58} fill="none">
        <path d="M28.5 11.5c-2.2-2.3-5.2-3.5-8.7-3.5-4.9 0-8.5 2.5-8.5 6.2 0 3.3 2.7 4.8 8.4 6.1 5.5 1.2 8.4 2.4 8.4 6.2 0 3.7-3.7 5.5-8.4 5.5-3.7 0-6.7-1.1-8.9-3.3" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"/>
        <path d="M11.5 28.5c2.2 2.3 5.2 3.5 8.7 3.5" stroke="#78A8FF" strokeWidth="3.2" strokeLinecap="round"/>
        <path d="M28.5 11.5c-2.2-2.3-5.2-3.5-8.7-3.5" stroke="#58D7CC" strokeWidth="3.2" strokeLinecap="round"/>
      </svg>
    </span>
  );
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [counts, setCounts] = useState({ requests: 0, notifications: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const loadCounts = async () => {
    try {
      const [requests, notifications] = await Promise.all([
        api.get('/requests/incoming'),
        api.get('/notifications'),
      ]);
      const incoming = requests.data.requests || [];
      const notes = notifications.data.notifications || [];
      setCounts({
        requests: incoming.filter(r => r.status === 'PENDING').length,
        notifications: notes.filter(n => !n.is_read).length,
      });
    } catch {
      // Keep navigation usable even when an auxiliary request fails.
    }
  };

  useEffect(() => {
    loadCounts();
    const timer = setInterval(loadCounts, 7000);
    return () => clearInterval(timer);
  }, [user?.id]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const pageTitle = useMemo(() => {
    const match = [...navGroups.flatMap(g => g.items)].find(([path]) =>
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
    if (location.pathname.startsWith('/profile/')) return 'Student profile';
    return match?.[2] || 'SkillSwap';
  }, [location.pathname]);

  const canGoBack = location.pathname !== '/dashboard';

  const goBack = () => {
    // Always give the user a safe escape route, even when the page was opened directly.
    if (window.history.length > 1) navigate(-1);
    else navigate('/dashboard', { replace: true });
  };

  const signOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const refresh = async () => {
    setRefreshing(true);
    await loadCounts();
    setRefreshing(false);
    window.dispatchEvent(new CustomEvent('skillswap:refresh'));
  };

  return (
    <div className="app-shell">
      <RealtimeCallManager />
      {mobileOpen && (
        <button className="shell-overlay" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`shell-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="shell-brand" onClick={() => navigate('/dashboard')}>
          <SkillSwapMark size={38} />
          <div><strong>SkillSwap</strong><span>Peer learning network</span></div>
        </div>

        <button className="shell-profile" onClick={() => navigate('/profile')}>
          <div className="shell-avatar">{initials(user?.name)}</div>
          <div className="shell-profile-copy">
            <strong>{user?.name || 'Student'}</strong>
            <span>{user?.department || 'Student'}</span>
          </div>
          <span className="online-dot" title="Account active" />
        </button>

        <nav className="shell-nav">
          {navGroups.map(group => (
            <div key={group.label} className="shell-nav-group">
              <span className="shell-nav-label">{group.label}</span>
              {group.items.map(([path, Icon, label]) => (
                <NavLink key={path} to={path} className={({ isActive }) => `shell-nav-link ${isActive ? 'active' : ''}`}>
                  <Icon size={18} strokeWidth={1.9} />
                  <span>{label}</span>
                  {label === 'Requests' && counts.requests > 0 && <b className="nav-badge">{counts.requests > 99 ? '99+' : counts.requests}</b>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="shell-bottom">
          <NavLink to="/notifications" className={({ isActive }) => `shell-nav-link ${isActive ? 'active' : ''}`}>
            <Bell size={18} /><span>Notifications</span>
            {counts.notifications > 0 && <b className="nav-badge">{counts.notifications > 99 ? '99+' : counts.notifications}</b>}
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `shell-nav-link ${isActive ? 'active' : ''}`}><UserRound size={18} /><span>Profile</span></NavLink>
          <NavLink to="/settings" className={({ isActive }) => `shell-nav-link ${isActive ? 'active' : ''}`}><Settings size={18} /><span>Settings</span></NavLink>
          <button className="shell-nav-link logout" onClick={signOut}><LogOut size={18} /><span>Sign out</span></button>
        </div>
      </aside>

      <div className="shell-main">
        <header className="shell-topbar">
          <div className="shell-topbar-left">
            <button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
            {canGoBack && (
              <button className="back-nav-button" onClick={goBack} title="Go back">
                <ArrowLeft size={17} />
                <span>Back</span>
              </button>
            )}
            <div><span className="shell-breadcrumb">Workspace</span><h1>{pageTitle}</h1></div>
          </div>
          <div className="shell-topbar-actions">
            <button className="icon-button" onClick={refresh} title="Refresh data"><RefreshCw size={18} className={refreshing ? 'spin' : ''} /></button>
            <button className="icon-button" onClick={() => navigate('/notifications')} title="Notifications"><Bell size={18} />{counts.notifications > 0 && <i />}</button>
            <button className="topbar-user" onClick={() => navigate('/profile')} aria-label="Open your profile">
              <div className="topbar-avatar">{initials(user?.name)}</div>
              <div className="topbar-user-copy"><strong>{user?.name || 'Student'}</strong><span>{user?.department || 'Student'}</span></div>
              <ChevronRight className="topbar-chevron" size={16} />
            </button>
          </div>
        </header>

        <main className="shell-content"><Outlet /></main>
      </div>
    </div>
  );
}
