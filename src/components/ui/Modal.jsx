import { X } from 'lucide-react';

export default function Modal({ title, onClose, children, actions }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h4>{title}</h4>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            <X size={16} />
          </button>
        </div>
        {children}
        {actions && <div className="modal-acts">{actions}</div>}
      </div>
    </div>
  );
}
