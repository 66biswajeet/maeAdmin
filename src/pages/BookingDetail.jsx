import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBooking, updateBookingStatus } from "../services/api";
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
import "./BookingDetail.css";

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
  if (!status) return <span className="status-badge status-badge--pending">—</span>;
  return (
    <span className={`status-badge status-badge--${status.toLowerCase()}`}>
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
      <span className={`kv-row__val${mono ? " kv-row__val--mono" : ""}`}>
        {String(value)}
      </span>
    </div>
  );
}

/* ── Section card ─────────────────────────────────────────────── */
function SectionCard({ title, icon, children }) {
  return (
    <div className="section-card">
      <div className="section-card__title">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

/* ── Item card (replaces the messy table cell) ────────────────── */
function ItemCard({ it, bookingVendor, idx }) {
  const snap = it.productSnapshot || (it.productId && typeof it.productId === "object" ? it.productId : {});
  const filter = it.filterSnapshot || {};
  const vendor = it.vendorSnapshot || bookingVendor || {};
  const img = snap.images?.[0]?.url || snap.image || null;
  const title = snap.title || it.productSnapshot?.title || (typeof it.productId === "string" ? it.productId : null) || `Item ${idx + 1}`;
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
                .map((c) => (typeof c === "string" ? c : c.name || c.city || ""))
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
          <p className="booking-state__text">Loading booking…</p>
        </div>
      </div>
    );

  if (!booking)
    return (
      <div className="booking-page">
        <div className="booking-state">
          <Package size={40} style={{ color: "#c5cfe0", marginBottom: 12 }} />
          <p className="booking-state__text">Booking not found.</p>
          <button className="bd-btn bd-btn--secondary" onClick={() => navigate(-1)}>
            ← Go back
          </button>
        </div>
      </div>
    );

  const vendor = booking.vendor || {};
  const customer = booking.customer || {};
  const canAccept = booking.status === "pending" || booking.status === "in_progress";
  const canComplete = booking.status === "accepted" || booking.status === "in_progress";
  const canCancel = booking.status !== "cancelled" && booking.status !== "completed";

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
            {updating && (
              <RefreshCw size={15} style={{ animation: "dotPulse 0.8s linear infinite", color: "#8fa0b5" }} />
            )}
          </div>
        </div>

        {/* ── Title + summary strip ── */}
        <div className="bd-headline">
          <h2 className="booking-title">Booking Details</h2>
          <StatusBadge status={booking.status} />
        </div>

        <div className="booking-summary">
          <div className="summary-field">
            <div className="summary-field__label">Booking ID</div>
            <div className="summary-field__value summary-field__value--id">
              {booking._id}
            </div>
          </div>
          <div className="summary-field">
            <div className="summary-field__label">Order Ref</div>
            <div className="summary-field__value summary-field__value--id">
              {typeof booking.order === "object"
                ? booking.order?._id || "—"
                : booking.order || "—"}
            </div>
          </div>
          <div className="summary-field">
            <div className="summary-field__label">Created</div>
            <div className="summary-field__value">{fmtDate(booking.createdAt)}</div>
          </div>
          <div className="summary-field">
            <div className="summary-field__label">Last Updated</div>
            <div className="summary-field__value">{fmtDate(booking.updatedAt)}</div>
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
                <span style={{ color: "#8fa0b5", fontSize: 13 }}>No vendor info</span>
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
                <span style={{ color: "#8fa0b5", fontSize: 13 }}>No customer info</span>
              )}
            </div>
          </SectionCard>

          {/* Price */}
          <SectionCard title="Price Breakdown" icon={<IndianRupee size={13} />}>
            <div className="price-list">
              {booking.subtotal !== undefined && (
                <div className="price-row">
                  <span className="price-row__label">Subtotal</span>
                  <span className="price-row__amount">{fmt(booking.subtotal)}</span>
                </div>
              )}
              {booking.discount ? (
                <div className="price-row">
                  <span className="price-row__label">Discount</span>
                  <span className="price-row__amount" style={{ color: "#16a34a" }}>
                    -{fmt(booking.discount)}
                  </span>
                </div>
              ) : null}
              {booking.tax !== undefined && (
                <div className="price-row">
                  <span className="price-row__label">Tax (GST)</span>
                  <span className="price-row__amount">{fmt(booking.tax)}</span>
                </div>
              )}
              <div className="price-row price-row--total">
                <span className="price-row__label">Total</span>
                <span className="price-row__amount">{fmt(booking.total)}</span>
              </div>
            </div>
          </SectionCard>

          {/* Notes */}
          <SectionCard title="Notes" icon={<FileText size={13} />}>
            <p className="bd-notes">
              {booking.notes || "No notes attached to this booking."}
            </p>
          </SectionCard>
        </div>

        {/* ── Items ── */}
        <div className="section-card" style={{ marginBottom: 0 }}>
          <div className="section-card__title">
            <Package size={13} />
            Items ({(booking.items || []).length})
          </div>

          {(booking.items || []).length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#8fa0b5", fontSize: 13 }}>
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
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`bk-toast ${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}
