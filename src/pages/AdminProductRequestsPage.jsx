import { useState, useEffect, useCallback } from "react";
import { Check, X, Eye, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import "./AdminProductRequestsPage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function AdminProductRequestsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const token = localStorage.getItem("token");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE}/products/admin/all?status=pending&search=${search}&page=${page}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setProducts(res.data.products || []);
      setPages(res.data.pages || 1);
    } catch (err) {
      toast.error("Failed to fetch pending products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, search, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleApprove = async (productId) => {
    setActionLoading((prev) => ({ ...prev, [productId]: "approving" }));
    try {
      await axios.patch(
        `${API_BASE}/products/${productId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Product approved!");
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve product");
    } finally {
      setActionLoading((prev) => ({ ...prev, [productId]: null }));
    }
  };

  const handleReject = async (productId) => {
    setActionLoading((prev) => ({ ...prev, [productId]: "rejecting" }));
    try {
      await axios.patch(
        `${API_BASE}/products/${productId}/reject`,
        { reason: "Rejected by admin" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Product rejected!");
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject product");
    } finally {
      setActionLoading((prev) => ({ ...prev, [productId]: null }));
    }
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setShowDetails(true);
  };

  return (
    <div className="admin-product-requests-page">
      <div className="page-header">
        <h1>Pending Product Requests</h1>
        <p>Review and approve/reject new vendor product submissions</p>
      </div>

      <div className="controls-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <button className="btn-refresh" onClick={fetchProducts} title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <p>Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <h3>No pending products</h3>
          <p>All product requests have been reviewed.</p>
        </div>
      ) : (
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Vendor</th>
                <th>Category</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="product-row">
                  <td>
                    <div className="product-name">
                      {product.images?.[0]?.url && (
                        <img
                          src={product.images[0].url}
                          alt={product.title}
                          className="product-thumb"
                        />
                      )}
                      <span>{product.title}</span>
                    </div>
                  </td>
                  <td>{product.vendor?.name || "Unknown"}</td>
                  <td>
                    {product.categories?.map((c) => c.name).join(", ") || "—"}
                  </td>
                  <td className="sku">{product.sku}</td>
                  <td className="price">₹{product.price?.toFixed(2)}</td>
                  <td className="date">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-view"
                        onClick={() => handleViewDetails(product)}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="btn-icon btn-approve"
                        onClick={() => handleApprove(product._id)}
                        disabled={actionLoading[product._id]}
                        title="Approve"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        className="btn-icon btn-reject"
                        onClick={() => handleReject(product._id)}
                        disabled={actionLoading[product._id]}
                        title="Reject"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="pagination">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span>
            Page {page} of {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
          >
            Next
          </button>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowDetails(false)}
            >
              ✕
            </button>

            <h2>{selectedProduct.title}</h2>

            <div className="modal-body">
              {selectedProduct.images?.[0]?.url && (
                <div className="product-image">
                  <img
                    src={selectedProduct.images[0].url}
                    alt={selectedProduct.title}
                  />
                </div>
              )}

              <div className="details-grid">
                <div className="detail-item">
                  <label>SKU</label>
                  <p>{selectedProduct.sku}</p>
                </div>
                <div className="detail-item">
                  <label>Vendor</label>
                  <p>{selectedProduct.vendor?.name}</p>
                </div>
                <div className="detail-item">
                  <label>Category</label>
                  <p>
                    {selectedProduct.categories
                      ?.map((c) => c.name)
                      .join(", ") || "—"}
                  </p>
                </div>
                <div className="detail-item">
                  <label>Selling Price</label>
                  <p>₹{selectedProduct.price?.toFixed(2)}</p>
                </div>
                <div className="detail-item">
                  <label>Base Price</label>
                  <p>₹{selectedProduct.basePrice?.toFixed(2) || "N/A"}</p>
                </div>
                <div className="detail-item">
                  <label>Commission</label>
                  <p>{selectedProduct.commission?.toFixed(2) || 0}%</p>
                </div>
              </div>

              {/* Variants Section */}
              {selectedProduct.variants &&
                selectedProduct.variants.length > 0 && (
                  <div className="variants-section">
                    <label>Variants ({selectedProduct.variants.length})</label>
                    <div className="variants-table">
                      <table>
                        <thead>
                          <tr>
                            <th>City</th>
                            <th>Plan</th>
                            <th>Regular Price</th>
                            <th>Sale Price</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProduct.variants.map((variant, idx) => (
                            <tr key={idx}>
                              <td>
                                {typeof variant.city === "object"
                                  ? variant.city?.name
                                  : "—"}
                              </td>
                              <td>
                                {typeof variant.plan === "object"
                                  ? variant.plan?.name
                                  : "—"}
                              </td>
                              <td className="price-cell">
                                ₹{Number(variant.price || 0).toFixed(2)}
                              </td>
                              <td className="price-cell">
                                ₹{Number(variant.salePrice || 0).toFixed(2)}
                              </td>
                              <td>
                                <span
                                  className={
                                    variant.isAvailable
                                      ? "badge-available"
                                      : "badge-unavailable"
                                  }
                                >
                                  {variant.isAvailable
                                    ? "Available"
                                    : "Not Available"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              <div className="description-section">
                <label>Description</label>
                <div
                  className="description-content"
                  dangerouslySetInnerHTML={{
                    __html: selectedProduct.description || "",
                  }}
                />
              </div>

              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setShowDetails(false)}
                >
                  Close
                </button>
                <button
                  className="btn-approve"
                  onClick={() => {
                    handleApprove(selectedProduct._id);
                    setShowDetails(false);
                  }}
                  disabled={actionLoading[selectedProduct._id]}
                >
                  <Check size={16} />
                  Approve
                </button>
                <button
                  className="btn-reject"
                  onClick={() => {
                    handleReject(selectedProduct._id);
                    setShowDetails(false);
                  }}
                  disabled={actionLoading[selectedProduct._id]}
                >
                  <X size={16} />
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
