import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { login as loginAPI } from "../services/api";
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from "lucide-react";
import "../styles/Auth.css";
import logo from "../assets/logo.png";

const FEATURES = [
  "Manage vendors, products & orders",
  "Real-time compliance analytics",
  "Full site content management",
  "Secure role-based access control",
];

export default function Login() {
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
      const res = await loginAPI(formData);
      const { token, admin } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("admin", JSON.stringify(admin));
      toast.success(`Welcome back, ${admin.name}!`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── Left panel ── */}
      <div className="auth-left">
        <div className="auth-left__inner">
          <h2 className="auth-left__tagline">
            India's #1 Audit &amp;
            <br />
            <span>Compliance Platform</span>
          </h2>
          <p className="auth-left__sub">
            The all-in-one admin dashboard for managing vendors, audits,
            compliance frameworks, and enterprise customers.
          </p>
          <ul className="auth-left__features">
            {FEATURES.map((f) => (
              <li key={f} className="auth-left__feature">
                <span className="auth-left__feature-dot" />
                {f}
              </li>
            ))}
          </ul>
          <div className="auth-left__badge">
            <ShieldCheck size={14} />
            Authorized Admin Portal · Secure Login
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-right">
        <div className="auth-card">
          {/* Logo */}
          <div className="auth-logo">
            <img src={logo} alt="Make Audit Easy" />
          </div>

          <div className="auth-divider" />

          {/* Heading */}
          <div className="auth-header">
            <h1>Admin Login</h1>
            <p>Sign in to access your dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((p) => !p)}
                  disabled={loading}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Signing in..." : "Sign In to Dashboard"}
            </button>
          </form>

          <div className="auth-divider" />

          <div className="auth-footer">
            <p>
              Don't have an account?{" "}
              <a href="/register" className="auth-link">
                Register here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
