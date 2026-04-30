import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, LogOut, Trash2, CheckCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";
import logo from "../../assets/logo.png";
import { 
  getNotifications, 
  markNotificationRead, 
  deleteNotification,
  markAllNotificationsRead 
} from "../../services/api";

export default function Topbar() {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);

  const admin = JSON.parse(localStorage.getItem("admin") || "{}");
  const userName = admin.name || "Admin User";
  const userRole = admin.role || "admin";
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  const handleMarkRead = async (e, id) => {
    e.stopPropagation();
    try {
      await markNotificationRead(id);
      fetchNotifications();
    } catch (err) {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      fetchNotifications();
      toast.success("All caught up!");
    } catch (err) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter(n => n._id !== id));
      setUnreadCount(prev => {
        const deleted = notifications.find(n => n._id === id);
        return (deleted && !deleted.isRead) ? prev - 1 : prev;
      });
    } catch (err) {
      toast.error("Failed to delete notification");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <header className="topbar">
      <div className="tb-brand">
        <img src={logo} alt="Make Audit Easy" className="tb-logo" />
      </div>

      <div className="tb-search">
        <Search className="si" />
        <input placeholder="Search vendors, products, or orders..." />
      </div>

      <div className="tb-right">
        <div className="notification-wrapper" ref={notificationRef}>
          <button 
            className={`tb-bell ${unreadCount > 0 ? 'has-unread' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell />
            {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="nd-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead}>Mark all read</button>
                )}
              </div>
              <div className="nd-body">
                {notifications.length === 0 ? (
                  <div className="empty-notifications">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n._id} 
                      className={`notification-item ${n.isRead ? 'read' : 'unread'}`}
                      onClick={() => !n.isRead && handleMarkRead({ stopPropagation: () => {} }, n._id)}
                    >
                      <div className="ni-icon">
                        <div className={`icon-circle ${n.type.toLowerCase()}`}></div>
                      </div>
                      <div className="ni-content">
                        <div className="ni-title">{n.title}</div>
                        <div className="ni-msg">{n.message}</div>
                        <div className="ni-time">
                          <Clock size={10} /> {formatTime(n.createdAt)}
                        </div>
                      </div>
                      <div className="ni-actions">
                        {!n.isRead && (
                          <button 
                            onClick={(e) => handleMarkRead(e, n._id)}
                            title="Mark as read"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                        <button 
                          onClick={(e) => handleDelete(e, n._id)}
                          className="delete"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="tb-user-wrapper">
          <button
            className="tb-user"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="u-info">
              <div className="uname">{userName}</div>
              <div className="urole">
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </div>
            </div>
            <div className="u-avatar">{userInitial}</div>
          </button>

          {showUserMenu && (
            <div className="user-menu">
              <button
                className="user-menu-item logout-btn"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
