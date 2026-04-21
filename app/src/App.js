import { useEffect, useState } from "react";

function App() {
  const [rows, setRows] = useState([]);
  const [activeView, setActiveView] = useState("HOME");
  
  const viewTitles = {
    "12_MONTHS": "12 Months – Rate Card",
    "MS": "MS Rate Card",
    "LAST_6_MONTHS": "Last 6 Months – Rate Card"
  };


  useEffect(() => {
    if (activeView === "12_MONTHS") {
      fetch("http://127.0.0.1:8000/rate-card/12-months")
        .then(res => res.json())
        .then(data => setRows(data))
        .catch(console.error);
    }

    
    if (activeView === "LAST_6_MONTHS") {
      fetch("http://127.0.0.1:8000/rate-card/last-6-months")
        .then(res => res.json())
        .then(data => setRows(data))
        .catch(console.error);
    }


    if (activeView === "MS") {
      fetch("http://127.0.0.1:8000/rate-card/ms")
        .then(res => res.json())
        .then(data => setRows(data))
        .catch(console.error);
    }
  }, [activeView]);

  const totals = rows.reduce(
    (acc, r) => {
      acc.billable += r.total_billable;
      acc.cost += r.internal_rate * r.default_hours;
      return acc;
    },
    { billable: 0, cost: 0 }
  );

  const overallCM =
    totals.billable === 0
      ? 0
      : ((totals.billable - totals.cost) / totals.billable) * 100;

  return (
    <div style={styles.app}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h3 style={styles.sidebarTitle}>Pricing Tool</h3>

        <NavButton label="Home" active={activeView === "HOME"} onClick={() => setActiveView("HOME")} />
        <NavButton label="12 Months – Rate Card" active={activeView === "12_MONTHS"} onClick={() => setActiveView("12_MONTHS")} />
        <NavButton label="Last 6 Months – Rate Card" active={activeView === "LAST_6_MONTHS"} onClick={() => setActiveView("LAST_6_MONTHS")} />  
        <NavButton label="MS Rate Card" active={activeView === "MS"} onClick={() => setActiveView("MS")} />
      

      </div>

      {/* CONTENT */}
      <div style={styles.content}>
        {activeView === "HOME" && (
          <div style={styles.card}>
            <h2>Welcome to Pricing Tool</h2>
            <p>
              This application centralizes engagement pricing and standard rate cards,
              replacing Excel-based workflows with a governed, Snowflake-backed platform.
            </p>
            <p>
              Use the navigation on the left to explore available rate cards. Upcoming
              features include pricing scenarios, AI-powered insights, and margin risk
              analysis.
            </p>
          </div>
        )}

        {activeView !== "HOME" && (
          <div style={styles.card}>
            <h2>{viewTitles[activeView]}</h2>

            {/* KPI ROW */}
            <div style={styles.kpiRow}>
              <KpiCard title="Total Billable" value={`$${totals.billable.toLocaleString()}`} color="#16a34a" />
              <KpiCard title="Total Cost" value={`$${totals.cost.toLocaleString()}`} color="#374151" />
              <KpiCard
                title="Overall CM"
                value={`${overallCM.toFixed(2)}%`}
                color={overallCM >= 60 ? "#16a34a" : "#dc2626"}
              />
            </div>

            {/* TABLE */}
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>SR Title</th>
                  <th>Project Role</th>
                  <th style={styles.num}>Bill Rate</th>
                  <th style={styles.num}>TA Rate</th>
                  <th style={styles.num}>Internal</th>
                  <th style={styles.num}>Hours</th>
                  <th style={styles.num}>Billable</th>
                  <th style={styles.num}>CM %</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r, idx) => (
                  <tr key={idx} style={idx % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                    <td>{r.sr_title}</td>
                    <td>{r.project_role}</td>
                    <td style={styles.num}>${r.billable_rate}</td>
                    <td style={styles.num}>${r.ta_rate}</td>
                    <td style={styles.num}>${r.internal_rate}</td>
                    <td style={styles.num}>{r.default_hours}</td>
                    <td style={styles.num}>${r.total_billable.toLocaleString()}</td>
                    <td
                      style={{
                        ...styles.num,
                        fontWeight: 600,
                        color: r.contribution_margin >= 60 ? "#16a34a" : "#dc2626"
                      }}
                    >
                      {r.contribution_margin.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Components ---------- */

const NavButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      ...styles.navButton,
      backgroundColor: active ? "#2563eb" : "transparent",
      color: active ? "white" : "#e5e7eb"
    }}
  >
    {label}
  </button>
);

const KpiCard = ({ title, value, color }) => (
  <div style={{ ...styles.kpiCard, borderLeft: `5px solid ${color}` }}>
    <div style={styles.kpiTitle}>{title}</div>
    <div style={styles.kpiValue}>{value}</div>
  </div>
);

/* ---------- Styles ---------- */

const styles = {
  app: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
    fontFamily: "Arial"
  },
  sidebar: {
    width: "220px",
    backgroundColor: "#1f2937",
    padding: "20px",
    color: "white"
  },
  sidebarTitle: {
    marginBottom: "24px"
  },
  navButton: {
    width: "100%",
    textAlign: "left",
    padding: "10px",
    marginBottom: "6px",
    borderRadius: "4px",
    border: "none",
    cursor: "pointer"
  },
  content: {
    flex: 1,
    padding: "24px"
  },
  card: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
  },
  kpiRow: {
    display: "flex",
    gap: "16px",
    margin: "20px 0"
  },
  kpiCard: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: "16px",
    borderRadius: "6px"
  },
  kpiTitle: {
    fontSize: "13px",
    color: "#6b7280"
  },
  kpiValue: {
    fontSize: "22px",
    fontWeight: 600,
    marginTop: "6px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px"
  },
  rowEven: {
    backgroundColor: "#ffffff"
  },
  rowOdd: {
    backgroundColor: "#f9fafb"
  },
  num: {
    textAlign: "right",
    whiteSpace: "nowrap"
  }
};

export default App;