import { useEffect, useState, useMemo } from "react";
import { analyticsSupabase } from "../lib/analyticsSupabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import BackButton from "../components/BackButton";

const QR_ID = "13803aa5-84ee-4161-978e-871e5b4f8788";

export default function QrAnalytics() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

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
        },
      )
      .subscribe();

    return () => {
      analyticsSupabase.removeChannel(channel);
    };
  }, []);

  async function fetchScans() {
    setLoading(true);

    const { data, error } = await analyticsSupabase
      .from("qr_scans")
      .select("*")
      .eq("qr_code_id", QR_ID)
      .order("scanned_at", { ascending: false });

    if (!error) setScans(data || []);
    else console.error(error);

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
        date: date.slice(0, 10),
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

    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const deviceData = breakdown("device_type");
  const browserData = breakdown("browser");
  const osData = breakdown("os");

  if (loading) return <p>Loading analytics...</p>;

  return (
    <div className="space-y-8">
      <BackButton />
      <h1 className="text-xl font-semibold">QR Code Analytics</h1>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat title="Total Scans" value={totalScans} />
        <Stat title="Today" value={todayScans} />
        <Stat title="Unique Visitors" value={uniqueVisitors} />
      </div>

      {/* SCANS PER DAY */}
      <Card title="Scans (Last 7 Days)">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={scansPerDay}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="scans" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* PEAK HOURS */}
      <Card title="Peak Hours">
        {peakHours.map((h) => (
          <div key={h.hour} className="flex justify-between py-1">
            <span>{h.hour}</span>
            <span>{h.scans}</span>
          </div>
        ))}
      </Card>

      {/* BREAKDOWN PIE CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PieCard title="Devices" data={deviceData} />
        <PieCard title="Browsers" data={browserData} />
        <PieCard title="Operating Systems" data={osData} />
      </div>
    </div>
  );
}

/* ===========================
   UI COMPONENTS
===========================*/

function Stat({ title, value }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow border">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow border">
      <h2 className="font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function PieCard({ title, data }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow border">
      <h2 className="font-semibold mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={90}>
            {data.map((_, index) => (
              <Cell key={index} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
