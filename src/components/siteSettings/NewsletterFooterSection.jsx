import { useState } from 'react';
import { Mail, Plus, X } from 'lucide-react';
import Toggle from '../ui/Toggle';
import Modal from '../ui/Modal';
import {
  updateNewsletter, updateFooter,
  addFooterColumn, updateFooterColumn, deleteFooterColumn,
  toggleSection
} from '../../services/api';
import toast from 'react-hot-toast';

function FooterColumnCard({ col, onUpdate, onDelete, onAddLink, onDeleteLink }) {
  return (
    <div className="footer-col">
      <div className="fc-title">{col.columnTitle}</div>
      {col.links?.map(link => (
        <div key={link._id} className="fl-item">
          <span className="fl-dot" />
          <span className="fl-txt">{link.label}</span>
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

  const handleSaveFooter = async () => {
    try {
      const res = await updateFooter({ sectionVisible, columns });
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
    </div>
  );
}
