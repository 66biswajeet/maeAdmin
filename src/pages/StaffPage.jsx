import { useState, useEffect } from "react";
import { Search, Plus, MoreVertical, Trash2, Edit, Eye } from "lucide-react";
import toast from "react-hot-toast";

export default function StaffPage() {
  const [staffList, setStaffList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Placeholder: Load staff list from API
    setLoading(true);
    // const fetchStaff = async () => {
    //   try {
    //     const res = await api get("/staff/all");
    //     setStaffList(res.data);
    //   } catch (err) {
    //     toast.error("Failed to load staff");
    //   }
    // };
    // fetchStaff();
    setLoading(false);
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Staff Management</h1>
          <p>Manage and organize your team members</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => toast.success("Add staff form coming soon")}
        >
          <Plus size={18} /> Add Staff Member
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-wrapper">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search staff by name, email..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading staff...</div>
        ) : staffList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No Staff Members Yet</h3>
            <p>Add your first staff member to get started</p>
            <button className="btn-primary-outline">
              <Plus size={18} /> Add Staff Member
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff) => (
                <tr key={staff.id}>
                  <td>{staff.name}</td>
                  <td>{staff.email}</td>
                  <td>{staff.role}</td>
                  <td>{staff.status}</td>
                  <td>{staff.joinedDate}</td>
                  <td>
                    <div className="actions-menu">
                      <button className="action-btn" title="View">
                        <Eye size={16} />
                      </button>
                      <button className="action-btn" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className="action-btn delete" title="Delete">
                        <Trash2 size={16} />
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
