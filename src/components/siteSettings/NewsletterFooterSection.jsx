import { useState } from 'react';
import { Mail, Plus, X, Edit2 } from 'lucide-react';
import Toggle from '../ui/Toggle';
import Modal from '../ui/Modal';
import {
  updateNewsletter, updateFooter,
  addFooterColumn, updateFooterColumn, deleteFooterColumn,
  toggleSection
} from '../../services/api';
import toast from 'react-hot-toast';

function FooterColumnCard({ col, onUpdate, onDelete, onAddLink, onDeleteLink, onEditLink }) {
  return (
    <div className="footer-col">
      <div className="fc-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{col.columnTitle}</span>
        <button 
          className="col-del-btn"
          onClick={() => {
            if (window.confirm(`Are you sure you want to delete the column "${col.columnTitle}"?`)) {
              onDelete(col._id);
            }
          }}
          title="Delete Column"
        >
          <X size={14} />
        </button>
      </div>
      {col.links?.map(link => (
        <div key={link._id} className="fl-item">
          <span className="fl-dot" />
          <span className="fl-txt">{link.label}</span>
          <button className="fl-edit" style={{ marginRight: '4px' }} onClick={() => onEditLink(col, link)}>
            <Edit2 size={11} />
          </button>
          <button className="fl-del" onClick={() => onDeleteLink(col._id, link._id)}>
            <X size={11} />
          </button>
        </div>
      ))}
      <button className="add-link" onClick={() => onAddLink(col)}>
        <Plus size={11} /> Add Link
      </button>
    </div>
  );
}

export default function NewsletterFooterSection({ data, footerData, onNewsletterChange, onFooterChange }) {
  const [nl, setNl] = useState({
    headline: data?.headline || 'Stay Regulatory Ready',
    subText: data?.subText || '',
    placeholderText: data?.placeholderText || 'Corporate email address',
    buttonText: data?.buttonText || 'Join Intel Desk',
    sectionVisible: data?.sectionVisible ?? true,
  });
  const [columns, setColumns] = useState(footerData?.columns || []);
  const [sectionVisible, setSectionVisible] = useState(footerData?.sectionVisible ?? true);
  const [showAddCol, setShowAddCol] = useState(false);
  const [showAddLink, setShowAddLink] = useState(false);
  const [activeCol, setActiveCol] = useState(null);
  const [newColTitle, setNewColTitle] = useState('');
  const [newLink, setNewLink] = useState({ label: '', url: '' });
  const [showEditLink, setShowEditLink] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [socialLinks, setSocialLinks] = useState(footerData?.socialLinks || []);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [isEditingSocial, setIsEditingSocial] = useState(false);
  const [socialIndex, setSocialIndex] = useState(null);
  const [socialForm, setSocialForm] = useState({ platform: '', url: '' });
  const [customPlatform, setCustomPlatform] = useState('');

  const setNlField = (k, v) => setNl(p => ({ ...p, [k]: v }));

  const handleSaveNewsletter = async () => {
    try {
      const res = await updateNewsletter(nl);
      onNewsletterChange(res.data.newsletter);
      toast.success('Newsletter section saved!');
    } catch { toast.error('Failed to save newsletter'); }
  };

  const handleAddColumn = async () => {
    if (!newColTitle.trim()) return;
    try {
      const res = await addFooterColumn({ columnTitle: newColTitle, links: [] });
      setColumns(res.data.footer?.columns || columns);
      setNewColTitle('');
      setShowAddCol(false);
      toast.success('Column added!');
    } catch { toast.error('Failed to add column'); }
  };

  const handleDeleteColumn = async (colId) => {
    try {
      const res = await deleteFooterColumn(colId);
      setColumns(res.data.footer?.columns || columns.filter(c => c._id !== colId));
      toast.success('Column deleted');
    } catch { toast.error('Failed to delete column'); }
  };

  const handleAddLink = (col) => {
    setActiveCol(col);
    setNewLink({ label: '', url: '' });
    setShowAddLink(true);
  };

  const handleSaveLink = async () => {
    if (!newLink.label || !newLink.url || !activeCol) return;
    try {
      const updatedLinks = [...(activeCol.links || []), newLink];
      const res = await updateFooterColumn(activeCol._id, {
        columnTitle: activeCol.columnTitle,
        links: updatedLinks,
      });
      setColumns(res.data.footer?.columns || columns);
      setShowAddLink(false);
      setActiveCol(null);
      toast.success('Link added!');
    } catch { toast.error('Failed to add link'); }
  };

  const handleDeleteLink = async (colId, linkId) => {
    const col = columns.find(c => c._id === colId);
    if (!col) return;
    try {
      const updatedLinks = col.links.filter(l => l._id !== linkId);
      const res = await updateFooterColumn(colId, { columnTitle: col.columnTitle, links: updatedLinks });
      setColumns(res.data.footer?.columns || columns);
      toast.success('Link removed');
    } catch { toast.error('Failed to remove link'); }
  };

  const handleEditLink = (col, link) => {
    setActiveCol(col);
    setEditingLink({ _id: link._id, label: link.label, url: link.url });
    setShowEditLink(true);
  };

  const handleSaveEditLink = async () => {
    if (!editingLink.label || !editingLink.url || !activeCol) return;
    try {
      const updatedLinks = activeCol.links.map(l =>
        l._id === editingLink._id ? { ...l, label: editingLink.label, url: editingLink.url } : l
      );
      const res = await updateFooterColumn(activeCol._id, {
        columnTitle: activeCol.columnTitle,
        links: updatedLinks,
      });
      setColumns(res.data.footer?.columns || columns);
      setShowEditLink(false);
      setEditingLink(null);
      setActiveCol(null);
      toast.success('Link updated!');
    } catch { toast.error('Failed to update link'); }
  };

  const PREDEFINED_PLATFORMS = ['facebook', 'instagram', 'youtube', 'x', 'linkedin', 'whatsapp', 'pinterest', 'tiktok', 'threads'];

  const handleAddSocialClick = () => {
    setIsEditingSocial(false);
    setSocialForm({ platform: 'facebook', url: '' });
    setCustomPlatform('');
    setShowSocialModal(true);
  };

  const handleEditSocialClick = (sl, index) => {
    setIsEditingSocial(true);
    setSocialIndex(index);
    const lowerPlatform = sl.platform.toLowerCase().trim();
    if (PREDEFINED_PLATFORMS.includes(lowerPlatform)) {
      setSocialForm({ platform: lowerPlatform, url: sl.url });
      setCustomPlatform('');
    } else {
      setSocialForm({ platform: 'custom', url: sl.url });
      setCustomPlatform(sl.platform);
    }
    setShowSocialModal(true);
  };

  const handleDeleteSocialLink = (index) => {
    if (window.confirm('Are you sure you want to delete this social link?')) {
      const updated = socialLinks.filter((_, i) => i !== index);
      setSocialLinks(updated);
      toast.success('Social link removed. Click "Save Footer" to apply changes.');
    }
  };

  const handleSaveSocialLink = () => {
    let finalPlatform = socialForm.platform;
    if (finalPlatform === 'custom') {
      finalPlatform = customPlatform.trim();
    }
    if (!finalPlatform || !socialForm.url.trim()) {
      toast.error("Please fill in both the platform and link URL");
      return;
    }
    
    const newSocial = { platform: finalPlatform, url: socialForm.url };
    if (isEditingSocial) {
      const updated = socialLinks.map((sl, i) => 
        i === socialIndex ? { ...sl, ...newSocial } : sl
      );
      setSocialLinks(updated);
      toast.success('Social link updated. Click "Save Footer" to apply changes.');
    } else {
      setSocialLinks([...socialLinks, newSocial]);
      toast.success('Social link added. Click "Save Footer" to apply changes.');
    }
    setShowSocialModal(false);
    setCustomPlatform('');
  };

  const handleSaveFooter = async () => {
    try {
      const res = await updateFooter({ sectionVisible, columns, socialLinks });
      onFooterChange(res.data.footer);
      toast.success('Footer saved!');
    } catch { toast.error('Failed to save footer'); }
  };

  return (
    <div className="sc">
      <div className="sc-head">
        <h3><Mail /> Newsletter &amp; Footer Link Manager</h3>
        <Toggle checked={sectionVisible} onChange={(v) => {
          setSectionVisible(v);
          toggleSection({ section: 'footer', visible: v }).catch(() => {});
        }} label="Section Visible" />
      </div>
      <div className="sc-body gap16">

        {/* Newsletter */}
        <div>
          <div className="fl" style={{ marginBottom: 10 }}>Newsletter Section Editor</div>
          <div className="nl-row">
            <input
              className="fi flex1"
              value={nl.headline}
              onChange={e => setNlField('headline', e.target.value)}
              placeholder="Stay Regulatory Ready"
            />
            <button className="btn btn-teal btn-sm" onClick={handleSaveNewsletter}>Update UI Text</button>
          </div>
          <div className="g2" style={{ marginTop: 10 }}>
            <div className="fg">
              <label className="fl">Sub Text</label>
              <textarea className="fta" value={nl.subText} onChange={e => setNlField('subText', e.target.value)} style={{ minHeight: 56 }} placeholder="Receive weekly summaries..." />
            </div>
            <div className="fg">
              <label className="fl">Button Text</label>
              <input className="fi" value={nl.buttonText} onChange={e => setNlField('buttonText', e.target.value)} />
              <label className="fl" style={{ marginTop: 8 }}>Placeholder Text</label>
              <input className="fi" value={nl.placeholderText} onChange={e => setNlField('placeholderText', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Social Media Links */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div className="fl">Social Media Links</div>
            <button className="btn btn-ghost btn-sm" onClick={handleAddSocialClick}>
              <Plus size={12} /> Add Social Link
            </button>
          </div>
          <div className="cat-grid" style={{ marginTop: 0 }}>
            {socialLinks.map((sl, index) => (
              <div key={sl._id || index} className="cat-pill">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 'bold' }}>{sl.platform}</span>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{sl.url}</span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button className="cat-del" style={{ padding: '4px', color: 'var(--teal)' }} onClick={() => handleEditSocialClick(sl, index)}>
                    <Edit2 size={12} />
                  </button>
                  <button className="cat-del" style={{ padding: '4px' }} onClick={() => handleDeleteSocialLink(index)}>
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* Footer columns */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="fl">Footer Navigation ({columns.length} Columns)</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAddCol(true)}>
              <Plus size={12} /> Add Column
            </button>
          </div>
          <div className="footer-grid">
            {columns.map(col => (
              <FooterColumnCard
                key={col._id}
                col={col}
                onUpdate={() => {}}
                onDelete={handleDeleteColumn}
                onAddLink={handleAddLink}
                onDeleteLink={handleDeleteLink}
                onEditLink={handleEditLink}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-teal btn-sm" onClick={handleSaveFooter}>Save Footer</button>
        </div>
      </div>

      {/* Add Column Modal */}
      {showAddCol && (
        <Modal
          title="Add Footer Column"
          onClose={() => setShowAddCol(false)}
          actions={
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddCol(false)}>Cancel</button>
              <button className="btn btn-teal btn-sm" onClick={handleAddColumn}>Add</button>
            </>
          }
        >
          <div className="fg">
            <label className="fl">Column Title</label>
            <input className="fi" value={newColTitle} onChange={e => setNewColTitle(e.target.value)} placeholder="e.g. Products" autoFocus />
          </div>
        </Modal>
      )}

      {/* Add Link Modal */}
      {showAddLink && (
        <Modal
          title={`Add Link to "${activeCol?.columnTitle}"`}
          onClose={() => setShowAddLink(false)}
          actions={
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddLink(false)}>Cancel</button>
              <button className="btn btn-teal btn-sm" onClick={handleSaveLink}>Add Link</button>
            </>
          }
        >
          <div className="gap12">
            <div className="fg">
              <label className="fl">Label</label>
              <input className="fi" value={newLink.label} onChange={e => setNewLink(p => ({ ...p, label: e.target.value }))} placeholder="e.g. ISO 27001 SMS" autoFocus />
            </div>
            <div className="fg">
              <label className="fl">URL</label>
              <input className="fi" value={newLink.url} onChange={e => setNewLink(p => ({ ...p, url: e.target.value }))} placeholder="/products/iso-27001-sms" />
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Link Modal */}
      {showEditLink && (
        <Modal
          title={`Edit Link in "${activeCol?.columnTitle}"`}
          onClose={() => {
            setShowEditLink(false);
            setEditingLink(null);
            setActiveCol(null);
          }}
          actions={
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => {
                setShowEditLink(false);
                setEditingLink(null);
                setActiveCol(null);
              }}>Cancel</button>
              <button className="btn btn-teal btn-sm" onClick={handleSaveEditLink}>Save Changes</button>
            </>
          }
        >
          <div className="gap12">
            <div className="fg">
              <label className="fl">Label</label>
              <input 
                className="fi" 
                value={editingLink?.label || ''} 
                onChange={e => setEditingLink(p => ({ ...p, label: e.target.value }))} 
                placeholder="e.g. ISO 27001 SMS" 
                autoFocus 
              />
            </div>
            <div className="fg">
              <label className="fl">URL</label>
              <input 
                className="fi" 
                value={editingLink?.url || ''} 
                onChange={e => setEditingLink(p => ({ ...p, url: e.target.value }))} 
                placeholder="/products/iso-27001-sms" 
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Social Link Add/Edit Modal */}
      {showSocialModal && (
        <Modal
          title={isEditingSocial ? 'Edit Social Link' : 'Add Social Link'}
          onClose={() => {
            setShowSocialModal(false);
            setCustomPlatform('');
          }}
          actions={
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => {
                setShowSocialModal(false);
                setCustomPlatform('');
              }}>Cancel</button>
              <button className="btn btn-teal btn-sm" onClick={handleSaveSocialLink}>Save</button>
            </>
          }
        >
          <div className="gap12">
            <div className="fg">
              <label className="fl">Social Media Platform</label>
              <select 
                className="fi" 
                value={socialForm.platform} 
                onChange={e => setSocialForm(p => ({ ...p, platform: e.target.value }))}
              >
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
                <option value="x">Twitter / X</option>
                <option value="linkedin">LinkedIn</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="pinterest">Pinterest</option>
                <option value="tiktok">TikTok</option>
                <option value="threads">Threads</option>
                <option value="custom">Other / Custom Platform</option>
              </select>
            </div>
            {socialForm.platform === 'custom' && (
              <div className="fg">
                <label className="fl">Custom Platform Name</label>
                <input 
                  className="fi" 
                  value={customPlatform} 
                  onChange={e => setCustomPlatform(e.target.value)} 
                  placeholder="e.g. Snapchat" 
                  autoFocus 
                />
              </div>
            )}
            <div className="fg">
              <label className="fl">Link URL</label>
              <input 
                className="fi" 
                value={socialForm.url} 
                onChange={e => setSocialForm(p => ({ ...p, url: e.target.value }))} 
                placeholder="https://..." 
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
