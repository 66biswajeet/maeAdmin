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
  FileSpreadsheet,
  Download,
} from "lucide-react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import axios from "axios";
import RichTextEditor from "../../components/RichTextEditor";
import CloudinaryUpload from "../../components/CloudinaryUpload";
import { getCategoryEmpanelments } from "../../services/api";
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
    additionalInfo: "",
    shortDesc: "",
    sku: "",
    categories: [],
    images: [],
    variants: [],
    empanelment: [],
  });

  const [categoryEmpanelments, setCategoryEmpanelments] = useState([]);

  const [currentVariant, setCurrentVariant] = useState({
    zone: "",
    plan: "",
    price: "",
    salePrice: "",
    isAvailable: true,
  });

  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const token = localStorage.getItem("vendorToken");

  // Get zone name with city for display
  const getZoneName = (zone) => {
    const zoneLabel = ZONE_OPTIONS.find((z) => z.value === zone)?.label || zone;
    if (zone === "basecity" && vendorData?.baseCity) {
      return `📍 ${vendorData.baseCity.toUpperCase()} (base city)`;
    }
    return zoneLabel;
  };

  // Zone options - basecity label will be updated dynamically with vendor data
  const ZONE_OPTIONS = [
    {
      value: "basecity",
      label: vendorData?.baseCity
        ? `📍 ${vendorData.baseCity.toUpperCase()} (base city)`
        : "📍 Your Base City",
    },
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
        setVendorData(vendorRes.data || vendorRes.data.vendor || {});
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

  const renderCategoryNode = (category, level = 0) => {
    const children = categories.filter(
      (cat) => (cat.parent?._id || cat.parent) === category._id
    );
    const hasChildren = children.length > 0;
    const isExpanded = expandedCategories.has(category._id);
    const isSelected = form.categories.includes(category._id);

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

  // Fetch empanelments for ALL selected categories
  useEffect(() => {
    const fetchCategoryEmpanelments = async () => {
      if (form.categories.length === 0) {
        setCategoryEmpanelments([]);
        return;
      }
      try {
        // Fetch empanelments for every selected category in parallel
        const results = await Promise.all(
          form.categories.map((catId) => getCategoryEmpanelments(catId))
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
  }, [form.categories]);

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

  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          toast.error("Excel file is empty");
          return;
        }

        // 1. Extract product details from the first row that has a name or SKU
        let title = "";
        let sku = "";
        let shortDesc = "";
        let description = "";

        for (const row of data) {
          const rowTitle = row["Product Name"] || row["ProductName"] || row["Title"] || row["title"] || row["Name"] || row["name"];
          const rowSku = row["SKU"] || row["sku"] || row["Sku"];
          const rowShortDesc = row["Short Description"] || row["ShortDescription"] || row["short description"] || row["shortDesc"] || row["shortdesc"];
          const rowDesc = row["Detailed Description"] || row["DetailedDescription"] || row["detailed description"] || row["Description"] || row["description"];

          if (rowTitle || rowSku) {
            title = String(rowTitle || "").trim();
            sku = String(rowSku || "").trim();
            shortDesc = String(rowShortDesc || "").trim();
            description = String(rowDesc || "").trim();
            break;
          }
        }

        const newVariants = [];
        const errors = [];

        data.forEach((row, index) => {
          const zone = String(row.Zone || row.zone || "")
            .toLowerCase()
            .trim();
          const planName = String(row.Plan || row.plan || "").trim();
          const priceStr = row.Price !== undefined && row.Price !== null ? String(row.Price).trim() : "";
          const price = parseFloat(row.Price || row.price);
          const salePrice =
            row.SalePrice || row.saleprice
              ? parseFloat(row.SalePrice || row.saleprice)
              : null;

          // If a row doesn't specify zone or plan or price, skip it without errors (e.g. padding rows)
          if (!zone && !planName && isNaN(price)) {
            return;
          }

          // Validate Zone
          const validZones = [
            "basecity",
            "north",
            "south",
            "east",
            "west",
            "virtual",
          ];
          if (!validZones.includes(zone)) {
            errors.push(`Row ${index + 2}: Invalid zone "${zone}"`);
            return;
          }

          // Find Plan
          const plan = plans.find(
            (p) => p.name.toLowerCase() === planName.toLowerCase(),
          );
          if (!plan) {
            errors.push(`Row ${index + 2}: Plan "${planName}" not found`);
            return;
          }

          // Validate Price
          if (isNaN(price)) {
            errors.push(`Row ${index + 2}: Invalid price`);
            return;
          }

          // Check for duplicate in newVariants
          const exists = newVariants.some(
            (v) => v.zone === zone && v.plan === plan._id,
          );
          const existsInForm = form.variants.some(
            (v) => v.zone === zone && v.plan === plan._id,
          );

          if (!exists && !existsInForm) {
            newVariants.push({
              zone,
              city: zone === "basecity" ? vendorData?.baseCity : null,
              plan: plan._id,
              price,
              salePrice,
              isAvailable: true,
            });
          }
        });

        // Update form fields
        setForm((prev) => ({
          ...prev,
          title: title || prev.title,
          sku: sku || prev.sku,
          shortDesc: shortDesc || prev.shortDesc,
          description: description || prev.description,
          variants: [...prev.variants, ...newVariants],
        }));

        let successMsg = `Successfully imported ${newVariants.length} variants!`;
        if (title || sku) {
          successMsg = `Successfully imported product details and ${newVariants.length} variants!`;
        }
        toast.success(successMsg);

        if (errors.length > 0) {
          console.error("Import Errors:", errors);
          toast.error(
            `${errors.length} rows skipped due to errors. Check console.`,
          );
        }
      } catch (err) {
        console.error("Excel Error:", err);
        toast.error("Failed to parse Excel file");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null; // Reset input
  };

  const downloadTemplate = () => {
    const templateData = [];
    const zones = ["basecity", "north", "south", "east", "west", "virtual"];
    let isFirstRow = true;

    plans.forEach((plan) => {
      const isBase = plan.name?.toLowerCase() === "base";

      if (isBase) {
        // Base plan is only for Virtual zone
        templateData.push({
          "Product Name": isFirstRow ? "Example Product Name" : "",
          "SKU": isFirstRow ? "EX-SKU-100" : "",
          "Short Description": isFirstRow ? "This is a premium purifier" : "",
          "Detailed Description": isFirstRow ? "<p>Detailed description goes here with HTML or simple text.</p>" : "",
          Zone: "virtual",
          Plan: plan.name,
          Price: 500,
          SalePrice: 350,
        });
        isFirstRow = false;
      } else {
        // All other plans for all other zones
        zones
          .filter((z) => z !== "virtual")
          .forEach((zone) => {
            templateData.push({
              "Product Name": isFirstRow ? "Example Product Name" : "",
              "SKU": isFirstRow ? "EX-SKU-100" : "",
              "Short Description": isFirstRow ? "This is a premium purifier" : "",
              "Detailed Description": isFirstRow ? "<p>Detailed description goes here with HTML or simple text.</p>" : "",
              Zone: zone,
              Plan: plan.name,
              Price: "",
              SalePrice: "",
            });
            isFirstRow = false;
          });
      }
    });

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ProductTemplate");
    XLSX.writeFile(wb, "Product_Upload_Template.xlsx");
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

  const handleImageUpload = (cloudinaryUrl) => {
    if (cloudinaryUrl) {
      setForm((prev) => ({
        ...prev,
        images: [
          {
            url: cloudinaryUrl,
            alt: form.title || "Product image",
          },
        ],
      }));
      toast.success("Image uploaded successfully!");
    }
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
        additionalInfo: form.additionalInfo,
        shortDesc: form.shortDesc,
        sku: form.sku,
        categories: form.categories,
        images: form.images,
        variants: form.variants,
        empanelment: form.empanelment && form.empanelment.length > 0 ? form.empanelment : undefined,
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
        {/* ══ BULK IMPORT / EXCEL UPLOAD ══ */}
        <div className="excel-import-top-bar" style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 1.5rem",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          marginBottom: "1.5rem",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FileSpreadsheet size={20} style={{ color: "#10b981" }} />
            <div>
              <p style={{ margin: 0, fontWeight: "600", fontSize: "0.875rem" }}>Quick Setup via Excel</p>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--ink-muted)" }}>Import product name, SKU, descriptions, and variants from a single spreadsheet</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              className="btn-outline-xs"
              onClick={downloadTemplate}
              title="Download Excel Template"
            >
              <Download size={13} /> Download Template
            </button>
            <label className="btn-primary-xs" style={{ margin: 0 }}>
              <FileSpreadsheet size={13} /> Import Excel
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleExcelImport}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div>

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
              <div
                className="categories-accordion"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginTop: "12px",
                }}
              >
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
                        <div
                          key={parent._id}
                          className="accordion-item"
                          style={{
                            border: "1px solid #eef0f2",
                            borderRadius: "10px",
                            overflow: "hidden",
                            backgroundColor: "#fff",
                          }}
                        >
                          <button
                            type="button"
                            className={`accordion-header ${isExpanded ? "expanded" : ""}`}
                            onClick={() => toggleParentCategory(parent._id)}
                            style={{
                              padding: "16px 20px",
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                              gap: "12px",
                              background: isExpanded
                                ? "linear-gradient(to right, #f8faff, #fff)"
                                : "#fff",
                              border: "none",
                              cursor: "pointer",
                              textAlign: "left",
                              transition: "all 0.2s ease",
                            }}
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
                  })()
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ══ SECTION 2B: EMPANELMENT ══ */}
        {categoryEmpanelments.length > 0 && (
          <div className="form-section">
            <div className="section-header">
              <div className="section-icon">
                <Tag size={16} />
              </div>
              <div>
                <p className="section-title">Empanelment</p>
                <p className="section-subtitle">
                  Select the empanelment for this product (based on selected category)
                </p>
              </div>
            </div>
            <div className="section-body">
              <div className="form-group">
                <label>Empanelment</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                  {categoryEmpanelments.map((emp) => {
                    const isSelected = (form.empanelment || []).includes(emp._id);
                    return (
                      <label
                        key={emp._id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          padding: "6px 14px",
                          borderRadius: 20,
                          border: `1.5px solid ${isSelected ? "#0ea5e9" : "#e2e8f0"}`,
                          background: isSelected ? "#e0f2fe" : "#f8fafc",
                          color: isSelected ? "#0369a1" : "#64748b",
                          fontWeight: isSelected ? 600 : 400,
                          transition: "all 0.15s",
                        }}
                      >
                        <input
                          type="checkbox"
                          name="vendor-empanelment"
                          value={emp._id}
                          checked={isSelected}
                          style={{ display: "none" }}
                          onChange={() =>
                            setForm((prev) => {
                              const current = prev.empanelment || [];
                              const isSel = current.includes(emp._id);
                              return {
                                ...prev,
                                empanelment: isSel
                                  ? current.filter((id) => id !== emp._id)
                                  : [...current, emp._id],
                              };
                            })
                          }
                        />
                        {emp.empanelmentName}
                      </label>
                    );
                  })}
                </div>
                <span className="form-hint" style={{ marginTop: 6, display: "block" }}>
                  Only empanelments linked to the selected category are shown
                </span>
              </div>
            </div>
          </div>
        )}

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
                    disabled={
                      !currentVariant.plan ||
                      plans
                        .find((p) => p._id === currentVariant.plan)
                        ?.name?.toLowerCase() === "base"
                    }
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
                    <span className="input-prefix"> </span>
                    <input
                      type="number"
                      name="price"
                      value={currentVariant.price}
                      onChange={handleVariantChange}
                      placeholder="₹ 0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Sale Price</label>
                  <div className="input-prefix-wrapper">
                    <span className="input-prefix"></span>
                    <input
                      type="number"
                      name="salePrice"
                      value={currentVariant.salePrice}
                      onChange={handleVariantChange}
                      placeholder="₹ 0.00"
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
                  const zoneName = getZoneName(variant.zone);
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
            <CloudinaryUpload
              onUpload={handleImageUpload}
              folder="products"
              showPreview={form.images.length > 0}
              previewUrl={form.images[0]?.url}
              onRemove={() => setForm((prev) => ({ ...prev, images: [] }))}
            />
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
