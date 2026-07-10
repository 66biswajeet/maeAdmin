import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, Shield, CheckCircle } from "lucide-react";
import API from "../services/api";
import "./VendorLoginPage.css";
import "./VendorForgotResetPage.css";

export default function VendorForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await API.post("/vendors/forgot-password", { email });
      setSent(true);
      toast.success(res?.data?.message || "Reset link sent! Check your inbox.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong. Please try again.");
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
          <h1 className="vl-left__title">Forgot your password?</h1>
          <p className="vl-left__sub">
            No worries — it happens to the best of us. Enter your registered
            email and we'll send you a secure link to create a new password.
          </p>
          <ul className="vl-trust-list">
            {[
              "Reset link expires in 15 minutes for your security",
              "No spam — just a one-time secure link",
              "Your account data stays safe and intact",
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
            {sent ? (
              <div className="vfr-sent">
                <div className="vfr-sent__emoji">✉️</div>
                <h2 className="vfr-sent__title">Check your inbox!</h2>
                <p className="vfr-sent__desc">
                  If <strong>{email}</strong> is registered with us, a password
                  reset link has been sent. The link is valid for{" "}
                  <strong>15 minutes</strong>.
                </p>
                <p className="vfr-sent__note">
                  Didn't receive it? Check your spam folder or{" "}
                  <button
                    className="vfr-sent__retry"
                    onClick={() => setSent(false)}
                  >
                    try again
                  </button>
                  .
                </p>
                <Link
                  to="/vendor/login"
                  className="vl-btn vl-btn--primary"
                  style={{ textDecoration: "none", textAlign: "center", display: "block", marginTop: "8px" }}
                >
                  Back to Login
                </Link>
              </div>
            ) : (
              <>
                <div className="vl-form-header">
                  <h2>Reset Password</h2>
                  <p>We'll email you a secure link to reset your password.</p>
                </div>

                <form onSubmit={handleSubmit} className="vl-fields">
                  <div className="vl-fg">
                    <label htmlFor="fp-email">
                      <Mail size={13} /> Email Address
                    </label>
                    <input
                      id="fp-email"
                      type="email"
                      placeholder="vendor@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="vl-btn vl-btn--primary"
                    disabled={loading}
                  >
                    {loading ? "Sending link..." : "Send Reset Link"}
                  </button>
                </form>
              </>
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
