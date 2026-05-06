import React, { useEffect, useState } from "react";
import { getSiteSettings } from "../services/api";
import BillTemplateSection from "../components/siteSettings/BillTemplateSection";
import toast from "react-hot-toast";

const BillTemplatePage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSiteSettings()
      .then((res) => setSettings(res.data))
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const updateBillTemplate = (val) => {
    setSettings((prev) => ({ ...prev, billTemplate: val }));
  };

  if (loading) return (
    <div className="spin-wrap">
      <div className="spin" />
    </div>
  );

  return (
    <div className="page-content">
      <div className="page-head">
        <div>
          <h2 className="page-title">Bill Template Settings</h2>
          <p className="page-sub">Manage the details that appear on customer receipts.</p>
        </div>
      </div>
      
      <div style={{ maxWidth: 800, marginTop: 24 }}>
        <BillTemplateSection 
          data={settings?.billTemplate || {}} 
          onChange={updateBillTemplate} 
        />
      </div>
    </div>
  );
};

export default BillTemplatePage;
