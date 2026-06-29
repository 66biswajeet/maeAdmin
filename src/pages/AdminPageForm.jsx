import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Globe,
  Clock,
  Layout,
  BookOpen,
  Image as ImageIcon,
  X,
  AlertCircle,
  Link,
  Eye,
} from "lucide-react";
import { createPage, getPage, updatePage } from "../services/api";
import { uploadToCloudinary } from "../services/cloudinaryService";
import RichTextEditor from "../components/RichTextEditor";
import toast from "react-hot-toast";

const CLIENT_URL = import.meta.env.VITE_CLIENT_URL || "http://localhost:3000";

// Auto-generate a URL-safe slug from a title
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminPageForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);

  // Determine page type from route if creating new
  const routeType = location.pathname.includes("create-blog") ? "blog" : "static";
  const pageType = isEdit ? null : routeType; // will be overridden when data loads for edit

  const [form, setForm] = useState({
    title: "",
    slug: "",
    type: pageType || "static",
    content: "",
    featuredImage: "",
    status: "draft",
    metaTitle: "",
    metaDescription: "",
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [featuredImagePreview, setFeaturedImagePreview] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef(null);

  // Load page data for editing
  useEffect(() => {
    if (!isEdit) return;
    const fetchPage = async () => {
      try {
        const res = await getPage(id);
        const p = res.data;
        setForm({
          title: p.title || "",
          slug: p.slug || "",
          type: p.type || "static",
          content: p.content || "",
          featuredImage: p.featuredImage || "",
          status: p.status || "draft",
          metaTitle: p.metaTitle || "",
          metaDescription: p.metaDescription || "",
        });
        if (p.featuredImage) setFeaturedImagePreview(p.featuredImage);
        setSlugManuallyEdited(true); // keep existing slug on edit by default
      } catch {
        toast.error("Failed to load page data");
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [id, isEdit]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleTitleChange = (e) => {
    const title = e.target.value;
    set("title", title);
    if (!slugManuallyEdited) {
      set("slug", slugify(title));
    }
    if (!form.metaTitle || form.metaTitle === form.title) {
      set("metaTitle", title);
    }
  };

  const handleSlugChange = (e) => {
    const raw = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    set("slug", raw);
    setSlugManuallyEdited(true);
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const result = await uploadToCloudinary(file, "pages/covers");
      if (result?.url) {
        set("featuredImage", result.url);
        setFeaturedImagePreview(result.url);
        toast.success("Cover image uploaded");
      }
    } catch {
      toast.error("Failed to upload cover image");
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const removeCover = () => {
    set("featuredImage", "");
    setFeaturedImagePreview("");
  };

  const handleSave = async (publishOverride) => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!form.content || form.content === "<p></p>") {
      toast.error("Content cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        status: publishOverride !== undefined ? publishOverride : form.status,
      };

      if (isEdit) {
        await updatePage(id, payload);
        toast.success("Page updated successfully");
      } else {
        await createPage(payload);
        toast.success("Page created successfully");
      }
      navigate("/settings/pages");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save page");
    } finally {
      setSaving(false);
    }
  };

  const liveUrl = `${CLIENT_URL}/${form.type === "blog" ? "blog" : "page"}/${form.slug || "your-slug"}`;
  const isBlog = form.type === "blog";

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
        <div
          style={{
            width: 36,
            height: 36,
            border: "3px solid var(--border)",
            borderTopColor: "var(--teal)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 12px",
          }}
        />
        Loading…
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* ── Top bar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 22,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => navigate("/settings/pages")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "var(--off-white)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "7px 12px",
              fontSize: 13,
              cursor: "pointer",
              color: "var(--text-secondary)",
            }}
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <div>
            <h2
              style={{
                fontSize: 19,
                fontWeight: 700,
                color: "var(--text-primary)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {isBlog ? <BookOpen size={18} color="#7c3aed" /> : <Layout size={18} color="var(--navy-border)" />}
              {isEdit ? `Edit ${isBlog ? "Blog Post" : "Static Page"}` : `Create ${isBlog ? "Blog Post" : "Static Page"}`}
            </h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              {isEdit ? "Update existing page content and settings" : `Create a new ${isBlog ? "blog post" : "static page"} for your website`}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {/* Save as Draft */}
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "var(--off-white)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "9px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
              color: "var(--text-secondary)",
            }}
          >
            <Clock size={14} />
            Save as Draft
          </button>

          {/* Publish */}
          <button
            onClick={() => handleSave("published")}
            disabled={saving}
            className="btn btn-teal"
            style={{ display: "flex", alignItems: "center", gap: 6, opacity: saving ? 0.7 : 1 }}
          >
            {saving ? (
              <>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                Saving…
              </>
            ) : (
              <>
                <Globe size={14} />
                {form.status === "published" ? "Update & Publish" : "Publish"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── URL Preview banner ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #f0f7ff, #e8f4ff)",
          border: "1px solid #c3dafe",
          borderRadius: "var(--radius)",
          padding: "10px 16px",
          marginBottom: 18,
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <Link size={13} color="#1e3b86" />
        <span style={{ fontSize: 12, color: "#1e3b86", fontWeight: 600 }}>
          Page URL:
        </span>
        <code
          style={{
            fontSize: 12,
            color: "#1e3b86",
            background: "rgba(30,59,134,0.08)",
            padding: "2px 8px",
            borderRadius: 4,
            wordBreak: "break-all",
          }}
        >
          {liveUrl}
        </code>
        {form.status === "published" && (
          <a
            href={liveUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              marginLeft: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              color: "var(--teal-dim)",
              fontWeight: 600,
            }}
          >
            <Eye size={12} />
            View live
          </a>
        )}
      </div>

      {/* ── Main layout: editor + sidebar ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 18, alignItems: "start" }}>
        {/* Left column — content editor */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Title */}
          <div
            style={{
              background: "var(--white)",
              borderRadius: "var(--radius)",
              padding: 20,
              boxShadow: "var(--shadow)",
            }}
          >
            <label style={labelStyle}>Page Title *</label>
            <input
              value={form.title}
              onChange={handleTitleChange}
              placeholder={isBlog ? "My Blog Post Title…" : "About Us, Contact Us, FAQ…"}
              style={inputStyle}
            />

            <label style={{ ...labelStyle, marginTop: 14 }}>
              Slug (URL identifier)
            </label>
            <div style={{ position: "relative" }}>
              <input
                value={form.slug}
                onChange={handleSlugChange}
                placeholder="my-page-slug"
                style={{ ...inputStyle, paddingLeft: 10, fontFamily: "monospace", fontSize: 13 }}
              />
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              Only lowercase letters, numbers, and hyphens. Auto-generated from title.
            </p>
          </div>

          {/* Rich Text Content */}
          <div
            style={{
              background: "var(--white)",
              borderRadius: "var(--radius)",
              padding: 20,
              boxShadow: "var(--shadow)",
            }}
          >
            <label style={labelStyle}>Content *</label>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
              Use the toolbar to add headings (H1–H3), bold, italic, lists, images, links, and tables. All free TipTap features.
            </p>
            <RichTextEditor
              value={form.content}
              onChange={(html) => set("content", html)}
              placeholder="Start writing your content here…"
            />
          </div>

          {/* SEO Settings */}
          <div
            style={{
              background: "var(--white)",
              borderRadius: "var(--radius)",
              padding: 20,
              boxShadow: "var(--shadow)",
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
              <Globe size={15} color="var(--teal)" />
              SEO Settings
            </h3>
            <label style={labelStyle}>Meta Title</label>
            <input
              value={form.metaTitle}
              onChange={(e) => set("metaTitle", e.target.value)}
              placeholder="SEO title (defaults to page title)"
              style={inputStyle}
              maxLength={70}
            />
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
              {form.metaTitle.length}/70 characters
            </p>

            <label style={{ ...labelStyle, marginTop: 14 }}>Meta Description</label>
            <textarea
              value={form.metaDescription}
              onChange={(e) => set("metaDescription", e.target.value)}
              placeholder="Brief description for search engines…"
              rows={3}
              maxLength={160}
              style={{ ...inputStyle, resize: "vertical", minHeight: 72 }}
            />
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
              {form.metaDescription.length}/160 characters
            </p>
          </div>
        </div>

        {/* Right column — sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Status card */}
          <div
            style={{
              background: "var(--white)",
              borderRadius: "var(--radius)",
              padding: 18,
              boxShadow: "var(--shadow)",
            }}
          >
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>
              Publication
            </h3>
            <div style={{ display: "flex", gap: 8 }}>
              {["draft", "published"].map((s) => (
                <button
                  key={s}
                  onClick={() => set("status", s)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: "var(--radius)",
                    border: form.status === s
                      ? `2px solid ${s === "published" ? "var(--teal)" : "var(--navy-border)"}`
                      : "2px solid var(--border)",
                    background: form.status === s
                      ? s === "published" ? "var(--teal-bg)" : "rgba(30,59,134,0.07)"
                      : "transparent",
                    color: form.status === s
                      ? s === "published" ? "var(--teal-dim)" : "var(--navy-border)"
                      : "var(--text-muted)",
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                    textTransform: "capitalize",
                    transition: "all 0.15s",
                  }}
                >
                  {s === "published" ? <Globe size={12} /> : <Clock size={12} />}
                  {s}
                </button>
              ))}
            </div>

            {form.status === "published" && (
              <div
                style={{
                  marginTop: 10,
                  padding: "8px 10px",
                  background: "var(--teal-bg)",
                  borderRadius: 6,
                  fontSize: 11,
                  color: "var(--teal-dim)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 6,
                }}
              >
                <Globe size={11} style={{ marginTop: 1, flexShrink: 0 }} />
                Page will be visible to website visitors after saving.
              </div>
            )}
          </div>

          {/* Page type (read-only display) */}
          <div
            style={{
              background: "var(--white)",
              borderRadius: "var(--radius)",
              padding: 18,
              boxShadow: "var(--shadow)",
            }}
          >
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
              Page Type
            </h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: "var(--radius)",
                background: isBlog ? "rgba(124,58,237,0.07)" : "rgba(30,59,134,0.07)",
                border: `1px solid ${isBlog ? "rgba(124,58,237,0.2)" : "rgba(30,59,134,0.15)"}`,
              }}
            >
              {isBlog ? <BookOpen size={15} color="#7c3aed" /> : <Layout size={15} color="var(--navy-border)" />}
              <span style={{ fontSize: 13, fontWeight: 600, color: isBlog ? "#7c3aed" : "var(--navy-border)" }}>
                {isBlog ? "Blog Post" : "Static Page"}
              </span>
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
              URL prefix: <code style={{ fontSize: 11 }}>/{isBlog ? "blog" : "page"}/</code>
            </p>
          </div>

          {/* Featured Image */}
          <div
            style={{
              background: "var(--white)",
              borderRadius: "var(--radius)",
              padding: 18,
              boxShadow: "var(--shadow)",
            }}
          >
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
              Featured Image
            </h3>

            {featuredImagePreview ? (
              <div style={{ position: "relative" }}>
                <img
                  src={featuredImagePreview}
                  alt="Cover"
                  style={{
                    width: "100%",
                    height: 160,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                  }}
                />
                <button
                  onClick={removeCover}
                  title="Remove image"
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => !uploadingCover && coverInputRef.current?.click()}
                style={{
                  border: "2px dashed var(--border)",
                  borderRadius: 8,
                  padding: "28px 16px",
                  textAlign: "center",
                  cursor: uploadingCover ? "not-allowed" : "pointer",
                  transition: "border-color 0.15s",
                  opacity: uploadingCover ? 0.7 : 1,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--teal)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              >
                {uploadingCover ? (
                  <>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        border: "2px solid var(--border)",
                        borderTopColor: "var(--teal)",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                        margin: "0 auto 8px",
                      }}
                    />
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Uploading…</p>
                  </>
                ) : (
                  <>
                    <ImageIcon size={24} style={{ color: "var(--text-muted)", marginBottom: 8 }} />
                    <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
                      Click to upload featured image
                      <br />
                      <span style={{ fontSize: 11 }}>(JPG, PNG, WebP)</span>
                    </p>
                  </>
                )}
              </div>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleCoverUpload}
            />
          </div>

          {/* Quick tips */}
          <div
            style={{
              background: "linear-gradient(135deg, #f0fdf9, #e6fdf5)",
              border: "1px solid rgba(0,201,167,0.2)",
              borderRadius: "var(--radius)",
              padding: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <AlertCircle size={13} color="var(--teal-dim)" />
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--teal-dim)" }}>Tips</span>
            </div>
            <ul style={{ fontSize: 11, color: "#047857", lineHeight: 1.8, paddingLeft: 14 }}>
              <li>Use H1 for the main heading, H2 for sections</li>
              <li>Images in the editor are uploaded to Cloudinary</li>
              <li>Slug stays fixed once published to preserve links</li>
              <li>Set meta description for better SEO ranking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--text-secondary)",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  fontSize: 14,
  outline: "none",
  transition: "border-color 0.15s",
  color: "var(--text-primary)",
  background: "#fff",
};
