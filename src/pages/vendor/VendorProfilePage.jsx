import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Building2,
  FileText,
  Upload,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Shield,
} from "lucide-react";
import {
  getVendorMe,
  updateVendorMe,
  createVendorEditRequest,
} from "../../services/api";
import toast from "react-hot-toast";
import "./VendorProfilePage.css";

export default function VendorProfilePage() {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState({});
  const [form, setForm] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editingField, setEditingField] = useState(null);

  useEffect(() => {
    loadVendor();
  }, []);

  const loadVendor = async () => {
    setLoading(true);
    try {
      const res = await getVendorMe();
      setVendor(res.data);
      setForm(res.data);
      if (res.data.logoUrl) setLogoPreview(res.data.logoUrl);
    } catch (err) {
      toast.error("Failed to load vendor profile");
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileCompletion = () => {
    const fields = [
      { key: "name", required: true },
      { key: "email", required: true },
      { key: "phone", required: true },
      { key: "companyName", required: true },
      { key: "bio", required: false },
      { key: "logoUrl", required: false },
      { key: "gstNumber", required: false },
      { key: "taxNumber", required: false },
    ];

    let completed = 0;
    let total = 0;

    fields.forEach((field) => {
      if (field.required) {
        total++;
        if (form[field.key] && form[field.key].trim()) completed++;
      } else {
        total++;
        if (form[field.key] && form[field.key].trim()) completed++;
      }
    });

    return Math.round((completed / total) * 100);
  };

  const getProfileColor = () => {
    const percent = calculateProfileCompletion();
    if (percent <= 25) return "#dc3545"; // Red
    if (percent <= 50) return "#ff9800"; // Orange
    if (percent <= 75) return "#ffc107"; // Yellow
    return "#28a745"; // Green
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleFieldChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const fd = new FormData();

      // Add all text fields
      fd.append("name", form.name);
      fd.append("companyName", form.companyName);
      fd.append("phone", form.phone);
      fd.append("bio", form.bio);
      fd.append("gstNumber", form.gstNumber);
      fd.append("taxNumber", form.taxNumber);

      if (logoFile) fd.append("logo", logoFile);

      const res = await updateVendorMe(fd);
      setVendor(res.data);
      setEditing({});
      setLogoFile(null);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const requestChange = async (fieldName) => {
    try {
      const fieldMap = {
        Email: "email",
        Phone: "phone",
        "Company Name": "companyName",
      };
      const apiFieldName = fieldMap[fieldName];

      await createVendorEditRequest({
        fieldName: apiFieldName,
        newValue: form[apiFieldName],
      });

      toast.success(
        `${fieldName} change request submitted to admin for review`,
      );
      setEditingField(null);
      // Reset the form to current value
      setForm((prev) => ({ ...prev, [apiFieldName]: vendor[apiFieldName] }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit request");
    }
  };

  if (loading) {
    return (
      <div className="vendor-profile-wrapper">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="vendor-profile-wrapper">
        <div className="empty-state">Failed to load vendor profile</div>
      </div>
    );
  }

  const completion = calculateProfileCompletion();
  const profileColor = getProfileColor();

  return (
    <div className="vendor-profile-wrapper">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="header-content">
          <h1>Vendor Profile</h1>
          <p>Manage your vendor account information and details</p>
        </div>

        {/* Profile Completion Widget */}
        <div className="completion-widget">
          <div
            className="completion-circle"
            style={{ borderColor: profileColor }}
          >
            <div className="completion-value" style={{ color: profileColor }}>
              {completion}%
            </div>
            <div className="completion-label">Complete</div>
          </div>
          <div className="completion-bar">
            <div
              className="completion-fill"
              style={{ width: `${completion}%`, backgroundColor: profileColor }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="profile-content">
        {/* Logo Section */}
        <section className="profile-section logo-section">
          <h2>Company Logo</h2>
          <div className="logo-container">
            <div className="logo-preview">
              {logoPreview ? (
                <img src={logoPreview} alt="Company logo" />
              ) : (
                <Building2 size={48} />
              )}
            </div>
            <div className="logo-upload">
              <label className="upload-btn">
                <Upload size={18} />
                {logoFile ? "Change Logo" : "Upload Logo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  hidden
                />
              </label>
              <p>Recommended: PNG or SVG, 400×120px</p>
            </div>
          </div>
        </section>

        {/* Sensitive Info Section */}
        <section className="profile-section">
          <h2>Personal Information</h2>
          <div className="section-note">
            ⚠️ Changes to Phone, Email, or Company Name require admin approval
          </div>

          {/* Name */}
          <div className="form-group">
            <label>Name</label>
            <div className="input-wrapper">
              <User size={18} />
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
              />
            </div>
          </div>

          {/* Email - Requires Admin Approval */}
          <div className="form-group sensitive-field">
            <label>Email Address (Approval Required)</label>
            {editingField === "email" ? (
              <div className="approval-edit">
                <div className="input-wrapper">
                  <Mail size={18} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                  />
                </div>
                <div className="approval-actions">
                  <button
                    className="btn-submit"
                    onClick={() => requestChange("Email")}
                  >
                    Request Change
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => setEditingField(null)}
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="input-wrapper disabled-input">
                <Mail size={18} />
                <input type="email" value={form.email} disabled />
                <button
                  className="edit-btn"
                  onClick={() => setEditingField("email")}
                >
                  Request Change
                </button>
              </div>
            )}
          </div>

          {/* Phone - Requires Admin Approval */}
          <div className="form-group sensitive-field">
            <label>Phone Number (Approval Required)</label>
            {editingField === "phone" ? (
              <div className="approval-edit">
                <div className="input-wrapper">
                  <Phone size={18} />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                  />
                </div>
                <div className="approval-actions">
                  <button
                    className="btn-submit"
                    onClick={() => requestChange("Phone")}
                  >
                    Request Change
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => setEditingField(null)}
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="input-wrapper disabled-input">
                <Phone size={18} />
                <input type="tel" value={form.phone} disabled />
                <button
                  className="edit-btn"
                  onClick={() => setEditingField("phone")}
                >
                  Request Change
                </button>
              </div>
            )}
          </div>

          {/* Company Name - Requires Admin Approval */}
          <div className="form-group sensitive-field">
            <label>Company Name (Approval Required)</label>
            {editingField === "companyName" ? (
              <div className="approval-edit">
                <div className="input-wrapper">
                  <Building2 size={18} />
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) =>
                      handleFieldChange("companyName", e.target.value)
                    }
                  />
                </div>
                <div className="approval-actions">
                  <button
                    className="btn-submit"
                    onClick={() => requestChange("Company Name")}
                  >
                    Request Change
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => setEditingField(null)}
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="input-wrapper disabled-input">
                <Building2 size={18} />
                <input type="text" value={form.companyName} disabled />
                <button
                  className="edit-btn"
                  onClick={() => setEditingField("companyName")}
                >
                  Request Change
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Bio Section */}
        <section className="profile-section">
          <h2>About Your Business</h2>
          <div className="form-group">
            <label>Bio / Description</label>
            <textarea
              value={form.bio}
              onChange={(e) => handleFieldChange("bio", e.target.value)}
              placeholder="Tell customers about your business..."
              rows={4}
              className="bio-textarea"
            />
          </div>
        </section>

        {/* Tax & GST Section */}
        <section className="profile-section tax-section">
          <h2>Tax Information</h2>
          <div className="tax-info">
            <div className="form-group">
              <label>GST Number</label>
              <div className="input-wrapper">
                <FileText size={18} />
                <input
                  type="text"
                  value={form.gstNumber}
                  onChange={(e) =>
                    handleFieldChange("gstNumber", e.target.value)
                  }
                  placeholder="e.g., 27AAPCU9603R1Z5"
                />
              </div>
            </div>

            <div className="form-group">
              <label>TAX Number</label>
              <div className="input-wrapper">
                <FileText size={18} />
                <input
                  type="text"
                  value={form.taxNumber}
                  onChange={(e) =>
                    handleFieldChange("taxNumber", e.target.value)
                  }
                  placeholder="e.g., AAATL0055K"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Account Status */}
        <section className="profile-section status-section">
          <h2>Account Status</h2>
          <div className="status-display">
            {vendor.status === "approved" && (
              <div className="status-badge approved">
                <CheckCircle size={20} />
                <div>
                  <strong>Approved</strong>
                  <p>Your account is active and verified</p>
                </div>
              </div>
            )}
            {vendor.status === "requested" && (
              <div className="status-badge pending">
                <AlertCircle size={20} />
                <div>
                  <strong>Pending Approval</strong>
                  <p>Your account is awaiting admin verification</p>
                </div>
              </div>
            )}
            {vendor.status === "rejected" && (
              <div className="status-badge rejected">
                <AlertCircle size={20} />
                <div>
                  <strong>Rejected</strong>
                  <p>Please contact support for more information</p>
                </div>
              </div>
            )}
            {vendor.status === "suspended" && (
              <div className="status-badge suspended">
                <AlertCircle size={20} />
                <div>
                  <strong>Suspended</strong>
                  <p>Your account has been temporarily suspended</p>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: 24, padding: 20, border: '1px solid #e5e7eb', borderRadius: 12, backgroundColor: '#f9fafb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#1d3783' }}>
              <Shield size={20} />
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Partnership Details</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Current Plan</label>
                <div style={{ marginTop: 4, fontSize: 16, fontWeight: 800, color: '#111' }}>
                  {vendor.interestedPlan || "Startup / Promotion Plan"}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Commission Rate</label>
                <div style={{ marginTop: 4, fontSize: 16, fontWeight: 800, color: '#111' }}>
                  {vendor.commissionPercentage || 0}%
                </div>
              </div>
            </div>

            <p style={{ marginTop: 12, fontSize: 12, color: '#666', margin: 0 }}>
              These are your active partnership terms. To request changes, please contact the Make Audit Easy administrator.
            </p>
          </div>
        </section>


        {/* Save Button */}
        <div className="profile-actions">
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            <Save size={18} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
