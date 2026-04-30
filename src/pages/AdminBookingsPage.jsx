import { useEffect, useState, useMemo, useCallback } from "react";
import { getBookings, updateBookingStatus } from "../services/api";
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
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./AdminBookingsPage.css";

/* ── Helpers ──────────────────────────────────────────────────── */
const fmt = (n) => {
  if (n === null || n === undefined) return "—";
  try {
    return new Intl.NumberFormat("en-IN").format(Number(n));
  } catch {
    return String(n);
  }
};

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const fmtTime = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const STATUS_OPTS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const PAGE_SIZE = 15;

/* ── Status badge ─────────────────────────────────────────────── */
function StatusBadge({ status }) {
  if (!status) return <span className="bk-status pending">—</span>;
  return (
    <span className={`bk-status ${status.toLowerCase()}`}>
      <span className="bk-status__dot" />
      {status.replace("_", " ")}
    </span>
  );
}

/* ── Stat card ────────────────────────────────────────────────── */
function StatCard({ icon, value, label, color }) {
  return (
    <div className="bk-stat-card">
      <div className={`bk-stat-icon ${color}`}>{icon}</div>
      <div className="bk-stat-info">
        <div className="bk-stat-value">{value}</div>
        <div className="bk-stat-label">{label}</div>
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────── */
export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(null); // id of row being updated
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  /* ── Fetch ──────────────────────────────────────────────────── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBookings({ page: 1, limit: 200 });
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error(err);
      showToast("Failed to load bookings", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ── Toast helper ───────────────────────────────────────────── */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Status change ──────────────────────────────────────────── */
  const changeStatus = async (id, status) => {
    setUpdating(id);
    try {
      await updateBookingStatus(id, { status });
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status } : b))
      );
      showToast(`Booking marked as ${status}`, "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to update status", "error");
    } finally {
      setUpdating(null);
    }
  };

  /* ── Derived: filtered + searched ──────────────────────────── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((b) => {
      const matchStatus =
        !statusFilter || b.status?.toLowerCase() === statusFilter;
      if (!matchStatus) return false;
      if (!q) return true;
      const vendorName = (
        b.vendor?.companyName ||
        b.vendor?.name ||
        ""
      ).toLowerCase();
      const customerName = (
        b.customer?.name ||
        b.customer?.email ||
        ""
      ).toLowerCase();
      const id = (b._id || "").toLowerCase();
      return (
        vendorName.includes(q) || customerName.includes(q) || id.includes(q)
      );
    });
  }, [bookings, search, statusFilter]);

  /* ── Pagination ─────────────────────────────────────────────── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  /* ── Stats ──────────────────────────────────────────────────── */
  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const completed = bookings.filter((b) => b.status === "completed").length;
    const revenue = bookings.reduce((s, b) => s + (Number(b.total) || 0), 0);
    return { total, pending, completed, revenue };
  }, [bookings]);

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="bk-page">
      {/* Header */}
      <div className="bk-header">
        <div className="bk-header__left">
          <h1>Bookings</h1>
          <p>Manage and track all service bookings</p>
        </div>
      </div>

      {/* Stats */}
      <div className="bk-stats">
        <StatCard
          icon={<Package size={18} />}
          value={stats.total}
          label="Total Bookings"
          color="blue"
        />
        <StatCard
          icon={<Clock size={18} />}
          value={stats.pending}
          label="Pending"
          color="amber"
        />
        <StatCard
          icon={<CheckCircle size={18} />}
          value={stats.completed}
          label="Completed"
          color="green"
        />
        <StatCard
          icon={<IndianRupee size={18} />}
          value={`₹${fmt(stats.revenue)}`}
          label="Total Revenue"
          color="teal"
        />
      </div>

      {/* Toolbar */}
      <div className="bk-toolbar">
        <div className="bk-search">
          <Search />
          <input
            id="bk-search-input"
            type="text"
            placeholder="Search vendor, customer, booking ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          id="bk-status-filter"
          className="bk-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <button
          id="bk-refresh-btn"
          className="bk-refresh-btn"
          onClick={load}
          disabled={loading}
        >
          <RefreshCw
            size={14}
            style={{
              animation: loading ? "bkSpin 0.8s linear infinite" : "none",
            }}
          />
          Refresh
        </button>

        <div className="bk-results-info">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table card */}
      <div className="bk-table-card">
        {loading ? (
          <div className="bk-loading">
            <div className="bk-spinner" />
            Loading bookings…
          </div>
        ) : paginated.length === 0 ? (
          <div className="bk-empty">
            <div className="bk-empty-icon">📭</div>
            <h3>No bookings found</h3>
            <p>
              {search || statusFilter
                ? "Try adjusting your search or filter."
                : "Bookings will appear here once created."}
            </p>
          </div>
        ) : (
          <>
            <div className="bk-table-wrap">
              <table className="bk-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Vendor</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((b) => {
                    const isUpdating = updating === b._id;
                    const canAccept =
                      b.status === "pending" || b.status === "in_progress";
                    const canComplete =
                      b.status === "accepted" || b.status === "in_progress";
                    const canCancel =
                      b.status !== "cancelled" && b.status !== "completed";

                    return (
                      <tr key={b._id}>
                        {/* ID */}
                        <td>
                          <span className="bk-cell-id">{b._id}</span>
                        </td>

                        {/* Vendor */}
                        <td>
                          <span className="bk-cell-primary">
                            {b.vendor?.companyName || b.vendor?.name || "—"}
                          </span>
                          {b.vendor?.email && (
                            <span className="bk-cell-secondary">
                              {b.vendor.email}
                            </span>
                          )}
                        </td>

                        {/* Customer */}
                        <td>
                          <span className="bk-cell-primary">
                            {b.customer?.name || b.customer?.email || "—"}
                          </span>
                          {b.customer?.name && b.customer?.email && (
                            <span className="bk-cell-secondary">
                              {b.customer.email}
                            </span>
                          )}
                        </td>

                        {/* Items */}
                        <td>
                          <span className="bk-items-badge">
                            <Package size={11} />
                            {(b.items || []).length}
                          </span>
                        </td>

                        {/* Total */}
                        <td>
                          <span className="bk-total">
                            <span className="bk-total-currency">₹</span>
                            {fmt(b.total)}
                          </span>
                        </td>

                        {/* Status */}
                        <td>
                          <StatusBadge status={b.status} />
                        </td>

                        {/* Date */}
                        <td>
                          <span className="bk-date">{fmtDate(b.createdAt)}</span>
                          <span className="bk-date-time">
                            {fmtTime(b.createdAt)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td>
                          <div className="bk-actions">
                            {canAccept && (
                              <button
                                id={`bk-accept-${b._id}`}
                                className="bk-btn bk-btn--accept"
                                disabled={isUpdating}
                                onClick={() => changeStatus(b._id, "accepted")}
                                title="Accept"
                              >
                                <CheckCircle size={12} />
                                Accept
                              </button>
                            )}
                            {canComplete && (
                              <button
                                id={`bk-complete-${b._id}`}
                                className="bk-btn bk-btn--complete"
                                disabled={isUpdating}
                                onClick={() =>
                                  changeStatus(b._id, "completed")
                                }
                                title="Mark Completed"
                              >
                                <TrendingUp size={12} />
                                Complete
                              </button>
                            )}
                            {canCancel && (
                              <button
                                id={`bk-cancel-${b._id}`}
                                className="bk-btn bk-btn--cancel"
                                disabled={isUpdating}
                                onClick={() => changeStatus(b._id, "cancelled")}
                                title="Cancel"
                              >
                                <XCircle size={12} />
                              </button>
                            )}
                            <button
                              id={`bk-view-${b._id}`}
                              className="bk-btn bk-btn--view"
                              onClick={() => navigate(`/bookings/${b._id}`)}
                              title="View details"
                            >
                              <Eye size={12} />
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bk-pagination">
                <div className="bk-pagination-info">
                  Showing {(safePage - 1) * PAGE_SIZE + 1}–
                  {Math.min(safePage * PAGE_SIZE, filtered.length)} of{" "}
                  {filtered.length}
                </div>
                <div className="bk-pagination-btns">
                  <button
                    className="bk-page-btn"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={safePage === 1}
                  >
                    <ChevronLeft size={13} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - safePage) <= 1
                    )
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) {
                        acc.push("...");
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === "..." ? (
                        <span
                          key={`ellipsis-${i}`}
                          style={{
                            padding: "6px 4px",
                            color: "#8fa0b5",
                            fontSize: 12,
                          }}
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          className={`bk-page-btn ${p === safePage ? "active" : ""}`}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </button>
                      )
                    )}
                  <button
                    className="bk-page-btn"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={safePage === totalPages}
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`bk-toast ${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}
