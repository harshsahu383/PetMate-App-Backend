const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
    addWalkHistory,
    getWalkHistory,
    updateWalkHistory,
    deleteWalkHistory,
} = require("../controllers/walkHistory.controller");

router.post(
    "/pets/:pet_uid/walk-history",
    authMiddleware,
    addWalkHistory
);

router.get(
    "/pets/:pet_uid/walk-history",
    authMiddleware,
    getWalkHistory
);

router.put(
    "/walk-history/:id",
    authMiddleware,
    updateWalkHistory
);

router.delete(
    "/walk-history/:id",
    authMiddleware,
    deleteWalkHistory
);

module.exports = router;