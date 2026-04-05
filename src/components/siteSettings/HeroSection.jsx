// import { useState } from 'react';
// import { LayoutTemplate, Plus, X } from 'lucide-react';
// import Toggle from '../ui/Toggle';
// import Modal from '../ui/Modal';
// import { updateHero, addCategoryLink, deleteCategoryLink, toggleSection } from '../../services/api';
// import toast from 'react-hot-toast';

// export default function HeroSection({ data, onChange }) {
//   const [form, setForm] = useState({
//     marketplaceMainTitle: data?.marketplaceMainTitle || '',
//     heroSubText: data?.heroSubText || '',
//     sectionVisible: data?.sectionVisible ?? true,
//   });
//   const [links, setLinks] = useState(data?.categoryLinks || []);
//   const [showModal, setShowModal] = useState(false);
//   const [newLink, setNewLink] = useState({ label: '', slug: '' });

//   const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

//   const handleSaveHero = async () => {
//     try {
//       const res = await updateHero(form);
//       onChange(res.data.hero);
//       toast.success('Hero section saved!');
//     } catch { toast.error('Failed to save hero'); }
//   };

//   const handleToggle = async (v) => {
//     set('sectionVisible', v);
//     try { await toggleSection({ section: 'hero', visible: v }); } catch {}
//   };

//   const handleAddLink = async () => {
//     if (!newLink.label || !newLink.slug) return;
//     try {
//       const res = await addCategoryLink(newLink);
//       setLinks(res.data.categoryLinks);
//       setNewLink({ label: '', slug: '' });
//       setShowModal(false);
//       toast.success('Category link added!');
//     } catch { toast.error('Failed to add category link'); }
//   };

//   const handleDeleteLink = async (linkId) => {
//     try {
//       const res = await deleteCategoryLink(linkId);
//       setLinks(res.data.categoryLinks);
//       toast.success('Link removed');
//     } catch { toast.error('Failed to delete link'); }
//   };

//   return (
//     <div className="sc">
//       <div className="sc-head">
//         <h3><LayoutTemplate /> Hero &amp; Categories</h3>
//         <Toggle checked={form.sectionVisible} onChange={handleToggle} label="Section Visible" />
//       </div>
//       <div className="sc-body gap16">
//         <div className="g2">
//           <div className="fg">
//             <label className="fl">Marketplace Main Title</label>
//             <input className="fi" value={form.marketplaceMainTitle} onChange={e => set('marketplaceMainTitle', e.target.value)} placeholder="The Global Hub for Compliance & Audits" />
//           </div>
//           <div className="fg">
//             <label className="fl">Hero Sub-Text</label>
//             <input className="fi" value={form.heroSubText} onChange={e => set('heroSubText', e.target.value)} placeholder="Streamline your regulatory requirements..." />
//           </div>
//         </div>

//         <div>
//           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
//             <span className="fl">Compliance Category Link Manager</span>
//             <button className="add-cat" onClick={() => setShowModal(true)}>
//               <Plus /> Add Category
//             </button>
//           </div>
//           <div className="cat-grid">
//             {links.map((link) => (
//               <div key={link._id} className="cat-pill">
//                 <span>{link.label}</span>
//                 <button className="cat-del" onClick={() => handleDeleteLink(link._id)}>
//                   <X />
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
//           <button className="btn btn-teal btn-sm" onClick={handleSaveHero}>Save Hero</button>
//         </div>
//       </div>

//       {showModal && (
//         <Modal
//           title="Add Category Link"
//           onClose={() => setShowModal(false)}
//           actions={
//             <>
//               <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
//               <button className="btn btn-teal btn-sm" onClick={handleAddLink}>Add</button>
//             </>
//           }
//         >
//           <div className="gap12">
//             <div className="fg">
//               <label className="fl">Label</label>
//               <input className="fi" value={newLink.label} onChange={e => setNewLink(p => ({ ...p, label: e.target.value }))} placeholder="e.g. SOC 2 Type II" />
//             </div>
//             <div className="fg">
//               <label className="fl">Slug</label>
//               <input className="fi" value={newLink.slug} onChange={e => setNewLink(p => ({ ...p, slug: e.target.value }))} placeholder="e.g. soc-2-type-ii" />
//             </div>
//           </div>
//         </Modal>
//       )}
//     </div>
//   );
// }

import { useState, useRef } from "react";
import {
  LayoutTemplate,
  Plus,
  X,
  Pencil,
  Trash2,
  ImageIcon,
  Tag,
} from "lucide-react";
import Toggle from "../ui/Toggle";
import Modal from "../ui/Modal";
import {
  updateHero,
  addCategoryLink,
  deleteCategoryLink,
  toggleSection,
  addHeroPromo,
  updateHeroPromo,
  deleteHeroPromo,
} from "../../services/api";
import toast from "react-hot-toast";

const EMPTY_PROMO = {
  primaryDiscountLabel: "",
  bannerTitle: "",
  bannerDescription: "",
  benefits: "", // comma-separated in the form, split on save
  ctaPrimaryText: "CLAIM DISCOUNT NOW",
  ctaPrimaryLink: "#",
  bgGradient: "linear-gradient(to bottom, #0a2540, #1a4a80)",
  isActive: true,
};

export default function HeroSection({
  data,
  heroScenePromos = [],
  onChange,
  onPromosChange,
}) {
  // ── Hero text form ─────────────────────────────────────────────────────
  const [form, setForm] = useState({
    marketplaceMainTitle: data?.marketplaceMainTitle || "",
    heroSubText: data?.heroSubText || "",
    sectionVisible: data?.sectionVisible ?? true,
  });

  // ── Category links ─────────────────────────────────────────────────────
  const [links, setLinks] = useState(data?.categoryLinks || []);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [newLink, setNewLink] = useState({ label: "", slug: "" });

  // ── Hero Scene Promos ──────────────────────────────────────────────────
  const [promos, setPromos] = useState(heroScenePromos);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoForm, setPromoForm] = useState(EMPTY_PROMO);
  const [bgFile, setBgFile] = useState(null);
  const [bgPreview, setBgPreview] = useState(null);
  const [savingPromo, setSavingPromo] = useState(false);
  const fileRef = useRef();

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setP = (k, v) => setPromoForm((p) => ({ ...p, [k]: v }));

  // ── Hero save ──────────────────────────────────────────────────────────
  const handleSaveHero = async () => {
    try {
      const res = await updateHero(form);
      onChange(res.data.hero);
      toast.success("Hero section saved!");
    } catch {
      toast.error("Failed to save hero");
    }
  };

  const handleToggle = async (v) => {
    set("sectionVisible", v);
    try {
      await toggleSection({ section: "hero", visible: v });
    } catch {}
  };

  // ── Category link handlers ─────────────────────────────────────────────
  const handleAddLink = async () => {
    if (!newLink.label || !newLink.slug) return;
    try {
      const res = await addCategoryLink(newLink);
      setLinks(res.data.categoryLinks);
      setNewLink({ label: "", slug: "" });
      setShowLinkModal(false);
      toast.success("Category link added!");
    } catch {
      toast.error("Failed to add category link");
    }
  };

  const handleDeleteLink = async (linkId) => {
    try {
      const res = await deleteCategoryLink(linkId);
      setLinks(res.data.categoryLinks);
      toast.success("Link removed");
    } catch {
      toast.error("Failed to delete link");
    }
  };

  // ── Promo modal helpers ────────────────────────────────────────────────
  const openAddPromo = () => {
    setEditingPromo(null);
    setPromoForm(EMPTY_PROMO);
    setBgFile(null);
    setBgPreview(null);
    setShowPromoModal(true);
  };

  const openEditPromo = (promo) => {
    setEditingPromo(promo);
    setPromoForm({
      primaryDiscountLabel: promo.primaryDiscountLabel || "",
      bannerTitle: promo.bannerTitle || "",
      bannerDescription: promo.bannerDescription || "",
      benefits: (promo.benefits || []).join(", "),
      ctaPrimaryText: promo.ctaPrimaryText || "CLAIM DISCOUNT NOW",
      ctaPrimaryLink: promo.ctaPrimaryLink || "#",
      bgGradient:
        promo.bgGradient || "linear-gradient(to bottom, #0a2540, #1a4a80)",
      isActive: promo.isActive ?? true,
    });
    setBgFile(null);
    setBgPreview(promo.backgroundImageUrl || null);
    setShowPromoModal(true);
  };

  const handleBgChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBgFile(file);
    setBgPreview(URL.createObjectURL(file));
  };

  // ── Promo save ─────────────────────────────────────────────────────────
  const handleSavePromo = async () => {
    if (!promoForm.bannerTitle.trim()) {
      toast.error("Banner title is required");
      return;
    }
    setSavingPromo(true);
    try {
      const fd = new FormData();
      // benefits: convert comma-separated string → JSON array
      const benefitsArr = promoForm.benefits
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      Object.entries(promoForm).forEach(([k, v]) => {
        if (k === "benefits") return; // handle separately
        fd.append(k, v);
      });
      benefitsArr.forEach((b) => fd.append("benefits[]", b));
      if (bgFile) fd.append("bgImage", bgFile);

      let updated;
      if (editingPromo?._id) {
        const res = await updateHeroPromo(editingPromo._id, fd);
        updated = res.data;
      } else {
        const res = await addHeroPromo(fd);
        updated = res.data;
      }

      setPromos(updated);
      onPromosChange(updated);
      setShowPromoModal(false);
      toast.success(editingPromo ? "Promo card updated!" : "Promo card added!");
    } catch {
      toast.error("Failed to save promo card");
    } finally {
      setSavingPromo(false);
    }
  };

  const handleDeletePromo = async (promoId) => {
    if (!window.confirm("Delete this promo card?")) return;
    try {
      await deleteHeroPromo(promoId);
      const updated = promos.filter((p) => p._id !== promoId);
      setPromos(updated);
      onPromosChange(updated);
      toast.success("Promo card deleted");
    } catch {
      toast.error("Failed to delete promo card");
    }
  };

  return (
    <>
      {/* ── Hero Text & Category Links ──────────────────────────────────── */}
      <div className="sc">
        <div className="sc-head">
          <h3>
            <LayoutTemplate /> Hero &amp; Categories
          </h3>
          <Toggle
            checked={form.sectionVisible}
            onChange={handleToggle}
            label="Section Visible"
          />
        </div>
        <div className="sc-body gap16">
          <div className="g2">
            <div className="fg">
              <label className="fl">Marketplace Main Title</label>
              <input
                className="fi"
                value={form.marketplaceMainTitle}
                onChange={(e) => set("marketplaceMainTitle", e.target.value)}
                placeholder="India's #1 Audit & Compliance Marketplace"
              />
            </div>
            <div className="fg">
              <label className="fl">Hero Sub-Text</label>
              <input
                className="fi"
                value={form.heroSubText}
                onChange={(e) => set("heroSubText", e.target.value)}
                placeholder="Streamline your regulatory requirements..."
              />
            </div>
          </div>

          {/* Category links */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span className="fl">Compliance Category Link Manager</span>
              <button
                className="add-cat"
                onClick={() => setShowLinkModal(true)}
              >
                <Plus size={14} /> Add Category
              </button>
            </div>
            <div className="cat-grid">
              {links.map((link) => (
                <div key={link._id} className="cat-pill">
                  <span>{link.label}</span>
                  <button
                    className="cat-del"
                    onClick={() => handleDeleteLink(link._id)}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {links.length === 0 && (
                <span style={{ opacity: 0.5, fontSize: 13 }}>
                  No category links yet.
                </span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn-teal btn-sm" onClick={handleSaveHero}>
              Save Hero
            </button>
          </div>
        </div>
      </div>

      {/* ── Hero Scene Promos (Right-Side Slider Cards) ─────────────────── */}
      <div className="sc">
        <div className="sc-head">
          <h3>
            <Tag /> Hero Scene Promo Cards
          </h3>
          <button className="btn btn-teal btn-sm" onClick={openAddPromo}>
            <Plus size={14} /> Add Promo Card
          </button>
        </div>
        <div className="sc-body">
          {promos.length === 0 ? (
            <div className="empty-state">
              <Tag size={32} />
              <p>
                No promo cards yet. Click <strong>Add Promo Card</strong> to
                create one.
              </p>
            </div>
          ) : (
            <div className="banner-list">
              {promos.map((promo, idx) => (
                <div key={promo._id} className="banner-row">
                  <div
                    className="banner-thumb"
                    style={
                      promo.backgroundImageUrl
                        ? {
                            backgroundImage: `url(${promo.backgroundImageUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : {
                            background:
                              promo.bgGradient ||
                              "linear-gradient(135deg, #0a2540, #1a4a80)",
                          }
                    }
                  >
                    <span className="banner-idx">#{idx + 1}</span>
                  </div>

                  <div className="banner-info">
                    <span className="banner-title-text">
                      {promo.bannerTitle || (
                        <em style={{ opacity: 0.5 }}>Untitled Promo</em>
                      )}
                    </span>
                    {promo.primaryDiscountLabel && (
                      <span className="badge-teal" style={{ fontSize: 11 }}>
                        {promo.primaryDiscountLabel}
                      </span>
                    )}
                    {promo.benefits?.length > 0 && (
                      <span style={{ fontSize: 12, opacity: 0.6 }}>
                        {promo.benefits.length} benefit(s)
                      </span>
                    )}
                    <span
                      className={`status-dot ${promo.isActive ? "active" : "inactive"}`}
                    >
                      {promo.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="banner-actions">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => openEditPromo(promo)}
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      className="btn btn-red-o btn-sm"
                      onClick={() => handleDeletePromo(promo._id)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Add Category Link Modal ─────────────────────────────────────── */}
      {showLinkModal && (
        <Modal
          title="Add Category Link"
          onClose={() => setShowLinkModal(false)}
          actions={
            <>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowLinkModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-teal btn-sm" onClick={handleAddLink}>
                Add
              </button>
            </>
          }
        >
          <div className="gap12">
            <div className="fg">
              <label className="fl">Label</label>
              <input
                className="fi"
                value={newLink.label}
                onChange={(e) =>
                  setNewLink((p) => ({ ...p, label: e.target.value }))
                }
                placeholder="e.g. SOC 2 Type II"
              />
            </div>
            <div className="fg">
              <label className="fl">Slug</label>
              <input
                className="fi"
                value={newLink.slug}
                onChange={(e) =>
                  setNewLink((p) => ({ ...p, slug: e.target.value }))
                }
                placeholder="e.g. soc-2-type-ii"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* ── Add / Edit Promo Card Modal ─────────────────────────────────── */}
      {showPromoModal && (
        <Modal
          title={editingPromo ? "Edit Promo Card" : "Add Promo Card"}
          onClose={() => setShowPromoModal(false)}
          actions={
            <>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowPromoModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-teal btn-sm"
                onClick={handleSavePromo}
                disabled={savingPromo}
              >
                {savingPromo
                  ? "Saving..."
                  : editingPromo
                    ? "Update Card"
                    : "Add Card"}
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
                  value={promoForm.bannerTitle}
                  onChange={(e) => setP("bannerTitle", e.target.value)}
                  placeholder="RBI IT & Cyber Security"
                />
              </div>
              <div className="fg">
                <label className="fl">Discount Label (Badge)</label>
                <input
                  className="fi"
                  value={promoForm.primaryDiscountLabel}
                  onChange={(e) => setP("primaryDiscountLabel", e.target.value)}
                  placeholder="50% DISCOUNT"
                />
              </div>
            </div>

            <div className="fg">
              <label className="fl">Banner Description</label>
              <textarea
                className="fta"
                value={promoForm.bannerDescription}
                onChange={(e) => setP("bannerDescription", e.target.value)}
                placeholder="Equip your enterprise with..."
              />
            </div>

            <div className="fg">
              <label className="fl">
                Benefits (comma-separated checkmark items)
              </label>
              <textarea
                className="fta"
                style={{ minHeight: 72 }}
                value={promoForm.benefits}
                onChange={(e) => setP("benefits", e.target.value)}
                placeholder="Full gap analysis, Remediation roadmap, Certified auditors"
              />
              <small style={{ opacity: 0.55, fontSize: 12 }}>
                Separate each benefit with a comma. These render as ✓ checkmark
                items on the card.
              </small>
            </div>

            <div className="g2">
              <div className="fg">
                <label className="fl">CTA Button Text</label>
                <input
                  className="fi"
                  value={promoForm.ctaPrimaryText}
                  onChange={(e) => setP("ctaPrimaryText", e.target.value)}
                  placeholder="CLAIM DISCOUNT NOW"
                />
              </div>
              <div className="fg">
                <label className="fl">CTA Button Link</label>
                <input
                  className="fi"
                  value={promoForm.ctaPrimaryLink}
                  onChange={(e) => setP("ctaPrimaryLink", e.target.value)}
                  placeholder="/claim"
                />
              </div>
            </div>

            <div className="g2">
              <div className="fg">
                <label className="fl">Background Gradient CSS (fallback)</label>
                <input
                  className="fi"
                  value={promoForm.bgGradient}
                  onChange={(e) => setP("bgGradient", e.target.value)}
                  placeholder="linear-gradient(to bottom, #0a2540, #1a4a80)"
                />
              </div>
              <div className="fg">
                <label className="fl">Status</label>
                <select
                  className="fi"
                  value={promoForm.isActive ? "true" : "false"}
                  onChange={(e) => setP("isActive", e.target.value === "true")}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            {/* Background image */}
            <div className="fg">
              <label className="fl">
                Background Image (optional, overrides gradient)
              </label>
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
                        position: "relative",
                      }
                    : {}
                }
              >
                {!bgPreview && (
                  <>
                    <ImageIcon />
                    <span>Set Card Background</span>
                    <small>Click to upload. Leave blank to use gradient.</small>
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
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
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
    </>
  );
}
