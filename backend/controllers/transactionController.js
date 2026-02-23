const { poolPromise, sql } = require("../config/db");

/*
    Add Transaction
    POST /api/transactions
*/
const addTransaction = async (req, res) => {
    try {
        const { title, amount, type, category, transactionDate } = req.body;
        const userId = req.user.id;

        if (!title || !amount || !type || !category || !transactionDate) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!["Income", "Expense"].includes(type)) {
            return res.status(400).json({ message: "Invalid transaction type" });
        }

        const pool = await poolPromise;

        await pool.request()
            .input("UserId", sql.Int, userId)
            .input("Title", sql.NVarChar, title)
            .input("Amount", sql.Decimal(12, 2), amount)
            .input("Type", sql.NVarChar, type)
            .input("Category", sql.NVarChar, category)
            .input("TransactionDate", sql.Date, transactionDate)
            .query(`
                INSERT INTO Transactions 
                (UserId, Title, Amount, Type, Category, TransactionDate)
                VALUES 
                (@UserId, @Title, @Amount, @Type, @Category, @TransactionDate)
            `);

        res.status(201).json({ message: "Transaction added successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


/*
    Get Transactions (with pagination)
    GET /api/transactions?page=1&limit=10
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
    PUT /api/transactions/:id
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
};
