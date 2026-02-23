const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");

const {
    addTransaction,
    getTransactions,
    updateTransaction,
} = require("../controllers/transactionController");

router.use(authenticateToken);

router.post("/", addTransaction);
router.get("/", getTransactions);
router.put("/:id", updateTransaction);

module.exports = router;
