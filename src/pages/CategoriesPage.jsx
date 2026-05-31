import { useEffect, useState, useRef } from "react";
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  ImageIcon,
  X,
  FolderOpen,
  ToggleLeft,
  ToggleRight,
  Search,
  Layers,
} from "lucide-react";
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getEmpanelments,
} from "../services/api";
import { uploadToCloudinary } from "../services/cloudinaryService";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  name: "",
  description: "",
  parent: "",
  order: 0,
  isActive: true,
  empanelments: [],
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [allEmpanelments, setAllEmpanelments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expandedIds, setExpandedIds] = useState({});
  const fileRef = useRef();

  const load = async () => {
    setLoading(true);
    try {
      const [catRes, empRes] = await Promise.all([
        getAdminCategories(),
        getEmpanelments(),
      ]);
      setCategories(catRes.data);
      setAllEmpanelments(empRes.data || []);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // Separate root and children
  const roots = categories.filter((c) => !c.parent);
  const childMap = categories.reduce((acc, c) => {
    if (c.parent) {
      const pid = c.parent._id || c.parent;
      acc[pid] = acc[pid] || [];
      acc[pid].push(c);
    }
    return acc;
  }, {});

  // Helper to build a flat list of all categories with hierarchy indentation, excluding a given sub-tree
  const getCategoryOptions = (currentEditingId) => {
    const list = [];
    
    // Get all descendant IDs of currentEditingId to exclude them from parent options
    const getDescendantsList = (id) => {
      const descendants = [];
      const children = childMap[id] || [];
      for (const child of children) {
        descendants.push(child._id);
        descendants.push(...getDescendantsList(child._id));
      }
      return descendants;
    };
    
    const excludedIds = currentEditingId 
      ? [currentEditingId, ...getDescendantsList(currentEditingId)]
      : [];

    const traverse = (cats, depth) => {
      for (const cat of cats) {
        if (excludedIds.includes(cat._id)) continue;
        list.push({
          _id: cat._id,
          name: cat.name,
          depth: depth,
        });
        const children = childMap[cat._id] || [];
        traverse(children, depth + 1);
      }
    };
    
    traverse(roots, 0);
    return list;
  };

  const categoryOptions = getCategoryOptions(editing?._id);

  const filtered = (list) =>
    search
      ? list.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
      : list;

  const openAdd = (parentId = "") => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, parent: parentId });
    setIconFile(null);
    setIconPreview(null);
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      description: cat.description || "",
      parent: cat.parent?._id || cat.parent || "",
      order: cat.order ?? 0,
      isActive: cat.isActive,
      empanelments: (cat.empanelments || []).map((e) => e._id || e),
    });
    setIconFile(null);
    setIconPreview(cat.iconUrl || null);
    setShowModal(true);
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      let iconUrl = editing?.iconUrl || "";

      if (iconFile) {
        const res = await uploadToCloudinary(iconFile, "categories");
        iconUrl = res.secure_url;
      }

      const payload = {
        name: form.name.trim(),
        description: form.description,
        order: form.order,
        isActive: form.isActive,
        parent: form.parent || null,
        iconUrl,
        empanelments: form.empanelments,
      };

      if (editing) {
        await updateCategory(editing._id, payload);
        toast.success("Category updated!");
      } else {
        await createCategory(payload);
        toast.success("Category created!");
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    const hasChildren = (childMap[cat._id] || []).length > 0;
    if (hasChildren) {
      toast.error("Remove subcategories before deleting this category");
      return;
    }
    if (!window.confirm(`Delete "${cat.name}"?`)) return;
    try {
      await deleteCategory(cat._id);
      toast.success("Category deleted");
      load();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleToggleActive = async (cat) => {
    try {
      await updateCategory(cat._id, { isActive: !cat.isActive });
      toast.success(
        `"${cat.name}" ${!cat.isActive ? "activated" : "deactivated"}`,
      );
      load();
    } catch {
      toast.error("Failed to update");
    }
  };

  const toggleExpand = (id) => setExpandedIds((p) => ({ ...p, [id]: !p[id] }));

  // Root categories (with optional text filter applied)
  const visibleRoots = filtered(roots);

  // Top-level stats
  const totalActive = categories.filter((c) => c.isActive).length;
  const totalInactive = categories.filter((c) => !c.isActive).length;
  const totalSub = categories.filter((c) => !!c.parent).length;

  return (
    <div>
      {/* ── Page header ── */}
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
            Categories
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
            Manage product categories and subcategories
          </p>
        </div>
        <button className="btn btn-teal" onClick={() => openAdd("")}>
          <Plus size={14} /> Add Category
        </button>
      </div>

      {/* ── Stats row ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {[
          {
            label: "Total",
            value: categories.length,
            color: "var(--navy-border)",
          },
          { label: "Active", value: totalActive, color: "var(--teal)" },
          { label: "Inactive", value: totalInactive, color: "var(--red)" },
          { label: "Sub-cats", value: totalSub, color: "#7b61ff" },
        ].map((s) => (
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
              style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Main card ── */}
      <div className="sc">
        <div className="sc-head">
          <h3>
            <Tag /> Category Tree
          </h3>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search
              size={13}
              style={{
                position: "absolute",
                left: 9,
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(255,255,255,0.5)",
              }}
            />
            <input
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 6,
                padding: "5px 10px 5px 28px",
                fontSize: 12,
                color: "#fff",
                outline: "none",
                width: 200,
              }}
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="sc-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="spin-wrap">
              <div className="spin" />
            </div>
          ) : visibleRoots.length === 0 ? (
            <div
              style={{
                padding: 40,
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              <FolderOpen size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p>
                No categories found.{" "}
                <button
                  style={{
                    color: "var(--teal)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                  onClick={() => openAdd("")}
                >
                  Create one
                </button>
              </p>
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
                    "Category",
                    "Slug",
                    "Sub-categories",
                    "Order",
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
                {visibleRoots.map((cat) => (
                  <CategoryRow
                    key={cat._id}
                    cat={cat}
                    children={childMap[cat._id] || []}
                    expandedIds={expandedIds}
                    onToggleExpand={toggleExpand}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                    onAddSub={openAdd}
                    childMap={childMap}
                    depth={0}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div
          className="overlay"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="modal" style={{ maxWidth: 520, width: "95%" }}>
            <h4 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Tag size={16} style={{ color: "var(--teal)" }} />
              {editing
                ? `Edit: ${editing.name}`
                : form.parent
                  ? "Add Sub-category"
                  : "Add Category"}
            </h4>

            <div className="gap16">
              {/* Name + Order */}
              <div className="g2">
                <div className="fg">
                  <label className="fl">
                    Name <span style={{ color: "var(--red)" }}>*</span>
                  </label>
                  <input
                    className="fi"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. ISO 27001"
                    autoFocus
                  />
                </div>
                <div className="fg">
                  <label className="fl">Order</label>
                  <input
                    className="fi"
                    type="number"
                    value={form.order}
                    onChange={(e) => set("order", Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="fg">
                <label className="fl">Description</label>
                <textarea
                  className="fta"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Short description of this category..."
                  style={{ minHeight: 64 }}
                />
              </div>

              {/* Empanelments */}
              <div className="fg">
                <label className="fl">Empanelments</label>
                <div
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    maxHeight: 180,
                    overflowY: "auto",
                    padding: "8px 10px",
                    background: "var(--off-white)",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  {allEmpanelments.length === 0 ? (
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      No empanelments available
                    </span>
                  ) : (
                    allEmpanelments.map((emp) => {
                      const checked = form.empanelments.includes(emp._id);
                      return (
                        <label
                          key={emp._id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 12,
                            cursor: "pointer",
                            padding: "4px 10px",
                            borderRadius: 20,
                            border: `1px solid ${checked ? "var(--teal)" : "var(--border)"}`,
                            background: checked ? "rgba(0,201,167,0.1)" : "#fff",
                            color: checked ? "var(--teal)" : "var(--text-secondary)",
                            fontWeight: checked ? 600 : 400,
                            transition: "all 0.15s",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            style={{ display: "none" }}
                            onChange={() => {
                              const updated = checked
                                ? form.empanelments.filter((id) => id !== emp._id)
                                : [...form.empanelments, emp._id];
                              set("empanelments", updated);
                            }}
                          />
                          {emp.empanelmentName}
                        </label>
                      );
                    })
                  )}
                </div>
                <small style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                  These empanelments will be available as filter options on the category page
                </small>
              </div>

              {/* Parent selector (indented hierarchy) */}
              <div className="g2">
                <div className="fg">
                  <label className="fl">Parent Category</label>
                  <select
                    className="fi"
                    value={form.parent}
                    onChange={(e) => set("parent", e.target.value)}
                  >
                    <option value="">— Root (no parent) —</option>
                    {categoryOptions.map((opt) => (
                      <option key={opt._id} value={opt._id}>
                        {"\u00A0\u00A0".repeat(opt.depth) + (opt.depth > 0 ? "↳ " : "") + opt.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="fg">
                  <label className="fl">Status</label>
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

              {/* Icon upload */}
              <div className="fg">
                <label className="fl">Icon / Image</label>
                <div
                  style={{
                    border: "2px dashed var(--border)",
                    borderRadius: 8,
                    minHeight: 90,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    cursor: "pointer",
                    background: "var(--off-white)",
                    position: "relative",
                    transition: "all 0.2s",
                    ...(iconPreview
                      ? { padding: 8 }
                      : { flexDirection: "column", padding: 16 }),
                  }}
                  onClick={() => fileRef.current.click()}
                >
                  {iconPreview ? (
                    <>
                      <img
                        src={iconPreview}
                        alt="icon"
                        style={{
                          width: 56,
                          height: 56,
                          objectFit: "contain",
                          borderRadius: 6,
                        }}
                      />
                      <span
                        style={{ fontSize: 12, color: "var(--text-secondary)" }}
                      >
                        Click to change
                      </span>
                      <button
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          background: "rgba(0,0,0,0.5)",
                          border: "none",
                          borderRadius: 4,
                          color: "#fff",
                          cursor: "pointer",
                          padding: "2px 6px",
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                          fontSize: 11,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIconPreview(null);
                          setIconFile(null);
                        }}
                      >
                        <X size={10} /> Remove
                      </button>
                    </>
                  ) : (
                    <>
                      <ImageIcon
                        size={22}
                        style={{ color: "var(--text-muted)" }}
                      />
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "var(--text-secondary)",
                        }}
                      >
                        Upload Icon
                      </span>
                      <small
                        style={{ fontSize: 11, color: "var(--text-muted)" }}
                      >
                        PNG, SVG, WebP recommended
                      </small>
                    </>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleIconChange}
                />
              </div>
            </div>

            <div className="modal-acts">
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
                  : editing
                    ? "Update Category"
                    : "Create Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Recursive row component ──────────────────────────────────────────────────
function CategoryRow({
  cat,
  children,
  expandedIds,
  onToggleExpand,
  onEdit,
  onDelete,
  onToggleActive,
  onAddSub,
  childMap,
  depth,
}) {
  const hasChildren = children.length > 0;
  const indent = depth * 24;
  const expanded = !!expandedIds[cat._id];

  return (
    <>
      <tr
        style={{
          borderBottom: "1px solid var(--border)",
          background: depth > 0 ? "#fafbff" : "var(--white)",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background =
            depth > 0 ? "#f0f4ff" : "var(--off-white)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background =
            depth > 0 ? "#fafbff" : "var(--white)")
        }
      >
        {/* Name */}
        <td style={{ padding: "10px 16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              paddingLeft: indent,
            }}
          >
            {/* Expand toggle */}
            {hasChildren ? (
              <button
                onClick={() => onToggleExpand(cat._id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--navy-border)",
                  padding: 2,
                  display: "flex",
                  borderRadius: 4,
                  transition: "background 0.15s",
                }}
              >
                <ChevronRight
                  size={13}
                  style={{
                    transform: expanded ? "rotate(90deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                />
              </button>
            ) : (
              <span
                style={{ width: 17, display: "inline-block", flexShrink: 0 }}
              >
                {depth > 0 && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 1,
                      background: "var(--border)",
                      marginRight: 4,
                      verticalAlign: "middle",
                    }}
                  />
                )}
              </span>
            )}

            {/* Icon */}
            {cat.iconUrl ? (
              <img
                src={cat.iconUrl}
                alt=""
                style={{
                  width: 22,
                  height: 22,
                  objectFit: "contain",
                  borderRadius: 4,
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 4,
                  background:
                    depth === 0 ? "rgba(30,59,134,0.1)" : "rgba(0,201,167,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {depth === 0 ? (
                  <Layers size={11} style={{ color: "var(--navy-border)" }} />
                ) : (
                  <Tag size={10} style={{ color: "var(--teal)" }} />
                )}
              </div>
            )}

            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: depth === 0 ? 600 : 500,
                  color: "var(--text-primary)",
                }}
              >
                {cat.name}
              </div>
              {cat.description && (
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    marginTop: 1,
                    maxWidth: 220,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {cat.description}
                </div>
              )}
            </div>
          </div>
        </td>

        {/* Slug */}
        <td style={{ padding: "10px 16px" }}>
          <code
            style={{
              fontSize: 11,
              background: "var(--off-white)",
              padding: "2px 6px",
              borderRadius: 4,
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            {cat.slug}
          </code>
        </td>

        {/* Sub-count */}
        <td style={{ padding: "10px 16px" }}>
          {hasChildren ? (
            <span
              style={{
                fontSize: 12,
                color: "var(--navy-border)",
                fontWeight: 600,
              }}
            >
              {children.length} sub
            </span>
          ) : (
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>—</span>
          )}
        </td>

        {/* Order */}
        <td
          style={{
            padding: "10px 16px",
            fontSize: 12,
            color: "var(--text-muted)",
          }}
        >
          {cat.order}
        </td>

        {/* Status */}
        <td style={{ padding: "10px 16px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 8px",
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 600,
              background: cat.isActive
                ? "rgba(0,201,167,0.1)"
                : "rgba(239,68,68,0.08)",
              color: cat.isActive ? "var(--teal)" : "var(--red)",
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
            {cat.isActive ? "Active" : "Inactive"}
          </span>
        </td>

        {/* Actions */}
        <td style={{ padding: "10px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {/* Add sub-category */}
            <button
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 11, padding: "3px 8px" }}
              onClick={() => onAddSub(cat._id)}
              title="Add subcategory"
            >
              <Plus size={11} /> Sub
            </button>
            <button
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 11, padding: "3px 8px" }}
              onClick={() => onToggleActive(cat)}
              title={cat.isActive ? "Deactivate" : "Activate"}
            >
              {cat.isActive ? (
                <ToggleRight size={13} style={{ color: "var(--teal)" }} />
              ) : (
                <ToggleLeft size={13} />
              )}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 11, padding: "3px 8px" }}
              onClick={() => onEdit(cat)}
            >
              <Pencil size={11} /> Edit
            </button>
            <button
              className="btn btn-red-o btn-sm"
              style={{ fontSize: 11, padding: "3px 8px" }}
              onClick={() => onDelete(cat)}
            >
              <Trash2 size={11} />
            </button>
          </div>
        </td>
      </tr>

      {/* Render children if expanded */}
      {expanded &&
        children.map((child) => (
          <CategoryRow
            key={child._id}
            cat={child}
            children={childMap[child._id] || []}
            expandedIds={expandedIds}
            onToggleExpand={onToggleExpand}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
            onAddSub={onAddSub}
            childMap={childMap}
            depth={depth + 1}
          />
        ))}
    </>
  );
}
