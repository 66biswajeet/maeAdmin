import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  IndianRupee, 
  ArrowUpRight, 
  ArrowDownRight,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  UserX,
  UserMinus,
  Award,
  Medal
} from "lucide-react";
import API from "../services/api";
import "./AdminDashboardPage.css";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [bookingRes, vendorRes] = await Promise.all([
        API.get("/bookings/admin/stats"),
        API.get("/vendors/admin/stats")
      ]);
      setStats({
        ...bookingRes.data,
        vendorCounts: vendorRes.data.counts,
        topVendors: vendorRes.data.topVendors
      });
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="adb-loading">
        <div className="adb-loader" />
        <p>Calculating dashboard data...</p>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Sales",
      value: `₹${(stats?.totalSales || 0).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: "#1e3b86",
      bg: "rgba(30,59,134,0.05)",
      trend: "+12.5%",
      isPositive: true,
      desc: "Gross platform volume"
    },
    {
      title: "Platform Revenue",
      value: `₹${(stats?.totalCommission || 0).toLocaleString('en-IN')}`,
      icon: TrendingUp,
      color: "#00c9a7",
      bg: "rgba(0,201,167,0.05)",
      trend: "+8.2%",
      isPositive: true,
      desc: "Commission earned (Net)"
    },
    {
      title: "Total Bookings",
      value: stats?.totalBookings || 0,
      icon: ShoppingCart,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.05)",
      trend: "+14",
      isPositive: true,
      desc: "Orders across all vendors"
    },
    {
      title: "Vendor Payouts",
      value: `₹${((stats?.totalSales || 0) - (stats?.totalCommission || 0)).toLocaleString('en-IN')}`,
      icon: ArrowUpRight,
      color: "#6366f1",
      bg: "rgba(99,102,241,0.05)",
      trend: "Steady",
      isPositive: true,
      desc: "Owed to partners"
    }
  ];

  return (
    <div className="adb-page">
      <div className="adb-header">
        <div>
          <h1>Platform Dashboard</h1>
          <p>Real-time overview of business performance and commissions.</p>
        </div>
        <div className="adb-date">
          <Clock size={16} />
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="adb-grid">
        {cards.map((c, i) => (
          <div key={i} className="adb-card">
            <div className="adb-card__head">
              <div className="adb-card__icon" style={{ backgroundColor: c.bg, color: c.color }}>
                <c.icon size={20} />
              </div>
              <div className={`adb-trend ${c.isPositive ? 'pos' : 'neg'}`}>
                {c.trend} 
                {c.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </div>
            </div>
            <div className="adb-card__body">
              <span className="adb-card__val">{c.value}</span>
              <span className="adb-card__lbl">{c.title}</span>
              <p className="adb-card__desc">{c.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="adb-sections">
        {/* Vendor Status Section */}
        <div className="adb-vendor-stats">
          <div className="adb-card-title">
            <h3>Vendor Network</h3>
          </div>
          <div className="adb-vendor-grid">
            <div className="avg-v-card st-approved">
              <UserCheck size={20} />
              <div className="avg-v-info">
                <span className="avg-v-val">{stats?.vendorCounts?.approved || 0}</span>
                <span className="avg-v-lbl">Active</span>
              </div>
            </div>
            <div className="avg-v-card st-pending">
              <Clock size={20} />
              <div className="avg-v-info">
                <span className="avg-v-val">{stats?.vendorCounts?.requested || 0}</span>
                <span className="avg-v-lbl">Pending</span>
              </div>
            </div>
            <div className="avg-v-card st-suspended">
              <UserMinus size={20} />
              <div className="avg-v-info">
                <span className="avg-v-val">{stats?.vendorCounts?.suspended || 0}</span>
                <span className="avg-v-lbl">Suspended</span>
              </div>
            </div>
            <div className="avg-v-card st-rejected">
              <UserX size={20} />
              <div className="avg-v-info">
                <span className="avg-v-val">{stats?.vendorCounts?.rejected || 0}</span>
                <span className="avg-v-lbl">Rejected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="adb-leaderboard">
          <div className="adb-card-title">
            <h3>Top Performers</h3>
          </div>
          <div className="adb-leader-list">
            <div className="leader-item">
              <div className="leader-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
                <Award size={20} />
              </div>
              <div className="leader-info">
                <label>Best Selling Product</label>
                <strong>{stats?.bestProduct?.name || "No sales yet"}</strong>
                <span>{stats?.bestProduct?.totalSold || 0} Units Sold</span>
              </div>
            </div>
            <div className="leader-item">
              <div className="leader-icon" style={{ background: '#f0f9ff', color: '#0284c7' }}>
                <Medal size={20} />
              </div>
              <div className="leader-info">
                <label>Top Earning Vendor</label>
                <strong>{stats?.bestSeller?.name || "No sales yet"}</strong>
                <span>₹{(stats?.bestSeller?.revenue || 0).toLocaleString('en-IN')} Earned</span>
              </div>
            </div>
          </div>
        </div>

        <div className="adb-recent">
          <div className="adb-card-title">
            <h3>Recent Activity</h3>
            <button onClick={() => window.location.href='/bookings'}>View All</button>
          </div>
          <div className="adb-list">
             <div className="adb-list-item">
                <div className="item-icon st-p"><Clock size={16}/></div>
                <div className="item-info">
                   <strong>Multiple bookings pending review</strong>
                   <span>Check the bookings section for new requests.</span>
                </div>
             </div>
             <div className="adb-list-item">
                <div className="item-icon st-s"><CheckCircle2 size={16}/></div>
                <div className="item-info">
                   <strong>Vendor verification complete</strong>
                   <span>3 new vendors were approved today.</span>
                </div>
             </div>
          </div>
        </div>

        <div className="adb-info-box">
           <h3>Commission Summary</h3>
           <p>The platform currently operates on a tier-based commission structure (10% - 42%). Revenue is calculated automatically upon every booking placement.</p>
           <div className="adb-mini-stats">
              <div className="ms-item">
                 <label>Total Partners</label>
                 <span>{stats?.vendorCounts?.total || 0} Vendors</span>
              </div>
              <div className="ms-item">
                 <label>Avg. Commission</label>
                 <span>~18%</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
