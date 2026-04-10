import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, Briefcase } from "lucide-react";
import {
  getEmpanelments,
  createEmpanelment,
  updateEmpanelment,
  deleteEmpanelment,
} from "../services/api";
import toast from "react-hot-toast";
import "./EmpanelmentPage.css";

const EMPTY_FORM = {
  empanelmentName: "",
};

export default function EmpanelmentPage() {
  const [empanelments, setEmpanelments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getEmpanelments();
      setEmpanelments(res.data || []);
    } catch {
      toast.error("Failed to load empanelments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const filtered = empanelments.filter((e) =>
    e.empanelmentName.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (empanelment) => {
    setEditing(empanelment);
    setForm({
      empanelmentName: empanelment.empanelmentName,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.empanelmentName.trim()) {
      toast.error("Please enter empanelment name");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await updateEmpanelment(editing._id, form);
        toast.success("Empanelment updated successfully");
      } else {
        await createEmpanelment(form);
        toast.success("Empanelment created successfully");
      }
      setShowModal(false);
      setForm(EMPTY_FORM);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save empanelment");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this empanelment? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await deleteEmpanelment(id);
      toast.success("Empanelment deleted successfully");
      load();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to delete empanelment",
      );
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1>Empanelment Management</h1>
          <p>Add, edit, or remove empanelments</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={18} />
          Add Empanelment
        </button>
      </div>

      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search empanelments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">Loading empanelments...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Briefcase size={48} />
          <h3>{search ? "No empanelments found" : "No empanelments yet"}</h3>
          <p>
            {search
              ? "Try a different search term"
              : "Add your first empanelment to get started"}
          </p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Empanelment Name</th>
                <th className="actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((empanelment) => (
                <tr key={empanelment._id}>
                  <td>
                    <div className="empanelment-name">
                      <Briefcase size={16} />
                      {empanelment.empanelmentName}
                    </div>
                  </td>
                  <td className="actions">
                    <button
                      className="btn-icon edit"
                      onClick={() => openEdit(empanelment)}
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="btn-icon delete"
                      onClick={() => handleDelete(empanelment._id)}
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
            <h2>{editing ? "Edit Empanelment" : "Add New Empanelment"}</h2>

            <div className="form-group">
              <label>Empanelment Name *</label>
              <input
                type="text"
                placeholder="e.g., Type A, Premium, etc."
                value={form.empanelmentName}
                onChange={(e) => set("empanelmentName", e.target.value)}
              />
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
                {saving
                  ? "Saving..."
                  : editing
                    ? "Update Empanelment"
                    : "Add Empanelment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
