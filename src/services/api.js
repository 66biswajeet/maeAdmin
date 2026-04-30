import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
});

API.interceptors.request.use((config) => {
  // Check for admin token first, then vendor token
  const adminToken = localStorage.getItem("token");
  const vendorToken = localStorage.getItem("vendorToken");
  const token = adminToken || vendorToken;

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor to handle expired tokens (401)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear auth data
      localStorage.removeItem("token");
      localStorage.removeItem("vendorToken");
      localStorage.removeItem("admin");
      localStorage.removeItem("vendor");
      // Redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth
export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");
export const updateProfile = (data) => API.patch("/auth/profile", data);
export const changePassword = (data) =>
  API.patch("/auth/change-password", data);

// Vendor Auth
export const vendorLogin = (data) => API.post("/vendors/login", data);
export const vendorRegister = (data) => API.post("/vendors/register", data);
export const vendorLogout = () => API.post("/vendors/logout");
export const getVendorMe = () => API.get("/vendors/me");
export const updateVendorMe = (formData) =>
  API.patch("/vendors/update-me", formData);

// Vendor Edit Requests
export const createVendorEditRequest = (data) =>
  API.post("/vendor-edit-requests", data);
export const getVendorEditRequests = () => API.get("/vendor-edit-requests");
export const approveVendorEditRequest = (id) =>
  API.patch(`/vendor-edit-requests/${id}/approve`);
export const rejectVendorEditRequest = (id, data) =>
  API.patch(`/vendor-edit-requests/${id}/reject`, data);

// Site Settings
export const getSiteSettings = () => API.get("/site-settings");
export const updateHeader = (formData) =>
  API.patch("/site-settings/header", formData);
export const updateHero = (data) => API.patch("/site-settings/hero", data);
export const addCategoryLink = (data) =>
  API.post("/site-settings/hero/category-links", data);
export const updateCategoryLink = (linkId, data) =>
  API.patch(`/site-settings/hero/category-links/${linkId}`, data);
export const deleteCategoryLink = (linkId) =>
  API.delete(`/site-settings/hero/category-links/${linkId}`);
export const addHeroPromo = (formData) =>
  API.post("/site-settings/hero/promos", formData);
export const updateHeroPromo = (promoId, formData) =>
  API.patch(`/site-settings/hero/promos/${promoId}`, formData);
export const deleteHeroPromo = (promoId) =>
  API.delete(`/site-settings/hero/promos/${promoId}`);
export const addPromoBanner = (formData) =>
  API.post("/site-settings/promo-banners", formData);
export const updatePromoBanner = (bannerId, formData) =>
  API.patch(`/site-settings/promo-banners/${bannerId}`, formData);
export const deletePromoBanner = (bannerId) =>
  API.delete(`/site-settings/promo-banners/${bannerId}`);
export const updateFeaturedGrid = (data) =>
  API.patch("/site-settings/featured-grid", data);
export const updateSpecialBanner = (data) =>
  API.patch("/site-settings/special-banner", data);
export const updateBestDeals = (data) =>
  API.patch("/site-settings/best-deals", data);
export const updateTrustSection = (data) =>
  API.patch("/site-settings/trust-section", data);
export const addTrustItem = (formData) =>
  API.post("/site-settings/trust-section/items", formData);
export const updateTrustItem = (itemId, formData) =>
  API.patch(`/site-settings/trust-section/items/${itemId}`, formData);
export const deleteTrustItem = (itemId) =>
  API.delete(`/site-settings/trust-section/items/${itemId}`);
export const updateNewsletter = (data) =>
  API.patch("/site-settings/newsletter", data);
export const toggleSection = (data) =>
  API.patch("/site-settings/toggle-section", data);
export const updateMeta = (formData) =>
  API.patch("/site-settings/meta", formData);
export const updateFooter = (data) => API.patch("/site-settings/footer", data);
export const addFooterColumn = (data) =>
  API.post("/site-settings/footer/columns", data);
export const updateFooterColumn = (columnId, data) =>
  API.patch(`/site-settings/footer/columns/${columnId}`, data);
export const deleteFooterColumn = (columnId) =>
  API.delete(`/site-settings/footer/columns/${columnId}`);
// ── Categories ─────────────────────────────────────────────────────────────
export const getAdminCategories = () => API.get("/categories/admin/all");
export const getPublicCategories = () => API.get("/categories?isActive=true");
export const createCategory = (data) => API.post("/categories", data);
export const updateCategory = (id, data) =>
  API.patch(`/categories/${id}`, data);
export const deleteCategory = (id) => API.delete(`/categories/${id}`);

// ── Cities ──────────────────────────────────────────────────────────────────
export const getCities = () => API.get("/cities");
export const createCity = (data) => API.post("/cities", data);
export const updateCity = (id, data) => API.patch(`/cities/${id}`, data);
export const deleteCity = (id) => API.delete(`/cities/${id}`);

// ── Plans ───────────────────────────────────────────────────────────────────
export const getPlans = () => API.get("/plans");
export const createPlan = (data) => API.post("/plans", data);
export const updatePlan = (id, data) => API.patch(`/plans/${id}`, data);
export const deletePlan = (id) => API.delete(`/plans/${id}`);

// ── Empanelments ────────────────────────────────────────────────────────────
export const getEmpanelments = () => API.get("/empanelments");
export const createEmpanelment = (data) => API.post("/empanelments", data);
export const updateEmpanelment = (id, data) =>
  API.patch(`/empanelments/${id}`, data);
export const deleteEmpanelment = (id) => API.delete(`/empanelments/${id}`);

// Bookings
export const getBookings = (params) => API.get("/bookings", { params });
export const getBooking = (id) => API.get(`/bookings/${id}`);
export const updateBookingStatus = (id, data) =>
  API.patch(`/bookings/${id}/status`, data);
export const getVendorBookings = () => API.get("/bookings/vendor/my");
export const createBooking = (data) => API.post("/bookings", data);

export default API;
