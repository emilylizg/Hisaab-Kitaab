const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const { getDashboardData } = require("../controllers/dashboardController");

router.use(authenticateToken);

router.get("/", getDashboardData);

module.exports = router;