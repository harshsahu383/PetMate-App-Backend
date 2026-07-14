const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },

        email: {
            type: String,
            unique: true,
            sparse: true,
            lowercase: true,
            trim: true,
            default: null,
        },

        phone: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
            default: null,
        },

        loginMethod: {
            type: String,
            enum: ["email", "phone"],
            required: true,
        },

        profileImage: {
            type: String,
            default: "",
        },

        address: {
            type: String,
            default: "",
        },

        city: {
            type: String,
            default: "",
        },

        state: {
            type: String,
            default: "",
        },

        pincode: {
            type: String,
            default: "",
        },

        role: {
            type: String,
            enum: ["customer", "groomer", "admin"],
            default: "customer",
        },

        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
); 

module.exports = mongoose.model("User", userSchema);