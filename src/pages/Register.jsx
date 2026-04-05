import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { register as registerAPI } from "../services/api";
import { Eye, EyeOff, Mail, Lock, User, ShieldCheck } from "lucide-react";
import "../styles/Auth.css";
import logo from "../assets/logo.png";

const FEATURES = [
  "Manage vendors, products & orders",
  "Real-time compliance analytics",
  "Full site content management",
  "Secure role-based access control",
];

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("Please fill all fields");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await registerAPI({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      const { token, admin } = res.data;

      // If token exists, user is approved (superadmin) → login
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("admin", JSON.stringify(admin));
        toast.success(`Welcome, ${admin.name}!`);
        navigate("/");
      } else {
        // Regular admin registration → awaiting approval
        toast.success("Registration submitted! Awaiting admin approval.");
        navigate("/login");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
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
            Create your admin account to start managing vendors, audits,
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
            Authorized Admin Portal · Secure Registration
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
            <h1>Create Admin Account</h1>
            <p>Register to access the admin dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" />
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  disabled={loading}
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
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

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <Lock size={16} className="input-icon" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    disabled={loading}
                    autoComplete="new-password"
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

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm</label>
                <div className="input-wrapper">
                  <Lock size={16} className="input-icon" />
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirm((p) => !p)}
                    disabled={loading}
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
                className="auth-select"
              >
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Creating account..." : "Create Admin Account"}
            </button>
          </form>

          <div className="auth-divider" />

          <div className="auth-footer">
            <p>
              Already have an account?{" "}
              <a href="/login" className="auth-link">
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
