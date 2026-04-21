import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  CheckCircle,
  Building2,
  Mail,
  Lock,
  Phone,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  MapPin,
  Search,
  Loader,
  X,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { searchCities } from "../services/indiaPostAPI";
import "./VendorRegisterPage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const BENEFITS = [
  "Access to 10,000+ compliance-ready businesses",
  "Verified vendor badge on your profile",
  "Real-time order & revenue dashboard",
  "Dedicated vendor support desk",
];

export default function VendorRegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    phone: "",
    baseCity: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1 = personal, 2 = company
  const [isChecking, setIsChecking] = useState(true); // Auth check state

  // City search states
  const [citySearchInput, setCitySearchInput] = useState("");
  const [citySearchResults, setCitySearchResults] = useState([]);
  const [citySearchLoading, setCitySearchLoading] = useState(false);
  const [citySearchError, setCitySearchError] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Check if user is admin or super admin
  useEffect(() => {
    const token = localStorage.getItem("token");
    const adminData = localStorage.getItem("admin");

    if (token && adminData) {
      try {
        const admin = JSON.parse(adminData);
        // Check multiple possible field names for role
        const role = admin.role || admin.type || admin.userType;

        console.log("Admin data found:", { role, admin }); // Debug log

        // Check against various role patterns
        const isAdmin =
          role &&
          (role === "admin" ||
            role === "superAdmin" ||
            role === "super_admin" ||
            role === "super admin" ||
            role?.toLowerCase?.() === "admin" ||
            role?.toLowerCase?.() === "superadmin" ||
            role?.toLowerCase?.() === "super_admin" ||
            role?.toLowerCase?.() === "super admin");

        if (isAdmin) {
          const roleDisplay = role?.toLowerCase?.().includes("super")
            ? "Super Admin"
            : "Admin";
          toast.error(`You are already a ${roleDisplay}`);
          setIsChecking(false);
          navigate("/");
          return;
        }
      } catch (e) {
        console.error("Error parsing admin data:", e);
      }
    }

    setIsChecking(false);
  }, [navigate]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleCitySearch = async (input) => {
    setCitySearchInput(input);
    setCitySearchError("");

    if (input.length < 2) {
      setCitySearchResults([]);
      return;
    }

    setCitySearchLoading(true);
    try {
      const result = await searchCities(input);
      if (result.success) {
        setCitySearchResults(result.cities);
      } else {
        setCitySearchError(result.error || "No cities found");
        setCitySearchResults([]);
      }
    } catch (err) {
      setCitySearchError("Error searching cities");
      setCitySearchResults([]);
    } finally {
      setCitySearchLoading(false);
    }
  };

  const handleSelectCity = (city) => {
    set("baseCity", city.name);
    setCitySearchInput("");
    setCitySearchResults([]);
    setShowCityDropdown(false);
  };

  const validateStep1 = () => {
    if (!form.name.trim()) return "Full name is required";
    if (!form.email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Enter a valid email";
    if (form.password.length < 6)
      return "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!form.companyName.trim()) {
      setError("Company name is required");
      return;
    }
    if (!form.baseCity.trim()) {
      setError("Base city/office location is required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/vendors/register`, {
        name: form.name,
        email: form.email,
        password: form.password,
        companyName: form.companyName,
        phone: form.phone,
        baseCity: form.baseCity,
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything while checking auth
  if (isChecking) {
    return null;
  }

  if (success) {
    return (
      <div className="vr-page">
        <div className="vr-success">
          <div className="vr-success__icon">
            <CheckCircle size={48} />
          </div>
          <h2>Application Submitted!</h2>
          <p>
            Thank you for applying to become a vendor on our platform. Our team
            will review your application and notify you at{" "}
            <strong>{form.email}</strong> once approved.
          </p>
          <div className="vr-success__steps">
            {[
              "Application received",
              "Admin review (1–2 days)",
              "Account activated",
            ].map((s, i) => (
              <div key={i} className="vr-success__step">
                <span className="vr-success__step-num">{i + 1}</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
          <a href="/vendor/login" className="vr-btn vr-btn--primary">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="vr-page">
      <div className="vr-layout">
        {/* ── Left panel ── */}
        <div className="vr-left">
          <div className="vr-left__logo">
            <Shield size={28} />
            <span>
              Make<strong>Audit</strong>Easy
            </span>
          </div>
          <h1 className="vr-left__title">
            Sell Your Compliance Services to India's Top Enterprises
          </h1>
          <p className="vr-left__sub">
            Join our vetted network of audit and compliance vendors trusted by
            500+ corporations.
          </p>
          <ul className="vr-benefits">
            {BENEFITS.map((b, i) => (
              <li key={i} className="vr-benefit">
                <CheckCircle size={16} />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <div className="vr-left__badge">
            <Shield size={16} />
            <span>Authorized Vendor Program · Est. 2024</span>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="vr-right">
          <div className="vr-form-card">
            <div className="vr-form-header">
              <h2>Vendor Application</h2>
              <p>
                Step {step} of 2 —{" "}
                {step === 1 ? "Personal Details" : "Company Info"}
              </p>
              {/* Step progress bar */}
              <div className="vr-step-bar">
                <div
                  className="vr-step-bar__fill"
                  style={{ width: step === 1 ? "50%" : "100%" }}
                />
              </div>
            </div>

            {error && (
              <div className="vr-error">
                <span>{error}</span>
              </div>
            )}

            {step === 1 ? (
              <div className="vr-fields">
                <div className="vr-fg">
                  <label>
                    <User size={13} /> Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Rahul Sharma"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                  />
                </div>
                <div className="vr-fg">
                  <label>
                    <Mail size={13} /> Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="rahul@company.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </div>
                <div className="vr-fg">
                  <label>
                    <Lock size={13} /> Password
                  </label>
                  <div className="vr-pass-wrap">
                    <input
                      type={showPass ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((p) => !p)}
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div className="vr-fg">
                  <label>
                    <Lock size={13} /> Confirm Password
                  </label>
                  <div className="vr-pass-wrap">
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat password"
                      value={form.confirmPassword}
                      onChange={(e) => set("confirmPassword", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((p) => !p)}
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <button className="vr-btn vr-btn--primary" onClick={handleNext}>
                  Continue <ArrowRight size={15} />
                </button>
              </div>
            ) : (
              <div className="vr-fields">
                <div className="vr-fg">
                  <label>
                    <Building2 size={13} /> Company Name <span>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Acme Compliance Pvt. Ltd."
                    value={form.companyName}
                    onChange={(e) => set("companyName", e.target.value)}
                  />
                </div>
                <div className="vr-fg">
                  <label>
                    <Phone size={13} /> Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </div>
                <div className="vr-fg">
                  <label>
                    <MapPin size={13} /> Base City / Office Location{" "}
                    <span>*</span>
                  </label>
                  <div style={{ position: "relative", width: "100%" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Search
                          size={13}
                          style={{
                            position: "absolute",
                            left: "10px",
                            color: "#999",
                            pointerEvents: "none",
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Search by city name or pincode..."
                          value={form.baseCity || citySearchInput}
                          onChange={(e) => handleCitySearch(e.target.value)}
                          onFocus={() => {
                            if (citySearchResults.length > 0)
                              setShowCityDropdown(true);
                          }}
                          style={{
                            paddingLeft: "32px",
                            width: "100%",
                          }}
                        />
                        {form.baseCity && (
                          <button
                            type="button"
                            onClick={() => {
                              set("baseCity", "");
                              setCitySearchInput("");
                              setCitySearchResults([]);
                            }}
                            style={{
                              position: "absolute",
                              right: "10px",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: "4px",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <X size={14} color="#666" />
                          </button>
                        )}
                      </div>
                      {citySearchLoading && (
                        <Loader
                          size={16}
                          style={{
                            animation: "spin 1s linear infinite",
                          }}
                        />
                      )}
                    </div>

                    {/* City search results dropdown */}
                    {showCityDropdown && citySearchResults.length > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          background: "white",
                          border: "1px solid #ddd",
                          borderRadius: "6px",
                          marginTop: "4px",
                          maxHeight: "300px",
                          overflowY: "auto",
                          zIndex: 1000,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      >
                        {citySearchResults.map((city, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectCity(city)}
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              background: "white",
                              border: "none",
                              textAlign: "left",
                              cursor: "pointer",
                              fontSize: "14px",
                              borderBottom: "1px solid #f0f0f0",
                              transition: "background-color 0.2s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#f5f5f5")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor = "white")
                            }
                          >
                            <div style={{ fontWeight: "500" }}>{city.name}</div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#666",
                                marginTop: "2px",
                              }}
                            >
                              {city.state}
                              {city.pincode && ` • ${city.pincode}`}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Search error */}
                    {citySearchError && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#e74c3c",
                          marginTop: "6px",
                        }}
                      >
                        {citySearchError}
                      </div>
                    )}
                  </div>
                </div>
                <div className="vr-notice">
                  <Shield size={14} />
                  <span>
                    Your application will be reviewed by our team within 1–2
                    business days.
                  </span>
                </div>
                <div className="vr-form-actions">
                  <button
                    className="vr-btn vr-btn--ghost"
                    onClick={() => {
                      setStep(1);
                      setError("");
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    className="vr-btn vr-btn--primary"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </div>
            )}

            <p className="vr-login-link">
              Already a vendor? <a href="/vendor/login">Sign in here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
