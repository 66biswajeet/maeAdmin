import React, { useState, useEffect } from "react";
import { 
  getEmailTemplates, 
  createEmailTemplate, 
  updateEmailTemplate, 
  deleteEmailTemplate 
} from "../services/api";
import { Plus, Edit2, Trash2, X, Save, Info } from "lucide-react";
import toast from "react-hot-toast";
import "./EmailTemplatesPage.css";

const EmailTemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
    description: "",
    variables: "",
    isActive: true
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await getEmailTemplates();
      setTemplates(res.data);
    } catch (err) {
      toast.error("Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template) => {
    setCurrentTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      description: template.description || "",
      variables: template.variables ? template.variables.join(", ") : "",
      isActive: template.isActive
    });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setCurrentTemplate(null);
    setFormData({
      name: "",
      subject: "",
      body: "",
      description: "",
      variables: "",
      isActive: true
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    try {
      await deleteEmailTemplate(id);
      toast.success("Template deleted");
      fetchTemplates();
    } catch (err) {
      toast.error("Failed to delete template");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      variables: formData.variables.split(",").map(v => v.trim()).filter(Boolean)
    };

    try {
      if (currentTemplate) {
        await updateEmailTemplate(currentTemplate._id, data);
        toast.success("Template updated");
      } else {
        await createEmailTemplate(data);
        toast.success("Template created");
      }
      setShowModal(false);
      fetchTemplates();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save template");
    }
  };

  if (loading) return <div className="loading">Loading templates...</div>;

  return (
    <div className="email-templates-page">
      <div className="page-header">
        <h1>Email Templates</h1>
        <button className="add-btn" onClick={handleAddNew}>
          <Plus size={20} /> Add New Template
        </button>
      </div>

      <div className="templates-grid">
        {templates.map((template) => (
          <div key={template._id} className={`template-card ${!template.isActive ? 'inactive' : ''}`}>
            <div className="card-header">
              <h3>{template.name}</h3>
              <div className="card-actions">
                <button onClick={() => handleEdit(template)} title="Edit"><Edit2 size={18} /></button>
                <button onClick={() => handleDelete(template._id)} className="delete" title="Delete"><Trash2 size={18} /></button>
              </div>
            </div>
            <p className="description">{template.description || "No description"}</p>
            <div className="card-footer">
              <span className="subject">Sub: {template.subject}</span>
              <span className={`status-pill ${template.isActive ? 'active' : 'inactive'}`}>
                {template.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{currentTemplate ? "Edit Template" : "New Template"}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Template Name (Unique Key)</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})}
                  required 
                  placeholder="ORDER_PLACED_CLIENT"
                  disabled={!!currentTemplate}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input 
                  type="text" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Sent to client after placing order"
                />
              </div>
              <div className="form-group">
                <label>Email Subject</label>
                <input 
                  type="text" 
                  value={formData.subject} 
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  required 
                  placeholder="Order Confirmation - {{orderId}}"
                />
              </div>
              <div className="form-group">
                <label>Body (HTML allowed)</label>
                <div className="body-editor-wrapper">
                  <textarea 
                    value={formData.body} 
                    onChange={(e) => setFormData({...formData, body: e.target.value})}
                    required 
                    rows={12}
                    placeholder="Hello {{userName}}, your order {{orderId}} has been placed."
                  />
                  <div className="variable-hint">
                    <Info size={14} /> Use <code>{"{{variableName}}"}</code> for dynamic content.
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Variables (Comma separated)</label>
                <input 
                  type="text" 
                  value={formData.variables} 
                  onChange={(e) => setFormData({...formData, variables: e.target.value})}
                  placeholder="userName, orderId, total"
                />
              </div>
              <div className="form-group checkbox">
                <label>
                  <input 
                    type="checkbox" 
                    checked={formData.isActive} 
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                  Is Active
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="save-btn"><Save size={20} /> Save Template</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplatesPage;
