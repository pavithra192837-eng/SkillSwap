import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, UserPlus, MessageCircle, Calendar, Star, Users, Video, ArrowLeft, MoreHorizontal, Trash2, Check, RotateCcw } from 'lucide-react';
import api, { getErrorMessage } from '../api';
import './Notifications.css';

const typeName = value => String(value || '').toLowerCase();
const timeText = value => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try { setError(''); const response = await api.get('/notifications'); setNotifications(response.data.notifications || []); }
    catch (e) { setError(getErrorMessage(e, 'Could not load notifications.')); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); const timer = setInterval(load, 10000); return () => clearInterval(timer); }, []);

  const unread = notifications.filter(n => !n.is_read).length;
  const visible = useMemo(() => tab === 'unread' ? notifications.filter(n => !n.is_read) : notifications, [notifications, tab]);

  const icon = type => { const t=typeName(type); if(t.includes('request'))return <UserPlus/>; if(t.includes('message'))return <MessageCircle/>; if(t.includes('session'))return <Calendar/>; if(t.includes('rating')||t.includes('completed'))return <Star/>; if(t.includes('call'))return <Video/>; if(t.includes('match'))return <Users/>; return <Bell/>; };

  const markRead = async id => {
    const old = notifications;
    setNotifications(c => c.map(n => n.id === id ? {...n,is_read:true} : n)); setMenu(null);
    try { await api.put(`/notifications/${id}/read`); } catch(e) { setNotifications(old); setError(getErrorMessage(e,'Could not mark notification as read.')); }
  };
  const markAll = async () => {
    if (!unread || busy) return;
    const old = notifications; setBusy(true); setNotifications(c=>c.map(n=>({...n,is_read:true})));
    try { await api.put('/notifications/read-all'); } catch(e) { setNotifications(old); setError(getErrorMessage(e,'Could not mark notifications as read.')); } finally { setBusy(false); }
  };
  const remove = async id => {
    const old=notifications; setNotifications(c=>c.filter(n=>n.id!==id)); setMenu(null);
    try { await api.delete(`/notifications/${id}`); } catch(e) { setNotifications(old); setError(getErrorMessage(e,'Could not remove notification.')); }
  };
  const clearAll = async () => {
    if (!notifications.length || busy) return;
    if (!window.confirm('Clear all notifications? This cannot be undone.')) return;
    const old=notifications; setBusy(true); setNotifications([]);
    try { await api.delete('/notifications'); } catch(e) { setNotifications(old); setError(getErrorMessage(e,'Could not clear notifications.')); } finally { setBusy(false); }
  };

  return <main className="notifications-page">
    <header className="notifications-topbar">
      <button className="notifications-back" onClick={()=>navigate('/dashboard')} aria-label="Back"><ArrowLeft size={19}/></button>
      <div className="notifications-title-area"><div className="notifications-title-icon"><Bell size={21}/></div><div><h1>Notifications</h1><p>Updates about your SkillSwap activity</p></div></div>
      <button className="notification-refresh" onClick={load} disabled={loading}><RotateCcw size={16}/></button>
    </header>
    <section className="notifications-container">
      <div className="notifications-toolbar"><div className="notification-tabs"><button className={tab==='all'?'active':''} onClick={()=>setTab('all')}>All <span>{notifications.length}</span></button><button className={tab==='unread'?'active':''} onClick={()=>setTab('unread')}>Unread <span>{unread}</span></button></div><div className="notification-actions"><button onClick={markAll} disabled={!unread||busy}><CheckCheck size={16}/> Mark all read</button><button onClick={clearAll} disabled={!notifications.length||busy}><Trash2 size={16}/> Clear all</button></div></div>
      {error && <div className="notification-error">{error}</div>}
      <div className="notifications-list">
        {loading ? <div className="empty-notifications"><Bell size={28}/><h2>Loading…</h2></div> : !visible.length ? <div className="empty-notifications"><div className="empty-icon"><CheckCheck size={27}/></div><h2>{tab==='unread'?'You’re all caught up':'No notifications yet'}</h2><p>{tab==='unread'?'Nothing needs your attention right now.':'New requests, messages and session activity will appear here.'}</p></div> : visible.map(n=><article key={n.id} className={`notification-item ${!n.is_read?'notification-unread':''}`} onClick={()=>!n.is_read&&markRead(n.id)}><div className={`notification-icon notification-${typeName(n.type)}`}>{icon(n.type)}</div><div className="notification-content"><div className="notification-heading"><h3>{n.title}</h3><time>{timeText(n.created_at)}</time></div><p>{n.message || 'SkillSwap activity update'}</p></div>{!n.is_read&&<span className="unread-dot"/>}<div className="notification-menu-wrap"><button className="notification-more" onClick={e=>{e.stopPropagation();setMenu(menu===n.id?null:n.id)}} aria-label="Notification options"><MoreHorizontal size={18}/></button>{menu===n.id&&<div className="notification-menu"><button onClick={e=>{e.stopPropagation();n.is_read?remove(n.id):markRead(n.id)}}>{n.is_read?<><Trash2/> Remove</>:<><Check/> Mark as read</>}</button>{n.is_read&&<button onClick={e=>{e.stopPropagation();remove(n.id)}}><Trash2/> Delete</button>}</div>}</div></article>)}
      </div>
    </section>
  </main>;
}
