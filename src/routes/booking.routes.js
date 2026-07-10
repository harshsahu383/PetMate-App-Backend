const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const getBookingByUID = require("../controllers/booking.controller").getBookingById;

const {
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking,
} = require("../controllers/booking.controller");

router.post("/", authMiddleware, createBooking);

router.get("/", authMiddleware, getMyBookings);

router.get("/:bookingUID", authMiddleware, getBookingByUID);

router.patch("/:bookingUID/cancel", authMiddleware, cancelBooking);

module.exports = router;