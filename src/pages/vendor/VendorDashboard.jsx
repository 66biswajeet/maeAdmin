import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  Star,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  IndianRupee,
} from "lucide-react";
import toast from "react-hot-toast";
import { getVendorMe } from "../../services/api";

export default function VendorDashboard() {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [navigate]);

  const loadData = async () => {
    const vendorToken = localStorage.getItem("vendorToken");
    if (!vendorToken) {
      navigate("/vendor/login");
      return;
    }
    setLoading(true);
    try {
      const res = await getVendorMe();
      setVendor(res.data);
      // Update local storage with fresh data too
      localStorage.setItem("vendor", JSON.stringify(res.data));
    } catch (err) {
      toast.error("Session expired or invalid");
      navigate("/vendor/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="spin-wrap">
        <div className="spin" />
      </div>
    );
  }

  if (!vendor) return null;

  const stats = [
    {
      icon: Package,
      label: "Total Products",
      value: vendor.totalProducts ?? 0,
      color: "var(--teal)",
      bg: "rgba(0,201,167,0.08)",
    },
    {
      icon: ShoppingCart,
      label: "Total Orders",
      value: vendor.totalOrders ?? 0,
      color: "var(--navy-border)",
      bg: "rgba(30,59,134,0.08)",
    },
    {
      icon: Star,
      label: "Avg. Rating",
      value: "4.8",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.08)",
    },
    {
      icon: BarChart3,
      label: "Gross Revenue",
      value: `₹${(vendor.grossRevenue ?? 0).toLocaleString("en-IN")}`,
      color: "#8b5cf6",
      bg: "rgba(139,92,246,0.08)",
    },
    {
      icon: TrendingUp,
      label: "Commission",
      value: `₹${(vendor.adminCommission ?? 0).toLocaleString("en-IN")}`,
      color: "#ec4899",
      bg: "rgba(236,72,153,0.08)",
    },
    {
      icon: IndianRupee,
      label: "Net Earnings",
      value: `₹${(vendor.totalRevenue ?? 0).toLocaleString("en-IN")}`,
      color: "#10b981",
      bg: "rgba(16,185,129,0.08)",
    },
  ];

  const recentActivity = [
    {
      icon: CheckCircle,
      text: "Your account has been approved",
      time: "Just now",
      color: "var(--teal)",
    },
    {
      icon: AlertCircle,
      text: "Complete your profile to get discovered",
      time: "2 min ago",
      color: "#f59e0b",
    },
    {
      icon: TrendingUp,
      text: "Add your first product to start selling",
      time: "5 min ago",
      color: "var(--navy-border)",
    },
  ];

  return (
    <div>
      {/* ── Welcome banner ── */}
      <div
        style={{
          background:
            "linear-gradient(135deg, var(--navy-border) 0%, #2d5be3 100%)",
          borderRadius: "var(--radius)",
          padding: "24px 28px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            right: -30,
            top: -30,
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 60,
            bottom: -40,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(0,201,167,0.12)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "1px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.65)",
              margin: "0 0 6px",
            }}
          >
            Vendor Portal
          </p>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              margin: "0 0 6px",
              color: "#fff",
            }}
          >
            Welcome back, {vendor.name}!
          </h2>
          <p
            style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", margin: 0 }}
          >
            {vendor.companyName
              ? `Managing ${vendor.companyName} · Compliance Vendor`
              : "Manage your compliance services and track performance"}
          </p>
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            flexShrink: 0,
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            fontWeight: 700,
            color: "#fff",
            border: "2px solid rgba(255,255,255,0.25)",
          }}
        >
          {vendor.name?.[0]?.toUpperCase() || "V"}
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="sc" style={{ marginBottom: 0 }}>
              <div
                style={{
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    flexShrink: 0,
                    background: s.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} style={{ color: s.color }} />
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      margin: 0,
                      lineHeight: 1,
                    }}
                  >
                    {s.value}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      margin: "4px 0 0",
                    }}
                  >
                    {s.label}
                  </p>
                </div>
              </div>
              <div style={{ height: 3, background: s.bg }}>
                <div
                  style={{
                    height: "100%",
                    width: "40%",
                    background: s.color,
                    borderRadius: 2,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Bottom row: Quick actions + Recent activity ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Quick actions */}
        <div className="sc" style={{ marginBottom: 0 }}>
          <div className="sc-head">
            <h3>
              <TrendingUp size={13} /> Quick Actions
            </h3>
          </div>
          <div
            className="sc-body"
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            {[
              {
                label: "Add New Product",
                sub: "List a compliance service",
                path: "/vendor/products/add",
                color: "var(--teal)",
                bg: "rgba(0,201,167,0.08)",
              },
              {
                label: "View My Orders",
                sub: "Check incoming requests",
                path: "/vendor/orders",
                color: "var(--navy-border)",
                bg: "rgba(30,59,134,0.08)",
              },
              {
                label: "See My Reviews",
                sub: "Read customer feedback",
                path: "/vendor/reviews",
                color: "#f59e0b",
                bg: "rgba(245,158,11,0.08)",
              },
              {
                label: "View Analytics",
                sub: "Track your performance",
                path: "/vendor/analytics",
                color: "#8b5cf6",
                bg: "rgba(139,92,246,0.08)",
              },
            ].map((a) => (
              <div
                key={a.label}
                onClick={() => navigate(a.path)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 8,
                  cursor: "pointer",
                  border: "1px solid var(--border)",
                  background: "var(--off-white)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = a.bg;
                  e.currentTarget.style.borderColor = a.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--off-white)";
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: a.color,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      margin: 0,
                    }}
                  >
                    {a.label}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      margin: 0,
                    }}
                  >
                    {a.sub}
                  </p>
                </div>
                <ChevronRight
                  size={14}
                  style={{ color: "var(--text-muted)" }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="sc" style={{ marginBottom: 0 }}>
          <div className="sc-head">
            <h3>
              <Clock size={13} /> Recent Activity
            </h3>
          </div>
          <div
            className="sc-body"
            style={{ display: "flex", flexDirection: "column", gap: 0 }}
          >
            {recentActivity.map((a, i) => {
              const Icon = a.icon;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom:
                      i < recentActivity.length - 1
                        ? "1px solid var(--border)"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: `${a.color}18`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={14} style={{ color: a.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--text-primary)",
                        margin: "0 0 2px",
                        fontWeight: 500,
                      }}
                    >
                      {a.text}
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        margin: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Clock size={10} /> {a.time}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Coming soon notice */}
            <div
              style={{
                marginTop: 12,
                padding: "12px 14px",
                background: "#f0f4ff",
                border: "1px solid #dce8ff",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--navy-border)",
                lineHeight: 1.5,
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>
                More features are coming soon to your vendor dashboard. Stay
                tuned!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Need ChevronRight for quick actions
function ChevronRight({ size, style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
