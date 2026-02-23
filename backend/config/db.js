const sql = require("mssql");

const config = {
    user: "expenseUser",
    password: "MahekAchyuthEmily",
    server: "192.168.2.187",
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
