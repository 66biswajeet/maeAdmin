import { useEffect, useState } from "react";
import { getSiteSettings } from "../services/api";
import MetaSettings from "../components/siteSettings/MetaSettings";
import toast from "react-hot-toast";

export default function MetaSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSiteSettings()
      .then((res) => setSettings(res.data))
      .catch(() => toast.error("Failed to load site settings"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="spin-wrap">
        <div className="spin" />
      </div>
    );

  if (!settings)
    return (
      <div className="ph-page">
        <h2>Could not load settings</h2>
      </div>
    );

  const onChange = (meta) => setSettings((prev) => ({ ...prev, meta }));
  const onSitemapChange = (sitemap) => setSettings((prev) => ({ ...prev, sitemap }));

  return (
    <div>
      <MetaSettings
        data={settings.meta || {}}
        sitemap={settings.sitemap || []}
        onChange={onChange}
        onSitemapChange={onSitemapChange}
      />
    </div>
  );
}
