import { useState, useEffect, useCallback } from "react";
import {
  Check,
  X,
  Eye,
  RefreshCw,
  Archive,
  Eye as EyeOff,
  Edit,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import "./AdminAllProductsPage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function AdminAllProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // all, active, inactive, pending
  const [actionLoading, setActionLoading] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [cities, setCities] = useState([]);
  const [plans, setPlans] = useState([]);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/products/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          status: statusFilter || undefined,
          search,
          page,
          limit: 20,
        },
      });
      setProducts(res.data.products || []);
      setPages(res.data.pages || 1);
    } catch (err) {
      toast.error("Failed to fetch products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, search, page, statusFilter]);

  useEffect(() => {
    fetchProducts();
    // Fetch cities and plans for variant display
    const fetchMetadata = async () => {
      try {
        const [citiesRes, plansRes] = await Promise.all([
          axios.get(`${API_BASE}/cities`),
          axios.get(`${API_BASE}/plans`),
        ]);
        setCities(citiesRes.data.cities || citiesRes.data || []);
        setPlans(plansRes.data.plans || plansRes.data || []);
      } catch (err) {
        console.error("Failed to fetch cities/plans", err);
      }
    };
    fetchMetadata();
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
      fetchProducts();
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
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject product");
    } finally {
      setActionLoading((prev) => ({ ...prev, [productId]: null }));
    }
  };

  const handleToggleFeatured = async (productId, isFeatured) => {
    setActionLoading((prev) => ({ ...prev, [productId]: "updating" }));
    try {
      await axios.patch(
        `${API_BASE}/products/${productId}/toggle-featured`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(`Product ${!isFeatured ? "featured" : "unfeatured"}!`);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update product");
    } finally {
      setActionLoading((prev) => ({ ...prev, [productId]: null }));
    }
  };

  const handleToggleBestDeal = async (productId, isBestDeal) => {
    setActionLoading((prev) => ({ ...prev, [productId]: "updating" }));
    try {
      await axios.patch(
        `${API_BASE}/products/${productId}/toggle-best-deal`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(
        `Product ${!isBestDeal ? "marked as" : "removed from"} best deals!`,
      );
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update product");
    } finally {
      setActionLoading((prev) => ({ ...prev, [productId]: null }));
    }
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setShowDetails(true);
  };

  const handleDeleteProduct = async (productId) => {
    setActionLoading((prev) => ({ ...prev, [productId]: "deleting" }));
    try {
      await axios.delete(`${API_BASE}/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Product deleted successfully!");
      setDeleteConfirm(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete product");
    } finally {
      setActionLoading((prev) => ({ ...prev, [productId]: null }));
    }
  };

  const handleNavigateToEdit = (productId) => {
    navigate(`/products/edit/${productId}`);
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: "#e8f5e9", color: "#27ae60", text: "Active" },
      inactive: { bg: "#fff3e0", color: "#f39c12", text: "Inactive" },
      pending: { bg: "#e3f2fd", color: "#2196f3", text: "Pending" },
    };
    const badge = badges[status] || badges.inactive;
    return badge;
  };

  return (
    <div className="admin-all-products-page">
      <div className="page-header">
        <h1>All Products</h1>
        <p>Manage all products across vendors</p>
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

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="status-filter"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>

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
          <h3>No products found</h3>
          <p>Try adjusting your search or filters</p>
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
                <th>Commission</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Best Deal</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const statusBadge = getStatusBadge(product.status);
                return (
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
                    <td className="price">
                      ₹{(product.basePrice || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="commission">
                      {product.commission?.toFixed(2) || 0}%
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: statusBadge.bg,
                          color: statusBadge.color,
                        }}
                      >
                        {statusBadge.text}
                      </span>
                    </td>
                    <td>
                      <span className="featured-badge">
                        {product.isFeatured ? "⭐ Yes" : "No"}
                      </span>
                    </td>
                    <td>
                      <span className="best-deal-badge">
                        {product.isBestDeal ? "🔥 Yes" : "No"}
                      </span>
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
                          className="btn-icon btn-edit"
                          onClick={() => handleNavigateToEdit(product._id)}
                          title="Edit Product"
                        >
                          <Edit size={16} />
                        </button>
                        {product.status === "pending" && (
                          <>
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
                          </>
                        )}
                        {product.status === "active" && (
                          <>
                            <button
                              className={`btn-icon btn-featured ${
                                product.isFeatured ? "active" : ""
                              }`}
                              onClick={() =>
                                handleToggleFeatured(
                                  product._id,
                                  product.isFeatured,
                                )
                              }
                              disabled={actionLoading[product._id]}
                              title="Toggle Featured"
                            >
                              {product.isFeatured ? "⭐" : "☆"}
                            </button>
                            <button
                              className={`btn-icon btn-best-deal ${
                                product.isBestDeal ? "active" : ""
                              }`}
                              onClick={() =>
                                handleToggleBestDeal(
                                  product._id,
                                  product.isBestDeal,
                                )
                              }
                              disabled={actionLoading[product._id]}
                              title="Toggle Best Deal"
                            >
                              {product.isBestDeal ? "🔥" : "❄️"}
                            </button>
                          </>
                        )}
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => setDeleteConfirm(product._id)}
                          disabled={actionLoading[product._id]}
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
                  <label>Status</label>
                  <p>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: getStatusBadge(selectedProduct.status)
                          .bg,
                        color: getStatusBadge(selectedProduct.status).color,
                      }}
                    >
                      {getStatusBadge(selectedProduct.status).text}
                    </span>
                  </p>
                </div>
                <div className="detail-item">
                  <label>Base Price</label>
                  <p>
                    ₹{(selectedProduct.basePrice || 0).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="detail-item">
                  <label>Commission</label>
                  <p>{selectedProduct.commission?.toFixed(2) || 0}%</p>
                </div>
                <div className="detail-item">
                  <label>Featured</label>
                  <p>{selectedProduct.isFeatured ? "⭐ Yes" : "No"}</p>
                </div>
                <div className="detail-item">
                  <label>Best Deal</label>
                  <p>{selectedProduct.isBestDeal ? "🔥 Yes" : "No"}</p>
                </div>
              </div>

              <div className="description-section">
                <label>Short Description</label>
                <p>{selectedProduct.shortDesc || "—"}</p>
              </div>

              <div className="description-section">
                <label>Full Description</label>
                <div
                  className="description-content"
                  dangerouslySetInnerHTML={{
                    __html: selectedProduct.description || "—",
                  }}
                />
              </div>

              {/* VARIANTS SECTION */}
              <div className="variants-section">
                <h3>
                  Pricing Variants ({selectedProduct.variants?.length || 0})
                </h3>
                {selectedProduct.variants &&
                selectedProduct.variants.length > 0 ? (
                  <table className="variants-detail-table">
                    <thead>
                      <tr>
                        <th>Zone</th>
                        <th>Plan</th>
                        <th>Price</th>
                        <th>Sale Price</th>
                        <th>Available</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProduct.variants.map((variant, idx) => {
                        // Zone options mapping
                        const ZONE_MAP = {
                          basecity: "📍 Your Base City",
                          north: "🔵 North Zone",
                          south: "🔵 South Zone",
                          east: "🔵 East Zone",
                          west: "🔵 West Zone",
                        };
                        const zoneName = ZONE_MAP[variant.zone] || variant.zone;
                        const planName =
                          plans.find((p) => p._id === variant.plan)?.name ||
                          "—";
                        return (
                          <tr key={idx}>
                            <td>{zoneName}</td>
                            <td>{planName}</td>
                            <td>₹{variant.price.toFixed(2)}</td>
                            <td>
                              {variant.salePrice
                                ? `₹${variant.salePrice.toFixed(2)}`
                                : "—"}
                            </td>
                            <td>{variant.isAvailable ? "✓ Yes" : "✗ No"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p className="empty-text">No variants added</p>
                )}
              </div>

              {/* DELIVERABLES SECTION */}
              {selectedProduct.deliverables &&
                selectedProduct.deliverables.length > 0 && (
                  <div className="deliverables-section">
                    <h3>Deliverables</h3>
                    <ul className="deliverables-list">
                      {selectedProduct.deliverables.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* ALL IMAGES SECTION */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div className="images-section">
                  <h3>Product Images ({selectedProduct.images.length})</h3>
                  <div className="images-grid">
                    {selectedProduct.images.map((img, idx) => (
                      <div key={idx} className="image-item">
                        <img
                          src={img.url}
                          alt={img.alt || `Image ${idx + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* REVIEWS SECTION */}
              <div className="reviews-section">
                <h3>Reviews & Rating</h3>
                <div className="review-stats">
                  <div className="stat-item">
                    <label>Average Rating</label>
                    <p>{selectedProduct.avgRating?.toFixed(2) || "0.00"} / 5</p>
                  </div>
                  <div className="stat-item">
                    <label>Review Count</label>
                    <p>{selectedProduct.reviewCount || 0}</p>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setShowDetails(false)}
                >
                  Close
                </button>
                {selectedProduct.status === "pending" && (
                  <>
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
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div
            className="modal-content modal-confirm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Delete Product?</h3>
            <p>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </p>
            <div className="modal-confirm-actions">
              <button
                className="btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="btn-delete"
                onClick={() => handleDeleteProduct(deleteConfirm)}
                disabled={actionLoading[deleteConfirm]}
              >
                {actionLoading[deleteConfirm]
                  ? "Deleting..."
                  : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
