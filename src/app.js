const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const petRoutes = require("./routes/pet.routes");
const servicesRoutes = require("./routes/service.routes");
const bookingRoutes = require("./routes/booking.routes");
const bannerRoutes = require("./routes/banner.routes");
const vaccineRoutes = require("./routes/vaccine.routes");
const medicalRecordRoutes = require("./routes/medicalRecord.routes");
const allergyRoutes = require("./routes/allergy.routes");
const walkHistoryRoutes = require("./routes/walkHistory.routes");
const hobbyRoutes = require("./routes/hobby.routes");


const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api", vaccineRoutes);
app.use("/api", medicalRecordRoutes);
app.use("/api", allergyRoutes);
app.use("/api", walkHistoryRoutes);
app.use("/api", hobbyRoutes);

// Test Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "PetMate Backend Running 🚀"
    });
});

module.exports = app;