import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, MapPin } from "lucide-react";
import { getCities, createCity, updateCity, deleteCity } from "../services/api";
import toast from "react-hot-toast";
import "./CitiesPage.css";

const ZONES = ["basecity", "north", "south", "east", "west", "virtual"];

const EMPTY_FORM = {
  name: "",
  zone: "",
  country: "India",
};

export default function CitiesPage() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getCities();
      setCities(res.data.cities || res.data || []);
    } catch {
      toast.error("Failed to load cities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const filtered = cities.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.zone.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (city) => {
    setEditing(city);
    setForm({
      name: city.name,
      zone: city.zone || "",
      country: city.country || "India",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.zone.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await updateCity(editing._id, form);
        toast.success("City updated successfully");
      } else {
        await createCity(form);
        toast.success("City created successfully");
      }
      setShowModal(false);
      setForm(EMPTY_FORM);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save city");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this city? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await deleteCity(id);
      toast.success("City deleted successfully");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete city");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1>Cities Management</h1>
          <p>Add, edit, or remove cities for service delivery</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={18} />
          Add City
        </button>
      </div>

      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search cities by name or zone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">Loading cities...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <MapPin size={48} />
          <h3>{search ? "No cities found" : "No cities yet"}</h3>
          <p>
            {search
              ? "Try a different search term"
              : "Add your first city to get started"}
          </p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>City Name</th>
                <th>Zone</th>
                <th>Country</th>
                <th className="actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((city) => (
                <tr key={city._id}>
                  <td>
                    <div className="city-name">
                      <MapPin size={16} />
                      {city.name}
                    </div>
                  </td>
                  <td>{city.zone}</td>
                  <td>{city.country}</td>
                  <td className="actions">
                    <button
                      className="btn-icon edit"
                      onClick={() => openEdit(city)}
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="btn-icon delete"
                      onClick={() => handleDelete(city._id)}
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
            <h2>{editing ? "Edit City" : "Add New City"}</h2>

            <div className="form-group">
              <label>City Name *</label>
              <input
                type="text"
                placeholder="e.g., Mumbai"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Select Zone *</label>
              <select
                value={form.zone}
                onChange={(e) => set("zone", e.target.value)}
              >
                <option value="">-- Choose a zone --</option>
                {ZONES.map((z) => (
                  <option key={z} value={z}>
                    {z.charAt(0).toUpperCase() + z.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                placeholder="e.g., India"
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
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
                {saving ? "Saving..." : editing ? "Update City" : "Add City"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
