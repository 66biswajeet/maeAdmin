// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { ArrowLeft, Upload, Plus, Trash2, DollarSign } from "lucide-react";
// import toast from "react-hot-toast";
// import axios from "axios";
// import "./VendorAddProductPage.css";

// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// export default function VendorAddProductPage() {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [categories, setCategories] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [plans, setPlans] = useState([]);
//   const [categoriesLoading, setCategoriesLoading] = useState(true);
//   const [citiesLoading, setCitiesLoading] = useState(true);
//   const [plansLoading, setPlansLoading] = useState(true);

//   const [form, setForm] = useState({
//     title: "",
//     description: "",
//     shortDesc: "",
//     sku: "",
//     category: "",
//     commission: "",
//     images: [],
//     variants: [],
//   });

//   const [currentVariant, setCurrentVariant] = useState({
//     city: "",
//     plan: "",
//     price: "",
//     salePrice: "",
//     isAvailable: true,
//   });

//   const token = localStorage.getItem("vendorToken");

//   // Fetch categories, cities, and plans on mount
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [categoriesRes, citiesRes, plansRes] = await Promise.all([
//           axios.get(`${API_BASE}/categories`),
//           axios.get(`${API_BASE}/cities`),
//           axios.get(`${API_BASE}/plans`),
//         ]);
//         setCategories(
//           categoriesRes.data.categories || categoriesRes.data || [],
//         );
//         setCities(citiesRes.data.cities || citiesRes.data || []);
//         setPlans(plansRes.data.plans || plansRes.data || []);
//       } catch (err) {
//         toast.error("Failed to load form data");
//         console.error(err);
//       } finally {
//         setCategoriesLoading(false);
//         setCitiesLoading(false);
//         setPlansLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleVariantChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setCurrentVariant((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const addVariant = () => {
//     if (!currentVariant.city || !currentVariant.plan || !currentVariant.price) {
//       toast.error("Please select city, plan, and enter price");
//       return;
//     }

//     // Check if this combination already exists
//     const exists = form.variants.some(
//       (v) => v.city === currentVariant.city && v.plan === currentVariant.plan,
//     );
//     if (exists) {
//       toast.error("This city-plan combination already exists");
//       return;
//     }

//     setForm((prev) => ({
//       ...prev,
//       variants: [
//         ...prev.variants,
//         {
//           ...currentVariant,
//           price: parseFloat(currentVariant.price),
//           salePrice: currentVariant.salePrice
//             ? parseFloat(currentVariant.salePrice)
//             : null,
//         },
//       ],
//     }));

//     // Reset variant form
//     setCurrentVariant({
//       city: "",
//       plan: "",
//       price: "",
//       salePrice: "",
//       isAvailable: true,
//     });
//     toast.success("Variant added!");
//   };

//   const removeVariant = (index) => {
//     setForm((prev) => ({
//       ...prev,
//       variants: prev.variants.filter((_, i) => i !== index),
//     }));
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setForm((prev) => ({
//           ...prev,
//           images: [{ url: reader.result, alt: form.title || "Product image" }],
//         }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!form.title || !form.sku) {
//       toast.error("Please fill in title and SKU");
//       return;
//     }

//     if (form.variants.length === 0) {
//       toast.error("Please add at least one variant (city-plan combination)");
//       return;
//     }

//     setLoading(true);
//     try {
//       const productData = {
//         title: form.title,
//         description: form.description,
//         shortDesc: form.shortDesc,
//         sku: form.sku,
//         category: form.category || null,
//         commission: parseFloat(form.commission) || 0,
//         images: form.images,
//         variants: form.variants,
//       };

//       await axios.post(`${API_BASE}/products/vendor/create`, productData, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       toast.success("Product submitted for approval!");
//       navigate("/vendor/products/all");
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to create product");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="vendor-add-product-page">
//       <button
//         className="btn-back"
//         onClick={() => navigate("/vendor/products/all")}
//       >
//         <ArrowLeft size={16} />
//         Back to Products
//       </button>

//       <div className="page-header">
//         <h1>Add New Product</h1>
//         <p>Your product will be reviewed and approved before going live</p>
//       </div>

//       <form onSubmit={handleSubmit} className="card product-form">
//         <div className="form-row">
//           <div className="form-group">
//             <label>Product Name *</label>
//             <input
//               type="text"
//               name="title"
//               value={form.title}
//               onChange={handleChange}
//               placeholder="Enter product name"
//               required
//             />
//           </div>
//           <div className="form-group">
//             <label>SKU (Stock Keeping Unit) *</label>
//             <input
//               type="text"
//               name="sku"
//               value={form.sku}
//               onChange={handleChange}
//               placeholder="e.g., PROD-001"
//               required
//             />
//           </div>
//         </div>

//         <div className="form-group">
//           <label>Description</label>
//           <textarea
//             name="description"
//             value={form.description}
//             onChange={handleChange}
//             placeholder="Describe your product in detail..."
//             rows="4"
//           />
//         </div>

//         <div className="form-group">
//           <label>Short Description</label>
//           <input
//             type="text"
//             name="shortDesc"
//             value={form.shortDesc}
//             onChange={handleChange}
//             placeholder="Brief description (for listings)"
//           />
//         </div>

//         <div className="form-row">
//           <div className="form-group">
//             <label>Category</label>
//             <select
//               name="category"
//               value={form.category}
//               onChange={handleChange}
//             >
//               <option value="">Select Category</option>
//               {categoriesLoading ? (
//                 <option disabled>Loading categories...</option>
//               ) : (
//                 categories.map((cat) => (
//                   <option key={cat._id} value={cat._id}>
//                     {cat.name}
//                   </option>
//                 ))
//               )}
//             </select>
//           </div>
//           <div className="form-group">
//             <label>Commission (%)</label>
//             <input
//               type="number"
//               name="commission"
//               value={form.commission}
//               onChange={handleChange}
//               placeholder="0"
//               step="0.01"
//               min="0"
//               max="100"
//             />
//           </div>
//         </div>

//         {/* VARIANTS SECTION */}
//         <div className="variants-section">
//           <h3>Product Variants (City & Plan)</h3>
//           <p className="variant-help-text">
//             Create pricing combinations for different cities and plans
//           </p>

//           <div className="variant-form card">
//             <div className="form-row">
//               <div className="form-group">
//                 <label>City *</label>
//                 <select
//                   name="city"
//                   value={currentVariant.city}
//                   onChange={handleVariantChange}
//                 >
//                   <option value="">Select City</option>
//                   {citiesLoading ? (
//                     <option disabled>Loading cities...</option>
//                   ) : (
//                     cities.map((city) => (
//                       <option key={city._id} value={city._id}>
//                         {city.name}
//                       </option>
//                     ))
//                   )}
//                 </select>
//               </div>
//               <div className="form-group">
//                 <label>Plan *</label>
//                 <select
//                   name="plan"
//                   value={currentVariant.plan}
//                   onChange={handleVariantChange}
//                 >
//                   <option value="">Select Plan</option>
//                   {plansLoading ? (
//                     <option disabled>Loading plans...</option>
//                   ) : (
//                     plans.map((plan) => (
//                       <option key={plan._id} value={plan._id}>
//                         {plan.name}
//                       </option>
//                     ))
//                   )}
//                 </select>
//               </div>
//             </div>

//             <div className="form-row">
//               <div className="form-group">
//                 <label>Price (₹) *</label>
//                 <input
//                   type="number"
//                   name="price"
//                   value={currentVariant.price}
//                   onChange={handleVariantChange}
//                   placeholder="0.00"
//                   step="0.01"
//                   min="0"
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Sale Price (₹)</label>
//                 <input
//                   type="number"
//                   name="salePrice"
//                   value={currentVariant.salePrice}
//                   onChange={handleVariantChange}
//                   placeholder="0.00 (optional)"
//                   step="0.01"
//                   min="0"
//                 />
//               </div>
//             </div>

//             <div className="form-group checkbox-group">
//               <label>
//                 <input
//                   type="checkbox"
//                   name="isAvailable"
//                   checked={currentVariant.isAvailable}
//                   onChange={handleVariantChange}
//                 />
//                 Available
//               </label>
//             </div>

//             <button
//               type="button"
//               className="btn-add-variant"
//               onClick={addVariant}
//             >
//               <Plus size={18} /> Add Variant
//             </button>
//           </div>

//           {/* VARIANTS LIST */}
//           {form.variants.length > 0 && (
//             <div className="variants-list">
//               <h4>Added Variants ({form.variants.length})</h4>
//               <table className="variants-table">
//                 <thead>
//                   <tr>
//                     <th>City</th>
//                     <th>Plan</th>
//                     <th>Price</th>
//                     <th>Sale Price</th>
//                     <th>Available</th>
//                     <th>Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {form.variants.map((variant, index) => {
//                     const cityName =
//                       cities.find((c) => c._id === variant.city)?.name || "—";
//                     const planName =
//                       plans.find((p) => p._id === variant.plan)?.name || "—";
//                     return (
//                       <tr key={index}>
//                         <td>{cityName}</td>
//                         <td>{planName}</td>
//                         <td>₹{variant.price.toFixed(2)}</td>
//                         <td>
//                           {variant.salePrice
//                             ? `₹${variant.salePrice.toFixed(2)}`
//                             : "—"}
//                         </td>
//                         <td>{variant.isAvailable ? "Yes" : "No"}</td>
//                         <td>
//                           <button
//                             type="button"
//                             className="btn-remove-variant"
//                             onClick={() => removeVariant(index)}
//                           >
//                             <Trash2 size={16} />
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         <div className="form-group">
//           <label>Product Image</label>
//           <div className="image-upload">
//             {form.images.length > 0 ? (
//               <div className="image-preview">
//                 <img src={form.images[0].url} alt="Preview" />
//                 <button
//                   type="button"
//                   onClick={() => setForm((prev) => ({ ...prev, images: [] }))}
//                   className="btn-remove"
//                 >
//                   ✕
//                 </button>
//               </div>
//             ) : (
//               <label className="upload-label">
//                 <Upload size={24} />
//                 <span>Click to upload image</span>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleImageChange}
//                   style={{ display: "none" }}
//                 />
//               </label>
//             )}
//           </div>
//         </div>

//         <div className="form-actions">
//           <button
//             type="button"
//             className="btn-secondary"
//             onClick={() => navigate("/vendor/products/all")}
//           >
//             Cancel
//           </button>
//           <button type="submit" className="btn-primary" disabled={loading}>
//             {loading ? "Adding..." : "Add Product"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Package,
  Tag,
  Image,
  MapPin,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import RichTextEditor from "../../components/RichTextEditor";
import "./VendorAddProductPage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function VendorAddProductPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [plans, setPlans] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(true);
  const [vendorData, setVendorData] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    shortDesc: "",
    sku: "",
    categories: [],
    images: [],
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

  const token = localStorage.getItem("vendorToken");

  // Zone options
  const ZONE_OPTIONS = [
    { value: "basecity", label: "📍 Your Base City" },
    { value: "north", label: "🔵 North Zone" },
    { value: "south", label: "🔵 South Zone" },
    { value: "east", label: "🔵 East Zone" },
    { value: "west", label: "🔵 West Zone" },
    { value: "virtual", label: "🌐 Virtual" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, plansRes, vendorRes] = await Promise.all([
          axios.get(`${API_BASE}/categories`),
          axios.get(`${API_BASE}/plans`),
          axios.get(`${API_BASE}/vendors/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setCategories(
          categoriesRes.data.categories || categoriesRes.data || [],
        );
        setPlans(plansRes.data.plans || plansRes.data || []);
        setVendorData(vendorRes.data);
      } catch (err) {
        toast.error("Failed to load form data");
        console.error(err);
      } finally {
        setCategoriesLoading(false);
        setPlansLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (plans.length > 0 && !currentVariant.plan) {
      const firstPlan = plans[0];
      setCurrentVariant((prev) => ({
        ...prev,
        plan: firstPlan._id,
        zone: firstPlan.name?.toLowerCase() === "base" ? "virtual" : prev.zone,
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
      toast.error("Please select zone, plan, and enter a price");
      return;
    }
    const exists = form.variants.some(
      (v) => v.zone === currentVariant.zone && v.plan === currentVariant.plan,
    );
    if (exists) {
      toast.error("This zone–plan combination already exists");
      return;
    }
    setForm((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          zone: currentVariant.zone,
          city:
            currentVariant.zone === "basecity" ? vendorData?.baseCity : null,
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
    toast.success("Variant added");
  };

  const removeVariant = (index) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        images: [
          {
            url: reader.result,
            alt: form.title || "Product image",
            name: file.name,
          },
        ],
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.sku) {
      toast.error("Product name and SKU are required");
      return;
    }
    if (form.variants.length === 0) {
      toast.error("Add at least one zone–plan variant");
      return;
    }
    setLoading(true);
    try {
      const productData = {
        title: form.title,
        description: form.description,
        shortDesc: form.shortDesc,
        sku: form.sku,
        categories: form.categories,
        images: form.images,
        variants: form.variants,
      };
      await axios.post(`${API_BASE}/products/vendor/create`, productData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Product submitted for approval!");
      navigate("/vendor/products/all");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  /* derived */
  const hasBasicInfo = form.title && form.sku;
  const hasVariants = form.variants.length > 0;

  return (
    <div className="vendor-add-product-page">
      {/* ── BACK ── */}
      <button
        className="btn-back"
        onClick={() => navigate("/vendor/products/all")}
      >
        <ArrowLeft size={14} />
        Back to Products
      </button>

      {/* ── HEADER ── */}
      <div className="page-header">
        <h1>Add New Product</h1>
        <p>
          Fill in the details below — we'll review and publish your product
          shortly.
        </p>
      </div>

      {/* ── PROGRESS ── */}
      <div className="progress-steps">
        <div className={`progress-step ${hasBasicInfo ? "done" : "active"}`}>
          <div className="progress-step-num">{hasBasicInfo ? "✓" : "1"}</div>
          <div>
            <div className="progress-step-label">Basic Info</div>
          </div>
        </div>
        <div className="progress-divider" />
        <div
          className={`progress-step ${hasVariants ? "done" : hasBasicInfo ? "active" : ""}`}
        >
          <div className="progress-step-num">{hasVariants ? "✓" : "2"}</div>
          <div>
            <div className="progress-step-label">Variants</div>
          </div>
        </div>
        <div className="progress-divider" />
        <div
          className={`progress-step ${form.images.length > 0 ? "done" : hasVariants ? "active" : ""}`}
        >
          <div className="progress-step-num">
            {form.images.length > 0 ? "✓" : "3"}
          </div>
          <div>
            <div className="progress-step-label">Media</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ══ SECTION 1: BASIC INFO ══ */}
        <div className="form-section">
          <div className="section-header">
            <div className="section-icon">
              <Package size={16} />
            </div>
            <div>
              <p className="section-title">Basic Information</p>
              <p className="section-subtitle">
                Name, description & identifiers
              </p>
            </div>
          </div>
          <div className="section-body">
            <div className="form-row">
              <div className="form-group">
                <label>
                  Product Name <span className="label-required">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g., Premium Water Purifier"
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  SKU <span className="label-required">*</span>
                </label>
                <input
                  type="text"
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  placeholder="e.g., WP-001"
                  required
                />
                <span className="form-hint">
                  Unique identifier for inventory tracking
                </span>
              </div>
            </div>

            <div className="form-group">
              <label>Short Description</label>
              <input
                type="text"
                name="shortDesc"
                value={form.shortDesc}
                onChange={handleChange}
                placeholder="One-liner shown on product cards"
              />
            </div>

            <div className="form-group">
              <label>Full Description</label>
              <RichTextEditor
                value={form.description}
                onChange={(html) =>
                  setForm((prev) => ({ ...prev, description: html }))
                }
                placeholder="Describe features, benefits, specifications…"
              />
            </div>
          </div>
        </div>

        {/* ══ SECTION 2: CLASSIFICATION ══ */}
        <div className="form-section">
          <div className="section-header">
            <div className="section-icon">
              <Tag size={16} />
            </div>
            <div>
              <p className="section-title">Classification</p>
              <p className="section-subtitle">Category settings</p>
            </div>
          </div>
          <div className="section-body">
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
                {categoriesLoading ? (
                  <div className="loading-state">
                    <div className="spinner-mini"></div>
                    <p>Loading categories...</p>
                  </div>
                ) : (
                  (() => {
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
                  })()
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ══ SECTION 3: VARIANTS ══ */}
        <div className="form-section">
          <div className="section-header">
            <div className="section-icon">
              <MapPin size={16} />
            </div>
            <div>
              <p className="section-title">
                Zone & Plan Variants
                {form.variants.length > 0 && (
                  <span className="variants-count-badge">
                    {form.variants.length}
                  </span>
                )}
              </p>
              <p className="section-subtitle">
                Set pricing per zone and subscription plan
              </p>
            </div>
          </div>
          <div className="section-body">
            {/* ADD VARIANT PANEL */}
            <div className="variant-add-panel">
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Plan <span className="label-required">*</span>
                  </label>
                  <select
                    name="plan"
                    value={currentVariant.plan}
                    onChange={handleVariantChange}
                  >
                    <option value="">Select plan</option>
                    {plansLoading ? (
                      <option disabled>Loading…</option>
                    ) : (
                      plans.map((plan) => (
                        <option key={plan._id} value={plan._id}>
                          {plan.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label>
                    Zone <span className="label-required">*</span>
                  </label>
                  <select
                    name="zone"
                    value={currentVariant.zone}
                    onChange={handleVariantChange}
                    disabled={!currentVariant.plan}
                  >
                    <option value="">Select zone</option>
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
                  <label>
                    Price <span className="label-required">*</span>
                  </label>
                  <div className="input-prefix-wrapper">
                    <span className="input-prefix">₹</span>
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
                </div>
                <div className="form-group">
                  <label>Sale Price</label>
                  <div className="input-prefix-wrapper">
                    <span className="input-prefix">₹</span>
                    <input
                      type="number"
                      name="salePrice"
                      value={currentVariant.salePrice}
                      onChange={handleVariantChange}
                      placeholder="Optional"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="variant-add-footer">
                <label className="checkbox-toggle">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={currentVariant.isAvailable}
                    onChange={handleVariantChange}
                  />
                  <span>Available for purchase</span>
                </label>
                <button
                  type="button"
                  className="btn-add-variant"
                  onClick={addVariant}
                >
                  <Plus size={15} />
                  Add Variant
                </button>
              </div>
            </div>

            {/* VARIANTS LIST */}
            {form.variants.length > 0 ? (
              <div className="variants-list">
                <div className="variants-list-header">
                  <span>Zone</span>
                  <span>Plan</span>
                  <span>Price</span>
                  <span>Sale</span>
                  <span>Status</span>
                  <span></span>
                </div>
                {form.variants.map((variant, index) => {
                  const zoneName =
                    ZONE_OPTIONS.find((z) => z.value === variant.zone)?.label ||
                    "—";
                  const planName =
                    plans.find((p) => p._id === variant.plan)?.name || "—";
                  return (
                    <div className="variant-row" key={index}>
                      <div className="variant-cell">
                        <span className="variant-city-tag">{zoneName}</span>
                      </div>
                      <div className="variant-cell">
                        <span className="variant-plan-chip">{planName}</span>
                      </div>
                      <div className="variant-cell variant-price">
                        ₹{variant.price.toFixed(2)}
                      </div>
                      <div className="variant-cell">
                        {variant.salePrice ? (
                          <span className="variant-sale-price">
                            ₹{variant.salePrice.toFixed(2)}
                          </span>
                        ) : (
                          <span className="variant-dash">—</span>
                        )}
                      </div>
                      <div className="variant-cell">
                        <span
                          className={`availability-badge ${variant.isAvailable ? "yes" : "no"}`}
                        >
                          {variant.isAvailable ? "Active" : "Off"}
                        </span>
                      </div>
                      <div className="variant-cell">
                        <button
                          type="button"
                          className="btn-remove-variant"
                          onClick={() => removeVariant(index)}
                          title="Remove variant"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="variants-empty">
                No variants added yet. Use the form above to create city–plan
                pricing.
              </div>
            )}
          </div>
        </div>

        {/* ══ SECTION 4: IMAGE ══ */}
        <div className="form-section">
          <div className="section-header">
            <div className="section-icon">
              <Image size={16} />
            </div>
            <div>
              <p className="section-title">Product Image</p>
              <p className="section-subtitle">
                Upload a high-quality photo for your listing
              </p>
            </div>
          </div>
          <div className="section-body">
            <div className="image-upload-area">
              {form.images.length > 0 ? (
                <div className="image-preview-container">
                  <img
                    src={form.images[0].url}
                    alt="Preview"
                    className="image-preview-img"
                  />
                  <div className="image-preview-meta">
                    <span className="img-name">
                      {form.images[0].name || "Uploaded image"}
                    </span>
                    <span className="img-badge">
                      <CheckCircle2 size={10} /> Uploaded
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-remove-img"
                    onClick={() => setForm((prev) => ({ ...prev, images: [] }))}
                    title="Remove image"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="upload-label">
                  <div className="upload-icon-wrap">
                    <Upload size={20} />
                  </div>
                  <div className="upload-label-text">
                    <strong>Click to upload image</strong>
                    <span>PNG, JPG or WEBP · Max 5MB</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* ── APPROVAL NOTICE ── */}
        <div className="approval-notice">
          <AlertTriangle size={15} />
          <span>
            Your product will be reviewed by our team before going live. This
            usually takes 1–2 business days.
          </span>
        </div>

        {/* ── ACTIONS ── */}
        <div className="form-actions-bar">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/vendor/products/all")}
          >
            Cancel
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" /> Submitting…
              </>
            ) : (
              <>
                <CheckCircle2 size={15} />
                Submit for Review
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
