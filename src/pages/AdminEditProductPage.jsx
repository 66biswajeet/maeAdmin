import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Plus, Trash2, DollarSign, Star, Edit2, Check, X as XIcon } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import RichTextEditor from "../components/RichTextEditor";
import CloudinaryUpload from "../components/CloudinaryUpload";
import { getCategoryEmpanelments, getProductReviews, createCustomReview, updateReview, deleteReview, approveReview, rejectReview } from "../services/api";
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
    additionalInfo: "",
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
    empanelment: [],
  });

  const [currentVariant, setCurrentVariant] = useState({
    zone: "",
    plan: "",
    price: "",
    salePrice: "",
    isAvailable: true,
  });

  // ── Reviews State ──────────────────────────────────────────────────
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsSectionOpen, setReviewsSectionOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editReviewData, setEditReviewData] = useState({});
  const [customReviewForm, setCustomReviewForm] = useState({
    customDisplayName: "",
    rating: 5,
    title: "",
    body: "",
  });
  const [customReviewHover, setCustomReviewHover] = useState(0);
  const [customReviewSubmitting, setCustomReviewSubmitting] = useState(false);

  const fetchProductReviews = async () => {
    if (!productId) return;
    setReviewsLoading(true);
    try {
      const res = await getProductReviews(productId);
      setReviews(res.data || []);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleToggleReviewsSection = () => {
    if (!reviewsSectionOpen) fetchProductReviews();
    setReviewsSectionOpen(p => !p);
  };

  const handleStartEditReview = (rv) => {
    setEditingReviewId(rv._id);
    setEditReviewData({
      customDisplayName: rv.customDisplayName || rv.displayName || "",
      rating:            rv.rating,
      title:             rv.title  || "",
      body:              rv.body   || "",
    });
  };

  const handleSaveEditReview = async (id) => {
    try {
      await updateReview(id, editReviewData);
      toast.success("Review updated");
      setEditingReviewId(null);
      fetchProductReviews();
    } catch {
      toast.error("Failed to update review");
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Delete this review? This cannot be undone.")) return;
    try {
      await deleteReview(id);
      toast.success("Review deleted");
      fetchProductReviews();
    } catch {
      toast.error("Failed to delete review");
    }
  };

  const handleApproveReview = async (id) => {
    try {
      await approveReview(id);
      toast.success("Review approved");
      fetchProductReviews();
    } catch {
      toast.error("Failed to approve review");
    }
  };

  const handleRejectReview = async (id) => {
    try {
      await rejectReview(id);
      toast.success("Review rejected");
      fetchProductReviews();
    } catch {
      toast.error("Failed to reject review");
    }
  };

  const handleSubmitCustomReview = async (e) => {
    e.preventDefault();
    if (!customReviewForm.customDisplayName.trim()) {
      toast.error("Display name is required");
      return;
    }
    if (!customReviewForm.body.trim()) {
      toast.error("Comment is required");
      return;
    }
    setCustomReviewSubmitting(true);
    try {
      await createCustomReview({ productId, ...customReviewForm });
      toast.success("Custom review posted!");
      setCustomReviewForm({ customDisplayName: "", rating: 5, title: "", body: "" });
      fetchProductReviews();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to post review");
    } finally {
      setCustomReviewSubmitting(false);
    }
  };

  const [deliverableInput, setDeliverableInput] = useState("");
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [categoryEmpanelments, setCategoryEmpanelments] = useState([]);
  const [vendorId, setVendorId] = useState("");
  const [vendorEmpanelmentIds, setVendorEmpanelmentIds] = useState([]);

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
          additionalInfo: product.additionalInfo || "",
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
          empanelment: Array.isArray(product.empanelment)
            ? product.empanelment.map(emp => emp._id || emp)
            : product.empanelment
            ? [product.empanelment._id || product.empanelment]
            : [],
        });

        // Store vendor ID so we can fetch their empanelments
        const vendorField = product.vendor;
        if (vendorField) {
          setVendorId(typeof vendorField === "object" ? vendorField._id : vendorField);
        }

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

  const renderCategoryNode = (category, level = 0) => {
    const children = categories.filter(
      (cat) => (cat.parent?._id || cat.parent) === category._id
    );
    const hasChildren = children.length > 0;
    const isExpanded = expandedCategories.has(category._id);
    const isSelected = formData.categories.includes(category._id);

    return (
      <div key={category._id} style={{ marginLeft: level > 0 ? "16px" : "0", marginTop: "4px" }}>
        <div 
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 8px",
            borderRadius: "6px",
            transition: "background 0.2s",
          }}
          className="category-tree-node"
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleParentCategory(category._id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2c5fe6",
                transform: isExpanded ? "rotate(90deg)" : "none",
                transition: "transform 0.2s",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          ) : (
            <span style={{ width: "18px", flexShrink: 0 }}></span>
          )}

          <label className="checkbox-item" style={{ padding: 0, margin: 0, display: "flex", alignItems: "center", cursor: "pointer", flex: 1 }}>
            <div className="checkbox-wrapper">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleCategoryToggle(category._id)}
              />
              <div className="checkbox-custom"></div>
            </div>
            <span className="checkbox-label" style={{ fontWeight: hasChildren ? "600" : "400" }}>
              {category.name}
            </span>
          </label>
        </div>

        {hasChildren && isExpanded && (
          <div style={{ borderLeft: "1px dashed #cbd5e1", marginLeft: "15px", paddingLeft: "8px" }}>
            {children.map((child) => renderCategoryNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Fetch vendor empanelments when vendor changes
  useEffect(() => {
    if (!vendorId || !token) return;
    const fetchVendorEmpanelments = async () => {
      try {
        const res = await axios.get(`${API_BASE}/vendors/${vendorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const v = res.data?.vendor || res.data;
        const ids = (v?.empanelment || []).map((e) =>
          typeof e === "object" ? e._id : e
        );
        setVendorEmpanelmentIds(ids);
        // Auto-merge vendor empanelments into formData
        if (ids.length > 0) {
          setFormData((prev) => ({
            ...prev,
            empanelment: Array.from(new Set([...ids, ...(prev.empanelment || [])])),
          }));
        }
      } catch {
        setVendorEmpanelmentIds([]);
      }
    };
    fetchVendorEmpanelments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId]);

  // Fetch empanelments when categories change
  useEffect(() => {
    const fetchCategoryEmpanelments = async () => {
      if (formData.categories.length === 0) {
        setCategoryEmpanelments([]);
        return;
      }
      try {
        // Fetch empanelments for every selected category in parallel
        const results = await Promise.all(
          formData.categories.map((catId) => getCategoryEmpanelments(catId))
        );
        // Merge & deduplicate by _id
        const seen = new Set();
        const merged = [];
        results.forEach((res) => {
          (res.data || []).forEach((emp) => {
            if (!seen.has(emp._id)) {
              seen.add(emp._id);
              merged.push(emp);
            }
          });
        });
        merged.sort((a, b) => a.empanelmentName.localeCompare(b.empanelmentName));
        setCategoryEmpanelments(merged);
      } catch {
        setCategoryEmpanelments([]);
      }
    };
    fetchCategoryEmpanelments();
  }, [formData.categories]);

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setNewImages((prev) => [...prev, ...files]);
    setPreviewImages((prev) => [...prev, ...newPreviews]);
  };

  // Handle Cloudinary image upload
  // Cloudinary images are already hosted — treat them as existing images
  // directly so they appear under "Current Images" and are NOT double-listed
  // under "New Images". This also prevents [object Object] in FormData.
  const handleCloudinaryImageUpload = (cloudinaryUrl) => {
    if (cloudinaryUrl) {
      setExistingImages((prev) => [
        ...prev,
        { url: cloudinaryUrl, alt: formData.title || "Product image" },
      ]);
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
      submitData.append("additionalInfo", formData.additionalInfo);
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
      if (formData.empanelment && formData.empanelment.length > 0) {
        formData.empanelment.forEach((empId) => {
          submitData.append("empanelment", empId);
        });
      } else {
        submitData.append("empanelment", "");
      }

      // Add new File objects (local uploads) to FormData
      // Cloudinary-uploaded images are already in existingImages — skip them here
      newImages.forEach((img) => {
        if (img instanceof File) {
          submitData.append("images", img);
        }
      });

      // Send existing images (including newly Cloudinary-uploaded ones) to keep
      // Normalise each entry to { url, alt } so the backend always gets objects
      if (existingImages.length > 0) {
        const normalised = existingImages.map((img) =>
          typeof img === "string" ? { url: img, alt: "Product image" } : { url: img.url || img, alt: img.alt || "Product image" }
        );
        submitData.append("keepImages", JSON.stringify(normalised));
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
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              {subcats.map((subcat) => renderCategoryNode(subcat, 0))}
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

            {/* Empanelment picker for edit */}
            {categoryEmpanelments.length > 0 && (
              <div className="form-group">
                <label>Empanelment</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                  {categoryEmpanelments.map((emp) => {
                    const isSelected = (formData.empanelment || []).includes(emp._id);
                    const isVendorOwned = vendorEmpanelmentIds.includes(emp._id);
                    return (
                      <label
                        key={emp._id}
                        title={isVendorOwned ? "This empanelment belongs to the product vendor and cannot be removed" : undefined}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: "0.8rem",
                          cursor: isVendorOwned ? "not-allowed" : "pointer",
                          padding: "6px 14px",
                          borderRadius: 20,
                          border: isVendorOwned
                            ? "2px solid #f59e0b"
                            : `1.5px solid ${isSelected ? "#0ea5e9" : "#e2e8f0"}`,
                          background: isVendorOwned
                            ? "#fef3c7"
                            : isSelected ? "#e0f2fe" : "#f8fafc",
                          color: isVendorOwned
                            ? "#92400e"
                            : isSelected ? "#0369a1" : "#64748b",
                          fontWeight: (isSelected || isVendorOwned) ? 600 : 400,
                          transition: "all 0.15s",
                          userSelect: "none",
                        }}
                      >
                        <input
                          type="checkbox"
                          name="empanelment-edit"
                          checked={isSelected}
                          disabled={isVendorOwned}
                          style={{ display: "none" }}
                          onChange={() => {
                            if (isVendorOwned) return;
                            setFormData((prev) => {
                              const current = prev.empanelment || [];
                              const isSel = current.includes(emp._id);
                              return {
                                ...prev,
                                empanelment: isSel
                                  ? current.filter((id) => id !== emp._id)
                                  : [...current, emp._id],
                              };
                            });
                          }}
                        />
                        {isVendorOwned && (
                          <span style={{ fontSize: "11px" }} title="Vendor empanelment — locked">🔒</span>
                        )}
                        {emp.empanelmentName}
                      </label>
                    );
                  })}
                </div>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 4, display: "block" }}>
                  Only empanelments linked to the selected category are shown.
                  {vendorEmpanelmentIds.length > 0 && (
                    <> &nbsp;🔒 <strong>Amber-highlighted</strong> empanelments belong to the product vendor and are locked.</>
                  )}
                </span>
              </div>
            )}
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

          <div className="form-group">
            <label>Additional Info</label>
            <RichTextEditor
              value={formData.additionalInfo}
              onChange={(html) =>
                setFormData((prev) => ({ ...prev, additionalInfo: html }))
              }
              placeholder="Enter additional details for this product…"
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
                    <img src={img?.url ?? img} alt={img?.alt || `Product ${index}`} />
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

      {/* ════════════════════════════════════════════════════════
          PRODUCT REVIEWS SECTION  (outside form to avoid submit conflicts)
      ════════════════════════════════════════════════════════ */}
      <section className="form-section admin-reviews-section">
        <div className="admin-reviews-header" onClick={handleToggleReviewsSection}>
          <h2>
            <Star size={18} style={{ marginRight: 8, verticalAlign: 'middle', color: '#f59e0b' }} />
            Product Reviews
            {reviews.length > 0 && (
              <span className="admin-reviews-badge">{reviews.length}</span>
            )}
          </h2>
          <button type="button" className="admin-reviews-toggle-btn">
            {reviewsSectionOpen ? '▲ Collapse' : '▼ Expand'}
          </button>
        </div>

        {reviewsSectionOpen && (
          <div className="admin-reviews-body">
            {/* ── Existing Reviews List ──────────────────────── */}
            <h3 className="admin-reviews-sub-title">All Reviews</h3>

            {reviewsLoading ? (
              <p className="admin-reviews-loading">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="admin-reviews-empty">No reviews yet for this product.</p>
            ) : (
              <div className="admin-review-list">
                {reviews.map((rv) => (
                  <div key={rv._id} className={`admin-review-item ${rv.isCustom ? 'is-custom' : ''}`}>
                    {editingReviewId === rv._id ? (
                      /* ── Inline Edit Mode ── */
                      <div className="admin-review-edit-form">
                        <div className="admin-review-edit-row">
                          <label>Display Name</label>
                          <input
                            type="text"
                            value={editReviewData.customDisplayName}
                            onChange={e => setEditReviewData(p => ({ ...p, customDisplayName: e.target.value }))}
                            placeholder="Name shown to customers"
                            className="admin-review-input"
                          />
                        </div>
                        <div className="admin-review-edit-row">
                          <label>Rating</label>
                          <div className="admin-star-picker">
                            {[1,2,3,4,5].map(s => (
                              <button
                                key={s}
                                type="button"
                                className={`admin-star-btn ${s <= editReviewData.rating ? 'active' : ''}`}
                                onClick={() => setEditReviewData(p => ({ ...p, rating: s }))}
                              >★</button>
                            ))}
                          </div>
                        </div>
                        <div className="admin-review-edit-row">
                          <label>Title</label>
                          <input
                            type="text"
                            value={editReviewData.title}
                            onChange={e => setEditReviewData(p => ({ ...p, title: e.target.value }))}
                            placeholder="Review title (optional)"
                            className="admin-review-input"
                          />
                        </div>
                        <div className="admin-review-edit-row">
                          <label>Comment</label>
                          <textarea
                            value={editReviewData.body}
                            onChange={e => setEditReviewData(p => ({ ...p, body: e.target.value }))}
                            rows={3}
                            className="admin-review-textarea"
                            placeholder="Review comment"
                          />
                        </div>
                        <div className="admin-review-edit-actions">
                          <button
                            type="button"
                            className="admin-review-btn admin-review-btn--save"
                            onClick={() => handleSaveEditReview(rv._id)}
                          >
                            <Check size={14} /> Save
                          </button>
                          <button
                            type="button"
                            className="admin-review-btn admin-review-btn--cancel"
                            onClick={() => setEditingReviewId(null)}
                          >
                            <XIcon size={14} /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── View Mode ── */
                      <>
                        <div className="admin-review-item__top">
                          <div className="admin-review-item__avatar">
                            {(rv.displayName || 'A')[0].toUpperCase()}
                          </div>
                          <div className="admin-review-item__meta">
                            <span className="admin-review-item__name">
                              {rv.displayName || 'Anonymous'}
                              {rv.isCustom && <span className="admin-review-custom-badge">Custom</span>}
                            </span>
                            <div className="admin-review-item__stars">
                              {[1,2,3,4,5].map(s => (
                                <span key={s} className={`admin-star-display ${s <= rv.rating ? 'filled' : ''}`}>★</span>
                              ))}
                            </div>
                          </div>
                          <span className="admin-review-item__date">
                            {new Date(rv.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                          <span className={`admin-review-status admin-review-status--${rv.status}`}>{rv.status}</span>
                        </div>
                        {rv.title && <p className="admin-review-item__title">{rv.title}</p>}
                        {rv.body  && <p className="admin-review-item__body">{rv.body}</p>}
                        <div className="admin-review-item__actions">
                          <button
                            type="button"
                            className="admin-review-btn admin-review-btn--edit"
                            onClick={() => handleStartEditReview(rv)}
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                          {rv.status !== 'approved' && (
                            <button
                              type="button"
                              className="admin-review-btn admin-review-btn--approve"
                              onClick={() => handleApproveReview(rv._id)}
                            >Approve</button>
                          )}
                          {rv.status !== 'rejected' && (
                            <button
                              type="button"
                              className="admin-review-btn admin-review-btn--reject"
                              onClick={() => handleRejectReview(rv._id)}
                            >Reject</button>
                          )}
                          <button
                            type="button"
                            className="admin-review-btn admin-review-btn--delete"
                            onClick={() => handleDeleteReview(rv._id)}
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── Add Custom Review Form ─────────────────────── */}
            <div className="admin-custom-review-form-wrap">
              <h3 className="admin-reviews-sub-title" style={{ marginTop: 28 }}>Post a Custom Review</h3>
              <p className="admin-custom-review-hint">
                Custom reviews appear on the product page alongside real customer reviews. You can post multiple with different display names.
              </p>
              <form className="admin-custom-review-form" onSubmit={handleSubmitCustomReview}>
                <div className="admin-custom-review-row-2col">
                  <div className="admin-review-edit-row">
                    <label>Display Name <span style={{color:'#ef4444'}}>*</span></label>
                    <input
                      type="text"
                      value={customReviewForm.customDisplayName}
                      onChange={e => setCustomReviewForm(p => ({ ...p, customDisplayName: e.target.value }))}
                      placeholder="e.g. John D."
                      className="admin-review-input"
                      maxLength={60}
                    />
                  </div>
                  <div className="admin-review-edit-row">
                    <label>Star Rating <span style={{color:'#ef4444'}}>*</span></label>
                    <div className="admin-star-picker">
                      {[1,2,3,4,5].map(s => (
                        <button
                          key={s}
                          type="button"
                          className={`admin-star-btn ${s <= (customReviewHover || customReviewForm.rating) ? 'active' : ''}`}
                          onMouseEnter={() => setCustomReviewHover(s)}
                          onMouseLeave={() => setCustomReviewHover(0)}
                          onClick={() => setCustomReviewForm(p => ({ ...p, rating: s }))}
                        >★</button>
                      ))}
                      <span className="admin-star-label">
                        {['','Poor','Fair','Good','Very Good','Excellent'][customReviewHover || customReviewForm.rating]}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="admin-review-edit-row">
                  <label>Review Title (optional)</label>
                  <input
                    type="text"
                    value={customReviewForm.title}
                    onChange={e => setCustomReviewForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Great service!"
                    className="admin-review-input"
                    maxLength={120}
                  />
                </div>
                <div className="admin-review-edit-row">
                  <label>Comment <span style={{color:'#ef4444'}}>*</span></label>
                  <textarea
                    value={customReviewForm.body}
                    onChange={e => setCustomReviewForm(p => ({ ...p, body: e.target.value }))}
                    rows={4}
                    className="admin-review-textarea"
                    placeholder="Write the review comment..."
                    maxLength={1000}
                  />
                </div>
                <button
                  type="submit"
                  className="admin-review-btn admin-review-btn--post"
                  disabled={customReviewSubmitting}
                >
                  {customReviewSubmitting ? 'Posting...' : '+ Post Custom Review'}
                </button>
              </form>
            </div>
          </div>
        )}
      </section>
    </div>

  );
}
