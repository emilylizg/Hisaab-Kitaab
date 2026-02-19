const express = require("express");
const cors = require("cors");

const app = express();
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

app.use("/api/transactions", transactionRoutes);
app.use("/api/auth", authRoutes);

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

const { poolPromise } = require("./config/db");

app.get("/test-db", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT GETDATE() AS CurrentTime");
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send("DB error");
    }
});


const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
