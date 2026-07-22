const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
    getVendorsByService,
} = require("../controllers/vendor.controller");

router.get(
    "/services/:service_uid/vendors",
    authMiddleware,
    getVendorsByService
);

module.exports = router;