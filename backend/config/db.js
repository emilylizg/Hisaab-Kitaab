const sql = require("mssql");

const config = {
    user: "expenseUser",
    password: "MahekAchyuthEmily",
    server: "45.122.120.105",
    database: "ExpenseTracker",
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log("Connected to MSSQL using Windows Authentication");
        return pool;
    })
    .catch(err => {
        console.error("Database Connection Failed:", err);
    });

module.exports = { sql, poolPromise };
