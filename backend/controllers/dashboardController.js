const sql = require("mssql");
const { poolPromise } = require("../config/db");

const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const period = req.query.period || "daily";

    const pool = await poolPromise;

    let dateFilter = "";

    if (period === "daily") {
      dateFilter = "CAST(TransactionDate AS DATE) = CAST(GETDATE() AS DATE)";
    }

    if (period === "weekly") {
      dateFilter = "TransactionDate >= DATEADD(DAY, -7, GETDATE())";
    }

    if (period === "monthly") {
      dateFilter = "TransactionDate >= DATEADD(MONTH, -1, GETDATE())";
    }

    const result = await pool.request()
      .input("UserId", sql.Int, userId)
      .query(`
        SELECT 
          Category,
          SUM(CASE WHEN Type = 'Income' THEN Amount ELSE 0 END) AS TotalIncome,
          SUM(CASE WHEN Type = 'Expense' THEN Amount ELSE 0 END) AS TotalExpense
        FROM Transactions
        WHERE UserId = @UserId
        AND ${dateFilter}
        GROUP BY Category
      `);

    res.json(result.recordset);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getDashboardData };