import { useState, useRef } from "react";
import {
  ImageIcon,
  Layers,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Toggle from "../ui/Toggle";
import Modal from "../ui/Modal";
import {
  addPromoBanner,
  updatePromoBanner,
  deletePromoBanner,
  toggleSection,
} from "../../services/api";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  bannerTitle: "",
  bannerDescription: "",
  primaryDiscountLabel: "",
  secondaryDiscountLabel: "",
  ctaPrimaryText: "Start Compliance Audit",
  ctaPrimaryLink: "#",
  ctaSecondaryText: "View Standards",
  ctaSecondaryLink: "#",
  isActive: true,
};

export default function PromoBannerSection({ data = [], onChange }) {
  const [banners, setBanners] = useState(data);
  const [sectionVisible, setSectionVisible] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null); // null = add mode
  const [form, setForm] = useState(EMPTY_FORM);
  const [bgFile, setBgFile] = useState(null);
  const [bgPreview, setBgPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const openAdd = () => {
    setEditingBanner(null);
    setForm(EMPTY_FORM);
    setBgFile(null);
    setBgPreview(null);
    setShowModal(true);
  };

  const openEdit = (banner) => {
    setEditingBanner(banner);
    setForm({
      bannerTitle: banner.bannerTitle || "",
      bannerDescription: banner.bannerDescription || "",
      primaryDiscountLabel: banner.primaryDiscountLabel || "",
      secondaryDiscountLabel: banner.secondaryDiscountLabel || "",
      ctaPrimaryText: banner.ctaPrimaryText || "Start Compliance Audit",
      ctaPrimaryLink: banner.ctaPrimaryLink || "#",
      ctaSecondaryText: banner.ctaSecondaryText || "View Standards",
      ctaSecondaryLink: banner.ctaSecondaryLink || "#",
      isActive: banner.isActive ?? true,
    });
    setBgFile(null);
    setBgPreview(banner.backgroundImageUrl || null);
    setShowModal(true);
  };

  const handleBgChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBgFile(file);
    setBgPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.bannerTitle.trim()) {
      toast.error("Banner title is required");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (bgFile) fd.append("bgImage", bgFile);

      let updated;
      if (editingBanner?._id) {
        const res = await updatePromoBanner(editingBanner._id, fd);
        updated = res.data;
      } else {
        const res = await addPromoBanner(fd);
        updated = res.data;
      }
      setBanners(updated);
      onChange(updated);
      setShowModal(false);
      toast.success(editingBanner ? "Banner updated!" : "Banner added!");
    } catch {
      toast.error("Failed to save banner");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (bannerId) => {
    if (!window.confirm("Delete this banner?")) return;
    try {
      await deletePromoBanner(bannerId);
      const updated = banners.filter((b) => b._id !== bannerId);
      setBanners(updated);
      onChange(updated);
      toast.success("Banner deleted");
    } catch {
      toast.error("Failed to delete banner");
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      const fd = new FormData();
      fd.append("isActive", !banner.isActive);
      const res = await updatePromoBanner(banner._id, fd);
      setBanners(res.data);
      onChange(res.data);
    } catch {
      toast.error("Failed to update banner");
    }
  };

  return (
    <div className="sc">
      <div className="sc-head">
        <h3>
          <Layers /> Promo Banner Slider (SOC 2 Style)
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Toggle
            checked={sectionVisible}
            onChange={(v) => {
              setSectionVisible(v);
              toggleSection({ section: "promoBanners", visible: v }).catch(
                () => {},
              );
            }}
            label="Section Visible"
          />
          <button className="btn btn-teal btn-sm" onClick={openAdd}>
            <Plus size={14} /> Add Banner
          </button>
        </div>
      </div>

      <div className="sc-body">
        {banners.length === 0 ? (
          <div className="empty-state">
            <Layers size={32} />
            <p>
              No promo banners yet. Click <strong>Add Banner</strong> to create
              one.
            </p>
          </div>
        ) : (
          <div className="banner-list">
            {banners.map((banner, idx) => (
              <div key={banner._id} className="banner-row">
                {/* Background thumbnail */}
                <div
                  className="banner-thumb"
                  style={
                    banner.backgroundImageUrl
                      ? {
                          backgroundImage: `url(${banner.backgroundImageUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : {
                          background:
                            "linear-gradient(135deg, #0a2540, #1a4a80)",
                        }
                  }
                >
                  <span className="banner-idx">#{idx + 1}</span>
                </div>

                {/* Info */}
                <div className="banner-info">
                  <span className="banner-title-text">
                    {banner.bannerTitle || (
                      <em style={{ opacity: 0.5 }}>Untitled Banner</em>
                    )}
                  </span>
                  {banner.primaryDiscountLabel && (
                    <span className="badge-teal" style={{ fontSize: 11 }}>
                      {banner.primaryDiscountLabel}
                    </span>
                  )}
                  <span
                    className={`status-dot ${banner.isActive ? "active" : "inactive"}`}
                  >
                    {banner.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Actions */}
                <div className="banner-actions">
                  <button
                    className="btn btn-ghost btn-sm"
                    title={banner.isActive ? "Deactivate" : "Activate"}
                    onClick={() => handleToggleActive(banner)}
                  >
                    {banner.isActive ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronUp size={14} />
                    )}
                    {banner.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => openEdit(banner)}
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    className="btn btn-red-o btn-sm"
                    onClick={() => handleDelete(banner._id)}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <Modal
          title={editingBanner ? "Edit Promo Banner" : "Add Promo Banner"}
          onClose={() => setShowModal(false)}
          actions={
            <>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-teal btn-sm"
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingBanner
                    ? "Update Banner"
                    : "Add Banner"}
              </button>
            </>
          }
        >
          <div className="gap16">
            <div className="g2">
              <div className="fg">
                <label className="fl">
                  Banner Title <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  className="fi"
                  value={form.bannerTitle}
                  onChange={(e) => set("bannerTitle", e.target.value)}
                  placeholder="Accelerate Your SOC 2 Journey"
                />
              </div>
              <div className="fg">
                <label className="fl">Primary Discount Label</label>
                <input
                  className="fi"
                  value={form.primaryDiscountLabel}
                  onChange={(e) => set("primaryDiscountLabel", e.target.value)}
                  placeholder="60% OFF"
                />
              </div>
            </div>

            <div className="fg">
              <label className="fl">Banner Description</label>
              <textarea
                className="fta"
                value={form.bannerDescription}
                onChange={(e) => set("bannerDescription", e.target.value)}
                placeholder="Get audit-ready in weeks, not months..."
              />
            </div>

            <div className="g2">
              <div className="fg">
                <label className="fl">Secondary Discount Label</label>
                <input
                  className="fi"
                  value={form.secondaryDiscountLabel}
                  onChange={(e) =>
                    set("secondaryDiscountLabel", e.target.value)
                  }
                  placeholder="Flash Sale: 50% Off"
                />
              </div>
              <div className="fg">
                <label className="fl">Active</label>
                <select
                  className="fi"
                  value={form.isActive ? "true" : "false"}
                  onChange={(e) => set("isActive", e.target.value === "true")}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div className="g2">
              <div className="fg">
                <label className="fl">Primary CTA Text</label>
                <input
                  className="fi"
                  value={form.ctaPrimaryText}
                  onChange={(e) => set("ctaPrimaryText", e.target.value)}
                  placeholder="Start Compliance Audit"
                />
              </div>
              <div className="fg">
                <label className="fl">Primary CTA Link</label>
                <input
                  className="fi"
                  value={form.ctaPrimaryLink}
                  onChange={(e) => set("ctaPrimaryLink", e.target.value)}
                  placeholder="/audit"
                />
              </div>
            </div>

            <div className="g2">
              <div className="fg">
                <label className="fl">Secondary CTA Text</label>
                <input
                  className="fi"
                  value={form.ctaSecondaryText}
                  onChange={(e) => set("ctaSecondaryText", e.target.value)}
                  placeholder="View Standards"
                />
              </div>
              <div className="fg">
                <label className="fl">Secondary CTA Link</label>
                <input
                  className="fi"
                  value={form.ctaSecondaryLink}
                  onChange={(e) => set("ctaSecondaryLink", e.target.value)}
                  placeholder="/standards"
                />
              </div>
            </div>

            {/* Background image uploader */}
            <div className="fg">
              <label className="fl">Background Image</label>
              <div
                className="bg-uz"
                onClick={() => fileRef.current.click()}
                style={
                  bgPreview
                    ? {
                        backgroundImage: `url(${bgPreview})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        minHeight: 120,
                      }
                    : {}
                }
              >
                {!bgPreview && (
                  <>
                    <ImageIcon />
                    <span>Set Banner Background</span>
                    <small>Click to upload. High resolution recommended.</small>
                  </>
                )}
                {bgPreview && (
                  <button
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: "rgba(0,0,0,0.6)",
                      border: "none",
                      borderRadius: 4,
                      color: "#fff",
                      cursor: "pointer",
                      padding: "2px 6px",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setBgPreview(null);
                      setBgFile(null);
                    }}
                  >
                    <X size={12} /> Remove
                  </button>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleBgChange}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
