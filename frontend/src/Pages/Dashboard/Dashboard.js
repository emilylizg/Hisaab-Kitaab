import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css";

const categories = ["Food", "Medical", "Utilities", "Other", "Travel"];

function Dashboard() {
  const [frequency, setFrequency] = useState("monthly");
  const [totals, setTotals] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get('http://localhost:5000/dashboard');
        setTotals(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, [frequency]);


  const formatTimeframe = (tf) => {
    if (!tf) return "";
    if (frequency === "daily") {
      const date = new Date(tf);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
    if (frequency === "weekly") {
      
      const match = tf.match(/(\d{4})-(\d+)/);
      if (match) return `Week ${parseInt(match[2])}, ${match[1]}`;
      return tf; 
    }
    if (frequency === "monthly") {
     
      const [year, month] = tf.split("-");
      const monthName = new Date(`${year}-${month}-01`).toLocaleString("en-US", { month: "long" });
      return `${monthName} ${year}`;
    }
    return tf;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Expense Analytics</h1>
        <select
          className="frequency-select"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {totals.map((row) => (
        <div key={row.Timeframe} className="timeframe-section">
          <h2 className="timeframe-label">{formatTimeframe(row.Timeframe)}</h2>
          <div className="category-grid">
            {categories.map((cat) => (
              <div key={cat} className="category-card">
                <h3>{cat}</h3>
                <div className="category-amount">
                  ${Number(row[cat]).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;