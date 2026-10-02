import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar(){
 const {user,logout}=useAuth(); const location=useLocation();
 const signOut=async()=>{await logout(); window.location.href='/';};
 return <nav className="navbar"><div className="navbar-container"><Link className="navbar-logo" to={user?'/dashboard':'/'}>Skill<span>Swap</span></Link><div className="desktop-nav"><Link className={`nav-link ${location.pathname==='/'?'active':''}`} to="/">Home</Link><Link className="nav-link" to="/explore">Explore</Link><a className="nav-link" href="/#how-it-works">How It Works</a></div><div className="desktop-actions">{user?<><Link className="login-btn" to="/dashboard">Dashboard</Link><button className="signup-btn" onClick={signOut}>Logout</button></>:<><Link className="login-btn" to="/login">Login</Link><Link className="signup-btn" to="/register">Sign Up</Link></>}</div></div></nav>;
}
