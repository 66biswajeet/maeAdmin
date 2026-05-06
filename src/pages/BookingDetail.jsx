import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBooking, updateBookingStatus } from "../services/api";
import "./BookingDetail.css";
import {
  ArrowLeft,
  Building2,
  User,
  Package,
  IndianRupee,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  TrendingUp,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

/* ── Helpers ──────────────────────────────────────────────────── */
function fmt(n) {
  if (n === null || n === undefined || n === "") return "—";
  try {
    return "₹" + new Intl.NumberFormat("en-IN").format(Number(n));
  } catch {
    return String(n);
  }
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function stripHtml(html) {
  if (!html) return "";
  return String(html)
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* ── Status badge ─────────────────────────────────────────────── */
function StatusBadge({ status }) {
  if (!status)
    return <span className="status-badge status-badge--pending">—</span>;

  const s = status.toLowerCase().replace(" ", "_");
  return (
    <span className={`status-badge status-badge--${s}`}>
      <span className="status-badge__dot" />
      {status.replace("_", " ")}
    </span>
  );
}

/* ── Info row (label + value) ─────────────────────────────────── */
function InfoRow({ label, value, mono }) {
  if (!value && value !== 0) return null;
  return (
    <div className="kv-row">
      <span className="kv-row__key">{label}</span>
      <span className={`kv-row__val ${mono ? "kv-row__val--mono" : ""}`}>
        {String(value)}
      </span>
    </div>
  );
}

/* ── Section card ─────────────────────────────────────────────── */
function SectionCard({ title, icon, children, className = "" }) {
  return (
    <div className={`section-card ${className}`}>
      <div className="section-card__title">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

/* ── Item card ────────────────────────────────────────────────── */
function ItemCard({ it, bookingVendor, idx }) {
  const snap =
    it.productSnapshot ||
    (it.productId && typeof it.productId === "object" ? it.productId : {});
  const filter = it.filterSnapshot || {};
  const vendor = it.vendorSnapshot || bookingVendor || {};
  const img = snap.images?.[0]?.url || snap.image || null;
  const title =
    snap.title ||
    it.productSnapshot?.title ||
    (typeof it.productId === "string" ? it.productId : null) ||
    `Item ${idx + 1}`;
  const desc = stripHtml(snap.description || snap.shortDesc || "");
  const plan = filter.plan || filter.planSnapshot || null;
  const cities = filter.cities || filter.citiesSelected || [];

  return (
    <div className="item-card">
      {/* Thumb */}
      <div className="item-card__thumb">
        {img ? (
          <img src={img} alt={title} />
        ) : (
          <div className="item-card__thumb-empty">
            <Package size={20} />
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="item-card__meta">
        <div className="item-card__title">{title}</div>
        {desc && (
          <div className="item-card__desc">
            {desc.slice(0, 160)}
            {desc.length > 160 ? "…" : ""}
          </div>
        )}

        <div className="item-card__tags">
          {vendor && (vendor.companyName || vendor.name) && (
            <span className="item-tag item-tag--vendor">
              <Building2 size={10} />
              {vendor.companyName || vendor.name}
            </span>
          )}
          {plan && (
            <span className="item-tag item-tag--plan">
              {plan.name || plan.title || plan._id || "Plan"}
            </span>
          )}
        </div>

        {Array.isArray(cities) && cities.length > 0 && (
          <div className="item-card__cities">
            <MapPin size={11} />
            <span>
              {cities
                .map((c) =>
                  typeof c === "string" ? c : c.name || c.city || "",
                )
                .filter(Boolean)
                .join(", ")}
            </span>
          </div>
        )}
      </div>

      {/* Price */}
      <div className="item-card__price">
        <div className="item-card__unit">{fmt(it.unitPrice)}</div>
        <div className="item-card__qty">× {it.quantity || 1}</div>
        <div className="item-card__total">
          {fmt((Number(it.unitPrice) || 0) * (Number(it.quantity) || 1))}
        </div>
      </div>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────── */
export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getBooking(id);
      setBooking(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();
  }, [id]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const changeStatus = async (status) => {
    setUpdating(true);
    try {
      await updateBookingStatus(id, { status });
      setBooking((b) => ({ ...b, status }));
      showToast(`Booking marked as ${status}`);
    } catch (err) {
      console.error(err);
      showToast("Failed to update status", "error");
    } finally {
      setUpdating(false);
    }
  };

  /* ── States ─────────────────────────────────────────────────── */
  if (loading)
    return (
      <div className="booking-page">
        <div className="booking-state">
          <div className="loader-dots">
            <div className="loader-dots__dot" />
            <div className="loader-dots__dot" />
            <div className="loader-dots__dot" />
          </div>
          <p
            style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0 }}
          >
            Loading booking…
          </p>
        </div>
      </div>
    );

  if (!booking)
    return (
      <div className="booking-page">
        <div className="booking-state">
          <Package
            size={40}
            style={{ color: "var(--border-strong)", marginBottom: "12px" }}
          />
          <p
            style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0 }}
          >
            Booking not found.
          </p>
          <button
            className="bd-btn bd-btn--secondary"
            onClick={() => navigate(-1)}
          >
            ← Go back
          </button>
        </div>
      </div>
    );

  const vendor = booking.vendor || {};
  const customer = booking.customer || {};
  const canAccept =
    booking.status === "pending" || booking.status === "in_progress";
  const canComplete =
    booking.status === "accepted" || booking.status === "in_progress";
  const canCancel =
    booking.status !== "cancelled" && booking.status !== "completed";

  return (
    <div className="booking-page">
      <div className="booking-inner">
        {/* ── Nav ── */}
        <div className="bd-topbar">
          <button className="btn-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} />
            Back to Bookings
          </button>
          <div className="bd-action-row">
            {canAccept && (
              <button
                id="bd-accept-btn"
                className="bd-btn bd-btn--accept"
                onClick={() => changeStatus("accepted")}
                disabled={updating}
              >
                <CheckCircle size={14} />
                Accept
              </button>
            )}
            {canComplete && (
              <button
                id="bd-complete-btn"
                className="bd-btn bd-btn--complete"
                onClick={() => changeStatus("completed")}
                disabled={updating}
              >
                <TrendingUp size={14} />
                Mark Completed
              </button>
            )}
            {canCancel && (
              <button
                id="bd-cancel-btn"
                className="bd-btn bd-btn--cancel"
                onClick={() => changeStatus("cancelled")}
                disabled={updating}
              >
                <XCircle size={14} />
                Cancel
              </button>
            )}
            {updating && <RefreshCw size={15} className="animate-spin" />}
          </div>
        </div>

        {/* ── Title + summary strip ── */}
        <div className="bd-headline">
          <h2 className="booking-title">Booking Details</h2>
          <StatusBadge status={booking.status} />
        </div>

        <div className="booking-summary">
          <div>
            <div className="summary-field__label">Booking ID</div>
            <div className="summary-field__value summary-field__value--id">
              {booking._id}
            </div>
          </div>
          <div>
            <div className="summary-field__label">Order Ref</div>
            <div className="summary-field__value summary-field__value--id">
              {typeof booking.order === "object"
                ? booking.order?._id || "—"
                : booking.order || "—"}
            </div>
          </div>
          <div>
            <div className="summary-field__label">Created</div>
            <div className="summary-field__value">
              {fmtDate(booking.createdAt)}
            </div>
          </div>
          <div>
            <div className="summary-field__label">Last Updated</div>
            <div className="summary-field__value">
              {fmtDate(booking.updatedAt)}
            </div>
          </div>
        </div>

        {/* ── Vendor + Customer + Price + Notes ── */}
        <div className="info-grid">
          {/* Vendor */}
          <SectionCard title="Vendor" icon={<Building2 size={13} />}>
            <div className="kv-list">
              <InfoRow label="Company" value={vendor.companyName} />
              <InfoRow label="Name" value={vendor.name} />
              <InfoRow label="Email" value={vendor.email} />
              <InfoRow label="Phone" value={vendor.phone} />
              <InfoRow label="ID" value={vendor._id} mono />
              {!vendor._id && !vendor.name && !vendor.companyName && (
                <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                  No vendor info
                </span>
              )}
            </div>
          </SectionCard>

          {/* Customer */}
          <SectionCard title="Customer" icon={<User size={13} />}>
            <div className="kv-list">
              <InfoRow label="Name" value={customer.name} />
              <InfoRow label="Email" value={customer.email} />
              <InfoRow label="Phone" value={customer.phone} />
              <InfoRow label="Company" value={customer.companyName} />
              <InfoRow label="ID" value={customer._id} mono />
              {!customer._id && !customer.name && !customer.email && (
                <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                  No customer info
                </span>
              )}
            </div>
          </SectionCard>

          {/* Price */}
          <SectionCard title="Price Breakdown" icon={<IndianRupee size={13} />}>
            <div className="price-list">
              {booking.subtotal !== undefined && (
                <div className="price-row">
                  <span className="price-row__label">Subtotal</span>
                  <span className="price-row__amount">
                    {fmt(booking.subtotal)}
                  </span>
                </div>
              )}
              {booking.discount ? (
                <div className="price-row">
                  <span className="price-row__label">Discount</span>
                  <span
                    className="price-row__amount"
                    style={{ color: "var(--teal)" }}
                  >
                    -{fmt(booking.discount)}
                  </span>
                </div>
              ) : null}
              {booking.tax !== undefined && (
                <>
                  {booking.taxType && booking.taxType.includes("CGST") ? (
                    <>
                      <div className="price-row">
                        <span className="price-row__label">CGST (9%)</span>
                        <span className="price-row__amount">{fmt(booking.tax / 2)}</span>
                      </div>
                      <div className="price-row">
                        <span className="price-row__label">SGST (9%)</span>
                        <span className="price-row__amount">{fmt(booking.tax / 2)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="price-row">
                      <span className="price-row__label">{booking.taxType || "IGST (18%)"}</span>
                      <span className="price-row__amount">{fmt(booking.tax)}</span>
                    </div>
                  )}
                </>
              )}
              <div className="price-row price-row--total">
                <span className="price-row__label">Total Order Amount</span>
                <span className="price-row__amount">{fmt(booking.total)}</span>
              </div>

              {/* Commission Breakdown (Internal/Vendor/Admin only) */}
              {vendor.commissionPercentage !== undefined && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed #eee' }}>
                  <div className="price-row" style={{ fontSize: '12px', color: '#666' }}>
                    <span className="price-row__label">Platform Commission ({vendor.commissionPercentage}%)</span>
                    <span className="price-row__amount">-{fmt((booking.total * vendor.commissionPercentage) / 100)}</span>
                  </div>
                  <div className="price-row" style={{ fontSize: '14px', fontWeight: '700', color: 'var(--navy-border)', marginTop: 4 }}>
                    <span className="price-row__label">Net Vendor Revenue</span>
                    <span className="price-row__amount">{fmt(booking.total - (booking.total * vendor.commissionPercentage) / 100)}</span>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Notes */}
          <SectionCard title="Notes" icon={<FileText size={13} />}>
            <p className="bd-notes">
              {booking.notes || "No notes attached to this booking."}
            </p>
          </SectionCard>

          {/* Billing Address */}
          {booking.billingAddress && (
            <SectionCard title="Billing Address" icon={<MapPin size={13} />}>
              <div className="kv-list">
                <InfoRow label="Name" value={`${booking.billingAddress.firstName} ${booking.billingAddress.lastName}`} />
                <InfoRow label="Street" value={booking.billingAddress.streetAddress} />
                <InfoRow label="Apt/Suite" value={booking.billingAddress.apartment} />
                <InfoRow label="City" value={booking.billingAddress.city} />
                <InfoRow label="State" value={booking.billingAddress.state} />
                <InfoRow label="Pincode" value={booking.billingAddress.pincode} />
                <InfoRow label="Phone" value={booking.billingAddress.phone} />
                <InfoRow label="Email" value={booking.billingAddress.email} />
              </div>
            </SectionCard>
          )}
        </div>

        {/* ── Items ── */}
        <SectionCard
          title={`Items (${(booking.items || []).length})`}
          icon={<Package size={13} />}
          className="mb-0"
        >
          {(booking.items || []).length === 0 ? (
            <div
              style={{
                textAlign: "center",
                paddingTop: "32px",
                paddingBottom: "32px",
                color: "var(--text-muted)",
                fontSize: "13px",
              }}
            >
              No items in this booking.
            </div>
          ) : (
            <div className="items-list">
              {(booking.items || []).map((it, i) => (
                <ItemCard
                  key={it._id || i}
                  it={it}
                  bookingVendor={booking.vendor}
                  idx={i}
                />
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            color: "white",
            padding: "8px 18px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "500",
            boxShadow: "var(--shadow-md)",
            zIndex: 300,
            background:
              toast.type === "success" ? "var(--teal)" : "var(--danger)",
            animation: "toastIn 0.25s ease",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Styles for Animations */}
      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { transform: scale(0.55); opacity: 0.25; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
