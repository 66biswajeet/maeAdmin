import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Star,
  ChevronRight,
  LogOut,
  BarChart3,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

// Only the tabs a vendor is allowed to see
const navItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/vendor/dashboard",
  },
  {
    icon: User,
    label: "My Profile",
    path: "/vendor/profile",
  },
  {
    icon: Package,
    label: "My Products",
    path: "/vendor/products",
    children: [
      { label: "All Products", path: "/vendor/products/all" },
      { label: "Add Product", path: "/vendor/products/add" },
    ],
  },
  {
    icon: ShoppingCart,
    label: "My Orders",
    path: "/vendor/orders",
  },
  {
    icon: Star,
    label: "Reviews",
    path: "/vendor/reviews",
  },
  {
    icon: BarChart3,
    label: "Analytics",
    path: "/vendor/analytics",
  },
];

export default function VendorSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState({ "My Products": true });

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const toggle = (label) =>
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));

  const handleLogout = () => {
    localStorage.removeItem("vendorToken");
    localStorage.removeItem("vendor");
    toast.success("Logged out successfully");
    navigate("/vendor/login");
  };

  // Read vendor from localStorage to show name/initial
  let vendor = null;
  try {
    vendor = JSON.parse(localStorage.getItem("vendor"));
  } catch {}

  return (
    <aside className="sidebar">
      {/* Logo — same as admin */}
      <div className="sidebar-logo">
        <div className="brand">
          VENDOR <span>PANEL</span>
        </div>
      </div>

      {/* Vendor mini-profile strip */}
      <div
        style={{
          padding: "12px 18px",
          borderBottom: "1px solid #dce8ff",
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "rgba(30,59,134,0.04)",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1e3b86, #2d5be3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {vendor?.name?.[0]?.toUpperCase() || "V"}
        </div>
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#1e3b86",
              margin: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {vendor?.name || "Vendor"}
          </p>
          <p style={{ fontSize: 10, color: "#8fa0b5", margin: 0 }}>
            Vendor Account
          </p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-lbl">Main Menu</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = item.children?.length > 0;
          const active = isActive(item.path);
          const open = expanded[item.label];

          return (
            <div key={item.label}>
              <div
                className={`nav-item ${active && !hasChildren ? "active" : ""}`}
                onClick={() => {
                  if (hasChildren) toggle(item.label);
                  else navigate(item.path);
                }}
              >
                <Icon />
                {item.label}
                {hasChildren && (
                  <ChevronRight className={`nav-chev ${open ? "open" : ""}`} />
                )}
              </div>

              {hasChildren && open && (
                <div className="sub-nav">
                  {item.children.map((child) => (
                    <div
                      key={child.path}
                      className={`nav-item ${location.pathname === child.path ? "active" : ""}`}
                      onClick={() => navigate(child.path)}
                    >
                      {child.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-foot">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut />
          Logout
        </button>
      </div>
    </aside>
  );
}
