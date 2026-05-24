import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Edit3,
  DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import RichTextEditor from "../../components/RichTextEditor";
import "./VendorProductDetailPage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function VendorProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [plans, setPlans] = useState([]);
  const token = localStorage.getItem("vendorToken");

  const [form, setForm] = useState({
    title: "",
    description: "",
    additionalInfo: "",
    shortDesc: "",
    sku: "",
    categories: [],
    basePrice: "",
    variants: [],
  });

  const [currentVariant, setCurrentVariant] = useState({
    zone: "",
    plan: "",
    price: "",
    salePrice: "",
    isAvailable: true,
  });

  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Zone options - basecity label will be updated dynamically with vendor data
  const ZONE_OPTIONS = [
    {
      value: "basecity",
      label: product?.vendor?.baseCity
        ? `📍 ${product.vendor.baseCity.toUpperCase()} (base city)`
        : "📍 Your Base City",
    },
    { value: "north", label: "🔵 North Zone" },
    { value: "south", label: "🔵 South Zone" },
    { value: "east", label: "🔵 East Zone" },
    { value: "west", label: "🔵 West Zone" },
    { value: "virtual", label: "🌐 Virtual" },
  ];

  // Fetch product details and form data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, categoriesRes, citiesRes, plansRes] =
          await Promise.all([
            axios.get(`${API_BASE}/products/${id}`),
            axios.get(`${API_BASE}/categories`),
            axios.get(`${API_BASE}/cities`),
            axios.get(`${API_BASE}/plans`),
          ]);

        setProduct(productRes.data);
        setCategories(
          categoriesRes.data.categories || categoriesRes.data || [],
        );
        setCities(citiesRes.data.cities || citiesRes.data || []);
        setPlans(plansRes.data.plans || plansRes.data || []);

        // Initialize form
        setForm({
          title: productRes.data.title,
          description: productRes.data.description,
          additionalInfo: productRes.data.additionalInfo || "",
          shortDesc: productRes.data.shortDesc,
          sku: productRes.data.sku,
          categories: productRes.data.categories?.map((c) => c._id) || [],
          basePrice: productRes.data.basePrice || "",
          variants: productRes.data.variants || [],
        });
      } catch (err) {
        toast.error("Failed to load product details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Pre-select first plan when plans are loaded
  useEffect(() => {
    if (plans.length > 0 && !currentVariant.plan) {
      const firstPlan = plans[0];
      setCurrentVariant((prev) => ({
        ...prev,
        plan: firstPlan._id,
        // Auto-set zone to "virtual" if first plan is "base"
        zone:
          firstPlan.name && firstPlan.name.toLowerCase() === "base"
            ? "virtual"
            : prev.zone,
      }));
    }
  }, [plans]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryToggle = (categoryId) => {
    setForm((prev) => {
      const isSelected = prev.categories.includes(categoryId);
      return {
        ...prev,
        categories: isSelected
          ? prev.categories.filter((id) => id !== categoryId)
          : [...prev.categories, categoryId],
      };
    });
  };

  const removeCategory = (categoryId) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.filter((id) => id !== categoryId),
    }));
  };

  const toggleParentCategory = (parentId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(parentId)) {
      newExpanded.delete(parentId);
    } else {
      newExpanded.add(parentId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleVariantChange = (e) => {
    const { name, value, type, checked } = e.target;
    let updatedVariant = {
      ...currentVariant,
      [name]: type === "checkbox" ? checked : value,
    };

    // Auto-set zone to "virtual" when plan is "base"
    if (name === "plan") {
      const selectedPlan = plans.find((p) => p._id === value);
      if (
        selectedPlan &&
        selectedPlan.name &&
        selectedPlan.name.toLowerCase() === "base"
      ) {
        updatedVariant.zone = "virtual";
      }
    }

    setCurrentVariant(updatedVariant);
  };

  const addVariant = () => {
    if (!currentVariant.zone || !currentVariant.plan || !currentVariant.price) {
      toast.error("Please select zone, plan, and enter price");
      return;
    }

    const exists = form.variants.some(
      (v) => v.zone === currentVariant.zone && v.plan === currentVariant.plan,
    );
    if (exists) {
      toast.error("This zone-plan combination already exists");
      return;
    }

    setForm((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          zone: currentVariant.zone,
          plan: currentVariant.plan,
          price: parseFloat(currentVariant.price),
          salePrice: currentVariant.salePrice
            ? parseFloat(currentVariant.salePrice)
            : null,
          isAvailable: currentVariant.isAvailable,
        },
      ],
    }));

    setCurrentVariant({
      zone: "",
      plan: "",
      price: "",
      salePrice: "",
      isAvailable: true,
    });
    toast.success("Variant added!");
  };

  const removeVariant = (index) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const updateVariant = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === index ? { ...v, [field]: value } : v,
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.sku) {
      toast.error("Please fill in title and SKU");
      return;
    }

    if (form.variants.length === 0) {
      toast.error("Please add at least one variant");
      return;
    }

    setSaving(true);
    try {
      const productData = {
        title: form.title,
        description: form.description,
        additionalInfo: form.additionalInfo,
        shortDesc: form.shortDesc,
        sku: form.sku,
        categories: form.categories,
        basePrice: parseFloat(form.basePrice) || 0,
        variants: form.variants,
      };

      await axios.patch(`${API_BASE}/products/vendor/${id}`, productData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Product updated successfully!");
      setEditing(false);
      // Refresh product data
      const res = await axios.get(`${API_BASE}/products/${id}`);
      setProduct(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="vendor-product-detail-page">
        <div className="loading">Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="vendor-product-detail-page">
        <div className="empty-state">
          <h3>Product not found</h3>
          <button
            className="btn-primary"
            onClick={() => navigate("/vendor/products/all")}
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const getCategoryNames = (categoryIds) => {
    if (!categoryIds || !Array.isArray(categoryIds)) return "—";
    return (
      categoryIds
        .map((catId) => categories.find((c) => c._id === catId)?.name)
        .filter(Boolean)
        .join(", ") || "—"
    );
  };

  const getZoneName = (zone) => {
    const zoneLabel = ZONE_OPTIONS.find((z) => z.value === zone)?.label || zone;
    if (zone === "basecity" && product?.vendor?.baseCity) {
      return `📍 ${product.vendor.baseCity.toUpperCase()} (base city)`;
    }
    return zoneLabel;
  };

  const getPlanName = (planId) => {
    // Handle both ID and populated object
    if (typeof planId === "object" && planId?.name) {
      return planId.name;
    }
    const plan = plans.find((p) => p._id === planId);
    return plan ? plan.name : "—";
  };

  return (
    <div className="vendor-product-detail-page">
      <button
        className="btn-back"
        onClick={() => navigate("/vendor/products/all")}
      >
        <ArrowLeft size={16} />
        Back to Products
      </button>

      <div className="detail-header">
        <div>
          <h1>{product.title}</h1>
          <p className="status">
            Status:{" "}
            <span className={`badge ${product.status}`}>{product.status}</span>
          </p>
        </div>
        {!editing && (
          <button className="btn-primary" onClick={() => setEditing(true)}>
            <Edit3 size={16} />
            Edit Product
          </button>
        )}
      </div>

      {!editing ? (
        // VIEW MODE
        <div className="detail-container">
          <div className="detail-card">
            <h3>Product Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Product Name</label>
                <p>{product.title}</p>
              </div>
              <div className="info-item">
                <label>SKU</label>
                <p>{product.sku}</p>
              </div>
              <div className="info-item">
                <label>Categories</label>
                <p>{getCategoryNames(product.categories)}</p>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <h3>Description</h3>
            <div
              className="description-content"
              dangerouslySetInnerHTML={{
                __html: product.description || "—",
              }}
            />
          </div>

          <div className="detail-card">
            <h3>Additional Info</h3>
            <div
              className="description-content"
              dangerouslySetInnerHTML={{
                __html: product.additionalInfo || "—",
              }}
            />
          </div>

          <div className="detail-card">
            <h3>Short Description</h3>
            <p>{product.shortDesc || "—"}</p>
          </div>

          <div className="detail-card">
            <h3>Base Price</h3>
            <p>₹{(product.basePrice || 0).toFixed(2)}</p>
          </div>

          <div className="detail-card">
            <h3>Pricing Variants ({product.variants?.length || 0})</h3>
            {product.variants && product.variants.length > 0 ? (
              <table className="variants-table">
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
                  {product.variants.map((variant, idx) => (
                    <tr key={idx}>
                      <td>{getZoneName(variant.zone)}</td>
                      <td>{getPlanName(variant.plan)}</td>
                      <td>₹{variant.price.toFixed(2)}</td>
                      <td>
                        {variant.salePrice
                          ? `₹${variant.salePrice.toFixed(2)}`
                          : "—"}
                      </td>
                      <td>{variant.isAvailable ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="empty-text">No variants added</p>
            )}
          </div>

          <div className="detail-card">
            <h3>Images</h3>
            {product.images && product.images.length > 0 ? (
              <div className="images-grid">
                {product.images.map((img, idx) => (
                  <div key={idx} className="image-item">
                    <img src={img.url} alt={img.alt} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-text">No images uploaded</p>
            )}
          </div>
        </div>
      ) : (
        // EDIT MODE
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="detail-container">
            <div className="form-card">
              <h3>Edit Product</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>SKU *</label>
                  <input
                    type="text"
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    placeholder="Enter SKU"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <RichTextEditor
                  value={form.description}
                  onChange={(html) =>
                    setForm((prev) => ({ ...prev, description: html }))
                  }
                  placeholder="Describe your product..."
                />
              </div>

              <div className="form-group">
                <label>Additional Info</label>
                <RichTextEditor
                  value={form.additionalInfo}
                  onChange={(html) =>
                    setForm((prev) => ({ ...prev, additionalInfo: html }))
                  }
                  placeholder="Enter additional details for this product…"
                />
              </div>

              <div className="form-group">
                <label>Short Description</label>
                <input
                  type="text"
                  name="shortDesc"
                  value={form.shortDesc}
                  onChange={handleChange}
                  placeholder="Brief description"
                />
              </div>

              <div className="form-group">
                <div className="category-section-header">
                  <label>Categories</label>
                  <p className="form-hint">Select one or more subcategories</p>
                </div>

                {/* Show selected categories as pills */}
                {form.categories.length > 0 && (
                  <div className="selected-categories-wrapper">
                    <div className="selected-categories-label">
                      <span className="badge-count">
                        {form.categories.length}
                      </span>
                      Selected
                    </div>
                    <div className="selected-categories">
                      {form.categories.map((catId) => {
                        const cat = categories.find((c) => c._id === catId);
                        return cat ? (
                          <div key={catId} className="category-pill">
                            <span className="pill-content">{cat.name}</span>
                            <button
                              type="button"
                              className="pill-remove-btn"
                              onClick={() => removeCategory(catId)}
                              title="Remove category"
                              aria-label={`Remove ${cat.name}`}
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Parent categories with collapsible subcategories */}
                <div className="categories-accordion">
                  {(() => {
                    const parentCats = categories.filter((cat) => !cat.parent);
                    if (parentCats.length === 0) {
                      return (
                        <div className="empty-state">
                          <p>No categories available</p>
                        </div>
                      );
                    }
                    return parentCats.map((parent) => {
                      const subcats = categories.filter(
                        (cat) => cat.parent?._id === parent._id,
                      );
                      const isExpanded = expandedCategories.has(parent._id);
                      return (
                        <div key={parent._id} className="accordion-item">
                          <button
                            type="button"
                            className={`accordion-header ${isExpanded ? "expanded" : ""}`}
                            onClick={() => toggleParentCategory(parent._id)}
                          >
                            <span className="accordion-icon">
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <polyline points="9 18 15 12 9 6"></polyline>
                              </svg>
                            </span>
                            <span className="accordion-title">
                              {parent.name}
                            </span>
                            {subcats.length > 0 && (
                              <span className="subcat-count">
                                {subcats.length}
                              </span>
                            )}
                          </button>
                          {isExpanded && subcats.length > 0 && (
                            <div className="accordion-body">
                              <div className="subcategories-grid">
                                {subcats.map((subcat) => (
                                  <label
                                    key={subcat._id}
                                    className="checkbox-item"
                                  >
                                    <div className="checkbox-wrapper">
                                      <input
                                        type="checkbox"
                                        checked={form.categories.includes(
                                          subcat._id,
                                        )}
                                        onChange={() =>
                                          handleCategoryToggle(subcat._id)
                                        }
                                      />
                                      <div className="checkbox-custom"></div>
                                    </div>
                                    <span className="checkbox-label">
                                      {subcat.name}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                          {isExpanded && subcats.length === 0 && (
                            <div className="accordion-body">
                              <div className="empty-subcategories">
                                <p>No subcategories</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>

            {/* BASE PLAN SECTION */}
            <div className="form-card">
              <h3>Base Plan</h3>

              <div className="form-group">
                <label>
                  Starting Price <span className="label-required">*</span>
                </label>
                <div className="input-prefix-wrapper">
                  <span className="input-prefix">₹</span>
                  <input
                    type="number"
                    name="basePrice"
                    value={form.basePrice}
                    onChange={handleChange}
                    placeholder="Starts from price"
                    step="0.01"
                    min="0"
                  />
                </div>
                <span className="form-hint">
                  This base price will be displayed as the starting price
                </span>
              </div>
            </div>

            {/* VARIANTS SECTION */}
            <div className="form-card">
              <h3>Manage Variants</h3>

              <div className="variant-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Plan *</label>
                    <select
                      name="plan"
                      value={currentVariant.plan}
                      onChange={handleVariantChange}
                    >
                      <option value="">Select Plan</option>
                      {plans.map((plan) => (
                        <option key={plan._id} value={plan._id}>
                          {plan.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Zone *</label>
                    <select
                      name="zone"
                      value={currentVariant.zone}
                      onChange={handleVariantChange}
                      disabled={currentVariant.plan ? false : true}
                    >
                      <option value="">Select Zone</option>
                      {ZONE_OPTIONS.map((zone) => (
                        <option key={zone.value} value={zone.value}>
                          {zone.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      value={currentVariant.price}
                      onChange={handleVariantChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Sale Price (₹)</label>
                    <input
                      type="number"
                      name="salePrice"
                      value={currentVariant.salePrice}
                      onChange={handleVariantChange}
                      placeholder="0.00 (optional)"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={currentVariant.isAvailable}
                      onChange={handleVariantChange}
                    />
                    Available
                  </label>
                </div>

                <button
                  type="button"
                  className="btn-add-variant"
                  onClick={addVariant}
                >
                  <Plus size={18} /> Add Variant
                </button>
              </div>

              {form.variants.length > 0 && (
                <div className="variants-list">
                  <h4>Variants ({form.variants.length})</h4>
                  <table className="variants-edit-table">
                    <thead>
                      <tr>
                        <th>Zone</th>
                        <th>Plan</th>
                        <th>Price</th>
                        <th>Sale Price</th>
                        <th>Available</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.variants.map((variant, index) => {
                        const zoneName = getZoneName(variant.zone);
                        return (
                          <tr key={index}>
                            <td>{zoneName}</td>
                            <td>{getPlanName(variant.plan)}</td>
                            <td>₹{variant.price.toFixed(2)}</td>
                            <td>
                              {variant.salePrice
                                ? `₹${variant.salePrice.toFixed(2)}`
                                : "—"}
                            </td>
                            <td>{variant.isAvailable ? "Yes" : "No"}</td>
                            <td>
                              <button
                                type="button"
                                className="btn-remove-variant"
                                onClick={() => removeVariant(index)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
