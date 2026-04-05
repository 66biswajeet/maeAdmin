import { useState, useRef } from "react";
import { LayoutTemplate, ImageIcon } from "lucide-react";
import Toggle from "../ui/Toggle";
import { updateMeta, toggleSection } from "../../services/api";
import toast from "react-hot-toast";

export default function MetaSettings({ data, onChange }) {
  const [form, setForm] = useState({
    title: data?.title || "",
    description: data?.description || "",
    keywords: data?.keywords || "",
    canonicalUrl: data?.canonicalUrl || "",
    robots: data?.robots || "index,follow",
    googleVerification: data?.googleVerification || "",
    jsonLd: data?.jsonLd || "",
    ogTitle: data?.og?.title || "",
    ogDescription: data?.og?.description || "",
    ogType: data?.og?.type || "website",
    twitterCard: data?.twitter?.card || "summary_large_image",
    twitterSite: data?.twitter?.site || "",
  });

  const [ogFile, setOgFile] = useState(null);
  const [ogPreview, setOgPreview] = useState(data?.og?.imageUrl || null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleOgChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setOgFile(f);
    setOgPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (ogFile) fd.append("ogImage", ogFile);
      const res = await updateMeta(fd);
      onChange(res.data.meta);
      toast.success("Meta settings saved");
    } catch (err) {
      toast.error("Failed to save meta settings");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (v) => {
    // Meta section visibility managed via toggleSection API
    try {
      await toggleSection({ section: "meta", visible: v });
    } catch {}
  };

  return (
    <div className="sc">
      <div className="sc-head">
        <h3>
          <LayoutTemplate /> Meta Settings
        </h3>
        <Toggle
          checked={data?.sectionVisible ?? true}
          onChange={handleToggle}
          label="Section Visible"
        />
      </div>
      <div className="sc-body gap16">
        <div className="fg">
          <label className="fl">Site Title</label>
          <input
            className="fi"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Site title for <title> tag"
          />
        </div>

        <div className="fg">
          <label className="fl">Meta Description</label>
          <textarea
            className="fta"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Meta description"
          />
        </div>

        <div className="g2">
          <div className="fg">
            <label className="fl">Meta Keywords (comma separated)</label>
            <input
              className="fi"
              value={form.keywords}
              onChange={(e) => set("keywords", e.target.value)}
              placeholder="keyword1, keyword2"
            />
          </div>
          <div className="fg">
            <label className="fl">Canonical URL</label>
            <input
              className="fi"
              value={form.canonicalUrl}
              onChange={(e) => set("canonicalUrl", e.target.value)}
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div className="g2">
          <div className="fg">
            <label className="fl">Robots</label>
            <input
              className="fi"
              value={form.robots}
              onChange={(e) => set("robots", e.target.value)}
              placeholder="index,follow"
            />
          </div>
          <div className="fg">
            <label className="fl">Google Site Verification</label>
            <input
              className="fi"
              value={form.googleVerification}
              onChange={(e) => set("googleVerification", e.target.value)}
              placeholder="google-site-verification token"
            />
          </div>
        </div>

        <div className="fg">
          <label className="fl">JSON-LD (structured data)</label>
          <textarea
            className="fta"
            value={form.jsonLd}
            onChange={(e) => set("jsonLd", e.target.value)}
            placeholder="Paste JSON-LD here"
            style={{ minHeight: 120 }}
          />
        </div>

        <hr />

        <div className="fg">
          <label className="fl">OG Title</label>
          <input
            className="fi"
            value={form.ogTitle}
            onChange={(e) => set("ogTitle", e.target.value)}
          />
        </div>
        <div className="fg">
          <label className="fl">OG Description</label>
          <textarea
            className="fta"
            value={form.ogDescription}
            onChange={(e) => set("ogDescription", e.target.value)}
          />
        </div>

        <div className="g2">
          <div className="fg">
            <label className="fl">OG Type</label>
            <input
              className="fi"
              value={form.ogType}
              onChange={(e) => set("ogType", e.target.value)}
            />
          </div>
          <div className="fg">
            <label className="fl">OG Image</label>
            <div className="uz" onClick={() => fileRef.current.click()}>
              {ogPreview ? (
                <img
                  src={ogPreview}
                  alt="og"
                  style={{ maxHeight: 120, objectFit: "cover" }}
                />
              ) : (
                <>
                  <ImageIcon />
                  <span className="uz-lbl">Upload OG Image</span>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleOgChange}
            />
          </div>
        </div>

        <div className="g2">
          <div className="fg">
            <label className="fl">Twitter Card</label>
            <input
              className="fi"
              value={form.twitterCard}
              onChange={(e) => set("twitterCard", e.target.value)}
            />
          </div>
          <div className="fg">
            <label className="fl">Twitter Site (@handle)</label>
            <input
              className="fi"
              value={form.twitterSite}
              onChange={(e) => set("twitterSite", e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            className="btn btn-teal btn-sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Meta"}
          </button>
        </div>
      </div>
    </div>
  );
}
