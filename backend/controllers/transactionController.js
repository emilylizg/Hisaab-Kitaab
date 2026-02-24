
/*
    Add Transaction
    POST /transactions
*/
// controllers/transactionController.js (replace addTransaction)
const { poolPromise, sql } = require("../config/db");

const allowedCategories = ["Food", "Travel", "Medical", "Utilities", "Others"];


const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const pool = await poolPromise;

    const result = await pool.request()
      .input("UserId", sql.Int, userId)
      .query(`
        SELECT 
          Id,
          Title,
          Category,
          Type,
          Amount,
          TransactionDate
        FROM Transactions
        WHERE UserId = @UserId
        ORDER BY TransactionDate DESC
      `);

    res.status(200).json(result.recordset);

  } catch (err) {
    console.error("Transaction fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const pool = await poolPromise;

        const result = await pool.request()
            .input("UserId", sql.Int, userId)
            .query(`
                SELECT 
                    SUM(CASE WHEN Type = 'Income' THEN Amount ELSE 0 END) AS Income,
                    SUM(CASE WHEN Type = 'Expense' THEN Amount ELSE 0 END) AS Expense
                FROM Transactions
                WHERE UserId = @UserId
            `);

        const income = result.recordset[0].Income || 0;
        const expense = result.recordset[0].Expense || 0;

        res.json({
            income,
            expense,
            savings: income - expense
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

const addTransaction = async (req, res) => {
  try {
    console.log("[addTransaction] req.user:", req.user); // debug: who's calling
    console.log("[addTransaction] req.body:", req.body); // debug: what was sent

    const { title, amount, type, category, transactionDate } = req.body;
    const userId = req.user && req.user.id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    if (!title || amount === undefined || !type || !category || !transactionDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["Income", "Expense"].includes(type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    // Validate category early to catch CHECK constraint violations
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        message: `Invalid category. Allowed: ${allowedCategories.join(", ")}`
      });
    }

    // Normalize/validate date: accept ISO or timestamps and convert to yyyy-mm-dd
    const d = new Date(transactionDate);
    if (isNaN(d.getTime())) {
      return res.status(400).json({ message: "Invalid transactionDate format" });
    }
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const sqlDate = `${yyyy}-${mm}-${dd}`; // safe for sql.Date

    const pool = await poolPromise;

    await pool.request()
      .input("UserId", sql.Int, userId)
      .input("Title", sql.NVarChar, title)
      .input("Amount", sql.Decimal(12, 2), amount)
      .input("Type", sql.NVarChar, type)
      .input("Category", sql.NVarChar, category)
      .input("TransactionDate", sql.Date, sqlDate)
      .query(`
        INSERT INTO Transactions 
        (UserId, Title, Amount, Type, Category, TransactionDate)
        VALUES 
        (@UserId, @Title, @Amount, @Type, @Category, @TransactionDate)
      `);

    console.log("[addTransaction] inserted transaction for userId:", userId);
    res.status(201).json({ message: "Transaction added successfully" });

  } catch (err) {
    console.error("[addTransaction] ERROR:", err);
    // if mssql gives nested error details, show them in dev
    if (err.originalError) {
      console.error("[addTransaction] originalError:", err.originalError);
    }
    // return helpful dev response
    res.status(500).json({ message: "Server error", detail: err.message });
  }
};


/*
    Get Transactions (with pagination)
    GET /transactions?page=1&limit=10
*/
const getTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const pool = await poolPromise;

        const result = await pool.request()
            .input("UserId", sql.Int, userId)
            .input("Limit", sql.Int, limit)
            .input("Offset", sql.Int, offset)
            .query(`
                SELECT *
                FROM Transactions
                WHERE UserId = @UserId
                ORDER BY TransactionDate DESC
                OFFSET @Offset ROWS
                FETCH NEXT @Limit ROWS ONLY
            `);

        res.json(result.recordset);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


/*
    Update Transaction
    PUT /transactions/:id
*/
const updateTransaction = async (req, res) => {
    try {
        const transactionId = parseInt(req.params.id);
        const userId = req.user.id;
        const { title, amount, type, category, transactionDate } = req.body;

        const pool = await poolPromise;

        const result = await pool.request()
            .input("Id", sql.Int, transactionId)
            .input("UserId", sql.Int, userId)
            .input("Title", sql.NVarChar, title)
            .input("Amount", sql.Decimal(12, 2), amount)
            .input("Type", sql.NVarChar, type)
            .input("Category", sql.NVarChar, category)
            .input("TransactionDate", sql.Date, transactionDate)
            .query(`
                UPDATE Transactions
                SET Title = @Title,
                    Amount = @Amount,
                    Type = @Type,
                    Category = @Category,
                    TransactionDate = @TransactionDate
                WHERE Id = @Id AND UserId = @UserId
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.json({ message: "Transaction updated successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    addTransaction,
    getTransactions,
    updateTransaction,
    getSummary,
    getUserTransactions
};