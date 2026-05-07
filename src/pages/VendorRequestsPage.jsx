import { useEffect, useState } from "react";
import {
  UserCheck,
  Search,
  CheckCircle,
  XCircle,
  PauseCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Building2,
  Mail,
  Phone,
  Calendar,
  Eye,
  RefreshCw,
  FileText,
  Check,
  X,
  MapPin,
  Shield,
} from "lucide-react";
import {
  getVendorEditRequests,
  approveVendorEditRequest,
  rejectVendorEditRequest,
} from "../services/api";
import API from "../services/api";
import toast from "react-hot-toast";

const STATUS_CONFIG = {
  requested: { label: "Pending", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  approved: { label: "Approved", color: "#00c9a7", bg: "rgba(0,201,167,0.1)" },
  rejected: { label: "Rejected", color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
  suspended: {
    label: "Suspended",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.1)",
  },
  active: { label: "Active", color: "#00c9a7", bg: "rgba(0,201,167,0.1)" },
};

export default function VendorRequestsPage() {
  const [activeTab, setActiveTab] = useState("applications"); // applications or edits
  const [vendors, setVendors] = useState([]);
  const [editRequests, setEditRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatus] = useState("requested");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [editingPlan, setEditingPlan] = useState("");
  const [editingCommission, setEditingCommission] = useState(0);
  const [actionLoading, setActionLoading] = useState("");

  const loadEditRequests = async () => {
    try {
      const res = await getVendorEditRequests();
      setEditRequests(res.data || []);
    } catch (err) {
      toast.error("Failed to load edit requests");
    }
  };

  const approveEditReq = async (id) => {
    try {
      setActionLoading("approve" + id);
      await approveVendorEditRequest(id);
      toast.success("Edit request approved");
      loadEditRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve");
    } finally {
      setActionLoading("");
    }
  };

  const rejectEditReq = async (id) => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;

    try {
      setActionLoading("reject" + id);
      await rejectVendorEditRequest(id, { reason });
      toast.success("Edit request rejected");
      loadEditRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject");
    } finally {
      setActionLoading("");
    }
  };

  const load = async (p = page, s = search, st = statusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 12 });
      if (s) params.set("search", s);
      if (st) params.set("status", st);
      const res = await API.get(`/vendors?${params}`);
      setVendors(res.data.vendors || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "applications") {
      load(1, search, statusFilter);
    } else {
      loadEditRequests();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "applications") {
      load(1, search, statusFilter);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (activeTab === "applications") {
      load(page, search, statusFilter);
    }
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load(1, search, statusFilter);
  };

  const doAction = async (id, action) => {
    setActionLoading(action + id);
    try {
      const newStatus =
        action === "approve"
          ? "approved"
          : action === "reject"
            ? "rejected"
            : "suspended";
      await API.patch(`/vendors/${id}`, { status: newStatus });
      toast.success(`Vendor ${action}d successfully`);
      setVendors((prev) =>
        prev.map((v) => (v._id === id ? { ...v, status: newStatus } : v)),
      );
      if (selected?._id === id) {
        setSelected((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed");
    } finally {
      setActionLoading("");
    }
  };

  const doDelete = async (id) => {
    if (!window.confirm("Permanently delete this vendor?")) return;
    try {
      await API.delete(`/vendors/${id}`);
      toast.success("Vendor deleted");
      setVendors((prev) => prev.filter((v) => v._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const stats = [
    { label: "Total", value: total, color: "#1e3b86" },
    {
      label: "Pending",
      value: vendors.filter((v) => v.status === "requested").length,
      color: "#f59e0b",
    },
    {
      label: "Approved",
      value: vendors.filter(
        (v) => v.status === "approved" || v.status === "active",
      ).length,
      color: "#00c9a7",
    },
    {
      label: "Rejected",
      value: vendors.filter((v) => v.status === "rejected").length,
      color: "#ef4444",
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            Vendor Requests
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
            Review and manage vendor applications & profile edit requests
          </p>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() =>
            activeTab === "applications"
              ? load(page, search, statusFilter)
              : loadEditRequests()
          }
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <button
          onClick={() => setActiveTab("applications")}
          style={{
            padding: "10px 16px",
            background:
              activeTab === "applications" ? "var(--primary)" : "transparent",
            color:
              activeTab === "applications" ? "white" : "var(--text-secondary)",
            border: "none",
            borderBottom:
              activeTab === "applications"
                ? "2px solid var(--primary)"
                : "none",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <UserCheck size={16} style={{ display: "inline", marginRight: 6 }} />
          Vendor Applications
        </button>
        <button
          onClick={() => setActiveTab("edits")}
          style={{
            padding: "10px 16px",
            background:
              activeTab === "edits" ? "var(--primary)" : "transparent",
            color: activeTab === "edits" ? "white" : "var(--text-secondary)",
            border: "none",
            borderBottom:
              activeTab === "edits" ? "2px solid var(--primary)" : "none",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <FileText size={16} style={{ display: "inline", marginRight: 6 }} />
          Profile Edit Requests (
          {editRequests.filter((r) => r.status === "pending").length})
        </button>
      </div>

      {/* Show different content based on active tab */}
      {activeTab === "applications" ? (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 12,
              marginBottom: 20,
            }}
          >
            {stats.map((s) => (
              <div
                key={s.label}
                style={{
                  background: "var(--white)",
                  borderRadius: "var(--radius)",
                  padding: "14px 18px",
                  boxShadow: "var(--shadow)",
                  borderLeft: `3px solid ${s.color}`,
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginTop: 2,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div className="sc" style={{ marginBottom: 16 }}>
            <div className="sc-body" style={{ padding: "14px 20px" }}>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <form
                  onSubmit={handleSearch}
                  style={{ display: "flex", gap: 8, flex: 1, minWidth: 220 }}
                >
                  <div style={{ position: "relative", flex: 1 }}>
                    <Search
                      size={13}
                      style={{
                        position: "absolute",
                        left: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--text-muted)",
                      }}
                    />
                    <input
                      className="fi"
                      style={{ paddingLeft: 30 }}
                      placeholder="Search by name, email, company..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <button className="btn btn-teal btn-sm" type="submit">
                    Search
                  </button>
                </form>
                <select
                  className="fi"
                  style={{ width: 150 }}
                  value={statusFilter}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="requested">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="active">Active</option>
                  <option value="rejected">Rejected</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          <div className="sc">
            <div className="sc-head">
              <h3>
                <UserCheck /> Vendor Applications ({total})
              </h3>
            </div>
            <div style={{ overflowX: "auto" }}>
              {loading ? (
                <div className="spin-wrap">
                  <div className="spin" />
                </div>
              ) : vendors.length === 0 ? (
                <div
                  style={{
                    padding: 48,
                    textAlign: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  <UserCheck
                    size={36}
                    style={{ opacity: 0.25, marginBottom: 8 }}
                  />
                  <p>No vendors found matching your filters.</p>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid var(--border)",
                        background: "var(--off-white)",
                      }}
                    >
                      {[
                        "Vendor",
                        "Company",
                        "Contact",
                        "Applied",
                        "Status",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "10px 16px",
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.6px",
                            color: "var(--text-secondary)",
                            textAlign: "left",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((vendor) => {
                      const sc =
                        STATUS_CONFIG[vendor.status] || STATUS_CONFIG.requested;
                      return (
                        <tr
                          key={vendor._id}
                          style={{
                            borderBottom: "1px solid var(--border)",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "var(--off-white)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <td style={{ padding: "12px 16px" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                              }}
                            >
                              <div
                                style={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: "50%",
                                  background:
                                    "linear-gradient(135deg, #1e3b86, #2d5be3)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: "#fff",
                                  flexShrink: 0,
                                }}
                              >
                                {vendor.name?.[0]?.toUpperCase() || "V"}
                              </div>
                              <div>
                                <div
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: "var(--text-primary)",
                                  }}
                                >
                                  {vendor.name}
                                </div>
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: "var(--text-muted)",
                                  }}
                                >
                                  {vendor.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td
                            style={{
                              padding: "12px 16px",
                              fontSize: 13,
                              color: "var(--text-secondary)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                              }}
                            >
                              <Building2
                                size={12}
                                style={{ color: "var(--text-muted)" }}
                              />
                              {vendor.companyName || (
                                <span
                                  style={{
                                    color: "var(--text-muted)",
                                    fontStyle: "italic",
                                  }}
                                >
                                  —
                                </span>
                              )}
                            </div>
                          </td>

                          <td
                            style={{
                              padding: "12px 16px",
                              fontSize: 12,
                              color: "var(--text-secondary)",
                            }}
                          >
                            {vendor.phone ? (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 5,
                                }}
                              >
                                <Phone
                                  size={11}
                                  style={{ color: "var(--text-muted)" }}
                                />
                                {vendor.phone}
                              </div>
                            ) : (
                              <span
                                style={{
                                  color: "var(--text-muted)",
                                  fontStyle: "italic",
                                }}
                              >
                                —
                              </span>
                            )}
                          </td>

                          <td
                            style={{
                              padding: "12px 16px",
                              fontSize: 12,
                              color: "var(--text-muted)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                              }}
                            >
                              <Calendar size={11} />
                              {new Date(vendor.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </div>
                          </td>

                          <td style={{ padding: "12px 16px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "3px 10px",
                                borderRadius: 10,
                                fontSize: 11,
                                fontWeight: 700,
                                background: sc.bg,
                                color: sc.color,
                              }}
                            >
                              <span
                                style={{
                                  width: 5,
                                  height: 5,
                                  borderRadius: "50%",
                                  background: "currentColor",
                                  display: "inline-block",
                                }}
                              />
                              {sc.label}
                            </span>
                          </td>

                          <td style={{ padding: "12px 16px" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                flexWrap: "wrap",
                              }}
                            >
                              <button
                                className="btn btn-ghost btn-sm"
                                style={{ fontSize: 11, padding: "3px 8px" }}
                                onClick={() => {
                                  setSelected(vendor);
                                  setEditingPlan(vendor.interestedPlan || "Startup / Promotion Plan");
                                  setEditingCommission(vendor.commissionPercentage || 0);
                                }}
                              >
                                <Eye size={11} /> View
                              </button>

                              {vendor.status !== "approved" &&
                                vendor.status !== "active" && (
                                  <button
                                    className="btn btn-sm"
                                    style={{
                                      fontSize: 11,
                                      padding: "3px 8px",
                                      background: "rgba(0,201,167,0.1)",
                                      color: "#00c9a7",
                                      border: "1px solid rgba(0,201,167,0.3)",
                                    }}
                                    disabled={!!actionLoading}
                                    onClick={() =>
                                      doAction(vendor._id, "approve")
                                    }
                                  >
                                    <CheckCircle size={11} />
                                    {actionLoading === "approve" + vendor._id
                                      ? "..."
                                      : "Approve"}
                                  </button>
                                )}

                              {vendor.status !== "rejected" && (
                                <button
                                  className="btn btn-sm"
                                  style={{
                                    fontSize: 11,
                                    padding: "3px 8px",
                                    background: "rgba(239,68,68,0.08)",
                                    color: "#ef4444",
                                    border: "1px solid rgba(239,68,68,0.2)",
                                  }}
                                  disabled={!!actionLoading}
                                  onClick={() => doAction(vendor._id, "reject")}
                                >
                                  <XCircle size={11} />
                                  {actionLoading === "reject" + vendor._id
                                    ? "..."
                                    : "Reject"}
                                </button>
                              )}

                              {(vendor.status === "approved" ||
                                vendor.status === "active") && (
                                  <button
                                    className="btn btn-sm"
                                    style={{
                                      fontSize: 11,
                                      padding: "3px 8px",
                                      background: "rgba(139,92,246,0.08)",
                                      color: "#8b5cf6",
                                      border: "1px solid rgba(139,92,246,0.2)",
                                    }}
                                    disabled={!!actionLoading}
                                    onClick={() =>
                                      doAction(vendor._id, "suspend")
                                    }
                                  >
                                    <PauseCircle size={11} />
                                    {actionLoading === "suspend" + vendor._id
                                      ? "..."
                                      : "Suspend"}
                                  </button>
                                )}

                              <button
                                className="btn btn-sm"
                                style={{
                                  fontSize: 11,
                                  padding: "3px 8px",
                                  background: "none",
                                  color: "var(--text-muted)",
                                  border: "1px solid var(--border)",
                                }}
                                onClick={() => doDelete(vendor._id)}
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 20px",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  Page {page} of {totalPages} · {total} vendors
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft size={13} /> Prev
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {selected && (
            <div
              className="overlay"
              onClick={(e) => e.target === e.currentTarget && setSelected(null)}
            >
              <div className="modal" style={{ maxWidth: 480, width: "95%" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: "linear-gradient(135deg, #1e3b86, #2d5be3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#fff",
                    }}
                  >
                    {selected.name?.[0]?.toUpperCase() || "V"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                      {selected.name}
                    </h4>
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--text-muted)",
                        margin: 0,
                      }}
                    >
                      {selected.email}
                    </p>
                  </div>
                  {(() => {
                    const sc =
                      STATUS_CONFIG[selected.status] || STATUS_CONFIG.requested;
                    return (
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: 10,
                          fontSize: 11,
                          fontWeight: 700,
                          background: sc.bg,
                          color: sc.color,
                        }}
                      >
                        {sc.label}
                      </span>
                    );
                  })()}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginBottom: 20,
                  }}
                >
                  {[
                    {
                      icon: Building2,
                      label: "Company",
                      value: selected.companyName || "—",
                    },
                    {
                      icon: MapPin,
                      label: "Base City",
                      value: selected.baseCity || "—",
                    },
                    {
                      icon: Phone,
                      label: "Phone",
                      value: selected.phone || "—",
                    },
                    { icon: Mail, label: "Email", value: selected.email },
                    {
                      icon: Shield,
                      label: "Interested Plan",
                      value: editingPlan || selected.interestedPlan || "Startup / Promotion Plan",
                    },
                    {
                      icon: FileText,
                      label: "Commission (%)",
                      value: `${editingCommission || selected.commissionPercentage || 0}%`,
                    },
                  ].map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 12px",
                        background: "var(--off-white)",
                        borderRadius: 6,
                      }}
                    >
                      <Icon
                        size={14}
                        style={{ color: "var(--text-muted)", flexShrink: 0 }}
                      />
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          minWidth: 70,
                        }}
                      >
                        {label}
                      </span>
                      <span
                        style={{ fontSize: 13, color: "var(--text-primary)" }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}

                  {/* Plan Editor */}
                  <div style={{ marginTop: 10, padding: '12px', border: '1px dashed var(--border)', borderRadius: 8 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>
                      Adjust Partnership Plan (Admin Only)
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select
                        className="fi"
                        style={{ fontSize: 13, flex: 1 }}
                        value={editingPlan}
                        onChange={(e) => {
                          const newPlan = e.target.value;
                          setEditingPlan(newPlan);
                          // Auto-update commission based on plan
                          const commissions = {
                            "Diamond Partner": 10,
                            "Gold Partner": 20,
                            "Silver Partner": 30,
                            "Startup / Promotion Plan": 42
                          };
                          if (commissions[newPlan]) {
                            setEditingCommission(commissions[newPlan]);
                          }
                        }}
                      >
                        <option value="Diamond Partner">Diamond Partner</option>
                        <option value="Gold Partner">Gold Partner</option>
                        <option value="Silver Partner">Silver Partner</option>
                        <option value="Startup / Promotion Plan">Startup / Promotion Plan</option>
                      </select>
                      <button
                        className="btn btn-sm btn-teal"
                        disabled={editingPlan === selected.interestedPlan || !!actionLoading}
                        onClick={async () => {
                          setActionLoading("updatePlan");
                          try {
                            await API.patch(`/vendors/${selected._id}`, { interestedPlan: editingPlan });
                            toast.success("Plan updated");
                            setSelected({ ...selected, interestedPlan: editingPlan });
                            setVendors(prev => prev.map(v => v._id === selected._id ? { ...v, interestedPlan: editingPlan } : v));
                          } catch (err) {
                            toast.error("Failed to update plan");
                          } finally {
                            setActionLoading("");
                          }
                        }}
                      >
                        <Check size={14} /> Update
                      </button>
                    </div>
                  </div>
                </div>


                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {selected.status !== "approved" &&
                    selected.status !== "active" && (
                      <button
                        className="btn btn-sm btn-teal"
                        disabled={!!actionLoading}
                        onClick={() => doAction(selected._id, "approve")}
                      >
                        <CheckCircle size={13} /> Approve Vendor
                      </button>
                    )}
                  {selected.status !== "rejected" && (
                    <button
                      className="btn btn-sm btn-red-o"
                      disabled={!!actionLoading}
                      onClick={() => doAction(selected._id, "reject")}
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  )}
                  {(selected.status === "approved" ||
                    selected.status === "active") && (
                      <button
                        className="btn btn-sm"
                        style={{
                          background: "rgba(139,92,246,0.1)",
                          color: "#8b5cf6",
                          border: "1px solid rgba(139,92,246,0.3)",
                        }}
                        disabled={!!actionLoading}
                        onClick={() => doAction(selected._id, "suspend")}
                      >
                        <PauseCircle size={13} /> Suspend
                      </button>
                    )}
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ marginLeft: "auto" }}
                    onClick={() => setSelected(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Edit Requests Tab */
        <div className="sc">
          <div className="sc-head">
            <h3>
              <FileText /> Profile Edit Requests
            </h3>
          </div>
          {editRequests.length === 0 ? (
            <div
              style={{
                padding: 48,
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              <FileText size={36} style={{ opacity: 0.25, marginBottom: 8 }} />
              <p>No edit requests found.</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background: "var(--off-white)",
                  }}
                >
                  {[
                    "Vendor",
                    "Field",
                    "Current Value",
                    "New Value",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 16px",
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.6px",
                        color: "var(--text-secondary)",
                        textAlign: "left",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {editRequests.map((req) => (
                  <tr
                    key={req._id}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      background:
                        req.status === "pending"
                          ? "rgba(245, 158, 11, 0.03)"
                          : "transparent",
                    }}
                  >
                    <td style={{ padding: "12px 16px", fontSize: 13 }}>
                      <div style={{ fontWeight: 500 }}>
                        {req.vendorId?.name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {req.vendorId?.companyName}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        textTransform: "capitalize",
                      }}
                    >
                      {req.fieldName}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13 }}>
                      <code
                        style={{
                          background: "#f0f0f0",
                          padding: "2px 6px",
                          borderRadius: 3,
                        }}
                      >
                        {req.currentValue || "—"}
                      </code>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13 }}>
                      <code
                        style={{
                          background: "#e8f5e9",
                          padding: "2px 6px",
                          borderRadius: 3,
                          color: "#2e7d32",
                        }}
                      >
                        {req.newValue}
                      </code>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13 }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          ...{
                            pending: {
                              bg: "rgba(245, 158, 11, 0.15)",
                              color: "#f59e0b",
                            },
                            approved: {
                              bg: "rgba(0, 201, 167, 0.15)",
                              color: "#00c9a7",
                            },
                            rejected: {
                              bg: "rgba(239, 68, 68, 0.15)",
                              color: "#ef4444",
                            },
                          }[req.status],
                        }}
                      >
                        {req.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13 }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        {req.status === "pending" && (
                          <>
                            <button
                              onClick={() => approveEditReq(req._id)}
                              disabled={!!actionLoading}
                              style={{
                                background: "rgba(0, 201, 167, 0.15)",
                                color: "#00c9a7",
                                border: "1px solid rgba(0, 201, 167, 0.3)",
                                padding: "4px 8px",
                                borderRadius: 4,
                                cursor: "pointer",
                                fontSize: 11,
                                fontWeight: 600,
                                display: "flex",
                                gap: 3,
                                alignItems: "center",
                              }}
                            >
                              <Check size={12} /> Approve
                            </button>
                            <button
                              onClick={() => rejectEditReq(req._id)}
                              disabled={!!actionLoading}
                              style={{
                                background: "rgba(239, 68, 68, 0.15)",
                                color: "#ef4444",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                padding: "4px 8px",
                                borderRadius: 4,
                                cursor: "pointer",
                                fontSize: 11,
                                fontWeight: 600,
                                display: "flex",
                                gap: 3,
                                alignItems: "center",
                              }}
                            >
                              <X size={12} /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
