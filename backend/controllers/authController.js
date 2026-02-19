const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { poolPromise, sql } = require("../config/db");

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ message: "All fields are required" });

        const pool = await poolPromise;

        // Check if email exists
        const existingUser = await pool.request()
            .input("Email", sql.NVarChar, email)
            .query("SELECT Id FROM Users WHERE Email = @Email");

        if (existingUser.recordset.length > 0)
            return res.status(400).json({ message: "Email already registered" });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        await pool.request()
            .input("Name", sql.NVarChar, name)
            .input("Email", sql.NVarChar, email)
            .input("PasswordHash", sql.NVarChar, hashedPassword)
            .query(`
                INSERT INTO Users (Name, Email, PasswordHash)
                VALUES (@Name, @Email, @PasswordHash)
            `);

        res.status(201).json({ message: "User registered successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: "Email and password required" });

        const pool = await poolPromise;

        const result = await pool.request()
            .input("Email", sql.NVarChar, email)
            .query("SELECT * FROM Users WHERE Email = @Email");

        if (result.recordset.length === 0)
            return res.status(400).json({ message: "Invalid credentials" });

        const user = result.recordset[0];

        const isMatch = await bcrypt.compare(password, user.PasswordHash);

        if (!isMatch)
            return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user.Id, email: user.Email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            token,
            user: {
                id: user.Id,
                name: user.Name,
                email: user.Email
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { register, login };
