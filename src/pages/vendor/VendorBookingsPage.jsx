import { useEffect, useState, useMemo, useCallback } from "react";
import { getVendorBookings, updateBookingStatus } from "../../services/api";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Package,
  Clock,
  TrendingUp,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  MapPin,
  User,
  Calendar,
  PhoneCall,
} from "lucide-react";
import "./VendorBookingsPage.css";

/* ── helpers ──────────────────────────────────────────────── */
const fmt = (n) => {
  if (n == null) return "—";
  try { return "₹" + new Intl.NumberFormat("en-IN").format(Number(n)); }
  catch { return String(n); }
};
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "";

const STATUS_OPTS = [
  { value: "",            label: "All Statuses" },
  { value: "pending",     label: "Pending" },
  { value: "accepted",    label: "Accepted" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed",   label: "Completed" },
  { value: "cancelled",   label: "Cancelled" },
];

const PAGE_SIZE = 12;

/* ── Status badge ─────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    pending:     "vb-status--pending",
    accepted:    "vb-status--accepted",
    in_progress: "vb-status--progress",
    completed:   "vb-status--completed",
    cancelled:   "vb-status--cancelled",
  };
  return (
    <span className={`vb-status ${map[status] || "vb-status--pending"}`}>
      <span className="vb-status__dot" />
      {(status || "pending").replace(/_/g, " ")}
    </span>
  );
}

/* ── Stat card ────────────────────────────────────────────── */
function StatCard({ icon, value, label, color }) {
  return (
    <div className="vb-stat-card">
      <div className={`vb-stat-icon ${color}`}>{icon}</div>
      <div>
        <div className="vb-stat-value">{value}</div>
        <div className="vb-stat-label">{label}</div>
      </div>
    </div>
  );
}

/* ── City pills extracted from items' filterSnapshot ─────── */
function CityPills({ items }) {
  const cities = new Set();
  (items || []).forEach((it) => {
    const fs = it.filterSnapshot || {};
    const arr = fs.cities || fs.citiesSelected || fs.cityList || [];
    arr.forEach((c) => {
      const name = typeof c === "string" ? c : (c.name || c.city);
      if (name) cities.add(name);
    });
  });
  const list = [...cities];
  if (!list.length) return null;
  return (
    <div className="vb-city-pills">
      <MapPin size={10} />
      {list.slice(0, 3).map((c) => (
        <span key={c} className="vb-city-pill">{c}</span>
      ))}
      {list.length > 3 && (
        <span className="vb-city-pill vb-city-pill--more">+{list.length - 3}</span>
      )}
    </div>
  );
}

/* ── Main component ───────────────────────────────────────── */
export default function VendorBookingsPage() {
  const [bookings,     setBookings]     = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [updating,     setUpdating]     = useState(null);
  const [toast,        setToast]        = useState(null);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page,         setPage]         = useState(1);
  const navigate = useNavigate();

  /* ── fetch ── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getVendorBookings();
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error("[VendorOrders] fetch error:", err);
      showToast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── toast ── */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── status update ── */
  const changeStatus = async (id, status) => {
    setUpdating(id);
    try {
      await updateBookingStatus(id, { status });
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status } : b));
      showToast(`Marked as ${status.replace(/_/g, " ")}`);
    } catch (err) {
      console.error(err);
      showToast(err?.response?.data?.message || "Failed to update status", "error");
    } finally {
      setUpdating(null);
    }
  };

  /* ── filter ── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((b) => {
      if (statusFilter && b.status !== statusFilter) return false;
      if (!q) return true;
      const customer = (b.customer?.name || b.customer?.email || "").toLowerCase();
      const id       = (b._id || "").toLowerCase();
      const product  = (b.items || [])
        .map((it) => (it.productSnapshot?.title || "").toLowerCase()).join(" ");
      return customer.includes(q) || id.includes(q) || product.includes(q);
    });
  }, [bookings, search, statusFilter]);

  /* ── pagination ── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  /* ── stats ── */
  const stats = useMemo(() => ({
    total:     bookings.length,
    pending:   bookings.filter((b) => b.status === "pending").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    revenue:   bookings.reduce((s, b) => s + (Number(b.total) || 0), 0),
  }), [bookings]);

  /* ── render ── */
  return (
    <div className="vb-page">

      {/* ── Header ── */}
      <div className="vb-header">
        <div>
          <h1 className="vb-header__title">My Orders</h1>
          <p className="vb-header__sub">
            All bookings from clients that are assigned to your account
          </p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="vb-stats">
        <StatCard icon={<Package size={18}/>}    value={stats.total}        label="Total Orders" color="blue"  />
        <StatCard icon={<Clock size={18}/>}       value={stats.pending}      label="Pending"      color="amber" />
        <StatCard icon={<CheckCircle size={18}/>} value={stats.completed}    label="Completed"    color="green" />
        <StatCard icon={<IndianRupee size={18}/>} value={fmt(stats.revenue)} label="Revenue"      color="teal"  />
      </div>

      {/* ── Toolbar ── */}
      <div className="vb-toolbar">
        <div className="vb-search">
          <Search size={14} />
          <input
            id="vb-search"
            type="text"
            placeholder="Search by customer, product, or booking ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          id="vb-status-filter"
          className="vb-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button className="vb-refresh-btn" onClick={load} disabled={loading} id="vb-refresh">
          <RefreshCw size={14} style={{ animation: loading ? "vbSpin 0.8s linear infinite" : "none" }} />
          Refresh
        </button>
        <span className="vb-result-count">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="vb-loading">
          <div className="vb-spinner" />
          Loading your orders…
        </div>
      ) : paginated.length === 0 ? (
        <div className="vb-empty">
          <div className="vb-empty-icon">📦</div>
          <h3>No orders found</h3>
          <p>
            {search || statusFilter
              ? "Try adjusting your search or filter."
              : "Orders placed by clients for your services will appear here."}
          </p>
        </div>
      ) : (
        <>
          <div className="vb-cards">
            {paginated.map((b) => {
              const isUpdating  = updating === b._id;
              const canAccept   = b.status === "pending";
              const canProgress = b.status === "accepted";
              const canComplete = b.status === "accepted" || b.status === "in_progress";
              const canCancel   = b.status !== "cancelled" && b.status !== "completed";

              const customerName  = b.customer?.name  || "—";
              const customerEmail = b.customer?.email || "";
              const customerPhone = b.customer?.phone || "";
              const itemTitles    = (b.items || []).map(
                (it) => it.productSnapshot?.title || it.title || "Service"
              ).filter(Boolean);

              return (
                <div key={b._id} className="vb-card">

                  {/* Card header */}
                  <div className="vb-card__header">
                    <div className="vb-card__id">
                      BK-{b._id.slice(-8).toUpperCase()}
                    </div>
                    <StatusBadge status={b.status} />
                  </div>

                  {/* Card body */}
                  <div className="vb-card__body">

                    {/* Customer info */}
                    <div className="vb-card__row">
                      <User size={13} className="vb-card__row-icon" />
                      <div>
                        <div className="vb-card__customer-name">{customerName}</div>
                        {customerEmail && (
                          <div className="vb-card__customer-email">{customerEmail}</div>
                        )}
                        {customerPhone && (
                          <div className="vb-card__customer-phone">
                            <PhoneCall size={10} /> {customerPhone}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Services */}
                    <div className="vb-card__row">
                      <Package size={13} className="vb-card__row-icon" />
                      <div className="vb-card__services">
                        {itemTitles.slice(0, 2).map((t, i) => (
                          <span key={i} className="vb-card__service-tag">{t}</span>
                        ))}
                        {itemTitles.length > 2 && (
                          <span className="vb-card__service-tag vb-card__service-tag--more">
                            +{itemTitles.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* City pills */}
                    <CityPills items={b.items} />

                    {/* Date/time */}
                    <div className="vb-card__row vb-card__row--muted">
                      <Calendar size={12} className="vb-card__row-icon" />
                      <span>{fmtDate(b.createdAt)} · {fmtTime(b.createdAt)}</span>
                    </div>
                  </div>

                  {/* Card footer: price + actions */}
                  <div className="vb-card__footer">
                    <div className="vb-card__price">
                      <div className="vb-card__price-total">{fmt(b.total)}</div>
                      <div className="vb-card__price-sub">
                        {fmt(b.subtotal)} + {fmt(b.tax)} GST
                      </div>
                    </div>
                    <div className="vb-card__actions">
                      {canAccept && (
                        <button
                          id={`vb-accept-${b._id}`}
                          className="vb-btn vb-btn--accept"
                          disabled={isUpdating}
                          onClick={() => changeStatus(b._id, "accepted")}
                        >
                          <CheckCircle size={12} /> Accept
                        </button>
                      )}
                      {canProgress && (
                        <button
                          id={`vb-progress-${b._id}`}
                          className="vb-btn vb-btn--progress"
                          disabled={isUpdating}
                          onClick={() => changeStatus(b._id, "in_progress")}
                        >
                          <TrendingUp size={12} /> Start
                        </button>
                      )}
                      {canComplete && (
                        <button
                          id={`vb-complete-${b._id}`}
                          className="vb-btn vb-btn--complete"
                          disabled={isUpdating}
                          onClick={() => changeStatus(b._id, "completed")}
                        >
                          <CheckCircle size={12} /> Complete
                        </button>
                      )}
                      {canCancel && (
                        <button
                          id={`vb-cancel-${b._id}`}
                          className="vb-btn vb-btn--cancel"
                          disabled={isUpdating}
                          onClick={() => changeStatus(b._id, "cancelled")}
                          title="Cancel order"
                        >
                          <XCircle size={12} />
                        </button>
                      )}
                      <button
                        id={`vb-view-${b._id}`}
                        className="vb-btn vb-btn--view"
                        onClick={() => navigate(`/vendor/bookings/${b._id}`)}
                        title="View full details"
                      >
                        <Eye size={12} /> View
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="vb-pagination">
              <span className="vb-pagination__info">
                Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="vb-pagination__btns">
                <button
                  className="vb-page-btn"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={safePage === 1}
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "…"
                      ? <span key={`e${i}`} className="vb-page-ellipsis">…</span>
                      : <button
                          key={p}
                          className={`vb-page-btn ${p === safePage ? "active" : ""}`}
                          onClick={() => setPage(p)}
                        >{p}</button>
                  )}
                <button
                  className="vb-page-btn"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={safePage === totalPages}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className={`vb-toast ${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}
