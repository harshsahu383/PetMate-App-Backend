const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const petRoutes = require("./routes/pet.routes");

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/pets", petRoutes);

// Test Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "PetMate Backend Running 🚀"
    });
});

module.exports = app;