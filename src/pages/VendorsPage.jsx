import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Mail,
  Phone,
  Search,
  RefreshCw,
  UserCheck,
  Users,
  XCircle,
  PauseCircle,
  CheckCircle,
  ShieldCheck,
  Filter,
  Eye,
  Shield,
  Calendar,
  X,
  MapPin,
  FileText,
} from "lucide-react";
import API from "../services/api";
import toast from "react-hot-toast";
import Modal from "../components/ui/Modal";
import "./VendorsPage.css";

const STATUS_CONFIG = {
  approved: { label: "Approved", icon: CheckCircle, cls: "status--approved" },
  requested: { label: "Pending", icon: ShieldCheck, cls: "status--pending" },
  rejected: { label: "Rejected", icon: XCircle, cls: "status--rejected" },
  suspended: {
    label: "Suspended",
    icon: PauseCircle,
    cls: "status--suspended",
  },
  active: { label: "Active", icon: CheckCircle, cls: "status--approved" },
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatus] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const navigate = useNavigate();
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [editingPlan, setEditingPlan] = useState("");
  const [editingCommission, setEditingCommission] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await API.get("/vendors");
      setVendors(response.data.vendors || []);
    } catch (err) {
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  const filtered = vendors.filter((v) => {
    const matchSearch =
      v.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      statusFilter === "all" ||
      v.status === statusFilter ||
      (statusFilter === "active" && v.status === "approved");
    return matchSearch && matchStatus;
  });

  // Stats
  const counts = {
    total: vendors.length,
    approved: vendors.filter(
      (v) => v.status === "approved" || v.status === "active",
    ).length,
    pending: vendors.filter((v) => v.status === "requested").length,
    rejected: vendors.filter((v) => v.status === "rejected").length,
  };

  const initials = (v) =>
    (v.companyName || v.name || "V")
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  const handleViewDetails = (vendor) => {
    navigate(`/vendors/details/${vendor._id}`);
  };

  return (
    <div className="vp-page">
      {/* ── Page header ── */}
      <div className="vp-header">
        <div className="vp-header__text">
          <h1>All Vendors</h1>
          <p>Manage all registered vendors on the platform</p>
        </div>
        <button
          className="vp-refresh"
          onClick={fetchVendors}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? "vp-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="vp-stats">
        {[
          { label: "Total Vendors", value: counts.total, mod: "blue" },
          { label: "Approved", value: counts.approved, mod: "teal" },
          { label: "Pending Review", value: counts.pending, mod: "amber" },
          { label: "Rejected", value: counts.rejected, mod: "red" },
        ].map((s) => (
          <div key={s.label} className={`vp-stat vp-stat--${s.mod}`}>
            <span className="vp-stat__value">{s.value}</span>
            <span className="vp-stat__label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="vp-toolbar">
        <div className="vp-search">
          <Search size={14} className="vp-search__icon" />
          <input
            type="text"
            placeholder="Search by name, company or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="vp-search__clear"
              onClick={() => setSearchTerm("")}
            >
              <XCircle size={14} />
            </button>
          )}
        </div>

        <div className="vp-toolbar__right">
          <div className="vp-filter">
            <Filter size={13} />
            <select
              value={statusFilter}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="active">Active</option>
              <option value="requested">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="vp-view-toggle">
            <button
              className={viewMode === "grid" ? "active" : ""}
              onClick={() => setViewMode("grid")}
              title="Grid view"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="currentColor"
              >
                <rect x="0" y="0" width="6" height="6" rx="1" />
                <rect x="8" y="0" width="6" height="6" rx="1" />
                <rect x="0" y="8" width="6" height="6" rx="1" />
                <rect x="8" y="8" width="6" height="6" rx="1" />
              </svg>
            </button>
            <button
              className={viewMode === "list" ? "active" : ""}
              onClick={() => setViewMode("list")}
              title="List view"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="currentColor"
              >
                <rect x="0" y="0" width="14" height="2.5" rx="1" />
                <rect x="0" y="5.5" width="14" height="2.5" rx="1" />
                <rect x="0" y="11" width="14" height="2.5" rx="1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Results count ── */}
      {!loading && (
        <p className="vp-count">
          Showing <strong>{filtered.length}</strong> of{" "}
          <strong>{vendors.length}</strong> vendors
          {statusFilter !== "all" && (
            <>
              {" "}
              · filtered by <em>{statusFilter}</em>
            </>
          )}
        </p>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="vp-loading">
          <div className="spin" />
          <span>Loading vendors...</span>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && filtered.length === 0 && (
        <div className="vp-empty">
          <div className="vp-empty__icon">
            <Users size={36} />
          </div>
          <h3>No vendors found</h3>
          <p>
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filter."
              : "No vendors have registered yet."}
          </p>
          {(searchTerm || statusFilter !== "all") && (
            <button
              className="vp-empty__reset"
              onClick={() => {
                setSearchTerm("");
                setStatus("all");
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* ── Grid view ── */}
      {!loading && filtered.length > 0 && viewMode === "grid" && (
        <div className="vp-grid">
          {filtered.map((vendor) => {
            const sc = STATUS_CONFIG[vendor.status] || STATUS_CONFIG.requested;
            const StatusIcon = sc.icon;
            return (
              <div key={vendor._id} className="vp-card">
                {/* Card header stripe */}
                <div className="vp-card__stripe" />

                {/* Avatar */}
                <div className="vp-card__top">
                  {vendor.logoUrl ? (
                    <img
                      src={vendor.logoUrl}
                      alt={vendor.companyName}
                      className="vp-card__avatar vp-card__avatar--img"
                    />
                  ) : (
                    <div className="vp-card__avatar vp-card__avatar--initials">
                      {initials(vendor)}
                    </div>
                  )}
                  <span className={`vp-status ${sc.cls}`}>
                    <StatusIcon size={10} />
                    {sc.label}
                  </span>
                </div>

                {/* Info */}
                <div className="vp-card__body">
                  <h3 className="vp-card__name">
                    {vendor.companyName || vendor.name}
                  </h3>
                  {vendor.companyName && vendor.name !== vendor.companyName && (
                    <p className="vp-card__person">{vendor.name}</p>
                  )}

                  <div className="vp-card__meta">
                    <span>
                      <Mail size={11} />
                      {vendor.email}
                    </span>
                    {vendor.phone && (
                      <span>
                        <Phone size={11} />
                        {vendor.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="vp-card__footer">
                  <div className="vp-card__stats">
                    <div className="vp-card__stat">
                      <span className="vp-card__stat-val">
                        {vendor.totalProducts ?? 0}
                      </span>
                      <span className="vp-card__stat-lbl">Products</span>
                    </div>
                    <div className="vp-card__stat-divider" />
                    <div className="vp-card__stat">
                      <span className="vp-card__stat-val">
                        ₹{(vendor.totalRevenue ?? 0).toLocaleString("en-IN")}
                      </span>
                      <span className="vp-card__stat-lbl">Revenue</span>
                    </div>
                  </div>
                  <div className="vp-card__actions">
                    <button 
                      className="vp-card__btn vp-card__btn--view"
                      onClick={() => handleViewDetails(vendor)}
                    >
                      <Eye size={13} /> View Profile
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── List view ── */}
      {!loading && filtered.length > 0 && viewMode === "list" && (
        <div className="vp-list-wrap">
          <table className="vp-list">
            <thead>
              <tr>
                {[
                  "Vendor",
                  "Email",
                  "Phone",
                  "Products",
                  "Revenue",
                  "Status",
                  "Joined",
                  "Actions",
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((vendor) => {
                const sc =
                  STATUS_CONFIG[vendor.status] || STATUS_CONFIG.requested;
                const StatusIcon = sc.icon;
                return (
                  <tr key={vendor._id}>
                    <td>
                      <div className="vp-list__vendor">
                        {vendor.logoUrl ? (
                          <img
                            src={vendor.logoUrl}
                            alt=""
                            className="vp-list__avatar vp-list__avatar--img"
                          />
                        ) : (
                          <div className="vp-list__avatar vp-list__avatar--initials">
                            {initials(vendor)}
                          </div>
                        )}
                        <div>
                          <p className="vp-list__name">
                            {vendor.companyName || vendor.name}
                          </p>
                          {vendor.companyName &&
                            vendor.name !== vendor.companyName && (
                              <p className="vp-list__sub">{vendor.name}</p>
                            )}
                        </div>
                      </div>
                    </td>
                    <td className="vp-list__cell">{vendor.email}</td>
                    <td className="vp-list__cell">{vendor.phone || "—"}</td>
                    <td className="vp-list__cell vp-list__cell--center">
                      {vendor.totalProducts ?? 0}
                    </td>
                    <td className="vp-list__cell">
                      ₹{(vendor.totalRevenue ?? 0).toLocaleString("en-IN")}
                    </td>
                    <td>
                      <span className={`vp-status ${sc.cls}`}>
                        <StatusIcon size={10} />
                        {sc.label}
                      </span>
                    </td>
                    <td className="vp-list__cell">
                      {new Date(vendor.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                        <button 
                          className="vp-action-btn" 
                          title="View Details"
                          onClick={() => handleViewDetails(vendor)}
                        >
                          <Eye size={14} />
                        </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Vendor Details Modal removed in favor of full page view */}
    </div>
  );
}
