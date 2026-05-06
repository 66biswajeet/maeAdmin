import { useEffect, useState } from "react";
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

export default function AdminVendorDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit states
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
        commissionPercentage: Number(editingCommission)
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
                  <span>{new Date(vendor.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="avd-card">
            <h3>Quick Actions</h3>
            <div className="avd-action-btns">
              {vendor.status === 'requested' && (
                <button className="btn-st btn-st--approve" onClick={() => handleStatusUpdate('approved')}>
                  <CheckCircle size={16} /> Approve Vendor
                </button>
              )}
              {vendor.status !== 'suspended' && (
                <button className="btn-st btn-st--suspend" onClick={() => handleStatusUpdate('suspended')}>
                  <PauseCircle size={16} /> Suspend Account
                </button>
              )}
              {vendor.status === 'suspended' && (
                <button className="btn-st btn-st--approve" onClick={() => handleStatusUpdate('active')}>
                  <CheckCircle size={16} /> Activate Account
                </button>
              )}
              <button className="btn-st btn-st--reject" onClick={() => handleStatusUpdate('rejected')}>
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
              <div className="avd-stat-icon" style={{ background: '#e0f2f1', color: '#00897b' }}>
                <Package size={20} />
              </div>
              <div className="avd-stat-content">
                <span className="avd-stat-val">{vendor.totalProducts || 0}</span>
                <span className="avd-stat-lbl">Listed Products</span>
              </div>
            </div>
            <div className="avd-stat-card">
              <div className="avd-stat-icon" style={{ background: '#e3f2fd', color: '#1e88e5' }}>
                <ShoppingCart size={20} />
              </div>
              <div className="avd-stat-content">
                <span className="avd-stat-val">{vendor.totalOrders || 0}</span>
                <span className="avd-stat-lbl">Total Orders</span>
              </div>
            </div>
            <div className="avd-stat-card">
              <div className="avd-stat-icon" style={{ background: '#f3e5f5', color: '#8e24aa' }}>
                <TrendingUp size={20} />
              </div>
              <div className="avd-stat-content">
                <span className="avd-stat-val">₹{(vendor.grossRevenue || 0).toLocaleString('en-IN')}</span>
                <span className="avd-stat-lbl">Gross Revenue</span>
              </div>
            </div>
            <div className="avd-stat-card">
              <div className="avd-stat-icon" style={{ background: '#fff1f2', color: '#e11d48' }}>
                <TrendingUp size={20} />
              </div>
              <div className="avd-stat-content">
                <span className="avd-stat-val">₹{(vendor.adminCommission || 0).toLocaleString('en-IN')}</span>
                <span className="avd-stat-lbl">Commission Paid</span>
              </div>
            </div>
            <div className="avd-stat-card">
              <div className="avd-stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                <IndianRupee size={20} />
              </div>
              <div className="avd-stat-content">
                <span className="avd-stat-val">₹{(vendor.totalRevenue || 0).toLocaleString('en-IN')}</span>
                <span className="avd-stat-lbl">Net Revenue (Payout)</span>
              </div>
            </div>
          </div>

          {/* About & Business Info */}
          <div className="avd-card">
            <div className="avd-card-head">
              <h3>Business Information</h3>
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
              <h3>Partnership & Commercials</h3>
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
                    const comms = {
                      "Diamond Partner": 10,
                      "Gold Partner": 20,
                      "Silver Partner": 30,
                      "Startup / Promotion Plan": 42
                    };
                    if (comms[p]) setEditingCommission(comms[p]);
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
                  disabled={actionLoading || (editingPlan === vendor.interestedPlan && Number(editingCommission) === vendor.commissionPercentage)}
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
