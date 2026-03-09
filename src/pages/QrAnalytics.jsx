import { useEffect, useState, useMemo } from "react";
import { analyticsSupabase } from "../lib/analyticsSupabase";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import BackButton from "../components/BackButton";
import { motion } from "framer-motion";
import CountUp from "react-countup";

const QR_ID = "13803aa5-84ee-4161-978e-871e5b4f8788";

const COLORS = ["#C9A227", "#E7D3A3", "#8A6F1A", "#D4AF37"];

export default function QrAnalytics() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchScans();

    // 🔴 REALTIME SUBSCRIPTION
    const channel = analyticsSupabase
      .channel("qr_scans_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "qr_scans",
          filter: `qr_code_id=eq.${QR_ID}`,
        },
        (payload) => {
          setScans((prev) => [payload.new, ...prev]);
          setLastUpdated(new Date());
        },
      )
      .subscribe();

    return () => analyticsSupabase.removeChannel(channel);
  }, []);

  async function fetchScans() {
    setLoading(true);

    const { data, error } = await analyticsSupabase
      .from("qr_scans")
      .select("*")
      .eq("qr_code_id", QR_ID)
      .order("scanned_at", { ascending: false });

    setScans(data || []);
    setLastUpdated(new Date());
    setLoading(false);
  }

  /* ===========================
     📊 METRICS CALCULATIONS
  ============================*/

  const totalScans = scans.length;

  const todayScans = scans.filter(
    (s) => new Date(s.scanned_at).toDateString() === new Date().toDateString(),
  ).length;

  const uniqueVisitors = new Set(scans.map((s) => s.scan_fingerprint)).size;

  /* ===========================
     📈 SCANS PER DAY (7 DAYS)
  ============================*/

  const scansPerDay = useMemo(() => {
    const days = {};
    const last7 = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toDateString();
    });

    last7.forEach((d) => (days[d] = 0));

    scans.forEach((scan) => {
      const day = new Date(scan.scanned_at).toDateString();
      if (days[day] !== undefined) days[day]++;
    });

    return Object.entries(days)
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("en-US", {
          weekday: "short",
        }),
        scans: count,
      }))
      .reverse();
  }, [scans]);

  /* ===========================
     🕒 PEAK HOURS
  ============================*/

  const peakHours = useMemo(() => {
    const hours = {};

    scans.forEach((scan) => {
      const hour = new Date(scan.scanned_at).getHours();
      hours[hour] = (hours[hour] || 0) + 1;
    });

    return Object.entries(hours)
      .map(([hour, count]) => ({
        hour: `${hour}:00`,
        scans: count,
      }))
      .sort((a, b) => b.scans - a.scans)
      .slice(0, 5);
  }, [scans]);

  /* ===========================
     📊 BREAKDOWNS
  ============================*/

  const breakdown = (field) => {
    const map = {};
    scans.forEach((s) => {
      const value = s[field] || "Unknown";
      map[value] = (map[value] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const deviceData = breakdown("device_type");
  const browserData = breakdown("browser");
  const osData = breakdown("os");

  if (loading) return <p className="p-6">Loading analytics...</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6">
      <BackButton />

      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-gray-800">
          QR Code Analytics
        </h1>
        <div
          className="rounded-xl border px-4 py-3 text-sm mt-2 flex items-start gap-2"
          style={{
            borderColor: "var(--brand-primary)",
            color: "var(--brand-primary)",
          }}
        >
          <span>
            This dashboard shows how customers interact with your QR menu. Track
            scan trends, peak hours, and device insights to understand when and
            how your menu is being accessed.
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-400">
            Last updated {lastUpdated.toLocaleTimeString()}
          </p>

          <span className="flex items-center gap-1 text-xs text-green-600">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Live
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Stat title="Total Scans" value={totalScans} color="#C9A227" />
        <Stat title="Today" value={todayScans} color="#16A34A" />
        <Stat title="Unique Visitors" value={uniqueVisitors} color="#2563EB" />
      </div>

      {/* Traffic */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card title="Scan Traffic">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={scansPerDay}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              {/* subtle grid */}
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />

              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                stroke="#9CA3AF"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={35}
                ticks={[0, 5, 10, 15, 20]}
              />

              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                cursor={{ stroke: "#C9A227", strokeWidth: 1 }}
              />

              <defs>
                <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A227" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#C9A227" stopOpacity={0} />
                </linearGradient>
              </defs>

              <Area
                type="monotoneX"
                dataKey="scans"
                stroke="#C9A227"
                fill="url(#scanGradient)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5 }}
                isAnimationActive
                animationDuration={900}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Analytics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PeakHoursChart data={peakHours} />

        <BarAnalytics title="Devices" data={deviceData} />

        <BarAnalytics title="Operating Systems" data={osData} />

        <Leaderboard title="Browsers" data={browserData} />
      </div>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function Stat({ title, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-2 h-8 rounded-full"
          style={{ backgroundColor: color }}
        />

        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-xl font-semibold text-gray-900">
            <CountUp end={value} duration={1} />
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <h2 className="font-semibold mb-3 text-gray-700">{title}</h2>
      {children}
    </div>
  );
}

function Leaderboard({ title, data }) {
  const sorted = [...data].sort((a, b) => b.value - a.value);

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <h2 className="font-semibold mb-4 text-gray-700">{title}</h2>

      <div className="divide-y divide-gray-100">
        {sorted.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center justify-between py-3"
          >
            <div className="flex items-center gap-3">
              {/* Rank circle */}
              <div
                className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold
                ${
                  index === 0
                    ? "bg-[#C9A227] text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {index + 1}
              </div>

              {/* Browser name */}
              <span className="text-sm text-gray-700">{item.name}</span>
            </div>

            {/* Value */}
            <span className="text-sm font-semibold text-gray-900">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PeakHoursChart({ data }) {
  const max = Math.max(...data.map((d) => d.scans), 1);

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <h2 className="font-semibold mb-3 text-gray-700">Peak Hours</h2>

      <div className="space-y-2">
        {data.map((item) => {
          const intensity = item.scans / max;

          return (
            <div
              key={item.hour}
              className="flex justify-between text-sm p-2 rounded"
              style={{
                backgroundColor: `rgba(201,162,39,${0.15 + intensity * 0.6})`,
              }}
            >
              <span>{item.hour}</span>
              <span>{item.scans}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BarAnalytics({ title, data }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <h2 className="font-semibold mb-4 text-gray-700">{title}</h2>

      <div className="space-y-4">
        {data.map((item) => {
          const width = (item.value / max) * 100;

          return (
            <div key={item.name}>
              <div className="flex justify-between text-sm mb-1">
                <span>{item.name}</span>
                <span className="font-medium">{item.value}</span>
              </div>

              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C9A227] rounded-full transition-all duration-700"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
