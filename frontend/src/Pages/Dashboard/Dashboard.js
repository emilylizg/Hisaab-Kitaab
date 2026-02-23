import React, { useState, useEffect } from "react";
import "./Dashboard.css";

function Dashboard() {
  const [frequency, setFrequency] = useState("monthly");
  const [data, setData] = useState({
    Food: 0,
    Medical: 0,
    Utilities: 0,
    Other: 0,
    Travel: 0,
    Income: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = ["Food", "Medical", "Utilities", "Other", "Travel"];

  // 🔹 Fetch Dashboard Summary
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");

        const response = await fetch(
          `http://localhost:5000/dashboard?period=${frequency}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const res = await response.json();

        setData({
          Food: res.Food || 0,
          Medical: res.Medical || 0,
          Utilities: res.Utilities || 0,
          Other: res.Other || 0,
          Travel: res.Travel || 0,
          Income: res.Income || 0,
        });

      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [frequency]);

  // 🔹 Fetch All Transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5000/transactions",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }

        const result = await response.json();
        setTransactions(result);

      } catch (err) {
        console.error("Transaction fetch error:", err);
      }
    };

    fetchTransactions();
  }, []);

  const totalExpense = categories.reduce(
    (sum, category) => sum + (data[category] || 0),
    0
  );

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

      {loading && <p>Loading dashboard...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <>
          <div className="category-grid">
            {categories.map((category) => (
              <div key={category} className="category-card">
                <h3>{category}</h3>
                <div className="category-amount">
                  ₹{(data[category] || 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div className="summary-section">
            <div className="summary-box">
              <h4>Grand Total Expense</h4>
              <p>₹{totalExpense.toLocaleString()}</p>
            </div>

            <div className="summary-box">
              <h4>Grand Total Income</h4>
              <p>₹{(data.Income || 0).toLocaleString()}</p>
            </div>
          </div>
        </>
      )}

      {/* 🔹 Transactions Table */}
      <h2 style={{ marginTop: "40px" }}>All Transactions</h2>

      <table className="transaction-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Title</th>
            <th>Category</th>
            <th>Type</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.Id}>
              <td>
                {new Date(tx.TransactionDate).toLocaleDateString()}
              </td>
              <td>{tx.Title}</td>
              <td>{tx.Category}</td>
              <td>{tx.Type}</td>
              <td>₹{tx.Amount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;