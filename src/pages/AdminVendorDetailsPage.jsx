import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2,
  Mail,
  Phone,
  User,
  Shield,
  FileText,
  Calendar,
  Package,
  ShoppingCart,
  TrendingUp,
  MapPin,
  CheckCircle,
  XCircle,
  PauseCircle,
  RefreshCw,
  ChevronLeft,
  Trash2,
  AlertCircle,
  IndianRupee,
  Pencil,
  X,
  Upload,
  Save,
} from "lucide-react";
import API from "../services/api";
import toast from "react-hot-toast";
import "./AdminVendorDetailsPage.css";

const STATUS_CONFIG = {
  requested: { label: "Pending Approval", icon: AlertCircle, cls: "st-pending" },
  approved: { label: "Active / Approved", icon: CheckCircle, cls: "st-approved" },
  active: { label: "Active", icon: CheckCircle, cls: "st-approved" },
  rejected: { label: "Rejected", icon: XCircle, cls: "st-rejected" },
  suspended: { label: "Suspended", icon: PauseCircle, cls: "st-suspended" },
};

const PLAN_COMMISSIONS = {
  "Diamond Partner": 10,
  "Gold Partner": 20,
  "Silver Partner": 30,
  "Startup / Promotion Plan": 42,
};

const EMPTY_FORM = {
  name: "",
  companyName: "",
  email: "",
  phone: "",
  baseCity: "",
  bio: "",
  gstNumber: "",
  taxNumber: "",
  interestedPlan: "",
  commissionPercentage: 0,
  status: "approved",
};

/* ─── Edit Modal ─────────────────────────────────────────────────── */
function EditVendorModal({ vendor, onClose, onSaved }) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  // Pre-fill form on open
  useEffect(() => {
    setForm({
      name: vendor.name || "",
      companyName: vendor.companyName || "",
      email: vendor.email || "",
      phone: vendor.phone || "",
      baseCity: vendor.baseCity || "",
      bio: vendor.bio || "",
      gstNumber: vendor.gstNumber || "",
      taxNumber: vendor.taxNumber || "",
      interestedPlan: vendor.interestedPlan || "",
      commissionPercentage: vendor.commissionPercentage ?? 0,
      status: vendor.status || "approved",
    });
    setLogoPreview(vendor.logoUrl || "");
    setLogoFile(null);
  }, [vendor]);

  const set = (field) => (e) => {
    const val = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: val };
      // Auto-set commission when plan changes
      if (field === "interestedPlan" && PLAN_COMMISSIONS[val]) {
        next.commissionPercentage = PLAN_COMMISSIONS[val];
      }
      return next;
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (logoFile) fd.append("logo", logoFile);
      await API.patch(`/vendors/${vendor._id}`, fd);
      toast.success("Vendor updated successfully");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update vendor");
    } finally {
      setSaving(false);
    }
  };

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="avd-modal-overlay" onClick={handleBackdrop}>
      <div className="avd-modal" role="dialog" aria-modal="true" aria-label="Edit Vendor">
        {/* Header */}
        <div className="avd-modal-header">
          <div className="avd-modal-title">
            <Pencil size={18} />
            <h2>Edit Vendor Profile</h2>
          </div>
          <button className="avd-modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="avd-modal-body">
          {/* Logo */}
          <div className="avd-modal-logo-row">
            <div className="avd-modal-logo-preview">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" />
              ) : (
                <div className="avd-modal-logo-init">
                  {form.companyName?.[0] || form.name?.[0] || "?"}
                </div>
              )}
            </div>
            <div className="avd-modal-logo-actions">
              <p className="avd-modal-logo-label">Company Logo</p>
              <button
                type="button"
                className="btn-upload-logo"
                onClick={() => fileRef.current?.click()}
              >
                <Upload size={14} /> Upload New Logo
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleLogoChange}
              />
              {logoFile && (
                <span className="avd-modal-logo-filename">{logoFile.name}</span>
              )}
            </div>
          </div>

          {/* Fields grid */}
          <div className="avd-modal-grid">
            <div className="avd-mfg">
              <label htmlFor="ve-name">Representative Name</label>
              <input id="ve-name" type="text" value={form.name} onChange={set("name")} placeholder="Full name" />
            </div>

            <div className="avd-mfg">
              <label htmlFor="ve-company">Company Name</label>
              <input id="ve-company" type="text" value={form.companyName} onChange={set("companyName")} placeholder="Company name" />
            </div>

            <div className="avd-mfg">
              <label htmlFor="ve-email">Email Address</label>
              <input id="ve-email" type="email" value={form.email} onChange={set("email")} placeholder="email@example.com" />
            </div>

            <div className="avd-mfg">
              <label htmlFor="ve-phone">Phone Number</label>
              <input id="ve-phone" type="tel" value={form.phone} onChange={set("phone")} placeholder="+91 XXXXX XXXXX" />
            </div>

            <div className="avd-mfg">
              <label htmlFor="ve-city">Base City</label>
              <input id="ve-city" type="text" value={form.baseCity} onChange={set("baseCity")} placeholder="City" />
            </div>

            <div className="avd-mfg">
              <label htmlFor="ve-status">Account Status</label>
              <select id="ve-status" value={form.status} onChange={set("status")}>
                <option value="approved">Active / Approved</option>
                <option value="requested">Pending Approval</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="avd-mfg">
              <label htmlFor="ve-gst">GST Number</label>
              <input id="ve-gst" type="text" value={form.gstNumber} onChange={set("gstNumber")} placeholder="GST registration number" />
            </div>

            <div className="avd-mfg">
              <label htmlFor="ve-pan">PAN / Tax Number</label>
              <input id="ve-pan" type="text" value={form.taxNumber} onChange={set("taxNumber")} placeholder="PAN number" />
            </div>

            <div className="avd-mfg">
              <label htmlFor="ve-plan">Partnership Tier</label>
              <select id="ve-plan" value={form.interestedPlan} onChange={set("interestedPlan")}>
                <option value="">-- Select Plan --</option>
                <option value="Diamond Partner">Diamond Partner</option>
                <option value="Gold Partner">Gold Partner</option>
                <option value="Silver Partner">Silver Partner</option>
                <option value="Startup / Promotion Plan">Startup / Promotion Plan</option>
              </select>
            </div>

            <div className="avd-mfg">
              <label htmlFor="ve-comm">Commission (%)</label>
              <div className="avd-input-pct">
                <input
                  id="ve-comm"
                  type="number"
                  min="0"
                  max="100"
                  value={form.commissionPercentage}
                  onChange={set("commissionPercentage")}
                />
                <span>%</span>
              </div>
            </div>
          </div>

          {/* Bio – full width */}
          <div className="avd-mfg avd-mfg--full">
            <label htmlFor="ve-bio">Business Bio</label>
            <textarea
              id="ve-bio"
              rows={4}
              value={form.bio}
              onChange={set("bio")}
              placeholder="Brief description of the vendor's business..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="avd-modal-footer">
          <button className="btn-modal-cancel" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn-modal-save" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <RefreshCw size={15} className="spin" /> Saving...
              </>
            ) : (
              <>
                <Save size={15} /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function AdminVendorDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  // Commercial section edit states (kept for backwards compat)
  const [editingPlan, setEditingPlan] = useState("");
  const [editingCommission, setEditingCommission] = useState(0);

  useEffect(() => {
    fetchVendor();
  }, [id]);

  const fetchVendor = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/vendors/${id}`);
      setVendor(res.data);
      setEditingPlan(res.data.interestedPlan || "Startup / Promotion Plan");
      setEditingCommission(res.data.commissionPercentage || 0);
    } catch (err) {
      toast.error("Failed to fetch vendor details");
      navigate("/vendors/all");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
    try {
      setActionLoading(true);
      await API.patch(`/vendors/${id}`, { status: newStatus });
      toast.success(`Vendor ${newStatus} successfully`);
      fetchVendor();
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCommercialUpdate = async () => {
    try {
      setActionLoading(true);
      await API.patch(`/vendors/${id}`, {
        interestedPlan: editingPlan,
        commissionPercentage: Number(editingCommission),
      });
      toast.success("Commercials updated");
      fetchVendor();
    } catch (err) {
      toast.error("Failed to update");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="avd-loading">
        <RefreshCw className="spin" size={32} />
        <p>Loading vendor profile...</p>
      </div>
    );
  }

  if (!vendor) return null;

  const st = STATUS_CONFIG[vendor.status] || STATUS_CONFIG.requested;
  const StatusIcon = st.icon;

  return (
    <div className="avd-page">
      {/* Edit Modal */}
      {editOpen && (
        <EditVendorModal
          vendor={vendor}
          onClose={() => setEditOpen(false)}
          onSaved={fetchVendor}
        />
      )}

      {/* ── Header ── */}
      <div className="avd-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={18} /> Back
        </button>
        <div className="avd-header__main">
          <h1>Vendor Profile</h1>
          <div className={`avd-badge ${st.cls}`}>
            <StatusIcon size={14} /> {st.label}
          </div>
        </div>
      </div>

      <div className="avd-layout">
        {/* ── Left Column: Identity & Contact ── */}
        <div className="avd-col-left">
          <div className="avd-card avd-identity">
            {/* Pencil edit button */}
            <button
              className="avd-edit-btn"
              onClick={() => setEditOpen(true)}
              title="Edit vendor info"
              aria-label="Edit vendor info"
            >
              <Pencil size={15} />
            </button>

            <div className="avd-avatar-wrap">
              {vendor.logoUrl ? (
                <img src={vendor.logoUrl} alt={vendor.companyName} />
              ) : (
                <div className="avd-avatar-init">
                  {vendor.companyName?.[0] || vendor.name?.[0]}
                </div>
              )}
            </div>
            <h2>{vendor.companyName || vendor.name}</h2>
            <p className="avd-email">{vendor.email}</p>

            <div className="avd-info-list">
              <div className="avd-info-item">
                <User size={16} />
                <div>
                  <label>Representative</label>
                  <span>{vendor.name}</span>
                </div>
              </div>
              <div className="avd-info-item">
                <Phone size={16} />
                <div>
                  <label>Phone</label>
                  <span>{vendor.phone || "—"}</span>
                </div>
              </div>
              <div className="avd-info-item">
                <MapPin size={16} />
                <div>
                  <label>Base City</label>
                  <span>{vendor.baseCity || "—"}</span>
                </div>
              </div>
              <div className="avd-info-item">
                <Calendar size={16} />
                <div>
                  <label>Member Since</label>
                  <span>
                    {new Date(vendor.createdAt).toLocaleDateString("en-IN", {
                      dateStyle: "medium",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="avd-card">
            <h3>Quick Actions</h3>
            <div className="avd-action-btns">
              {vendor.status === "requested" && (
                <button
                  className="btn-st btn-st--approve"
                  onClick={() => handleStatusUpdate("approved")}
                >
                  <CheckCircle size={16} /> Approve Vendor
                </button>
              )}
              {vendor.status !== "suspended" && (
                <button
                  className="btn-st btn-st--suspend"
                  onClick={() => handleStatusUpdate("suspended")}
                >
                  <PauseCircle size={16} /> Suspend Account
                </button>
              )}
              {vendor.status === "suspended" && (
                <button
                  className="btn-st btn-st--approve"
                  onClick={() => handleStatusUpdate("active")}
                >
                  <CheckCircle size={16} /> Activate Account
                </button>
              )}
              <button
                className="btn-st btn-st--reject"
                onClick={() => handleStatusUpdate("rejected")}
              >
                <XCircle size={16} /> Reject / Delete
              </button>
            </div>
          </div>
        </div>

        {/* ── Right Column: Stats, Bio, Commercials ── */}
        <div className="avd-col-right">
          {/* Stats Bar */}
          <div className="avd-stats-grid">
            <div className="avd-stat-card">
              <div className="avd-stat-icon" style={{ background: "#e0f2f1", color: "#00897b" }}>
                <Package size={20} />
              </div>
              <div className="avd-stat-content">
                <span className="avd-stat-val">{vendor.totalProducts || 0}</span>
                <span className="avd-stat-lbl">Listed Products</span>
              </div>
            </div>
            <div className="avd-stat-card">
              <div className="avd-stat-icon" style={{ background: "#e3f2fd", color: "#1e88e5" }}>
                <ShoppingCart size={20} />
              </div>
              <div className="avd-stat-content">
                <span className="avd-stat-val">{vendor.totalOrders || 0}</span>
                <span className="avd-stat-lbl">Total Orders</span>
              </div>
            </div>
            <div className="avd-stat-card">
              <div className="avd-stat-icon" style={{ background: "#f3e5f5", color: "#8e24aa" }}>
                <TrendingUp size={20} />
              </div>
              <div className="avd-stat-content">
                <span className="avd-stat-val">
                  ₹{(vendor.grossRevenue || 0).toLocaleString("en-IN")}
                </span>
                <span className="avd-stat-lbl">Gross Revenue</span>
              </div>
            </div>
            <div className="avd-stat-card">
              <div className="avd-stat-icon" style={{ background: "#fff1f2", color: "#e11d48" }}>
                <TrendingUp size={20} />
              </div>
              <div className="avd-stat-content">
                <span className="avd-stat-val">
                  ₹{(vendor.adminCommission || 0).toLocaleString("en-IN")}
                </span>
                <span className="avd-stat-lbl">Commission Paid</span>
              </div>
            </div>
            <div className="avd-stat-card">
              <div className="avd-stat-icon" style={{ background: "#ecfdf5", color: "#10b981" }}>
                <IndianRupee size={20} />
              </div>
              <div className="avd-stat-content">
                <span className="avd-stat-val">
                  ₹{(vendor.totalRevenue || 0).toLocaleString("en-IN")}
                </span>
                <span className="avd-stat-lbl">Net Revenue (Payout)</span>
              </div>
            </div>
          </div>

          {/* About & Business Info */}
          <div className="avd-card">
            <div className="avd-card-head">
              <h3>Business Information</h3>
              <button
                className="avd-edit-btn avd-edit-btn--inline"
                onClick={() => setEditOpen(true)}
                title="Edit business info"
              >
                <Pencil size={14} /> Edit
              </button>
            </div>
            <div className="avd-business-grid">
              <div className="avd-biz-item">
                <label>GST Number</label>
                <p>{vendor.gstNumber || "Not Provided"}</p>
              </div>
              <div className="avd-biz-item">
                <label>Tax / PAN Number</label>
                <p>{vendor.taxNumber || "Not Provided"}</p>
              </div>
            </div>
            <div className="avd-bio-section">
              <label>Business Bio</label>
              <p>{vendor.bio || "No bio available for this vendor."}</p>
            </div>
          </div>

          {/* Commercial Settings */}
          <div className="avd-card avd-commercials">
            <div className="avd-card-head">
              <h3>Partnership &amp; Commercials</h3>
              <div className="avd-badge st-commercial">Active Plan</div>
            </div>

            <div className="avd-comm-editor">
              <div className="avd-fg">
                <label>Partnership Tier</label>
                <select
                  value={editingPlan}
                  onChange={(e) => {
                    const p = e.target.value;
                    setEditingPlan(p);
                    if (PLAN_COMMISSIONS[p]) setEditingCommission(PLAN_COMMISSIONS[p]);
                  }}
                >
                  <option value="Diamond Partner">Diamond Partner</option>
                  <option value="Gold Partner">Gold Partner</option>
                  <option value="Silver Partner">Silver Partner</option>
                  <option value="Startup / Promotion Plan">Startup / Promotion Plan</option>
                </select>
              </div>

              <div className="avd-fg">
                <label>Commission Percentage (%)</label>
                <div className="avd-input-pct">
                  <input
                    type="number"
                    value={editingCommission}
                    onChange={(e) => setEditingCommission(e.target.value)}
                  />
                  <span>%</span>
                </div>
              </div>

              <div className="avd-comm-actions">
                <button
                  className="btn-update"
                  disabled={
                    actionLoading ||
                    (editingPlan === vendor.interestedPlan &&
                      Number(editingCommission) === vendor.commissionPercentage)
                  }
                  onClick={handleCommercialUpdate}
                >
                  {actionLoading ? "Updating..." : "Save Commercial Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
