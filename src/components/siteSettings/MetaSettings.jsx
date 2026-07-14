import { useState, useEffect, useRef } from "react";
import { LayoutTemplate, ImageIcon, FileCode2, Plus, Trash2, Download, Save } from "lucide-react";
import Toggle from "../ui/Toggle";
import { updateMeta, toggleSection, updateSitemap } from "../../services/api";
import toast from "react-hot-toast";

/* ─── Sitemap helpers ───────────────────────────────────────────── */
const STORAGE_KEY = "mae_sitemap_entries";

const defaultEntry = () => ({
  id: crypto.randomUUID(),
  loc: "",
  lastmod: new Date().toISOString().slice(0, 10),
  changefreq: "weekly",
  priority: "0.8",
});

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function buildXml(entries) {
  const rows = entries
    .filter((e) => e.loc.trim())
    .map(
      (e) =>
        `  <url>\n    <loc>${e.loc.trim()}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>`;
}

function downloadXml(xml) {
  const blob = new Blob([xml], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sitemap.xml";
  a.click();
  URL.revokeObjectURL(url);
}

function SitemapGenerator({ initialEntries = [], onSaveSuccess }) {
  const [entries, setEntries] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialEntries && initialEntries.length > 0) {
      setEntries(initialEntries.map((e) => ({ id: e._id || e.id, ...e })));
    } else {
      const local = loadEntries();
      if (local && local.length > 0) {
        setEntries(local);
      } else {
        setEntries([]);
      }
    }
  }, [initialEntries]);

  const update = (id, field, value) => {
    const next = entries.map((e) => (e.id === id ? { ...e, [field]: value } : e));
    setEntries(next);
  };

  const add = () => {
    const next = [...entries, defaultEntry()];
    setEntries(next);
  };

  const remove = (id) => {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
  };

  const handleDownload = () => {
    const valid = entries.filter((e) => e.loc.trim());
    if (valid.length === 0) {
      toast.error("Add at least one URL before downloading.");
      return;
    }
    downloadXml(buildXml(valid));
    toast.success(`sitemap.xml downloaded with ${valid.length} URL${valid.length !== 1 ? "s" : ""}`);
  };

  const handleSave = async () => {
    const valid = entries.filter((e) => e.loc.trim());
    if (valid.length === 0) {
      toast.error("Add at least one URL before saving.");
      return;
    }
    setSaving(true);
    try {
      const payload = valid.map(({ id, _id, ...rest }) => ({
        ...rest,
        _id: _id || (id.length === 36 ? undefined : id),
      }));

      const res = await updateSitemap(payload);
      const updatedSitemap = res.data.sitemap || [];
      
      setEntries(updatedSitemap.map((e) => ({ id: e._id, ...e })));
      localStorage.removeItem(STORAGE_KEY);
      
      if (onSaveSuccess) {
        onSaveSuccess(updatedSitemap);
      }
      toast.success("Sitemap saved and published successfully");
    } catch (err) {
      toast.error("Failed to save and publish sitemap");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sc" style={{ marginTop: 24 }}>
      <div className="sc-head">
        <h3>
          <FileCode2 /> Sitemap Generator
        </h3>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>
          Google Search Console compatible
        </span>
      </div>

      <div className="sc-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Info banner */}
        <div style={{
          background: "rgba(0,201,167,0.08)",
          border: "1px solid rgba(0,201,167,0.2)",
          borderRadius: 6,
          padding: "10px 14px",
          fontSize: 12,
          color: "var(--text-secondary)",
          lineHeight: 1.6,
        }}>
          Add the URLs you want Google to index. Once saved, your sitemap is published live at{" "}
          <a
            href="https://makeauditeasy.com/sitemap.xml"
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--teal)", fontWeight: 600, textDecoration: "underline" }}
          >
            https://makeauditeasy.com/sitemap.xml
          </a>
          . You can submit this link directly to{" "}
          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--teal)", fontWeight: 600 }}
          >
            Google Search Console
          </a>
          .
        </div>

        {/* URL table */}
        {entries.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
            }}>
              <thead>
                <tr style={{ background: "var(--off-white)" }}>
                  {["Page URL", "Last Modified", "Change Freq", "Priority", ""].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "8px 10px",
                        textAlign: "left",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.6px",
                        textTransform: "uppercase",
                        color: "var(--text-secondary)",
                        borderBottom: "1px solid var(--border)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => (
                  <tr
                    key={entry.id}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      background: idx % 2 === 0 ? "var(--white)" : "var(--off-white)",
                      transition: "background 0.1s",
                    }}
                  >
                    {/* URL */}
                    <td style={{ padding: "7px 8px", minWidth: 280 }}>
                      <input
                        className="fi"
                        value={entry.loc}
                        onChange={(e) => update(entry.id, "loc", e.target.value)}
                        placeholder="https://makeauditeasy.com/page"
                        style={{ fontSize: 12 }}
                      />
                    </td>
                    {/* Last modified */}
                    <td style={{ padding: "7px 8px", minWidth: 140 }}>
                      <input
                        className="fi"
                        type="date"
                        value={entry.lastmod}
                        onChange={(e) => update(entry.id, "lastmod", e.target.value)}
                        style={{ fontSize: 12 }}
                      />
                    </td>
                    {/* Change freq */}
                    <td style={{ padding: "7px 8px", minWidth: 130 }}>
                      <select
                        className="fi"
                        value={entry.changefreq}
                        onChange={(e) => update(entry.id, "changefreq", e.target.value)}
                        style={{ fontSize: 12 }}
                      >
                        {["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"].map(
                          (f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          )
                        )}
                      </select>
                    </td>
                    {/* Priority */}
                    <td style={{ padding: "7px 8px", minWidth: 90 }}>
                      <select
                        className="fi"
                        value={entry.priority}
                        onChange={(e) => update(entry.id, "priority", e.target.value)}
                        style={{ fontSize: 12 }}
                      >
                        {["1.0", "0.9", "0.8", "0.7", "0.6", "0.5", "0.4", "0.3", "0.2", "0.1"].map(
                          (p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          )
                        )}
                      </select>
                    </td>
                    {/* Remove */}
                    <td style={{ padding: "7px 8px" }}>
                      <button
                        onClick={() => remove(entry.id)}
                        title="Remove URL"
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          padding: 4,
                          borderRadius: 4,
                          display: "flex",
                          alignItems: "center",
                          transition: "color 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{
            border: "2px dashed var(--border)",
            borderRadius: 8,
            padding: "28px 20px",
            textAlign: "center",
            color: "var(--text-muted)",
          }}>
            <FileCode2 size={28} style={{ margin: "0 auto 8px", display: "block", opacity: 0.4 }} />
            <p style={{ fontSize: 13, fontWeight: 500 }}>No URLs added yet</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>
              Click <strong>Add URL</strong> to start building your sitemap.
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={add}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              background: "none",
              border: "1px dashed var(--teal)",
              borderRadius: 6,
              color: "var(--teal)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--teal-bg)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <Plus size={14} /> Add URL
          </button>

          <button
            onClick={handleDownload}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 16px",
              background: "none",
              border: "1px solid var(--teal)",
              borderRadius: 6,
              color: "var(--teal)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--teal-bg)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <Download size={14} /> Download sitemap.xml
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 16px",
              background: "var(--teal)",
              border: "none",
              borderRadius: 6,
              color: "white",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s",
              opacity: saving ? 0.7 : 1,
            }}
            onMouseEnter={(e) => !saving && (e.currentTarget.style.background = "var(--teal-dim)")}
            onMouseLeave={(e) => !saving && (e.currentTarget.style.background = "var(--teal)")}
          >
            <Save size={14} /> {saving ? "Saving..." : "Save & Publish sitemap.xml"}
          </button>

          {entries.length > 0 && (
            <span style={{ fontSize: 11.5, color: "var(--text-muted)", marginLeft: "auto" }}>
              {entries.filter((e) => e.loc.trim()).length} URL
              {entries.filter((e) => e.loc.trim()).length !== 1 ? "s" : ""} ready to export
            </span>
          )}
        </div>

        {/* XML preview */}
        {entries.some((e) => e.loc.trim()) && (
          <details style={{ marginTop: 4 }}>
            <summary style={{
              fontSize: 11.5,
              fontWeight: 600,
              color: "var(--text-secondary)",
              cursor: "pointer",
              userSelect: "none",
              letterSpacing: "0.3px",
            }}>
              Preview XML
            </summary>
            <pre style={{
              marginTop: 10,
              background: "#0f1b2d",
              color: "#4ade80",
              borderRadius: 6,
              padding: "14px 16px",
              fontSize: 11.5,
              lineHeight: 1.7,
              overflow: "auto",
              maxHeight: 300,
              fontFamily: "'DM Mono', 'Fira Code', monospace",
            }}>
              {buildXml(entries)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

export default function MetaSettings({ data, sitemap, onChange, onSitemapChange }) {
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
    <>
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
    <SitemapGenerator initialEntries={sitemap} onSaveSuccess={onSitemapChange} />
  </>
  );
}
