const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const {
    completeProfile,
    getProfile,
} = require("../controllers/user.controller");

router.post("/complete-profile", authMiddleware, completeProfile);

router.get("/profile", authMiddleware, getProfile);

module.exports = router;