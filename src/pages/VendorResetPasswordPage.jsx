import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Lock, Eye, EyeOff, Shield, CheckCircle } from "lucide-react";
import API from "../services/api";
import "./VendorLoginPage.css";
import "./VendorForgotResetPage.css";

const getPasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, text: "", criteria: {} };
  const criteria = {
    length: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
  };
  const score = Object.values(criteria).filter(Boolean).length;
  const texts = ["", "Very Weak", "Weak", "Medium", "Good", "Strong"];
  return { score, text: texts[score] || "", criteria };
};

export default function VendorResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) setError("Reset token is missing or invalid. Please request a new reset link.");
  }, [token]);

  const strength = getPasswordStrength(form.password);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid reset token. Please request a new reset link.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/vendors/reset-password", {
        token,
        password: form.password,
      });
      toast.success(res?.data?.message || "Password reset successful!");
      navigate("/vendor/login");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to reset password. Please try again.";
      setError(msg);
      toast.error(msg);
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
            <span>Make<strong>Audit</strong>Easy</span>
          </div>
          <h1 className="vl-left__title">Create a new password</h1>
          <p className="vl-left__sub">
            Choose a strong, unique password to keep your vendor account secure.
          </p>
          <ul className="vl-trust-list">
            {[
              "Use at least 8 characters",
              "Mix uppercase, lowercase, and numbers",
              "Avoid using your email or company name",
            ].map((point, i) => (
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
              <h2>Set New Password</h2>
              <p>Enter and confirm your new vendor portal password.</p>
            </div>

            {error && <div className="vfr-error">{error}</div>}

            {!token ? (
              <div style={{ textAlign: "center", marginTop: "12px" }}>
                <Link to="/vendor/forgot-password" className="vl-btn vl-btn--primary" style={{ textDecoration: "none", display: "inline-block" }}>
                  Request New Reset Link
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="vl-fields">
                {/* New Password */}
                <div className="vl-fg">
                  <label htmlFor="rp-password">
                    <Lock size={13} /> New Password
                  </label>
                  <div className="vl-pass-wrap">
                    <input
                      id="rp-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter new password"
                      disabled={loading}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword((p) => !p)} disabled={loading}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Strength meter */}
                  {form.password && (
                    <div className="vfr-strength">
                      <div className="vfr-strength__bar">
                        <div
                          className="vfr-strength__fill"
                          style={{
                            width: `${(strength.score / 5) * 100}%`,
                            background:
                              strength.score <= 2
                                ? "#ef4444"
                                : strength.score <= 3
                                ? "#f59e0b"
                                : "#10b981",
                          }}
                        />
                      </div>
                      <span
                        className="vfr-strength__label"
                        style={{
                          color:
                            strength.score <= 2
                              ? "#ef4444"
                              : strength.score <= 3
                              ? "#d97706"
                              : "#059669",
                        }}
                      >
                        {strength.text}
                      </span>
                      <div className="vfr-strength__criteria">
                        {[
                          { key: "length", label: "Min 8 chars" },
                          { key: "upper", label: "Uppercase" },
                          { key: "lower", label: "Lowercase" },
                          { key: "number", label: "Number" },
                          { key: "special", label: "Special char" },
                        ].map(({ key, label }) => (
                          <span
                            key={key}
                            className={`vfr-criterion ${strength.criteria[key] ? "met" : ""}`}
                          >
                            {strength.criteria[key] ? "✓" : "○"} {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="vl-fg">
                  <label htmlFor="rp-confirm">
                    <Lock size={13} /> Confirm Password
                  </label>
                  <div className="vl-pass-wrap">
                    <input
                      id="rp-confirm"
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat new password"
                      disabled={loading}
                      required
                    />
                    <button type="button" onClick={() => setShowConfirm((p) => !p)} disabled={loading}>
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="vl-btn vl-btn--primary"
                  disabled={loading || !token}
                >
                  {loading ? "Resetting password..." : "Reset Password"}
                </button>
              </form>
            )}

            <p className="vl-register-link" style={{ marginTop: "8px" }}>
              Remembered your password?{" "}
              <Link to="/vendor/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
