import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AdminLayout from "./components/layout/AdminLayout";
import VendorLayout from "./layouts/VendorLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import VendorProtectedRoute from "./components/VendorProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SiteSettingsPage from "./pages/SiteSettings";
import ProfileSettings from "./pages/ProfileSettings";
import MetaSettingsPage from "./pages/MetaSettings";
import BillTemplatePage from "./pages/BillTemplatePage";
import PlaceholderPage from "./pages/PlaceholderPage";
import CategoriesPage from "./pages/CategoriesPage";
import CitiesPage from "./pages/CitiesPage";
import PlansPage from "./pages/PlansPage";
import EmpanelmentPage from "./pages/EmpanelmentPage";
import VendorsPage from "./pages/VendorsPage";
import VendorRequestsPage from "./pages/VendorRequestsPage";
import VendorRegisterPage from "./pages/VendorRegisterPage";
import VendorLoginPage from "./pages/VendorLoginPage";
import VendorForgotPasswordPage from "./pages/VendorForgotPasswordPage";
import VendorResetPasswordPage from "./pages/VendorResetPasswordPage";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorProductsPage from "./pages/vendor/VendorProductsPage";
import VendorAddProductPage from "./pages/vendor/VendorAddProductPage";
import VendorProductDetailPage from "./pages/vendor/VendorProductDetailPage";
import VendorProfilePage from "./pages/vendor/VendorProfilePage";
import StaffPage from "./pages/StaffPage";
import StaffRequestsPage from "./pages/StaffRequestsPage";
import AdminProductRequestsPage from "./pages/AdminProductRequestsPage";
import AdminAllProductsPage from "./pages/AdminAllProductsPage";
import AdminAddProductPage from "./pages/AdminAddProductPage";
import AdminEditProductPage from "./pages/AdminEditProductPage";
import AdminBookingsPage from "./pages/AdminBookingsPage";
import VendorBookingsPage from "./pages/vendor/VendorBookingsPage";
import BookingDetail from "./pages/BookingDetail";
import VendorBookingDetail from "./pages/BookingDetail";
import EmailTemplatesPage from "./pages/EmailTemplatesPage";
import AdminVendorDetailsPage from "./pages/AdminVendorDetailsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminPagesPage from "./pages/AdminPagesPage";
import AdminPageForm from "./pages/AdminPageForm";

import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "'DM Sans',sans-serif",
            fontSize: "13px",
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          },
          success: {
            style: {
              background: "#0d2b1f",
              color: "#4ade80",
              border: "1px solid #166534",
            },
            iconTheme: { primary: "#4ade80", secondary: "#0d2b1f" },
          },
          error: {
            style: {
              background: "#2b0d0d",
              color: "#f87171",
              border: "1px solid #7f1d1d",
            },
            iconTheme: { primary: "#f87171", secondary: "#2b0d0d" },
          },
        }}
      />
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/vendor/login" element={<VendorLoginPage />} />
        <Route path="/vendor/register" element={<VendorRegisterPage />} />
        <Route path="/vendor/forgot-password" element={<VendorForgotPasswordPage />} />
        <Route path="/vendor/reset-password" element={<VendorResetPasswordPage />} />

        {/* Protected Vendor Routes */}
        <Route 
          element={
            <VendorProtectedRoute>
              <VendorLayout />
            </VendorProtectedRoute>
          }
        >
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/products/all" element={<VendorProductsPage />} />
          <Route
            path="/vendor/products/add"
            element={<VendorAddProductPage />}
          />
          <Route
            path="/vendor/products/:id"
            element={<VendorProductDetailPage />}
          />
          <Route path="/vendor/orders" element={<VendorBookingsPage />} />
          <Route
            path="/vendor/reviews"
            element={
              <div className="page-content">
                <h2>Reviews</h2>
                <p style={{ color: "#999" }}>Coming soon</p>
              </div>
            }
          />
          <Route
            path="/vendor/analytics"
            element={
              <div className="page-content">
                <h2>Analytics</h2>
                <p style={{ color: "#999" }}>Coming soon</p>
              </div>
            }
          />
          <Route path="/vendor/profile" element={<VendorProfilePage />} />
          <Route
            path="/vendor/bookings/:id"
            element={<VendorBookingDetail />}
          />
        </Route>

        {/* Protected Admin Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="catalog/categories" element={<CategoriesPage />} />
          <Route path="catalog/cities" element={<CitiesPage />} />
          <Route path="catalog/plans" element={<PlansPage />} />
          <Route path="catalog/empanelments" element={<EmpanelmentPage />} />
          <Route path="vendors/all" element={<VendorsPage />} />
          <Route path="vendors/requests" element={<VendorRequestsPage />} />
          <Route path="vendors/details/:id" element={<AdminVendorDetailsPage />} />
          <Route path="vendors" element={<VendorsPage />} />
          <Route path="staff/all" element={<StaffPage />} />
          <Route path="staff/requests" element={<StaffRequestsPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="products/all" element={<AdminAllProductsPage />} />
          <Route path="products/add" element={<AdminAddProductPage />} />
          <Route
            path="products/edit/:productId"
            element={<AdminEditProductPage />}
          />
          <Route
            path="products/requests"
            element={<AdminProductRequestsPage />}
          />
          <Route path="products/tags" element={<PlaceholderPage />} />
          <Route path="products/attributes" element={<PlaceholderPage />} />
          <Route path="products/reviews" element={<PlaceholderPage />} />
          <Route path="customers/all" element={<PlaceholderPage />} />
          <Route path="customers/support" element={<PlaceholderPage />} />
          <Route path="orders" element={<PlaceholderPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="bookings/:id" element={<BookingDetail />} />
          <Route path="settings/site" element={<SiteSettingsPage />} />
          <Route path="settings/meta" element={<MetaSettingsPage />} />
          <Route path="settings/bill-template" element={<BillTemplatePage />} />
          <Route path="settings/email-templates" element={<EmailTemplatesPage />} />
          <Route path="settings/pages" element={<AdminPagesPage />} />
          <Route path="settings/pages/create-static" element={<AdminPageForm />} />
          <Route path="settings/pages/create-blog" element={<AdminPageForm />} />
          <Route path="settings/pages/edit/:id" element={<AdminPageForm />} />
          <Route path="settings/profile" element={<ProfileSettings />} />
          <Route path="*" element={<Navigate to="/settings/site" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
