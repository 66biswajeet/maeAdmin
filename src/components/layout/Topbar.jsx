import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import logo from "../../assets/logo.png";

export default function Topbar() {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const admin = JSON.parse(localStorage.getItem("admin") || "{}");
  const userName = admin.name || "Admin User";
  const userRole = admin.role || "admin";
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    toast.success("Logged out successfully");
    navigate("/login");
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
        <button className="tb-bell">
          <Bell />
        </button>
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
