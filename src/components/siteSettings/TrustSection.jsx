import { useState } from 'react';
import { ShieldCheck, Tag, Lock, ChevronRight, Award } from 'lucide-react';
import Toggle from '../ui/Toggle';
import Modal from '../ui/Modal';
import { updateTrustSection, updateTrustItem, addTrustItem, deleteTrustItem, toggleSection } from '../../services/api';
import toast from 'react-hot-toast';

const ICON_MAP = {
  shield: ShieldCheck,
  tag: Tag,
  lock: Lock,
  award: Award,
};

function TrustCard({ item, onUpdate }) {
  const Icon = ICON_MAP[item.iconName] || ShieldCheck;
  return (
    <div className="trust-card">
      <div className="trust-icon-row">
        <div className="trust-circle"><Icon /></div>
        <span className="trust-title">{item.title}</span>
      </div>
      <p className="trust-desc">{item.description}</p>
      <button className="chg-icon" onClick={() => onUpdate(item)}>
        Change Icon <ChevronRight />
      </button>
    </div>
  );
}

export default function TrustSection({ data, onChange }) {
  const [headline, setHeadline] = useState(data?.headline || 'Trusted by 500+ India Corporations');
  const [subHeadline, setSubHeadline] = useState(data?.subHeadline || '');
  const [items, setItems] = useState(data?.items || []);
  const [sectionVisible, setSectionVisible] = useState(data?.sectionVisible ?? true);
  const [editItem, setEditItem] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', description: '', iconName: 'shield' });

  const handleSaveHeadline = async () => {
    try {
      const res = await updateTrustSection({ headline, subHeadline, sectionVisible });
      onChange(res.data.trustSection);
      toast.success('Trust section saved!');
    } catch { toast.error('Failed to save'); }
  };

  const handleAddItem = async () => {
    if (!newItem.title) return;
    try {
      const fd = new FormData();
      fd.append('title', newItem.title);
      fd.append('description', newItem.description);
      fd.append('iconName', newItem.iconName);
      const res = await addTrustItem(fd);
      setItems(res.data.trustSection?.items || items);
      setShowAdd(false);
      setNewItem({ title: '', description: '', iconName: 'shield' });
      toast.success('Trust item added!');
    } catch { toast.error('Failed to add item'); }
  };

  const handleUpdateItem = async () => {
    if (!editItem) return;
    try {
      const fd = new FormData();
      fd.append('title', editItem.title);
      fd.append('description', editItem.description);
      fd.append('iconName', editItem.iconName);
      const res = await updateTrustItem(editItem._id, fd);
      setItems(res.data.trustSection?.items || items);
      setEditItem(null);
      toast.success('Item updated!');
    } catch { toast.error('Failed to update item'); }
  };

  const handleDeleteItem = async (id) => {
    try {
      const res = await deleteTrustItem(id);
      setItems(res.data.trustSection?.items || items.filter(i => i._id !== id));
      toast.success('Item deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const ICONS = ['shield', 'tag', 'lock', 'award'];

  return (
    <div className="sc">
      <div className="sc-head">
        <h3><ShieldCheck /> Trust Section Editors</h3>
        <Toggle checked={sectionVisible} onChange={(v) => {
          setSectionVisible(v);
          toggleSection({ section: 'trustSection', visible: v }).catch(() => {});
        }} label="Section Visible" />
      </div>
      <div className="sc-body gap16">
        <div className="g2">
          <div className="fg">
            <label className="fl">Headline</label>
            <input className="fi" value={headline} onChange={e => setHeadline(e.target.value)} />
          </div>
          <div className="fg">
            <label className="fl">Sub Headline</label>
            <input className="fi" value={subHeadline} onChange={e => setSubHeadline(e.target.value)} placeholder="Optional sub text..." />
          </div>
        </div>

        <div className="trust-grid">
          {items.map(item => (
            <TrustCard key={item._id} item={item} onUpdate={setEditItem} />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(true)}>+ Add Item</button>
          <button className="btn btn-teal btn-sm" onClick={handleSaveHeadline}>Save Section</button>
        </div>
      </div>

      {/* Edit Item Modal */}
      {editItem && (
        <Modal
          title="Edit Trust Item"
          onClose={() => setEditItem(null)}
          actions={
            <>
              <button className="btn btn-red-o btn-sm" onClick={() => handleDeleteItem(editItem._id)}>Delete</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditItem(null)}>Cancel</button>
              <button className="btn btn-teal btn-sm" onClick={handleUpdateItem}>Update</button>
            </>
          }
        >
          <div className="gap12">
            <div className="fg">
              <label className="fl">Title</label>
              <input className="fi" value={editItem.title} onChange={e => setEditItem(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="fg">
              <label className="fl">Description</label>
              <textarea className="fta" value={editItem.description} onChange={e => setEditItem(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="fg">
              <label className="fl">Icon</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {ICONS.map(ic => {
                  const Ic = ICON_MAP[ic];
                  return (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setEditItem(p => ({ ...p, iconName: ic }))}
                      style={{
                        width: 36, height: 36, border: `2px solid ${editItem.iconName === ic ? 'var(--teal)' : 'var(--border)'}`,
                        borderRadius: 6, background: editItem.iconName === ic ? 'var(--teal-bg)' : 'white',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: editItem.iconName === ic ? 'var(--teal)' : 'var(--text-muted)',
                      }}
                    >
                      <Ic size={16} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Item Modal */}
      {showAdd && (
        <Modal
          title="Add Trust Item"
          onClose={() => setShowAdd(false)}
          actions={
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-teal btn-sm" onClick={handleAddItem}>Add</button>
            </>
          }
        >
          <div className="gap12">
            <div className="fg">
              <label className="fl">Title</label>
              <input className="fi" value={newItem.title} onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Legal Rigor" />
            </div>
            <div className="fg">
              <label className="fl">Description</label>
              <textarea className="fta" value={newItem.description} onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))} placeholder="Short description..." />
            </div>
            <div className="fg">
              <label className="fl">Icon</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {ICONS.map(ic => {
                  const Ic = ICON_MAP[ic];
                  return (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setNewItem(p => ({ ...p, iconName: ic }))}
                      style={{
                        width: 36, height: 36, border: `2px solid ${newItem.iconName === ic ? 'var(--teal)' : 'var(--border)'}`,
                        borderRadius: 6, background: newItem.iconName === ic ? 'var(--teal-bg)' : 'white',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: newItem.iconName === ic ? 'var(--teal)' : 'var(--text-muted)',
                      }}
                    >
                      <Ic size={16} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
