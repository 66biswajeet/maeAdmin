import React from "react";
import { Receipt, Building2, MapPin, Globe, Phone, Mail, FileText } from "lucide-react";
import { updateBillTemplate } from "../../services/api";
import toast from "react-hot-toast";

const BillTemplateSection = ({ data = {}, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  const handleSave = async () => {
    try {
      await updateBillTemplate(data);
      toast.success("Bill template saved successfully");
    } catch (err) {
      toast.error("Failed to save bill template");
    }
  };

  return (
    <div className="set-card">
      <div className="set-card__head">
        <div className="set-card__title">
          <Receipt /> Bill Template Settings
        </div>
        <button className="btn btn-teal btn-sm" onClick={handleSave}>
          Save Template
        </button>
      </div>

      <div className="set-card__body">
        <p className="set-card__sub">
          Configure the company details and notes that appear on the downloadable receipts for customers.
        </p>

        <div className="grid grid-2">
          <div className="form-group">
            <label><Building2 size={14} /> Company Name</label>
            <input
              type="text"
              name="companyName"
              value={data.companyName || ""}
              onChange={handleChange}
              placeholder="e.g. Make Audit Easy"
            />
          </div>
          <div className="form-group">
            <label><FileText size={14} /> GSTIN</label>
            <input
              type="text"
              name="gstin"
              value={data.gstin || ""}
              onChange={handleChange}
              placeholder="Enter Company GSTIN"
            />
          </div>
        </div>

        <div className="form-group">
          <label><MapPin size={14} /> Registered Address</label>
          <textarea
            name="address"
            value={data.address || ""}
            onChange={handleChange}
            placeholder="Complete company address..."
            rows="3"
          />
        </div>

        <div className="grid grid-2">
          <div className="form-group">
            <label><Phone size={14} /> Contact Phone</label>
            <input
              type="text"
              name="phone"
              value={data.phone || ""}
              onChange={handleChange}
              placeholder="+91..."
            />
          </div>
          <div className="form-group">
            <label><Mail size={14} /> Contact Email</label>
            <input
              type="email"
              name="email"
              value={data.email || ""}
              onChange={handleChange}
              placeholder="billing@..."
            />
          </div>
        </div>

        <div className="form-group">
          <label><Globe size={14} /> Website URL</label>
          <input
            type="text"
            name="website"
            value={data.website || ""}
            onChange={handleChange}
            placeholder="www.makeauditeasy.com"
          />
        </div>

        <div className="form-group">
          <label><FileText size={14} /> Footer Note / Terms</label>
          <textarea
            name="footerNote"
            value={data.footerNote || ""}
            onChange={handleChange}
            placeholder="e.g. This is a computer generated receipt..."
            rows="2"
          />
        </div>

        <div className="bill-preview-tip">
          <div className="tip-icon">💡</div>
          <p>The company logo (logo.png) is automatically included at the top of the bill.</p>
        </div>
      </div>
    </div>
  );
};

export default BillTemplateSection;
