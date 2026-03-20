import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import "./App.css";

const VENUE_COLORS = ["#00E5A0", "#3B82F6", "#A855F7", "#F59E0B", "#EC4899", "#06B6D4"];
const VENUES = ["Perth", "Sydney", "Brisbane", "Adelaide", "Melbourne"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#131825", border: "1px solid #1E2A42", borderRadius: 8,
      padding: "10px 14px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    }}>
      <p style={{ color: "#E2E8F0", fontWeight: 600, margin: 0, fontSize: 13 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: "4px 0 0", fontSize: 12 }}>
          {p.name}: <strong>{typeof p.value === "number" && p.value > 999 ? p.value.toLocaleString() : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

function KPI({ label, value, sub, color }) {
  return (
    <div className="kpi">
      <div className="kpi-glow" style={{ background: color }} />
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ color }}>{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

function SectionTitle({ children, subtitle }) {
  return (
    <div className="section-title">
      <h2>{children}</h2>
      {subtitle && <p className="subtitle">{subtitle}</p>}
    </div>
  );
}

function GrowthBadge({ value }) {
  if (value === null || value === undefined) return <span className="badge badge-blue">New</span>;
  const cls = value > 0 ? "positive" : value < 0 ? "negative" : "neutral";
  const arrow = value > 0 ? "\u2191" : value < 0 ? "\u2193" : "";
  return <span className={`growth ${cls}`}>{arrow}{Math.abs(value).toFixed(1)}%</span>;
}

// ── Overview Tab ──
function OverviewTab({ data }) {
  const { yearOverYear, venueComparison, newVsReturning } = data;
  const latest = yearOverYear[yearOverYear.length - 1];
  const prev = yearOverYear[yearOverYear.length - 2];
  const attendeeGrowth = prev ? ((latest.totalAttendees - prev.totalAttendees) / prev.totalAttendees * 100).toFixed(1) : 0;
  const companyGrowth = prev ? ((latest.uniqueCompanies - prev.uniqueCompanies) / prev.uniqueCompanies * 100).toFixed(1) : 0;

  const latestNvR = newVsReturning[newVsReturning.length - 1];

  // venue comparison without "Unknown"
  const venues = venueComparison.filter(v => v.venue !== "Unknown");

  return (
    <>
      <div className="kpi-row">
        <KPI label="Total Attendees (2025)" value={latest.totalAttendees.toLocaleString()} sub={`${attendeeGrowth > 0 ? "\u2191" : "\u2193"} ${Math.abs(attendeeGrowth)}% vs 2024`} color="#00E5A0" />
        <KPI label="Unique Companies" value={latest.uniqueCompanies.toLocaleString()} sub={`${companyGrowth > 0 ? "\u2191" : "\u2193"} ${Math.abs(companyGrowth)}% vs 2024`} color="#3B82F6" />
        <KPI label="Returning Rate" value={`${latestNvR.returningPct}%`} sub={`${latestNvR.returning} returning companies`} color="#A855F7" />
        <KPI label="New Companies" value={latestNvR.new.toLocaleString()} sub={`${latestNvR.newPct}% of total`} color="#F59E0B" />
        <KPI label="3-Year Total" value={data.summary.totalRecords.toLocaleString()} sub={`${data.summary.totalCompanies.toLocaleString()} unique companies`} color="#EC4899" />
      </div>

      <div className="grid-2-wide">
        {/* YoY Attendance */}
        <div className="card">
          <SectionTitle subtitle="Total attendees across all venues">Year-over-Year Attendance</SectionTitle>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={yearOverYear} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2A42" />
              <XAxis dataKey="year" tick={{ fill: "#7A8BA7", fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: "#7A8BA7", fontSize: 11 }} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#7A8BA7" }} />
              <Bar dataKey="totalAttendees" name="Attendees" fill="#00E5A0" radius={[4, 4, 0, 0]} />
              <Bar dataKey="uniqueCompanies" name="Companies" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* New vs Returning */}
        <div className="card">
          <SectionTitle subtitle="Company retention year-over-year">New vs Returning Companies</SectionTitle>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={newVsReturning.filter(d => d.year !== "2023")} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2A42" />
              <XAxis dataKey="year" tick={{ fill: "#7A8BA7", fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: "#7A8BA7", fontSize: 11 }} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="returning" name="Returning" fill="#00E5A0" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="new" name="New" fill="#3B82F6" radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
          <div className="insight-box">
            <div className="label">Trend</div>
            <div className="text">
              Returning companies grew from 43.3% in 2024 to 59.4% in 2025, showing strong retention momentum.
            </div>
          </div>
        </div>
      </div>

      {/* Venue comparison */}
      <div className="card">
        <SectionTitle subtitle="Attendance by city across all years">Venue Comparison</SectionTitle>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={venues} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2A42" />
            <XAxis dataKey="venue" tick={{ fill: "#7A8BA7", fontSize: 12 }} axisLine={false} />
            <YAxis tick={{ fill: "#7A8BA7", fontSize: 11 }} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="2023" name="2023" fill="#A855F7" radius={[4, 4, 0, 0]} />
            <Bar dataKey="2024" name="2024" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="2025" name="2025" fill="#00E5A0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="metric-row">
          {venues.sort((a, b) => (b["2025"] || 0) - (a["2025"] || 0)).slice(0, 3).map((v, i) => (
            <div className="metric-card" key={v.venue}>
              <div className="label">{i === 0 ? "Largest Venue 2025" : `#${i + 1} Venue`}</div>
              <div className="value" style={{ color: VENUE_COLORS[i] }}>{v.venue} ({v["2025"]})</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Venues Tab ──
function VenuesTab({ data }) {
  const { venueData, venueComparison, registrationTypes } = data;
  const venues2025 = venueData.filter(v => v.year === "2025").sort((a, b) => b.attendees - a.attendees);
  const maxAttendees = Math.max(...venues2025.map(v => v.attendees));

  // Venue pie for 2025
  const total2025 = venues2025.reduce((s, v) => s + v.attendees, 0);

  // Reg type data for 2023 (the only year with variety)
  const regTypes2023 = registrationTypes.filter(r => r.year === "2023");

  return (
    <>
      <div className="grid-2-wide">
        <div className="card">
          <SectionTitle subtitle="2025 attendee volume by city">Venue Breakdown</SectionTitle>
          {venues2025.map((v, i) => (
            <div className="venue-row" key={v.venue}>
              <div className="venue-label">{v.venue}</div>
              <div className="venue-bar-track">
                <div className="venue-bar-fill" style={{
                  width: `${(v.attendees / maxAttendees) * 100}%`,
                  background: `linear-gradient(90deg, ${VENUE_COLORS[i]}CC, ${VENUE_COLORS[i]})`,
                  boxShadow: `0 0 12px ${VENUE_COLORS[i]}33`,
                }}>
                  <span>{v.attendees}</span>
                </div>
              </div>
              <div style={{ width: 60, textAlign: "right", fontSize: 11, color: "#7A8BA7" }}>
                {(v.attendees / total2025 * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <SectionTitle subtitle="2025 share of total attendance">Venue Distribution</SectionTitle>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={venues2025} cx="50%" cy="50%" innerRadius={55} outerRadius={95} dataKey="attendees" nameKey="venue" paddingAngle={3} stroke="none">
                {venues2025.map((_, i) => <Cell key={i} fill={VENUE_COLORS[i]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {venues2025.map((v, i) => (
              <div key={v.venue} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: VENUE_COLORS[i] }} />
                <span style={{ fontSize: 11, color: "#7A8BA7" }}>{v.venue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Venue YoY table */}
        <div className="card">
          <SectionTitle subtitle="Growth trends by city">Venue Year-over-Year</SectionTitle>
          <table className="data-table">
            <thead>
              <tr>
                <th>City</th><th>2023</th><th>2024</th><th>2025</th><th>24→25 Growth</th>
              </tr>
            </thead>
            <tbody>
              {venueComparison.filter(v => v.venue !== "Unknown").map(v => {
                const g = v["2024"] ? ((v["2025"] - v["2024"]) / v["2024"] * 100) : null;
                return (
                  <tr key={v.venue}>
                    <td style={{ fontWeight: 600 }}>{v.venue}</td>
                    <td>{(v["2023"] || 0).toLocaleString()}</td>
                    <td>{(v["2024"] || 0).toLocaleString()}</td>
                    <td style={{ fontWeight: 600 }}>{(v["2025"] || 0).toLocaleString()}</td>
                    <td><GrowthBadge value={g ? parseFloat(g.toFixed(1)) : null} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Registration types (2023) */}
        <div className="card">
          <SectionTitle subtitle="2023 breakdown (2024-25 are Reseller-only lists)">Registration Types</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={regTypes2023.filter(r => r.type !== "Unknown")} cx="50%" cy="50%" innerRadius={40} outerRadius={75} dataKey="count" nameKey="type" paddingAngle={3} stroke="none">
                <Cell fill="#00E5A0" />
                <Cell fill="#F59E0B" />
                <Cell fill="#3B82F6" />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 8 }}>
            {regTypes2023.filter(r => r.type !== "Unknown").map((r, i) => (
              <div key={r.type} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 2 ? "1px solid #1E2A42" : "none" }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{r.type}</span>
                <span style={{ fontSize: 13 }}>{r.count.toLocaleString()} <span style={{ color: "#7A8BA7" }}>({r.pct}%)</span></span>
              </div>
            ))}
          </div>
          <div className="insight-box">
            <div className="label">Note</div>
            <div className="text">2024 and 2025 checked-in lists contain only Reseller registrations. Vendor and Staff data is only available for 2023.</div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Retention Tab ──
function RetentionTab({ data }) {
  const { repeatAttendance, newVsReturning } = data;
  const total = repeatAttendance.reduce((s, r) => s + r.count, 0);
  const maxCount = Math.max(...repeatAttendance.map(r => r.count));

  return (
    <>
      <div className="grid-2">
        <div className="card">
          <SectionTitle subtitle="How many years companies have attended">Repeat Attendance Cohorts</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={repeatAttendance} layout="vertical" barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2A42" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#7A8BA7", fontSize: 11 }} axisLine={false} />
              <YAxis dataKey="label" type="category" tick={{ fill: "#7A8BA7", fontSize: 12 }} axisLine={false} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Companies" fill="#00E5A0" radius={[0, 6, 6, 0]}>
                {repeatAttendance.map((_, i) => (
                  <Cell key={i} fill={`rgba(0,229,160,${1 - i * 0.25})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <SectionTitle subtitle="Loyalty breakdown across 3 years of data">Retention Funnel</SectionTitle>
          <div style={{ padding: "16px 0" }}>
            {repeatAttendance.map((r, i) => {
              const pct = (r.count / total * 100).toFixed(1);
              const widthPct = (r.count / maxCount) * 100;
              return (
                <div className="funnel-item" key={r.label}>
                  <div className="funnel-icon" style={{
                    background: `rgba(0,229,160,${0.1 + i * 0.05})`,
                    border: `1px solid rgba(0,229,160,${0.2 + i * 0.1})`,
                  }}>
                    {r.label.split(" ")[0]}
                  </div>
                  <div className="funnel-content">
                    <div className="funnel-header">
                      <span className="funnel-count">{r.count} companies</span>
                      <span className="funnel-pct">{pct}%</span>
                    </div>
                    <div className="funnel-bar">
                      <div className="funnel-fill" style={{ width: `${widthPct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="insight-box">
            <div className="label">Key Insight</div>
            <div className="text">
              {repeatAttendance[2].count} companies ({(repeatAttendance[2].count / total * 100).toFixed(1)}%) have attended all 3 years -- these are your most loyal partners.
              {repeatAttendance[1].count + repeatAttendance[2].count} companies ({((repeatAttendance[1].count + repeatAttendance[2].count) / total * 100).toFixed(1)}%) are repeat attendees (2+ years).
            </div>
          </div>
        </div>
      </div>

      {/* New vs Returning trend */}
      <div className="card" style={{ marginTop: 18 }}>
        <SectionTitle subtitle="Company-level new vs returning trend">Retention Trend</SectionTitle>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={newVsReturning}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2A42" />
            <XAxis dataKey="year" tick={{ fill: "#7A8BA7", fontSize: 12 }} axisLine={false} />
            <YAxis tick={{ fill: "#7A8BA7", fontSize: 11 }} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="returningPct" name="Returning %" stroke="#00E5A0" strokeWidth={3} dot={{ fill: "#00E5A0", r: 5 }} />
            <Line type="monotone" dataKey="newPct" name="New %" stroke="#3B82F6" strokeWidth={3} dot={{ fill: "#3B82F6", r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
        <div className="metric-row">
          <div className="metric-card">
            <div className="label">Total Unique Companies</div>
            <div className="value" style={{ color: "#00E5A0" }}>{data.summary.totalCompanies.toLocaleString()}</div>
          </div>
          <div className="metric-card">
            <div className="label">Multi-Year Attendees</div>
            <div className="value" style={{ color: "#A855F7" }}>{(repeatAttendance[1].count + repeatAttendance[2].count).toLocaleString()}</div>
          </div>
          <div className="metric-card">
            <div className="label">Returning Rate 2025</div>
            <div className="value" style={{ color: "#3B82F6" }}>{newVsReturning[newVsReturning.length - 1].returningPct}%</div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── AM Performance Tab ──
function AMTab({ data }) {
  const [sortBy, setSortBy] = useState("totalRegistrations");
  const [stateFilter, setStateFilter] = useState("All");

  // Filter out junk AMs (codes, single-registration anomalies)
  const validAMs = data.amSummary.filter(am =>
    am.totalRegistrations >= 10 && !/^\d+$/.test(am.am) && !/^[A-Z]{2,}-/.test(am.am) && am.am.includes(" ")
  );

  const states = ["All", ...new Set(validAMs.map(a => a.state).filter(Boolean))].sort();

  const filtered = stateFilter === "All" ? validAMs : validAMs.filter(a => a.state === stateFilter);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "growth") {
      const ag = a.growth ?? -999;
      const bg = b.growth ?? -999;
      return bg - ag;
    }
    return (b[sortBy] || 0) - (a[sortBy] || 0);
  });

  const topAM = sorted[0];

  // Chart data: top 15 AMs
  const chartData = sorted.slice(0, 15).map(am => ({
    name: am.am.split(" ")[0],
    "2024": am.by2024,
    "2025": am.by2025,
  }));

  return (
    <>
      <div className="kpi-row">
        <KPI label="Top AM (Total)" value={topAM?.am || "-"} sub={`${topAM?.totalRegistrations} registrations`} color="#00E5A0" />
        <KPI label="Total AMs" value={validAMs.length} sub="active account managers" color="#3B82F6" />
        <KPI label="Avg Registrations" value={Math.round(validAMs.reduce((s, a) => s + a.totalRegistrations, 0) / validAMs.length)} sub="per AM (2024-2025)" color="#A855F7" />
        <KPI label="Avg Growth" value={`${(validAMs.filter(a => a.growth !== null).reduce((s, a) => s + a.growth, 0) / validAMs.filter(a => a.growth !== null).length).toFixed(1)}%`} sub="2024 to 2025" color="#F59E0B" />
      </div>

      {/* AM Bar Chart */}
      <div className="card" style={{ marginBottom: 18 }}>
        <SectionTitle subtitle="Top 15 AMs by registration count">AM Performance Comparison</SectionTitle>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2A42" />
            <XAxis dataKey="name" tick={{ fill: "#7A8BA7", fontSize: 10 }} axisLine={false} interval={0} angle={-30} textAnchor="end" height={50} />
            <YAxis tick={{ fill: "#7A8BA7", fontSize: 11 }} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="2024" name="2024" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="2025" name="2025" fill="#00E5A0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AM Table */}
      <div className="card">
        <div className="filter-row">
          <SectionTitle subtitle="Sortable detailed view">Account Manager Leaderboard</SectionTitle>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div className="state-filters">
              {states.map(s => (
                <button key={s} className={`state-btn ${stateFilter === s ? "active" : ""}`} onClick={() => setStateFilter(s)}>{s}</button>
              ))}
            </div>
            <div className="sort-controls">
              {[
                { key: "totalRegistrations", label: "Total" },
                { key: "by2025", label: "2025" },
                { key: "growth", label: "Growth" },
                { key: "uniqueCompanies", label: "Companies" },
              ].map(s => (
                <button key={s.key} className={`sort-btn ${sortBy === s.key ? "active" : ""}`} onClick={() => setSortBy(s.key)}>{s.label}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th onClick={() => setSortBy("am")}>Account Manager</th>
                <th>State</th>
                <th onClick={() => setSortBy("by2024")}>2024</th>
                <th onClick={() => setSortBy("by2025")}>2025</th>
                <th onClick={() => setSortBy("totalRegistrations")}>Total</th>
                <th onClick={() => setSortBy("uniqueCompanies")}>Companies</th>
                <th onClick={() => setSortBy("growth")}>Growth</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((am, i) => {
                const maxTotal = sorted[0]?.totalRegistrations || 1;
                const barPct = (am.totalRegistrations / maxTotal) * 100;
                return (
                  <tr key={am.am}>
                    <td style={{ color: "#7A8BA7", fontSize: 11 }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{am.am}</td>
                    <td><span className="badge badge-blue">{am.state}</span></td>
                    <td>{am.by2024 || "-"}</td>
                    <td style={{ fontWeight: 600 }}>{am.by2025 || "-"}</td>
                    <td style={{ fontWeight: 700 }}>{am.totalRegistrations}</td>
                    <td>{am.uniqueCompanies}</td>
                    <td><GrowthBadge value={am.growth} /></td>
                    <td style={{ minWidth: 120 }}>
                      <div className="progress-bar" style={{ width: "100%" }}>
                        <div className="progress-fill" style={{
                          width: `${barPct}%`,
                          background: barPct > 75 ? "#00E5A0" : barPct > 50 ? "#3B82F6" : barPct > 25 ? "#F59E0B" : "#EF4444",
                        }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ── Main App ──
export default function App() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + "expo-data.json")
      .then(r => r.json())
      .then(setData)
      .catch(err => console.error("Failed to load data:", err));
  }, []);

  if (!data) return <div className="loading">Loading Expo Data...</div>;

  const tabs = ["overview", "venues", "retention", "AM performance"];

  return (
    <div className="app">
      <div className="header">
        <div className="header-inner">
          <div>
            <div className="header-label">Analytics Dashboard</div>
            <h1>Leader Expo Attendance<span> Report</span></h1>
            <p className="header-sub">
              {data.summary.totalRecords.toLocaleString()} attendee records across {data.summary.years.join(", ")} | {data.summary.totalCompanies.toLocaleString()} unique companies
            </p>
          </div>
          <div className="tabs">
            {tabs.map(tab => (
              <button key={tab} className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="main">
        {activeTab === "overview" && <OverviewTab data={data} />}
        {activeTab === "venues" && <VenuesTab data={data} />}
        {activeTab === "retention" && <RetentionTab data={data} />}
        {activeTab === "AM performance" && <AMTab data={data} />}

        <div className="footer">
          <span className="mono">REAL DATA from Leader Expo check-in records 2023-2025</span>
          <span>Leader Expo Attendance Report</span>
        </div>
      </div>
    </div>
  );
}
