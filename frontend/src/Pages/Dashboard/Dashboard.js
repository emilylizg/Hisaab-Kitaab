import React, { useState, useEffect } from "react";
import "./Dashboard.css";

const expenseData = {
  daily: {
    Food: 25,
    Medical: 10,
    Utilities: 15,
    Other: 8,
    Travel: 20,
    income: 150,
  },
  weekly: {
    Food: 175,
    Medical: 50,
    Utilities: 90,
    Other: 40,
    Travel: 120,
    income: 1000,
  },
  monthly: {
    Food: 700,
    Medical: 200,
    Utilities: 350,
    Other: 150,
    Travel: 400,
    income: 4000,
  },
};

function Dashboard() {
  const [frequency, setFrequency] = useState("monthly");
  const [data, setData] = useState(expenseData.monthly);

  useEffect(() => {
    setData(expenseData[frequency]);
  }, [frequency]);

  const categories = ["Food", "Medical", "Utilities", "Other", "Travel"];

  const totalExpense = categories.reduce(
    (sum, category) => sum + data[category],
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

      <div className="category-grid">
        {categories.map((category) => (
          <div key={category} className="category-card">
            <h3>{category}</h3>
            <div className="category-amount">
              ${data[category].toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="summary-section">
        <div className="summary-box">
          <h4>Grand Total Expense</h4>
          <p>${totalExpense.toLocaleString()}</p>
        </div>

        <div className="summary-box">
          <h4>Grand Total Income</h4>
          <p>${data.income.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;