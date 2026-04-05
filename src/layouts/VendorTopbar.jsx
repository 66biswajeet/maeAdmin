import { useState, useRef, useEffect } from "react";
import { Search, Bell, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../assets/logo.png";

export default function VendorTopbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  let vendor = null;
  try {
    vendor = JSON.parse(localStorage.getItem("vendor"));
  } catch {}

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("vendorToken");
    localStorage.removeItem("vendor");
    toast.success("Logged out");
    navigate("/vendor/login");
  };

  const initials = vendor?.name
    ? vendor.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "V";

  return (
    <header className="topbar">
      {/* Brand */}
      <div className="tb-brand">
        <img src={logo} alt="Make Audit Easy" className="tb-logo" />
      </div>

      {/* Search */}
      <div className="tb-search">
        <Search className="si" />
        <input placeholder="Search..." />
      </div>

      <div className="tb-right">
        {/* Notifications */}
        <button className="tb-bell">
          <Bell />
        </button>

        {/* User menu */}
        <div className="tb-user-wrapper" ref={menuRef}>
          <button className="tb-user" onClick={() => setMenuOpen((o) => !o)}>
            <div className="u-info">
              <span className="uname">{vendor?.name || "Vendor"}</span>
              <span className="urole">
                {vendor?.companyName || "Vendor Account"}
              </span>
            </div>
            <div className="u-avatar">{initials}</div>
          </button>

          {menuOpen && (
            <div className="user-menu">
              <button
                className="user-menu-item"
                onClick={() => {
                  navigate("/vendor/profile");
                  setMenuOpen(false);
                }}
              >
                <User size={14} /> My Profile
              </button>
              <button
                className="user-menu-item logout-btn"
                onClick={handleLogout}
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
