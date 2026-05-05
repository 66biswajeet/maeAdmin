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
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-amber-50 text-amber-600 border border-amber-600/18">
        —
      </span>
    );

  const styles = {
    pending: "bg-amber-50 text-amber-600 border-amber-600/18",
    accepted: "bg-blue-50 text-blue-600 border-blue-600/18",
    confirmed: "bg-emerald-50 text-emerald-600 border-emerald-600/20",
    in_progress: "bg-purple-50 text-purple-600 border-purple-600/15",
    completed: "bg-emerald-50 text-emerald-600 border-emerald-600/20",
    cancelled: "bg-red-50 text-red-600 border-red-600/18",
    rejected: "bg-red-50 text-red-600 border-red-600/18",
  };

  const s = status.toLowerCase();
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold capitalize border ${styles[s] || styles.pending}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {status.replace("_", " ")}
    </span>
  );
}

/* ── Info row (label + value) ─────────────────────────────────── */
function InfoRow({ label, value, mono }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between items-baseline gap-2 text-[13px] leading-relaxed">
      <span className="text-slate-400 font-normal shrink-0 min-w-[72px]">
        {label}
      </span>
      <span
        className={`text-slate-700 font-medium text-right break-words ${mono ? "font-mono text-[11.5px] text-slate-500" : ""}`}
      >
        {String(value)}
      </span>
    </div>
  );
}

/* ── Section card ─────────────────────────────────────────────── */
function SectionCard({ title, icon, children, className = "" }) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl p-[18px] pb-5 shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.7px] text-slate-400 mb-4 pb-3 border-b border-slate-100">
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
    <div className="flex gap-4 items-start p-4 border border-slate-200 rounded-lg bg-slate-50/50 transition-all hover:border-emerald-500/30 hover:shadow-[0_2px_8px_rgba(0,201,167,0.06)] group sm:flex-wrap">
      {/* Thumb */}
      <div className="w-[72px] h-[72px] rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
        {img ? (
          <img src={img} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="text-slate-200 flex items-center justify-center w-full h-full">
            <Package size={20} />
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold text-slate-800 mb-1 group-hover:text-emerald-600 transition-colors">
          {title}
        </div>
        {desc && (
          <div className="text-[12px] text-slate-500 leading-tight mb-2.5 line-clamp-2">
            {desc.slice(0, 160)}
            {desc.length > 160 ? "…" : ""}
          </div>
        )}

        <div className="flex gap-1.5 flex-wrap mb-2">
          {vendor && (vendor.companyName || vendor.name) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
              <Building2 size={10} />
              {vendor.companyName || vendor.name}
            </span>
          )}
          {plan && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
              {plan.name || plan.title || plan._id || "Plan"}
            </span>
          )}
        </div>

        {Array.isArray(cities) && cities.length > 0 && (
          <div className="flex items-center gap-1.5 font-medium text-slate-400 text-[11.5px]">
            <MapPin size={11} />
            <span className="truncate">
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
      <div className="text-right flex flex-col items-end gap-1 min-w-[90px] shrink-0 sm:w-full sm:text-left sm:items-start sm:border-t sm:border-dashed sm:border-slate-200 sm:pt-2.5 sm:mt-1 sm:flex-row sm:gap-3">
        <div className="text-[13.5px] font-semibold text-slate-800">
          {fmt(it.unitPrice)}
        </div>
        <div className="text-[12px] text-slate-400 italic">
          × {it.quantity || 1}
        </div>
        <div className="text-[16px] font-bold text-[#1e3b86] pt-1.5 border-t border-slate-200 min-w-[70px] sm:border-t-0 sm:pt-0 sm:ml-auto">
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
      <div className="min-h-screen bg-slate-50 font-['DM_Sans'] text-slate-900 p-7 sm:p-4 pb-20">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3.5 text-center">
          <div className="flex gap-1.5 items-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-[dotPulse_1.2s_ease-in-out_infinite]" />
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-[dotPulse_1.2s_ease-in-out_infinite_0.18s]" />
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-[dotPulse_1.2s_ease-in-out_infinite_0.36s]" />
          </div>
          <p className="text-[14px] text-slate-400">Loading booking…</p>
        </div>
      </div>
    );

  if (!booking)
    return (
      <div className="min-h-screen bg-slate-50 font-['DM_Sans'] text-slate-900 p-7 sm:p-4 pb-20">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3.5 text-center">
          <Package size={40} className="text-slate-200 mb-3" />
          <p className="text-[14px] text-slate-400">Booking not found.</p>
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-200 text-[13px] font-semibold text-slate-600 hover:border-slate-300 transition-colors"
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
    <div className="min-h-screen bg-slate-50 font-['DM_Sans'] text-slate-900 p-7 sm:p-4 pb-20">
      <div className="max-w-[920px] mx-auto">
        {/* ── Nav ── */}
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap sm:flex-col sm:items-start">
          <button
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-transparent border border-slate-200 text-slate-500 text-[13px] font-medium hover:border-slate-300 hover:text-slate-800 hover:bg-white transition-all shadow-sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={15} />
            Back to Bookings
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            {canAccept && (
              <button
                id="bd-accept-btn"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/18 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-bold bg-blue-50 text-blue-600 border border-blue-600/18 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-bold bg-red-50 text-red-500 border border-red-500/18 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                onClick={() => changeStatus("cancelled")}
                disabled={updating}
              >
                <XCircle size={14} />
                Cancel
              </button>
            )}
            {updating && (
              <RefreshCw size={15} className="animate-spin text-slate-400" />
            )}
          </div>
        </div>

        {/* ── Title + summary strip ── */}
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-[20px] font-bold tracking-tight text-slate-900 m-0">
            Booking Details
          </h2>
          <StatusBadge status={booking.status} />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-[18px_22px] grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] sm:grid-cols-2 gap-[14px_20px] mb-5 shadow-sm">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-400 mb-1">
              Booking ID
            </div>
            <div className="text-[11.5px] font-mono text-slate-500 break-all">
              {booking._id}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-400 mb-1">
              Order Ref
            </div>
            <div className="text-[11.5px] font-mono text-slate-500 break-all">
              {typeof booking.order === "object"
                ? booking.order?._id || "—"
                : booking.order || "—"}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-400 mb-1">
              Created
            </div>
            <div className="text-[13.5px] font-medium text-slate-800">
              {fmtDate(booking.createdAt)}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-slate-400 mb-1">
              Last Updated
            </div>
            <div className="text-[13.5px] font-medium text-slate-800">
              {fmtDate(booking.updatedAt)}
            </div>
          </div>
        </div>

        {/* ── Vendor + Customer + Price + Notes ── */}
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-4 mb-4">
          {/* Vendor */}
          <SectionCard title="Vendor" icon={<Building2 size={13} />}>
            <div className="flex flex-col gap-[9px]">
              <InfoRow label="Company" value={vendor.companyName} />
              <InfoRow label="Name" value={vendor.name} />
              <InfoRow label="Email" value={vendor.email} />
              <InfoRow label="Phone" value={vendor.phone} />
              <InfoRow label="ID" value={vendor._id} mono />
              {!vendor._id && !vendor.name && !vendor.companyName && (
                <span className="text-slate-400 text-[13px]">
                  No vendor info
                </span>
              )}
            </div>
          </SectionCard>

          {/* Customer */}
          <SectionCard title="Customer" icon={<User size={13} />}>
            <div className="flex flex-col gap-[9px]">
              <InfoRow label="Name" value={customer.name} />
              <InfoRow label="Email" value={customer.email} />
              <InfoRow label="Phone" value={customer.phone} />
              <InfoRow label="Company" value={customer.companyName} />
              <InfoRow label="ID" value={customer._id} mono />
              {!customer._id && !customer.name && !customer.email && (
                <span className="text-slate-400 text-[13px]">
                  No customer info
                </span>
              )}
            </div>
          </SectionCard>

          {/* Price */}
          <SectionCard title="Price Breakdown" icon={<IndianRupee size={13} />}>
            <div className="flex flex-col gap-[10px]">
              {booking.subtotal !== undefined && (
                <div className="flex justify-between items-center text-[13.5px]">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium text-slate-800">
                    {fmt(booking.subtotal)}
                  </span>
                </div>
              )}
              {booking.discount ? (
                <div className="flex justify-between items-center text-[13.5px]">
                  <span className="text-slate-500">Discount</span>
                  <span className="font-medium text-emerald-600">
                    -{fmt(booking.discount)}
                  </span>
                </div>
              ) : null}
              {booking.tax !== undefined && (
                <div className="flex justify-between items-center text-[13.5px]">
                  <span className="text-slate-500">Tax (GST)</span>
                  <span className="font-medium text-slate-800">
                    {fmt(booking.tax)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2.5 mt-1 border-t border-slate-100">
                <span className="text-[14px] font-bold text-slate-800">
                  Total
                </span>
                <span className="text-[17px] font-bold text-[#1e3b86]">
                  {fmt(booking.total)}
                </span>
              </div>
            </div>
          </SectionCard>

          {/* Notes */}
          <SectionCard title="Notes" icon={<FileText size={13} />}>
            <p className="text-[13.5px] text-slate-500 leading-relaxed m-0">
              {booking.notes || "No notes attached to this booking."}
            </p>
          </SectionCard>
        </div>

        {/* ── Items ── */}
        <SectionCard
          title={`Items (${(booking.items || []).length})`}
          icon={<Package size={13} />}
          className="mb-0"
        >
          {(booking.items || []).length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-[13px]">
              No items in this booking.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
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
          className={`fixed bottom-6 right-6 text-white px-[18px] py-2.5 rounded-lg text-[13px] font-medium shadow-lg z-[300] animate-[toastIn_0.25s_ease] ${toast.type === "success" ? "bg-emerald-600" : "bg-red-500"}`}
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
