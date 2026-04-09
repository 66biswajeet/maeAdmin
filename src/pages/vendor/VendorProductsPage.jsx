import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit2, Trash2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import "./VendorProductsPage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function VendorProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const navigate = useNavigate();

  const token = localStorage.getItem("vendorToken");
  const vendor = JSON.parse(localStorage.getItem("vendor") || "{}");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${API_BASE}/products/vendor/my-products`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { page, search, limit: 10 },
        },
      );
      setProducts(data.products || []);
      setPages(data.pages || 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [token, page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await axios.delete(`${API_BASE}/products/vendor/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Product deleted");
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete product");
    }
  };

  const filtered = search.trim()
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase()),
      )
    : products;

  return (
    <div className="vendor-products-page">
      <div className="page-header">
        <div>
          <h1>My Products</h1>
          <p>Manage and view all your products</p>
        </div>
        <a href="/vendor/products/add" className="btn-primary">
          <Plus size={16} />
          Add Product
        </a>
      </div>

      <div className="card">
        <div className="card-toolbar">
          <div className="search-wrapper">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <button
            className="btn-icon"
            onClick={fetchProducts}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "spin" : ""} />
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No Products</h3>
            <p>Start by adding your first product to your catalog</p>
            <a href="/vendor/products/add" className="btn-primary">
              <Plus size={16} />
              Add Your First Product
            </a>
          </div>
        ) : (
          <div className="products-grid">
            {filtered.map((product) => (
              <div
                key={product._id}
                className="product-card"
                onClick={() => navigate(`/vendor/products/${product._id}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="product-image">
                  {product.images?.[0]?.url ? (
                    <img src={product.images[0].url} alt={product.title} />
                  ) : (
                    <div className="placeholder">📷</div>
                  )}
                </div>
                <div className="product-info">
                  <h4>{product.title}</h4>
                  <p className="sku">SKU: {product.sku}</p>
                  <p className="price">
                    ₹{(product.basePrice || 0).toLocaleString("en-IN")}
                  </p>
                  <p className="commission">
                    Commission: {product.commission?.toFixed(2) || 0}%
                  </p>
                </div>
                <div className="product-actions">
                  <button
                    className="btn-icon btn-edit"
                    title="Edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/vendor/products/${product._id}`);
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(product._id);
                    }}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="pagination">
            <button
              className="btn-page"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Prev
            </button>
            <span>
              Page {page} of {pages}
            </span>
            <button
              className="btn-page"
              disabled={page === pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
