import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Search,
  Globe,
  Layout,
  CheckCircle,
  Clock,
  Copy,
} from "lucide-react";
import {
  getPages,
  deletePage,
  togglePublishPage,
} from "../services/api";
import toast from "react-hot-toast";

const CLIENT_URL = import.meta.env.VITE_CLIENT_URL || "http://localhost:3000";

function getPageUrl(page) {
  const prefix = page.type === "blog" ? "blog" : "page";
  return `${CLIENT_URL}/${prefix}/${page.slug}`;
}

function StatusBadge({ status }) {
  const isPublished = status === "published";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        background: isPublished ? "rgba(0,201,167,0.12)" : "rgba(139,149,160,0.12)",
        color: isPublished ? "var(--teal-dim)" : "var(--text-muted)",
        border: `1px solid ${isPublished ? "rgba(0,201,167,0.3)" : "rgba(139,149,160,0.3)"}`,
      }}
    >
      {isPublished ? <CheckCircle size={10} /> : <Clock size={10} />}
      {isPublished ? "Published" : "Draft"}
    </span>
  );
}

function TypeBadge({ type }) {
  const isBlog = type === "blog";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        background: isBlog ? "rgba(124,58,237,0.1)" : "rgba(30,59,134,0.1)",
        color: isBlog ? "#7c3aed" : "var(--navy-border)",
        border: `1px solid ${isBlog ? "rgba(124,58,237,0.25)" : "rgba(30,59,134,0.2)"}`,
      }}
    >
      {isBlog ? <BookOpen size={10} /> : <Layout size={10} />}
      {isBlog ? "Blog Post" : "Static Page"}
    </span>
  );
}

export default function AdminPagesPage() {
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (typeFilter) params.type = typeFilter;
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await getPages(params);
      setPages(res.data);
    } catch {
      toast.error("Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [typeFilter, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const handleDelete = async (page) => {
    if (!window.confirm(`Delete "${page.title}"? This cannot be undone.`)) return;
    try {
      await deletePage(page._id);
      toast.success("Page deleted");
      load();
    } catch {
      toast.error("Failed to delete page");
    }
  };

  const handleTogglePublish = async (page) => {
    try {
      await togglePublishPage(page._id);
      toast.success(
        page.status === "published"
          ? `"${page.title}" unpublished`
          : `"${page.title}" published`
      );
      load();
    } catch {
      toast.error("Failed to update publish status");
    }
  };

  const copyLink = (page) => {
    navigator.clipboard.writeText(getPageUrl(page));
    toast.success("Link copied to clipboard!");
  };

  // Stats
  const totalStatic = pages.filter((p) => p.type === "static").length;
  const totalBlog = pages.filter((p) => p.type === "blog").length;
  const totalPublished = pages.filter((p) => p.status === "published").length;

  const stats = [
    { label: "Total Pages", value: pages.length, color: "var(--navy-border)", icon: FileText },
    { label: "Static Pages", value: totalStatic, color: "#1e3b86", icon: Layout },
    { label: "Blog Posts", value: totalBlog, color: "#7c3aed", icon: BookOpen },
    { label: "Published", value: totalPublished, color: "var(--teal)", icon: Globe },
  ];

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>
            Pages
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
            Create and manage static pages and blog posts
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn btn-teal"
            onClick={() => navigate("/settings/pages/create-static")}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Plus size={14} />
            Create Static Page
          </button>
          <button
            className="btn"
            onClick={() => navigate("/settings/pages/create-blog")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius)",
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Plus size={14} />
            Create Blog Post
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 22,
        }}
      >
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              style={{
                background: "var(--white)",
                borderRadius: "var(--radius)",
                padding: "14px 18px",
                boxShadow: "var(--shadow)",
                borderLeft: `3px solid ${s.color}`,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: `${s.color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={16} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Filters ── */}
      <div
        style={{
          background: "var(--white)",
          borderRadius: "var(--radius)",
          padding: "14px 18px",
          boxShadow: "var(--shadow)",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <form onSubmit={handleSearch} style={{ flex: 1, minWidth: 200, display: "flex", gap: 8 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or slug…"
              style={{
                width: "100%",
                padding: "8px 10px 8px 32px",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                fontSize: 13,
                outline: "none",
              }}
            />
          </div>
          <button type="submit" className="btn btn-teal" style={{ padding: "8px 14px" }}>
            Search
          </button>
        </form>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            fontSize: 13,
            outline: "none",
            minWidth: 130,
          }}
        >
          <option value="">All Types</option>
          <option value="static">Static Pages</option>
          <option value="blog">Blog Posts</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            fontSize: 13,
            outline: "none",
            minWidth: 130,
          }}
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div
        style={{
          background: "var(--white)",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow)",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
            <div
              style={{
                width: 32,
                height: 32,
                border: "3px solid var(--border)",
                borderTopColor: "var(--teal)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 12px",
              }}
            />
            Loading pages…
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : pages.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <FileText size={40} style={{ color: "var(--text-muted)", marginBottom: 12 }} />
            <p style={{ fontWeight: 600, color: "var(--text-primary)" }}>No pages found</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
              Create your first page using the buttons above.
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "#fafbfd" }}>
                {["Title", "Slug / URL", "Type", "Status", "Created", "Actions"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 16px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      textAlign: "left",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pages.map((page, i) => (
                <tr
                  key={page._id}
                  style={{
                    borderBottom: i < pages.length - 1 ? "1px solid var(--border)" : "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fbff")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Title */}
                  <td style={{ padding: "12px 16px", maxWidth: 220 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>
                      {page.title}
                    </div>
                    {page.metaTitle && page.metaTitle !== page.title && (
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        SEO: {page.metaTitle}
                      </div>
                    )}
                  </td>

                  {/* Slug / URL */}
                  <td style={{ padding: "12px 16px", maxWidth: 260 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <code
                        style={{
                          fontSize: 11,
                          background: "var(--off-white)",
                          padding: "2px 6px",
                          borderRadius: 4,
                          color: "var(--navy-border)",
                          wordBreak: "break-all",
                        }}
                      >
                        /{page.type === "blog" ? "blog" : "page"}/{page.slug}
                      </code>
                      <button
                        onClick={() => copyLink(page)}
                        title="Copy full URL"
                        style={{
                          background: "none",
                          border: "none",
                          padding: 2,
                          cursor: "pointer",
                          color: "var(--text-muted)",
                          flexShrink: 0,
                        }}
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </td>

                  {/* Type */}
                  <td style={{ padding: "12px 16px" }}>
                    <TypeBadge type={page.type} />
                  </td>

                  {/* Status */}
                  <td style={{ padding: "12px 16px" }}>
                    <StatusBadge status={page.status} />
                  </td>

                  {/* Created */}
                  <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontSize: 12, whiteSpace: "nowrap" }}>
                    {new Date(page.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {/* Edit */}
                      <button
                        onClick={() => navigate(`/settings/pages/edit/${page._id}`)}
                        title="Edit"
                        style={actionBtnStyle("#1e3b86")}
                      >
                        <Pencil size={13} />
                      </button>

                      {/* Toggle publish */}
                      <button
                        onClick={() => handleTogglePublish(page)}
                        title={page.status === "published" ? "Unpublish" : "Publish"}
                        style={actionBtnStyle(page.status === "published" ? "#f97316" : "var(--teal)")}
                      >
                        {page.status === "published" ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>

                      {/* Open in new tab (only if published) */}
                      {page.status === "published" && (
                        <a
                          href={getPageUrl(page)}
                          target="_blank"
                          rel="noreferrer"
                          title="View live page"
                          style={{ ...actionBtnStyle("var(--teal-dim)"), display: "inline-flex" }}
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(page)}
                        title="Delete"
                        style={actionBtnStyle("var(--red)")}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function actionBtnStyle(color) {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    borderRadius: 6,
    border: `1px solid ${color}22`,
    background: `${color}12`,
    color: color,
    cursor: "pointer",
    transition: "all 0.15s",
    textDecoration: "none",
  };
}
