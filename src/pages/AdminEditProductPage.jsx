import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Plus, Trash2, DollarSign } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import RichTextEditor from "../components/RichTextEditor";
import CloudinaryUpload from "../components/CloudinaryUpload";
import "./AdminEditProductPage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function AdminEditProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [plans, setPlans] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDesc: "",
    commission: "",
    sku: "",
    basePrice: "",
    categories: [],
    status: "active",
    isFeatured: false,
    isBestDeal: false,
    deliverables: [],
    variants: [],
  });

  const [currentVariant, setCurrentVariant] = useState({
    zone: "",
    plan: "",
    price: "",
    salePrice: "",
    isAvailable: true,
  });

  const [deliverableInput, setDeliverableInput] = useState("");
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Zone options
  const ZONE_OPTIONS = [
    { value: "basecity", label: "📍 Your Base City" },
    { value: "north", label: "🔵 North Zone" },
    { value: "south", label: "🔵 South Zone" },
    { value: "east", label: "🔵 East Zone" },
    { value: "west", label: "🔵 West Zone" },
    { value: "virtual", label: "🌐 Virtual" },
  ];

  // Fetch product details and metadata
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productRes, categoriesRes, citiesRes, plansRes] =
          await Promise.all([
            axios.get(`${API_BASE}/products/${productId}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${API_BASE}/categories`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${API_BASE}/cities`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${API_BASE}/plans`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        const product = productRes.data;

        setFormData({
          title: product.title || "",
          description: product.description || "",
          shortDesc: product.shortDesc || "",
          commission: product.commission || "",
          sku: product.sku || "",
          basePrice: product.basePrice || "",
          categories: product.categories?.map((c) => c._id) || [],
          status: product.status || "active",
          isFeatured: product.isFeatured || false,
          isBestDeal: product.isBestDeal || false,
          deliverables: product.deliverables || [],
          variants: product.variants || [],
        });

        if (product.images && product.images.length > 0) {
          setExistingImages(product.images);
        }

        const cats = categoriesRes.data?.categories || categoriesRes.data || [];
        setCategories(cats);
        setCities(citiesRes.data?.cities || citiesRes.data || []);
        setPlans(plansRes.data?.plans || plansRes.data || []);
      } catch (err) {
        toast.error("Failed to load product details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (productId && token) {
      fetchData();
    }
  }, [productId, token]);

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

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCategoryToggle = (categoryId) => {
    setFormData((prev) => {
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
    setFormData((prev) => ({
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

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setNewImages((prev) => [...prev, ...files]);
    setPreviewImages((prev) => [...prev, ...newPreviews]);
  };

  // Handle Cloudinary image upload
  const handleCloudinaryImageUpload = (cloudinaryUrl) => {
    if (cloudinaryUrl) {
      setNewImages((prev) => [
        ...prev,
        { url: cloudinaryUrl, alt: formData.title || "Product image" },
      ]);
      setPreviewImages((prev) => [...prev, cloudinaryUrl]);
      toast.success("Image uploaded successfully!");
    }
  };

  // Remove new image
  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove existing image
  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Add deliverable
  const addDeliverable = () => {
    if (deliverableInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        deliverables: [...prev.deliverables, deliverableInput],
      }));
      setDeliverableInput("");
    }
  };

  // Remove deliverable
  const removeDeliverable = (index) => {
    setFormData((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index),
    }));
  };

  // Add variant
  const addVariant = () => {
    if (!currentVariant.zone || !currentVariant.plan || !currentVariant.price) {
      toast.error("Please select zone, plan, and enter price");
      return;
    }

    // Check for duplicate zone-plan combination
    const isDuplicate = formData.variants.some(
      (v) => v.zone === currentVariant.zone && v.plan === currentVariant.plan,
    );

    if (isDuplicate) {
      toast.error("This zone-plan combination already exists");
      return;
    }

    setFormData((prev) => ({
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
          id: Date.now(),
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
  };

  // Remove variant
  const removeVariant = (id) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((v) => v.id !== id),
    }));
  };

  // Handle variant field change
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

  // Get city/plan names for display
  const getCityName = (cityId) => {
    const city = cities.find((c) => c._id === cityId);
    return city?.name || "Unknown City";
  };

  const getPlanName = (planId) => {
    if (!planId) return "Unknown Plan";
    // If planId is already a populated object with a name
    if (typeof planId === "object" && planId.name) return planId.name;

    // Otherwise look it up in the plans state
    const id = typeof planId === "object" ? planId._id : planId;
    const plan = plans.find((p) => p._id === id);
    return plan?.name || "Unknown Plan";
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.variants.length) {
      toast.error(
        "Please fill all required fields and add at least one variant",
      );
      return;
    }

    setSaving(true);
    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("shortDesc", formData.shortDesc);
      submitData.append("commission", formData.commission);
      submitData.append("sku", formData.sku);
      submitData.append("basePrice", parseFloat(formData.basePrice) || 0);

      // Append each category ID individually instead of stringifying
      formData.categories.forEach((catId) => {
        submitData.append("categories", catId);
      });

      submitData.append("status", formData.status);
      submitData.append("isFeatured", formData.isFeatured);
      submitData.append("isBestDeal", formData.isBestDeal);
      submitData.append("deliverables", JSON.stringify(formData.deliverables));
      submitData.append("variants", JSON.stringify(formData.variants));

      // Add new images
      newImages.forEach((img) => {
        submitData.append("images", img);
      });

      // Add existing image IDs to keep
      if (existingImages.length > 0) {
        submitData.append("keepImages", JSON.stringify(existingImages));
      }

      const response = await axios.patch(
        `${API_BASE}/products/${productId}`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success("Product updated successfully");
      setTimeout(() => {
        navigate("/products/all");
      }, 1000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to update product";
      toast.error(errorMsg);
      console.error("Update Error:", {
        status: err.response?.status,
        message: errorMsg,
        fullError: err.response?.data,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-edit-page">
        <div className="loading">Loading product details...</div>
      </div>
    );
  }

  return (
    <div className="admin-edit-page">
      <div className="header-section">
        <button
          onClick={() => navigate("/products/all")}
          className="back-button"
        >
          <ArrowLeft size={20} /> Back to Products
        </button>
        <h1>Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="edit-form">
        {/* Basic Information */}
        <section className="form-section">
          <h2>Basic Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>SKU</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <div className="category-section-header">
                <label>Categories</label>
                <p className="form-hint">Select one or more subcategories</p>
              </div>

              {/* Show selected categories as pills */}
              {formData.categories.length > 0 && (
                <div className="selected-categories-wrapper">
                  <div className="selected-categories-label">
                    <span className="badge-count">
                      {formData.categories.length}
                    </span>
                    Selected
                  </div>
                  <div className="selected-categories">
                    {formData.categories.map((catId) => {
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
                          <span className="accordion-title">{parent.name}</span>
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
                                      checked={formData.categories.includes(
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
            <div className="form-group">
              <label>Commission (%)</label>
              <input
                type="number"
                name="commission"
                value={formData.commission}
                onChange={handleChange}
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Short Description</label>
            <textarea
              name="shortDesc"
              value={formData.shortDesc}
              onChange={handleChange}
              rows="2"
            />
          </div>

          <div className="form-group">
            <label>Full Description</label>
            <RichTextEditor
              value={formData.description}
              onChange={(html) =>
                setFormData((prev) => ({ ...prev, description: html }))
              }
              placeholder="Describe your product features, benefits, specifications…"
            />
          </div>
        </section>

        {/* Base Plan Section */}
        <section className="form-section">
          <h2>Base Plan</h2>

          <div className="form-group">
            <label>
              Starting Price <span className="label-required">*</span>
            </label>
            <div className="input-prefix-wrapper">
              <span className="input-prefix">₹</span>
              <input
                type="number"
                name="basePrice"
                value={formData.basePrice}
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
        </section>

        {/* Variants Section */}
        <section className="form-section">
          <h2>Pricing Variants *</h2>

          <div className="variant-form">
            <div className="form-grid">
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

              <div className="form-group">
                <label>Price *</label>
                <input
                  type="number"
                  name="price"
                  value={currentVariant.price}
                  onChange={handleVariantChange}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Sale Price</label>
                <input
                  type="number"
                  name="salePrice"
                  value={currentVariant.salePrice}
                  onChange={handleVariantChange}
                  min="0"
                  step="0.01"
                />
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
                onClick={addVariant}
                className="btn-add-variant"
              >
                <Plus size={18} /> Add Variant
              </button>
            </div>
          </div>

          {/* Variants Table */}
          {formData.variants.length > 0 && (
            <div className="variants-table-container">
              <table className="variants-table">
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
                  {formData.variants.map((variant) => {
                    const zoneName =
                      ZONE_OPTIONS.find((z) => z.value === variant.zone)
                        ?.label || variant.zone;
                    return (
                      <tr key={variant.id || Math.random()}>
                        <td>{zoneName}</td>
                        <td>{getPlanName(variant.plan)}</td>
                        <td>₹{variant.price}</td>
                        <td>
                          {variant.salePrice ? `₹${variant.salePrice}` : "-"}
                        </td>
                        <td>{variant.isAvailable ? "Yes" : "No"}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => removeVariant(variant.id)}
                            className="btn-remove"
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
        </section>

        {/* Deliverables Section */}
        <section className="form-section">
          <h2>Deliverables</h2>
          <div className="deliverables-form">
            <input
              type="text"
              value={deliverableInput}
              onChange={(e) => setDeliverableInput(e.target.value)}
              placeholder="Enter deliverable item"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addDeliverable();
                }
              }}
            />
            <button type="button" onClick={addDeliverable} className="btn-add">
              <Plus size={18} /> Add
            </button>
          </div>

          {formData.deliverables.length > 0 && (
            <ul className="deliverables-list">
              {formData.deliverables.map((item, index) => (
                <li key={index}>
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => removeDeliverable(index)}
                    className="btn-remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Images Section */}
        <section className="form-section">
          <h2>Product Images</h2>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="images-group">
              <h3>Current Images</h3>
              <div className="images-grid">
                {existingImages.map((img, index) => (
                  <div key={index} className="image-item">
                    <img src={img} alt={`Product ${index}`} />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="btn-remove-image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images Preview */}
          {previewImages.length > 0 && (
            <div className="images-group">
              <h3>New Images</h3>
              <div className="images-grid">
                {previewImages.map((preview, index) => (
                  <div key={index} className="image-item">
                    <img src={preview} alt={`New ${index}`} />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="btn-remove-image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <CloudinaryUpload
            onUpload={handleCloudinaryImageUpload}
            folder="products"
          />
        </section>

        {/* Status & Features */}
        <section className="form-section">
          <h2>Status & Features</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                />
                Featured
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="isBestDeal"
                  checked={formData.isBestDeal}
                  onChange={handleChange}
                />
                Best Deal
              </label>
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/products/all")}
            className="btn-cancel"
          >
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-submit">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
