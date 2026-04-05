import { useState } from 'react';
import { ShieldCheck, Zap } from 'lucide-react';
import Toggle from '../ui/Toggle';
import { updateSpecialBanner, toggleSection } from '../../services/api';
import toast from 'react-hot-toast';

export default function SpecialBannerSection({ data, onChange }) {
  const [form, setForm] = useState({
    campaignTitle: data?.campaignTitle || 'GEN Next VAPT Audit',
    price: data?.price || 'Rs 30,000/-',
    badgeVisible: data?.badgeVisible ?? true,
    badgeText: data?.badgeText || 'NEW',
    ctaText: data?.ctaText || 'Book It Now',
    ctaLink: data?.ctaLink || '#',
    sectionVisible: data?.sectionVisible ?? true,
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    try {
      const res = await updateSpecialBanner(form);
      onChange(res.data.specialBanner);
      toast.success('Special banner saved!');
    } catch { toast.error('Failed to save special banner'); }
  };

  return (
    <div className="sc">
      <div className="sc-head">
        <h3><Zap /> Special Pricing Banner (GEN Next VAPT)</h3>
        <Toggle checked={form.sectionVisible} onChange={(v) => {
          set('sectionVisible', v);
          toggleSection({ section: 'specialBanner', visible: v }).catch(() => {});
        }} label="Section Visible" />
      </div>
      <div className="sc-body gap16">
        <div className="sp-row">
          {/* Icon Picker */}
          <div className="fg" style={{ flexShrink: 0 }}>
            <span className="fl">Icon Picker</span>
            <button className="icon-btn" type="button">
              <ShieldCheck />
            </button>
          </div>

          {/* Campaign Title */}
          <div className="fg flex1">
            <label className="fl">Campaign Title</label>
            <input className="fi" value={form.campaignTitle} onChange={e => set('campaignTitle', e.target.value)} />
          </div>

          {/* Price */}
          <div className="fg flex1">
            <label className="fl">Price Input</label>
            <input
              className="fi"
              value={form.price}
              onChange={e => set('price', e.target.value)}
              style={{ color: 'var(--teal)', fontWeight: 600 }}
            />
          </div>

          {/* Badge */}
          <div className="fg" style={{ flexShrink: 0 }}>
            <label className="fl">Badge Visible</label>
            <div className="badge-row">
              <span className="new-badge">{form.badgeText}</span>
              <label className="tgl">
                <input
                  type="checkbox"
                  checked={form.badgeVisible}
                  onChange={e => set('badgeVisible', e.target.checked)}
                />
                <span className="tgl-track" />
                <span className="tgl-thumb" />
              </label>
            </div>
          </div>
        </div>

        <div className="g2">
          <div className="fg">
            <label className="fl">CTA Button Text</label>
            <input className="fi" value={form.ctaText} onChange={e => set('ctaText', e.target.value)} />
          </div>
          <div className="fg">
            <label className="fl">CTA Link</label>
            <input className="fi" value={form.ctaLink} onChange={e => set('ctaLink', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-teal btn-sm" onClick={handleSave}>Save Banner</button>
        </div>
      </div>
    </div>
  );
}
