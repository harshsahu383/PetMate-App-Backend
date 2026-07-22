const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
    getAllServices,
    getServiceById,
    getServiceByUid,
} = require("../controllers/service.controller");

router.get("/", authMiddleware, getAllServices);

router.get("/:service_uid", authMiddleware, getServiceByUid);

module.exports = router;