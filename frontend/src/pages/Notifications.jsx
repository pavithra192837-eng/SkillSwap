import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  UserPlus,
  MessageCircle,
  Calendar,
  Star,
  Users,
  Video,
  ArrowLeft,
} from "lucide-react";

import "./Notifications.css";

function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "match",
      title: "New Skill Match",
      description: "You matched with Arun Kumar based on your skills.",
      time: "10 minutes ago",
      unread: true,
    },
    {
      id: 2,
      type: "request",
      title: "New Exchange Request",
      description: "Priya Sharma sent you a skill exchange request.",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      type: "message",
      title: "New Message",
      description: "You have a new message from Rahul Raj.",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 4,
      type: "session",
      title: "Upcoming Session",
      description: "Your Python Basics session starts in 30 minutes.",
      time: "3 hours ago",
      unread: false,
    },
    {
      id: 5,
      type: "accepted",
      title: "Request Accepted",
      description: "Arun Kumar accepted your skill exchange request.",
      time: "Yesterday",
      unread: false,
    },
    {
      id: 6,
      type: "completed",
      title: "Session Completed",
      description: "Your Python Basics session has been completed.",
      time: "Yesterday",
      unread: false,
    },
  ]);

  const getIcon = (type) => {
    switch (type) {
      case "match":
        return <Users size={19} />;

      case "request":
        return <UserPlus size={19} />;

      case "message":
        return <MessageCircle size={19} />;

      case "session":
        return <Calendar size={19} />;

      case "accepted":
        return <CheckCheck size={19} />;

      case "completed":
        return <Star size={19} />;

      case "call":
        return <Video size={19} />;

      default:
        return <Bell size={19} />;
    }
  };

  const markAsRead = (id) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  };

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  return (
    <main className="notifications-page">

      {/* TOP BAR */}
      <header className="notifications-topbar">

        <button
          className="notifications-back"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={19} />
        </button>

        <div className="notifications-title-area">

          <div className="notifications-title-icon">
            <Bell size={20} />
          </div>

          <div>
            <h1>Notifications</h1>

            <p>
              Stay updated with your SkillSwap activity
            </p>
          </div>

        </div>

        <button
          className="mark-all-button"
          onClick={markAllAsRead}
        >
          <CheckCheck size={17} />
          Mark all as read
        </button>

      </header>

      {/* CONTENT */}
      <section className="notifications-container">

        {/* SUMMARY */}
        <div className="notifications-summary">

          <div>
            <span>ALL NOTIFICATIONS</span>
            <strong>{notifications.length}</strong>
          </div>

          <div>
            <span>UNREAD</span>
            <strong>{unreadCount}</strong>
          </div>

        </div>

        {/* NOTIFICATION LIST */}
        <div className="notifications-list">

          {notifications.length === 0 ? (
            <div className="empty-notifications">

              <div className="empty-icon">
                <Bell size={27} />
              </div>

              <h2>No notifications</h2>

              <p>
                You're all caught up. New activity will
                appear here.
              </p>

            </div>
          ) : (
            notifications.map((notification) => (

              <div
                key={notification.id}
                className={`notification-item ${
                  notification.unread
                    ? "notification-unread"
                    : ""
                }`}
                onClick={() =>
                  markAsRead(notification.id)
                }
              >

                {/* ICON */}
                <div
                  className={`notification-icon notification-${notification.type}`}
                >
                  {getIcon(notification.type)}
                </div>

                {/* CONTENT */}
                <div className="notification-content">

                  <div className="notification-heading">

                    <h3>
                      {notification.title}
                    </h3>

                    {notification.unread && (
                      <span className="unread-dot"></span>
                    )}

                  </div>

                  <p>
                    {notification.description}
                  </p>

                  <span className="notification-time">
                    {notification.time}
                  </span>

                </div>

                

              </div>

            ))
          )}

        </div>

      </section>

    </main>
  );
}

export default Notifications;