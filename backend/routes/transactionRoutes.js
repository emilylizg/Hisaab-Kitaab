const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");

const {  } = require("../controllers/transactionController");
const verifyToken = require("../middleware/verifyToken");

router.get("/transactions", verifyToken, getUserTransactions);

const {
    addTransaction,
    getTransactions,
    updateTransaction,
    getSummary,
    getUserTransactions
} = require("../controllers/transactionController");

router.use(authenticateToken);

router.post("/", addTransaction);
router.get("/summary", getSummary);
router.get("/", getTransactions);
router.put("/:id", updateTransaction);

module.exports = router;
