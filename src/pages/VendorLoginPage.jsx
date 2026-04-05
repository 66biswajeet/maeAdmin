import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock, Shield, CheckCircle } from "lucide-react";
import { vendorLogin } from "../services/api";
import "./VendorLoginPage.css";

const TRUST_POINTS = [
  "Manage your compliance service listings",
  "Track orders and revenue in real-time",
  "Connect with 10,000+ verified businesses",
  "Priority support from our vendor desk",
];

export default function VendorLoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await vendorLogin({
        email: formData.email,
        password: formData.password,
      });

      const { token, vendor } = res.data;

      localStorage.setItem("vendorToken", token);
      localStorage.setItem("vendor", JSON.stringify(vendor));
      localStorage.removeItem("token");
      localStorage.removeItem("admin");

      toast.success(`Welcome back, ${vendor.name}!`);
      navigate("/vendor/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vl-page">
      <div className="vl-layout">
        {/* ── Left panel ── */}
        <div className="vl-left">
          <div className="vl-left__logo">
            <Shield size={28} />
            <span>
              Make<strong>Audit</strong>Easy
            </span>
          </div>
          <h1 className="vl-left__title">Your Vendor Dashboard Awaits</h1>
          <p className="vl-left__sub">
            Sign in to manage your compliance services and grow your business
            with India's leading audit platform.
          </p>
          <ul className="vl-trust-list">
            {TRUST_POINTS.map((point, i) => (
              <li key={i} className="vl-trust-item">
                <CheckCircle size={16} />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <div className="vl-left__badge">
            <Shield size={16} />
            <span>Authorized Vendor Program · Est. 2024</span>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="vl-right">
          <div className="vl-form-card">
            <div className="vl-form-header">
              <h2>Vendor Login</h2>
              <p>Access your dashboard and manage your listings</p>
            </div>

            <form onSubmit={handleSubmit} className="vl-fields">
              <div className="vl-fg">
                <label htmlFor="email">
                  <Mail size={13} /> Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="vendor@example.com"
                  disabled={loading}
                />
              </div>

              <div className="vl-fg">
                <label htmlFor="password">
                  <Lock size={13} /> Password
                </label>
                <div className="vl-pass-wrap">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="vl-btn vl-btn--primary"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="vl-register-link">
              Don't have an account?{" "}
              <Link to="/vendor/register">Apply to become a vendor</Link>
            </p>
            <p className="vl-admin-link">
              <Link to="/login">Admin Login →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
