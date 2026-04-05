import { useState } from 'react';
import { Grid, ImageIcon } from 'lucide-react';
import Toggle from '../ui/Toggle';
import { updateFeaturedGrid, toggleSection } from '../../services/api';
import toast from 'react-hot-toast';

const EMPTY_PRODUCTS = Array.from({ length: 5 }, (_, i) => ({
  _id: `empty-${i}`,
  productTitle: '',
  price: '',
  imageUrl: '',
}));

export default function FeaturedGridSection({ data, onChange }) {
  const [sectionTitle, setSectionTitle] = useState(data?.sectionTitle || 'Featured Products');
  const [sectionVisible, setSectionVisible] = useState(data?.sectionVisible ?? true);
  const [products, setProducts] = useState(
    data?.products?.length ? data.products : EMPTY_PRODUCTS
  );

  const setProduct = (idx, key, val) => {
    setProducts(prev => prev.map((p, i) => i === idx ? { ...p, [key]: val } : p));
  };

  const handleSave = async () => {
    try {
      const res = await updateFeaturedGrid({
        sectionTitle,
        sectionVisible,
        products: products.map((p, i) => ({
          productTitle: p.productTitle,
          price: parseFloat(p.price) || 0,
          imageUrl: p.imageUrl,
          order: i,
        })),
      });
      onChange(res.data.featuredGrid);
      toast.success('Featured grid saved!');
    } catch { toast.error('Failed to save featured grid'); }
  };

  return (
    <div className="sc">
      <div className="sc-head">
        <h3><Grid /> Featured Product Grid Editor</h3>
        <Toggle checked={sectionVisible} onChange={(v) => {
          setSectionVisible(v);
          toggleSection({ section: 'featuredGrid', visible: v }).catch(() => {});
        }} label="Section Visible" />
      </div>
      <div className="sc-body gap16">
        <div className="fg">
          <label className="fl">Section Title</label>
          <input className="fi" value={sectionTitle} onChange={e => setSectionTitle(e.target.value)} placeholder="Featured Products" />
        </div>

        <div className="prod-grid">
          {products.map((prod, idx) => (
            <div key={prod._id || idx} className="prod-card">
              <div className="prod-img">
                {prod.imageUrl
                  ? <img src={prod.imageUrl} alt="product" />
                  : <ImageIcon />
                }
              </div>
              <div className="prod-flds">
                <div className="pfl">Product Title</div>
                <input
                  className="pfi"
                  value={prod.productTitle}
                  onChange={e => setProduct(idx, 'productTitle', e.target.value)}
                  placeholder="Title..."
                />
                <div className="pfl" style={{ marginTop: 4 }}>Price (INR)</div>
                <input
                  className="pfi green"
                  value={prod.price}
                  onChange={e => setProduct(idx, 'price', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-teal btn-sm" onClick={handleSave}>Save Grid</button>
        </div>
      </div>
    </div>
  );
}
