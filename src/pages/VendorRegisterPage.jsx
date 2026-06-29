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
  Info,
  ExternalLink,
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
    interestedPlan: "Startup / Promotion Plan",
    empanelment: "",
  });
  const [empanelments, setEmpanelments] = useState([]);
  const [showSubscriptionInfo, setShowSubscriptionInfo] = useState(false);
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
    fetchEmpanelments();
  }, [navigate]);

  const fetchEmpanelments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/empanelments`);
      setEmpanelments(res.data);
    } catch (err) {
      console.error("Error fetching empanelments:", err);
    }
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const triggerCitySearch = async () => {
    const input = citySearchInput || form.baseCity;
    setCitySearchError("");

    if (!input || input.length < 2) {
      setCitySearchError("Enter at least 2 characters");
      setCitySearchResults([]);
      return;
    }

    setCitySearchLoading(true);
    setShowCityDropdown(false);
    try {
      const result = await searchCities(input);
      if (result.success) {
        setCitySearchResults(result.cities);
        setShowCityDropdown(true);
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

  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (!pwd) return { score, text: "" };
    
    const criteria = {
      length: pwd.length >= 12,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd),
    };

    if (criteria.length) score++;
    if (criteria.upper) score++;
    if (criteria.lower) score++;
    if (criteria.number) score++;
    if (criteria.special) score++;

    let text = "Very Weak";
    if (score === 1) text = "Very Weak";
    else if (score === 2) text = "Weak";
    else if (score === 3) text = "Medium";
    else if (score === 4) text = "Good";
    else if (score === 5) text = "Strong";

    return { score, text, criteria };
  };

  const strength = getPasswordStrength(form.password);

  const validateStep1 = () => {
    if (!form.name.trim()) return "Full name is required";
    if (!form.email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Enter a valid email";
    
    const { criteria } = strength;
    if (form.password && (!criteria || !criteria.length || !criteria.upper || !criteria.lower || !criteria.number || !criteria.special)) {
      return "Password does not meet complexity requirements.";
    }

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
    if (!form.empanelment) {
      setError("Empanelment is required");
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
        interestedPlan: form.interestedPlan,
        empanelment: form.empanelment,
      });
      setSuccess(true);
    } catch (err) {
      const data = err?.response?.data;
      let errMsg = "Registration failed. Please try again.";
      if (data?.errors && Array.isArray(data.errors)) {
        errMsg = data.errors.map((e) => e.message).join(". ");
      } else if (data?.message) {
        errMsg = data.message;
      }
      setError(errMsg);
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
                      placeholder="Create a strong password"
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
                  
                  <div className="pwd-strength" style={{ marginTop: "10px" }}>
                    {form.password && (
                      <>
                        <div className="pwd-bar" style={{ height: "5px", background: "#e5e7eb", borderRadius: "3px", overflow: "hidden", position: "relative", marginBottom: "6px" }}>
                          <div style={{
                            height: "100%",
                            width: `${(strength.score / 5) * 100}%`,
                            background: strength.score <= 2 ? "#ef4444" : strength.score <= 4 ? "#f59e0b" : "#10b981",
                            transition: "width 0.3s ease, background 0.3s ease"
                          }} />
                        </div>
                        <div className="pwd-label" style={{ marginBottom: "8px", fontSize: "0.75rem", fontWeight: "600", color: strength.score <= 2 ? "#ef4444" : strength.score <= 4 ? "#d97706" : "#059669" }}>
                          Password Strength: {strength.text}
                        </div>
                      </>
                    )}

                    <div style={{ fontSize: "0.75rem", color: "#6b7280", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", padding: "8px", background: "#f9fafb", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                      <div style={{ color: strength.criteria?.length ? "#10b981" : "#9ca3af", transition: "color 0.2s ease" }}>
                        {strength.criteria?.length ? "✓" : "○"} Min 12 characters
                      </div>
                      <div style={{ color: strength.criteria?.upper ? "#10b981" : "#9ca3af", transition: "color 0.2s ease" }}>
                        {strength.criteria?.upper ? "✓" : "○"} One uppercase
                      </div>
                      <div style={{ color: strength.criteria?.lower ? "#10b981" : "#9ca3af", transition: "color 0.2s ease" }}>
                        {strength.criteria?.lower ? "✓" : "○"} One lowercase
                      </div>
                      <div style={{ color: strength.criteria?.number ? "#10b981" : "#9ca3af", transition: "color 0.2s ease" }}>
                        {strength.criteria?.number ? "✓" : "○"} One number
                      </div>
                      <div style={{ color: strength.criteria?.special ? "#10b981" : "#9ca3af", transition: "color 0.2s ease" }}>
                        {strength.criteria?.special ? "✓" : "○"} One special char
                      </div>
                    </div>
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
                          placeholder="Enter city name or pincode..."
                          value={citySearchInput}
                          onChange={(e) => setCitySearchInput(e.target.value)}
                          onFocus={() => {
                            if (citySearchResults.length > 0)
                              setShowCityDropdown(true);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              triggerCitySearch();
                            }
                          }}
                          style={{
                            paddingLeft: "32px",
                            width: "100%",
                          }}
                        />
                        {(form.baseCity || citySearchInput) && (
                          <button
                            type="button"
                            onClick={() => {
                              set("baseCity", "");
                              setCitySearchInput("");
                              setCitySearchResults([]);
                              setShowCityDropdown(false);
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
                      <button 
                        type="button"
                        className="vr-btn vr-btn--teal btn-city-search"
                        onClick={triggerCitySearch}
                        disabled={citySearchLoading}
                        style={{
                          padding: '0 15px',
                          height: '42px',
                          fontSize: '13px',
                          borderRadius: '8px',
                          backgroundColor: '#2d5be3',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: '600'
                        }}
                      >
                        {citySearchLoading ? (
                          <Loader size={14} className="spin" />
                        ) : (
                          <Search size={14} />
                        )}
                        Search
                      </button>
                    </div>
                    {form.baseCity && !citySearchInput && (
                      <div style={{ fontSize: '12px', color: '#059669', marginTop: '6px', fontWeight: '600' }}>
                        Selected: {form.baseCity}
                      </div>
                    )}


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

                <div className="vr-fg">
                  <label>
                    Partnership Plan Preference <span>*</span>
                  </label>
                  <select
                    value={form.interestedPlan}
                    onChange={(e) => set("interestedPlan", e.target.value)}
                    className="vr-select"
                  >
                    <option value="Diamond Partner">Diamond Partner (₹1,50,000)</option>
                    <option value="Gold Partner">Gold Partner (₹75,000)</option>
                    <option value="Silver Partner">Silver Partner (₹50,000)</option>
                    <option value="Startup / Promotion Plan">Startup / Promotion Plan (Free)</option>
                  </select>
                  <button 
                    type="button" 
                    className="vr-info-link"
                    onClick={() => setShowSubscriptionInfo(true)}
                  >
                    <Info size={14} /> Know more about subscriptions
                  </button>
                </div>

                <div className="vr-fg">
                  <label>
                    Empanelment <span>*</span>
                  </label>
                  <select
                    value={form.empanelment}
                    onChange={(e) => set("empanelment", e.target.value)}
                    className="vr-select"
                  >
                    <option value="">Select Empanelment</option>
                    {empanelments.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.empanelmentName}
                      </option>
                    ))}
                  </select>
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

      {/* Subscription Info Modal */}
      {showSubscriptionInfo && (
        <div className="vr-modal-overlay">
          <div className="vr-modal">
            <div className="vr-modal-header">
              <h3>Partnership & Commercial Plans</h3>
              <button onClick={() => setShowSubscriptionInfo(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="vr-modal-body">
              <div className="plan-promo">
                Grow Risk-Free with Our Partnership Tiers. Sign up for a Diamond, Gold, or Silver Partnership today and take advantage of our 100% No-Lead Refund Guarantee. If our platform doesn't generate a lead for you within the first 12 months, we'll return your subscription fee in full.
              </div>
              
              <div className="plan-table-wrapper">
                <table className="plan-table">
                  <thead>
                    <tr>
                      <th>Plan Name</th>
                      <th>Original Subscription Fee</th>
                      <th>Offer Price</th>
                      <th>Commission Rate</th>
                      <th>Validity</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Diamond Partner</strong></td>
                      <td>₹3,00,000</td>
                      <td>₹1,50,000</td>
                      <td>10%</td>
                      <td>12 Months</td>
                    </tr>
                    <tr>
                      <td><strong>Gold Partner</strong></td>
                      <td>₹1,50,000</td>
                      <td>₹75,000</td>
                      <td>20%</td>
                      <td>12 Months</td>
                    </tr>
                    <tr>
                      <td><strong>Silver Partner</strong></td>
                      <td>₹1,00,000</td>
                      <td>₹50,000</td>
                      <td>30%</td>
                      <td>12 Months</td>
                    </tr>
                    <tr>
                      <td><strong>Startup / Promotion Plan</strong></td>
                      <td>₹25,000</td>
                      <td>Free (Limited Offer)</td>
                      <td>42%</td>
                      <td>12 Months</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
