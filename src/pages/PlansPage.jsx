import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, Layers } from "lucide-react";
import { getPlans, createPlan, updatePlan, deletePlan } from "../services/api";
import toast from "react-hot-toast";
import "./PlansPage.css";

const EMPTY_FORM = {
  name: "",
  description: "",
  sequence: 0,
  allowVirtual: false,
  allowBasecity: false,
  additionalCitiesLimit: 0,
};

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getPlans();
      setPlans(res.data.plans || res.data || []);
    } catch {
      toast.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const filtered = plans.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (plan) => {
    setEditing(plan);
    setForm({
      name: plan.name,
      description: plan.description || "",
      sequence: plan.sequence || 0,
      allowVirtual: plan.allowVirtual || false,
      allowBasecity: plan.allowBasecity || false,
      additionalCitiesLimit: plan.additionalCitiesLimit || 0,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await updatePlan(editing._id, form);
        toast.success("Plan updated successfully");
      } else {
        await createPlan(form);
        toast.success("Plan created successfully");
      }
      setShowModal(false);
      setForm(EMPTY_FORM);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this plan? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await deletePlan(id);
      toast.success("Plan deleted successfully");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete plan");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1>Plans Management</h1>
          <p>Add, edit, or remove subscription plans</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={18} />
          Add Plan
        </button>
      </div>

      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search plans by name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">Loading plans...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Layers size={48} />
          <h3>{search ? "No plans found" : "No plans yet"}</h3>
          <p>
            {search
              ? "Try a different search term"
              : "Add your first plan to get started"}
          </p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sequence</th>
                <th>Plan Name</th>
                <th>Description</th>
                <th>City Configuration</th>
                <th className="actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((plan) => (
                <tr key={plan._id}>
                  <td>
                    <span className="sequence-badge">{plan.sequence || 0}</span>
                  </td>
                  <td>
                    <div className="plan-name">
                      <Layers size={16} />
                      {plan.name}
                    </div>
                  </td>
                  <td>{plan.description || "—"}</td>
                  <td>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        lineHeight: "1.6",
                      }}
                    >
                      {plan.allowVirtual && !plan.allowBasecity ? (
                        <span>🌐 Virtual Only</span>
                      ) : plan.allowBasecity && !plan.allowVirtual ? (
                        <span>
                          📍 Base City + {plan.additionalCitiesLimit || 0}{" "}
                          Additional
                        </span>
                      ) : (
                        <span style={{ color: "#999" }}>—</span>
                      )}
                    </div>
                  </td>
                  <td className="actions">
                    <button
                      className="btn-icon edit"
                      onClick={() => openEdit(plan)}
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="btn-icon delete"
                      onClick={() => handleDelete(plan._id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? "Edit Plan" : "Add New Plan"}</h2>

            <div className="form-group">
              <label>Plan Name *</label>
              <input
                type="text"
                placeholder="e.g., Professional, Standard"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Sequence / Order</label>
              <input
                type="number"
                placeholder="0"
                value={form.sequence}
                onChange={(e) => set("sequence", parseInt(e.target.value) || 0)}
              />
              <small>Lower numbers appear first in the list</small>
            </div>

            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                placeholder="e.g., For professional users"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>

            {/* City Configuration Section */}
            <div
              style={{
                borderTop: "1px solid #e0e0e0",
                paddingTop: "16px",
                marginTop: "16px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                📍 City Options
              </h3>
              <p
                style={{
                  fontSize: "12px",
                  color: "#666",
                  margin: "0 0 12px 0",
                }}
              >
                Configure which city options are available for this plan
              </p>

              {/* Virtual Service Option */}
              <div className="form-group">
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="serviceType"
                    checked={form.allowVirtual && !form.allowBasecity}
                    onChange={(e) => {
                      if (e.target.checked) {
                        set("allowVirtual", true);
                        set("allowBasecity", false);
                        set("additionalCitiesLimit", 0);
                      }
                    }}
                  />
                  <span>🌐 Virtual Service Only</span>
                </label>
                <small style={{ marginLeft: "28px", color: "#999" }}>
                  Client can only use virtual service (no physical cities)
                </small>
              </div>

              {/* Base City Option */}
              <div className="form-group">
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="serviceType"
                    checked={form.allowBasecity && !form.allowVirtual}
                    onChange={(e) => {
                      if (e.target.checked) {
                        set("allowVirtual", false);
                        set("allowBasecity", true);
                      }
                    }}
                  />
                  <span>📍 Base City + Additional Cities</span>
                </label>
                <small style={{ marginLeft: "28px", color: "#999" }}>
                  Client can use their base city and add extra cities
                </small>
              </div>

              {/* Additional Cities Limit */}
              {form.allowBasecity && (
                <div className="form-group">
                  <label>Maximum Additional Cities Allowed (0-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={form.additionalCitiesLimit}
                    onChange={(e) =>
                      set(
                        "additionalCitiesLimit",
                        Math.min(
                          10,
                          Math.max(0, parseInt(e.target.value) || 0),
                        ),
                      )
                    }
                  />
                  <small style={{ color: "#999" }}>
                    First city is base city, limit is for extra cities
                  </small>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : editing ? "Update Plan" : "Add Plan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
