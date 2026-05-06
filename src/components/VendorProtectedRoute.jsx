import { Navigate } from "react-router-dom";

export default function VendorProtectedRoute({ children }) {
  const token = localStorage.getItem("vendorToken");
  const vendor = localStorage.getItem("vendor");

  if (!token || !vendor) {
    return <Navigate to="/vendor/login" replace />;
  }

  return children;
}
