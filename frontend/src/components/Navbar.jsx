import { useEffect, useState } from 'react';
import { Menu, X, ArrowUpRight, Compass, House, Workflow, LogOut, LayoutDashboard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [location.pathname]);

  const signOut = async () => {
    await logout();
    window.location.href = '/';
  };

  const isActive = path => location.pathname === path;

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link className="navbar-brand" to={user ? '/dashboard' : '/'} aria-label="SkillSwap home">
          <span className="navbar-brand-mark"><ArrowUpRight size={17} strokeWidth={2.6} /></span>
          <span className="navbar-brand-word"><b>Skill</b><strong>Swap</strong></span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link className={`nav-link ${isActive('/') ? 'active' : ''}`} to="/"><House size={15}/> Home</Link>
          <Link className={`nav-link ${isActive('/explore') ? 'active' : ''}`} to="/explore"><Compass size={15}/> Explore skills</Link>
          <a className="nav-link" href="/#how-it-works"><Workflow size={15}/> How it works</a>
        </nav>

        <div className="desktop-actions">
          {user ? <>
            <Link className="login-btn" to="/dashboard"><LayoutDashboard size={15}/> Dashboard</Link>
            <button className="signup-btn" onClick={signOut}><LogOut size={15}/> Sign out</button>
          </> : <>
            <Link className="login-btn" to="/login">Log in</Link>
            <Link className="signup-btn" to="/register">Create account <ArrowUpRight size={15}/></Link>
          </>}
        </div>

        <button className={`menu-button ${open ? 'active' : ''}`} onClick={() => setOpen(v => !v)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
          {open ? <X size={21}/> : <Menu size={21}/>} 
        </button>
      </div>

      <div className={`mobile-menu ${open ? 'open' : ''}`}>
        <Link to="/"><House size={17}/> Home</Link>
        <Link to="/explore"><Compass size={17}/> Explore skills</Link>
        <a href="/#how-it-works"><Workflow size={17}/> How it works</a>
        {user ? <>
          <Link to="/dashboard"><LayoutDashboard size={17}/> Dashboard</Link>
          <button onClick={signOut}><LogOut size={17}/> Sign out</button>
        </> : <>
          <Link to="/login">Log in</Link>
          <Link className="mobile-primary" to="/register">Create account <ArrowUpRight size={16}/></Link>
        </>}
      </div>
    </header>
  );
}
