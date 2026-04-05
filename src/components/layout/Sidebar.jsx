import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  Tag,
  Sliders,
  Star,
  ShoppingCart,
  UserCheck,
  Settings,
  ChevronRight,
  LogOut,
  User,
  UserCog,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  {
    icon: UserCheck,
    label: "Vendors",
    path: "/vendors",
    children: [
      { label: "All Vendors", path: "/vendors/all" },
      { label: "Vendor Requests", path: "/vendors/requests" },
    ],
  },
  {
    icon: UserCog,
    label: "Staff",
    path: "/staff",
    children: [
      { label: "All Staff", path: "/staff/all" },
      { label: "Staff Requests", path: "/staff/requests" },
    ],
  },
  {
    icon: Tag,
    label: "Catalog",
    path: "/catalog",
    children: [
      { label: "Categories", path: "/catalog/categories" },
      { label: "Products", path: "/catalog/products" },
      { label: "Tags", path: "/catalog/tags" },
      { label: "Attributes", path: "/catalog/attributes" },
    ],
  },
  {
    icon: Package,
    label: "Products",
    path: "/products",
    children: [
      { label: "All Products", path: "/products/all" },
      { label: "Product Requests", path: "/products/requests" },
      { label: "Tags", path: "/products/tags" },
      { label: "Attributes", path: "/products/attributes" },
      { label: "Reviews", path: "/products/reviews" },
    ],
  },
  {
    icon: Users,
    label: "Customers",
    path: "/customers",
    children: [
      { label: "All Customers", path: "/customers/all" },
      { label: "Customer Support", path: "/customers/support" },
    ],
  },
  { icon: ShoppingCart, label: "Orders", path: "/orders" },
  {
    icon: Settings,
    label: "Settings",
    path: "/settings",
    children: [
      { label: "Site Settings", path: "/settings/site" },
      { label: "Meta Settings", path: "/settings/meta" },
      { label: "Profile Settings", path: "/settings/profile" },
    ],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState({
    Products: true,
    Settings: true,
    Catalog: false,
    Vendors: false,
    Staff: false,
  });

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const toggle = (label) =>
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="brand">
          ADMIN <span>PANEL</span>
        </div>
      </div>

      <nav className="sidebar-nav">
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
        <button className="logout-btn">
          <LogOut />
          Logout
        </button>
      </div>
    </aside>
  );
}
