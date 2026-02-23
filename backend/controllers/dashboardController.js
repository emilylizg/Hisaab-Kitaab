const sql = require("mssql");
const { poolPromise } = require("../config/db");

const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const period = req.query.period || "monthly";

    const pool = await poolPromise;

    let dateFilter = "";

    if (period === "daily") {
      dateFilter = "CAST(TransactionDate AS DATE) = CAST(GETDATE() AS DATE)";
    }

    else if (period === "weekly") {
      dateFilter = "TransactionDate >= DATEADD(DAY, -7, GETDATE())";
    }

    else {
      dateFilter = "TransactionDate >= DATEADD(MONTH, -1, GETDATE())";
    }

    const result = await pool.request()
      .input("UserId", sql.Int, userId)
      .query(`
        SELECT Category, Type, SUM(Amount) AS Total
        FROM Transactions
        WHERE UserId = @UserId
        AND ${dateFilter}
        GROUP BY Category, Type
      `);

    const response = {
      Food: 0,
      Medical: 0,
      Utilities: 0,
      Other: 0,
      Travel: 0,
      Income: 0
    };

    result.recordset.forEach(row => {
      if (row.Type === "Income") {
        response.Income += row.Total;
      } else if (response[row.Category] !== undefined) {
        response[row.Category] += row.Total;
      }
    });

    res.json(response);

  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getDashboardData };