import { useEffect, useState } from "react";
import { getSiteSettings } from "../services/api";
import HeaderSection from "../components/siteSettings/HeaderSection";
import HeroSection from "../components/siteSettings/HeroSection";
import PromoBannerSection from "../components/siteSettings/PromoBannerSection";
import FeaturedGridSection from "../components/siteSettings/FeaturedGridSection";
import SpecialBannerSection from "../components/siteSettings/SpecialBannerSection";
import TrustSection from "../components/siteSettings/TrustSection";
import NewsletterFooterSection from "../components/siteSettings/NewsletterFooterSection";
import MetaSettings from "../components/siteSettings/MetaSettings";
import toast from "react-hot-toast";
import { RotateCcw, Save } from "lucide-react";

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSiteSettings()
      .then((res) => setSettings(res.data))
      .catch(() => toast.error("Failed to load site settings"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="spin-wrap">
        <div className="spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="ph-page">
        <h2>Could not load settings</h2>
        <p>Make sure the backend is running at the configured API URL.</p>
      </div>
    );
  }

  const update = (key) => (val) =>
    setSettings((prev) => ({ ...prev, [key]: val }));

  return (
    <div>
      <HeaderSection data={settings.header} onChange={update("header")} />

      {/* HeroSection now receives heroScenePromos as a separate prop */}
      <HeroSection
        data={settings.hero}
        heroScenePromos={settings.heroScenePromos || []}
        onChange={update("hero")}
        onPromosChange={update("heroScenePromos")}
      />

      <MetaSettings data={settings.meta || {}} onChange={update("meta")} />

      <PromoBannerSection
        data={settings.promoBanners || []}
        onChange={update("promoBanners")}
      />

      <FeaturedGridSection
        data={settings.featuredGrid}
        onChange={update("featuredGrid")}
      />

      <SpecialBannerSection
        data={settings.specialBanner}
        onChange={update("specialBanner")}
      />

      <TrustSection
        data={settings.trustSection}
        onChange={update("trustSection")}
      />

      <NewsletterFooterSection
        data={settings.newsletter}
        footerData={settings.footer}
        onNewsletterChange={update("newsletter")}
        onFooterChange={update("footer")}
      />

      {/* Global action bar */}
      <div className="bot-bar">
        <button
          className="btn btn-red-o"
          onClick={() => {
            if (window.confirm("Discard all unsaved changes?")) {
              setLoading(true);
              getSiteSettings()
                .then((res) => setSettings(res.data))
                .finally(() => setLoading(false));
            }
          }}
        >
          <RotateCcw /> Discard Changes
        </button>
        <button
          className="btn btn-teal"
          onClick={() => toast.success("All changes are saved per section!")}
        >
          <Save /> Save All Changes
        </button>
      </div>
    </div>
  );
}
