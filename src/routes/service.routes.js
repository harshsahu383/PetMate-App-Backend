const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
    getAllServices,
    getServiceById,
} = require("../controllers/service.controller");

router.get("/", authMiddleware, getAllServices);

router.get("/:id", authMiddleware, getServiceById);

module.exports = router;