import { useState, useEffect, useCallback } from "react";
import {
  UserCheck,
  UserX,
  UserMinus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  RefreshCw,
  Mail,
  Calendar,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import "./StaffRequestsTab.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const STATUS_TABS = [
  { key: "requested", label: "Pending", icon: Clock },
  { key: "approved", label: "Approved", icon: CheckCircle },
  { key: "rejected", label: "Rejected", icon: XCircle },
  { key: "suspended", label: "Suspended", icon: AlertCircle },
];

const STATUS_BADGE = {
  requested: { label: "Pending", cls: "badge--pending" },
  approved: { label: "Approved", cls: "badge--approved" },
  rejected: { label: "Rejected", cls: "badge--rejected" },
  suspended: { label: "Suspended", cls: "badge--suspended" },
};

export default function StaffRequestsTab() {
  const [activeStatus, setActiveStatus] = useState("requested");
  const [admins, setAdmins] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Fetch admins with memoization to prevent unnecessary API calls
  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_BASE}/auth/requests`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: activeStatus, page, limit: 10 },
      });
      setAdmins(data.admins);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [activeStatus, page]);

  // Reset page when status changes
  useEffect(() => {
    setPage(1);
  }, [activeStatus]);

  // Fetch admins when status or page changes
  useEffect(() => {
    fetchAdmins();
  }, [activeStatus, page, fetchAdmins]);

  const handleAction = async (id, action) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.patch(
        `${API_BASE}/auth/requests/${id}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(data.message);
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = search.trim()
    ? admins.filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.email.toLowerCase().includes(search.toLowerCase()),
      )
    : admins;

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  return (
    <div className="sr-container">
      {/* ── Header ── */}
      <div className="sr-header">
        <div>
          <h2 className="sr-title">Staff Requests</h2>
          <p className="sr-subtitle">
            Review and manage admin registration requests
          </p>
        </div>
        <button
          className="sr-refresh"
          onClick={fetchAdmins}
          disabled={loading}
          title="Refresh"
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
        </button>
      </div>

      {/* ── Status tabs ── */}
      <div className="sr-tabs">
        {STATUS_TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`sr-tab ${activeStatus === key ? "sr-tab--active" : ""}`}
            onClick={() => setActiveStatus(key)}
          >
            <Icon size={14} />
            {label}
            {key === "requested" &&
              total > 0 &&
              activeStatus !== "requested" && (
                <span className="sr-tab-badge">{total}</span>
              )}
          </button>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="sr-search-wrap">
        <Search size={15} className="sr-search-icon" />
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sr-search"
        />
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="sr-loading">
          <RefreshCw size={22} className="spin" />
          <span>Loading…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="sr-empty">
          <Clock size={36} />
          <p>No {activeStatus} requests found</p>
        </div>
      ) : (
        <div className="sr-table-wrap">
          <table className="sr-table">
            <thead>
              <tr>
                <th>Admin</th>
                <th>Email</th>
                <th>Status</th>
                <th>Requested</th>
                {activeStatus === "approved" && <th>Approved On</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((admin) => {
                const busy = actionLoading === admin._id;
                const badge = STATUS_BADGE[admin.status] || {};
                return (
                  <tr key={admin._id}>
                    {/* Name + avatar initial */}
                    <td>
                      <div className="sr-person">
                        <div className="sr-avatar">
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="sr-name">{admin.name}</div>
                          <div className="sr-role">Admin</div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td>
                      <div className="sr-email">
                        <Mail size={13} />
                        {admin.email}
                      </div>
                    </td>

                    {/* Status badge */}
                    <td>
                      <span className={`sr-badge ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>

                    {/* Requested date */}
                    <td>
                      <div className="sr-date">
                        <Calendar size={13} />
                        {formatDate(admin.createdAt)}
                      </div>
                    </td>

                    {/* Approved on (conditional column) */}
                    {activeStatus === "approved" && (
                      <td>
                        <div className="sr-date">
                          <Calendar size={13} />
                          {formatDate(admin.approvedAt)}
                        </div>
                      </td>
                    )}

                    {/* Actions */}
                    <td>
                      <div className="sr-actions">
                        {admin.status === "requested" && (
                          <>
                            <button
                              className="sr-btn sr-btn--approve"
                              onClick={() => handleAction(admin._id, "approve")}
                              disabled={busy}
                              title="Approve"
                            >
                              <UserCheck size={14} />
                              {busy ? "…" : "Approve"}
                            </button>
                            <button
                              className="sr-btn sr-btn--reject"
                              onClick={() => handleAction(admin._id, "reject")}
                              disabled={busy}
                              title="Reject"
                            >
                              <UserX size={14} />
                              {busy ? "…" : "Reject"}
                            </button>
                          </>
                        )}

                        {admin.status === "approved" && (
                          <button
                            className="sr-btn sr-btn--suspend"
                            onClick={() => handleAction(admin._id, "suspend")}
                            disabled={busy}
                            title="Suspend"
                          >
                            <UserMinus size={14} />
                            {busy ? "…" : "Suspend"}
                          </button>
                        )}

                        {(admin.status === "rejected" ||
                          admin.status === "suspended") && (
                          <button
                            className="sr-btn sr-btn--approve"
                            onClick={() => handleAction(admin._id, "approve")}
                            disabled={busy}
                            title="Re-approve"
                          >
                            <UserCheck size={14} />
                            {busy ? "…" : "Re-approve"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      {pages > 1 && (
        <div className="sr-pagination">
          <button
            className="sr-page-btn"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <span className="sr-page-info">
            Page {page} of {pages}
          </span>
          <button
            className="sr-page-btn"
            disabled={page === pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
