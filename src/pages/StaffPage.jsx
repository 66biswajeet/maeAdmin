import { useState, useEffect, useCallback } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  X,
  Mail,
  Calendar,
  Shield,
  UserCheck,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Hash,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

/* ─── API helper ──────────────────────────────────────────────── */
const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }
  return res.json();
}

/* ─── Helpers ─────────────────────────────────────────────────── */
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const AVATAR_PALETTES = [
  ["#0f2d52", "#3b82f6"],
  ["#0a2e1e", "#10b981"],
  ["#2d0a52", "#a855f7"],
  ["#52220a", "#f97316"],
  ["#0f0f3d", "#6366f1"],
];

/* ─── Avatar ──────────────────────────────────────────────────── */
function Avatar({ name, size = 40 }) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "??";
  const [bg, accent] =
    AVATAR_PALETTES[(name?.charCodeAt(0) || 0) % AVATAR_PALETTES.length];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${bg}, ${accent})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.35,
        flexShrink: 0,
        letterSpacing: 0.5,
        boxShadow: `0 0 0 2.5px ${accent}44`,
      }}
    >
      {initials}
    </div>
  );
}

/* ─── Detail row inside drawer ────────────────────────────────── */
function DetailRow({ icon: Icon, label, value }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "13px 0",
        borderBottom: "1px solid #f3f4f6",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: "#f0f4ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        <Icon size={15} color="#3b5bdb" strokeWidth={2} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: 11,
            color: "#9ca3af",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 3,
          }}
        >
          {label}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: "#111827",
            fontWeight: 500,
            wordBreak: "break-all",
          }}
        >
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

/* ─── Admin Detail Drawer ─────────────────────────────────────── */
function AdminDrawer({ admin, onClose }) {
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!admin) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(3px)",
          zIndex: 40,
          animation: "fadeIn 0.2s ease",
        }}
      />

      {/* Slide-in panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(440px, 100vw)",
          background: "#fff",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 48px rgba(0,0,0,0.14)",
          animation: "slideIn 0.28s cubic-bezier(0.16,1,0.3,1)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Drawer header */}
        <div
          style={{
            padding: "22px 24px 18px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#fafafa",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 700,
                color: "#10b981",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 4,
              }}
            >
              Admin Profile
            </p>
            <h2
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 800,
                color: "#111",
              }}
            >
              Staff Details
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#6b7280",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f3f4f6";
              e.currentTarget.style.color = "#111";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.color = "#6b7280";
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Hero section */}
        <div
          style={{
            padding: "28px 24px 22px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            background: "linear-gradient(160deg, #f0fdf4 0%, #fff 60%)",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Avatar name={admin.name} size={76} />
          <div style={{ textAlign: "center" }}>
            <h3
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 800,
                color: "#111",
              }}
            >
              {admin.name}
            </h3>
            <p style={{ margin: "5px 0 0", color: "#6b7280", fontSize: 13 }}>
              {admin.email}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: "#eff6ff",
                color: "#1d4ed8",
                borderRadius: 999,
                padding: "4px 12px",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <Shield size={11} />
              {admin.role?.charAt(0).toUpperCase() + admin.role?.slice(1)}
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: "#d1fae5",
                color: "#065f46",
                borderRadius: 999,
                padding: "4px 12px",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <CheckCircle size={11} />
              Approved
            </span>
          </div>
        </div>

        {/* Detail rows — scrollable */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 24px 24px" }}>
          <DetailRow icon={Hash} label="Admin ID" value={admin._id} />
          <DetailRow icon={User} label="Full Name" value={admin.name} />
          <DetailRow icon={Mail} label="Email Address" value={admin.email} />
          <DetailRow
            icon={Shield}
            label="Role"
            value={admin.role?.charAt(0).toUpperCase() + admin.role?.slice(1)}
          />
          <DetailRow
            icon={Calendar}
            label="Registered On"
            value={fmtDateTime(admin.createdAt)}
          />
          <DetailRow
            icon={UserCheck}
            label="Approved On"
            value={fmtDateTime(admin.approvedAt)}
          />
          {admin.approvedBy && (
            <DetailRow
              icon={User}
              label="Approved By"
              value={admin.approvedBy?.name || admin.approvedBy}
            />
          )}
          {admin.avatar && (
            <div style={{ paddingTop: 16 }}>
              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Avatar
              </p>
              <img
                src={admin.avatar}
                alt={admin.name}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #e5e7eb",
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        {/* Drawer footer */}
        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid #f0f0f0",
            background: "#fafafa",
          }}
        >
          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 9,
              border: "1px solid #e5e7eb",
              background: "#fff",
              color: "#374151",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
            }}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   Main StaffPage — Approved staff only
════════════════════════════════════════════════════════════════ */
export default function StaffPage() {
  const [admins, setAdmins] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const LIMIT = 10;

  const fetchAdmins = useCallback(async (pg) => {
    setLoading(true);
    try {
      const data = await apiFetch(
        `/auth/requests?status=approved&page=${pg}&limit=${LIMIT}`,
      );
      setAdmins(data.admins || []);
      setTotal(data.total || 0);
      setTotalPages(data.pages || 1);
    } catch (err) {
      toast.error(err.message || "Failed to load staff");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins(1);
  }, [fetchAdmins]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchAdmins(newPage);
  };

  const filtered = admins.filter((a) => {
    const q = search.toLowerCase();
    return (
      !q ||
      a.name?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        color: "#111827",
        padding: "32px 28px",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideIn { from { transform:translateX(100%) } to { transform:translateX(0) } }
        .view-btn:hover {
          background: #eff6ff !important;
          border-color: #93c5fd !important;
          color: #1d4ed8 !important;
        }
        .staff-row:hover td { background: #f8faff; }
      `}</style>

      {/* ── Page header ── */}
      <div
        style={{
          marginBottom: 28,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 6,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                background: "linear-gradient(135deg, #0a2e1e, #10b981)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={19} color="#fff" />
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: "-0.5px",
              }}
            >
              Staff Directory
            </h1>
          </div>
          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: 14,
              paddingLeft: 48,
            }}
          >
            All approved admin accounts &mdash;{" "}
            <strong style={{ color: "#374151" }}>{total}</strong> member
            {total !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          onClick={() => fetchAdmins(page)}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "9px 16px",
            borderRadius: 9,
            border: "1px solid #e5e7eb",
            background: "#fff",
            color: "#374151",
            fontWeight: 600,
            fontSize: 13,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            fontFamily: "inherit",
          }}
        >
          <RefreshCw
            size={14}
            style={{ animation: loading ? "spin 1s linear infinite" : "none" }}
          />
          Refresh
        </button>
      </div>

      {/* ── Summary strip ── */}
      <div
        style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}
      >
        {[
          {
            Icon: UserCheck,
            label: "Total Approved",
            value: total,
            color: "#10b981",
          },
          {
            Icon: Clock,
            label: "Showing Now",
            value: filtered.length,
            color: "#3b82f6",
          },
        ].map(({ Icon, label, value, color }) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 20px",
              borderRadius: 12,
              background: "#fff",
              border: "1px solid #f0f0f0",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              flex: "1 1 180px",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: color + "18",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={18} color={color} />
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 800,
                  lineHeight: 1.1,
                  color: "#111",
                }}
              >
                {value}
              </p>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: 12,
                  color: "#9ca3af",
                  fontWeight: 500,
                }}
              >
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search bar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "9px 14px",
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          background: "#fff",
          maxWidth: 380,
          marginBottom: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <Search size={16} color="#9ca3af" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: 13.5,
            color: "#111",
            background: "transparent",
            fontFamily: "inherit",
          }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "#9ca3af",
              display: "flex",
              padding: 0,
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Table card ── */}
      <div
        style={{
          border: "1px solid #f0f0f0",
          borderRadius: 14,
          overflow: "hidden",
          background: "#fff",
          boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
          minHeight: 280,
        }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              padding: "70px 20px",
              color: "#9ca3af",
            }}
          >
            <RefreshCw
              size={32}
              color="#d1d5db"
              style={{ animation: "spin 1.2s linear infinite" }}
            />
            <p style={{ margin: 0, fontSize: 14 }}>Loading staff…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: "70px 20px",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 18,
                background: "#f9fafb",
                border: "1.5px dashed #d1d5db",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={26} color="#d1d5db" />
            </div>
            <p
              style={{
                margin: 0,
                fontWeight: 700,
                color: "#374151",
                fontSize: 15,
              }}
            >
              {search ? "No results found" : "No approved staff yet"}
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "#9ca3af" }}>
              {search
                ? "Try a different search term"
                : "Approve admins from the Requests tab"}
            </p>
          </div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13.5,
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#fafafa",
                  borderBottom: "1.5px solid #f0f0f0",
                }}
              >
                {[
                  "#",
                  "Admin",
                  "Email",
                  "Role",
                  "Registered",
                  "Approved On",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontWeight: 700,
                      fontSize: 11,
                      color: "#9ca3af",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((admin, idx) => (
                <tr
                  key={admin._id}
                  className="staff-row"
                  style={{
                    borderBottom:
                      idx < filtered.length - 1 ? "1px solid #f5f5f5" : "none",
                  }}
                >
                  {/* # */}
                  <td
                    style={{
                      padding: "13px 16px",
                      color: "#d1d5db",
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  >
                    {(page - 1) * LIMIT + idx + 1}
                  </td>

                  {/* Name + avatar */}
                  <td style={{ padding: "13px 16px" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <Avatar name={admin.name} size={36} />
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontWeight: 700,
                            color: "#111827",
                            fontSize: 13.5,
                          }}
                        >
                          {admin.name}
                        </p>
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: 11,
                            color: "#9ca3af",
                            fontFamily: "monospace",
                          }}
                        >
                          {admin._id?.slice(-8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td style={{ padding: "13px 16px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: "#6b7280",
                      }}
                    >
                      <Mail size={13} color="#d1d5db" />
                      <span style={{ fontSize: 13 }}>{admin.email}</span>
                    </div>
                  </td>

                  {/* Role */}
                  <td style={{ padding: "13px 16px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        background: "#eff6ff",
                        color: "#1d4ed8",
                        borderRadius: 6,
                        padding: "3px 10px",
                        fontSize: 11.5,
                        fontWeight: 700,
                      }}
                    >
                      <Shield size={10} />
                      {admin.role?.charAt(0).toUpperCase() +
                        admin.role?.slice(1)}
                    </span>
                  </td>

                  {/* Registered */}
                  <td style={{ padding: "13px 16px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        color: "#9ca3af",
                        fontSize: 12.5,
                      }}
                    >
                      <Calendar size={12} />
                      {fmtDate(admin.createdAt)}
                    </div>
                  </td>

                  {/* Approved on */}
                  <td style={{ padding: "13px 16px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        background: "#d1fae5",
                        color: "#065f46",
                        borderRadius: 999,
                        padding: "3px 10px",
                        fontSize: 11.5,
                        fontWeight: 700,
                      }}
                    >
                      <CheckCircle size={10} />
                      {fmtDate(admin.approvedAt)}
                    </span>
                  </td>

                  {/* View button */}
                  <td style={{ padding: "13px 16px" }}>
                    <button
                      className="view-btn"
                      onClick={() => setSelected(admin)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 13px",
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        background: "#fff",
                        color: "#374151",
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all 0.15s",
                      }}
                    >
                      <Eye size={13} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && !loading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            marginTop: 20,
          }}
        >
          <button
            onClick={() => handlePageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "7px 14px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#fff",
              fontWeight: 600,
              fontSize: 13,
              cursor: page === 1 ? "not-allowed" : "pointer",
              opacity: page === 1 ? 0.4 : 1,
              color: "#374151",
              fontFamily: "inherit",
            }}
          >
            <ChevronLeft size={15} /> Prev
          </button>
          <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "7px 14px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#fff",
              fontWeight: 600,
              fontSize: 13,
              cursor: page === totalPages ? "not-allowed" : "pointer",
              opacity: page === totalPages ? 0.4 : 1,
              color: "#374151",
              fontFamily: "inherit",
            }}
          >
            Next <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* ── Detail Drawer ── */}
      {selected && (
        <AdminDrawer admin={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
