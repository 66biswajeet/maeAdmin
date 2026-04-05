import { useState, useRef } from 'react';
import { ImageIcon, LayoutTemplate } from 'lucide-react';
import Toggle from '../ui/Toggle';
import { updateHeader, toggleSection } from '../../services/api';
import toast from 'react-hot-toast';

export default function HeaderSection({ data, onChange }) {
  const [form, setForm] = useState({
    topNavbarPhone: data?.topNavbarPhone || '',
    primarySupportEmail: data?.primarySupportEmail || '',
    stickyAnnouncementText: data?.stickyAnnouncementText || '',
    sectionVisible: data?.sectionVisible ?? true,
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(data?.logoUrl || null);
  const fileRef = useRef();

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      const fd = new FormData();
      fd.append('topNavbarPhone', form.topNavbarPhone);
      fd.append('primarySupportEmail', form.primarySupportEmail);
      fd.append('stickyAnnouncementText', form.stickyAnnouncementText);
      fd.append('sectionVisible', form.sectionVisible);
      if (logoFile) fd.append('logo', logoFile);
      const res = await updateHeader(fd);
      onChange(res.data.header);
      toast.success('Header saved!');
    } catch {
      toast.error('Failed to save header');
    }
  };

  const handleToggle = async (v) => {
    set('sectionVisible', v);
    try {
      await toggleSection({ section: 'header', visible: v });
    } catch { /* silent */ }
  };

  return (
    <div className="sc">
      <div className="sc-head">
        <h3><LayoutTemplate /> Header &amp; Branding</h3>
        <Toggle checked={form.sectionVisible} onChange={handleToggle} label="Section Visible" />
      </div>
      <div className="sc-body gap16">
        <div className="g2" style={{ alignItems: 'start' }}>
          {/* Logo upload */}
          <div className="fg">
            <span className="fl">Main Logo Preview</span>
            <div className="uz" onClick={() => fileRef.current.click()}>
              {logoPreview
                ? <img src={logoPreview} alt="logo" style={{ maxHeight: 60, maxWidth: 180, objectFit: 'contain' }} />
                : <><ImageIcon /><span className="uz-lbl">Upload Preview</span><small>Recommended SVG or PNG (Transparent) 400×120px minimum size</small></>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
          </div>

          <div className="gap16">
            <div className="fg">
              <label className="fl">Top Navbar Phone</label>
              <input className="fi" value={form.topNavbarPhone} onChange={e => set('topNavbarPhone', e.target.value)} placeholder="+91 800-456-7890" />
            </div>
            <div className="fg">
              <label className="fl">Primary Support Email</label>
              <input className="fi" value={form.primarySupportEmail} onChange={e => set('primarySupportEmail', e.target.value)} placeholder="support@..." />
            </div>
          </div>
        </div>

        <div className="fg">
          <label className="fl">Sticky Announcement Text</label>
          <input className="fi" value={form.stickyAnnouncementText} onChange={e => set('stickyAnnouncementText', e.target.value)} placeholder="Limited Time Offer: Get 20% off..." />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-teal btn-sm" onClick={handleSave}>Save Header</button>
        </div>
      </div>
    </div>
  );
}
