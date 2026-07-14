const pool = require("../config/db");
const generateOTP = require("../utils/generateOtp");
const otpStore = require("../utils/otpStore");
const sendOTPEmail = require("../services/email.service");
const generateToken = require("../utils/generateToken");

const sendEmailOTP = async (req, res) => {
    try {

        const name = req.body.name?.trim();
        let { email } = req.body;

        email = email.trim().toLowerCase();

        // Validation
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: "Name and Email are required",
            });
        }

        // Check if user already exists
        const [rows] = await pool.execute(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );
        if (rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }
        const otp = generateOTP();


        otpStore.set(email, {
            name,
            email,
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000,
        });

        const emailSent = await sendOTPEmail(email, otp);
        if (!emailSent) {
            return res.status(500).json({
                success: false,
                message: "Failed to send OTP email",
            });
        }

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
        });



    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });

    }
};
const verifyEmailOTP = async (req, res) => {
    try {

        const { otp } = req.body;
        let { email } = req.body;

        email = email.trim().toLowerCase();
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required",
            });
        }
        const storedOTP = otpStore.get(email);
        if (!storedOTP) {
            return res.status(400).json({
                success: false,
                message: "OTP not found or expired",
            });
        }
        if (Date.now() > storedOTP.expiresAt) {

            otpStore.delete(email);

            return res.status(400).json({
                success: false,
                message: "OTP has expired",
            });

        }
        if (storedOTP.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }
        const { name } = storedOTP;
        const [result] = await pool.execute(
            `
    INSERT INTO users
    (name,email,login_method,is_verified)
    VALUES (?,?,?,?)
    `,
            [
                name,
                email,
                "email",
                true
            ]
        );
        const token = generateToken(result.insertId);

        otpStore.delete(email);

        return res.status(201).json({
            success: true,
            message: "Account Created Successfully",
            data: {
                token,
                user: {
                    id: result.insertId,
                    name,
                    email,
                },
                is_profile_completed: false,
            },
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }
};

const sendLoginOTP = async (req, res) => {
    try {

        let { email } = req.body;

        email = email.trim().toLowerCase();

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        // Check if user exists
        const [rows] = await pool.execute(
            "SELECT id, name, email FROM users WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Account not found",
            });
        }

        const user = rows[0];

        const otp = generateOTP();

        otpStore.set(email, {
            userId: user.id,
            name: user.name,
            email: user.email,
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000,
        });

        const emailSent = await sendOTPEmail(email, otp);

        if (!emailSent) {
            return res.status(500).json({
                success: false,
                message: "Failed to send OTP",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Login OTP sent successfully",
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });

    }
};
const verifyLoginOTP = async (req, res) => {
    try {

        let { email, otp } = req.body;

        // Normalize email
        email = email.trim().toLowerCase();

        // Validation
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required",
            });
        }

        // Get OTP from Map
        const storedOTP = otpStore.get(email);

        if (!storedOTP) {
            return res.status(400).json({
                success: false,
                message: "OTP not found or expired",
            });
        }

        // Check Expiry
        if (Date.now() > storedOTP.expiresAt) {

            otpStore.delete(email);

            return res.status(400).json({
                success: false,
                message: "OTP has expired",
            });
        }

        // Check OTP
        if (storedOTP.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        // Generate JWT
        const token = generateToken(storedOTP.userId);

        // Delete OTP after successful verification
        otpStore.delete(email);

        

        const [rows] = await pool.execute(
            `
    SELECT is_profile_completed
    FROM users
    WHERE id = ?
    `,
            [storedOTP.userId]
        );

        return res.status(200).json({
            success: true,
            message: "Login Successful",
            data: {
                token,
                user: {
                    id: storedOTP.userId,
                    name: storedOTP.name,
                    email: storedOTP.email,
                },
                    is_profile_completed: rows[0].is_profile_completed,
            },
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });

    }
};
const resendOTP = async (req, res) => {
    try {



        let { email = "", type } = req.body;

        email = email.trim().toLowerCase();

        if (!email || !type) {
            return res.status(400).json({
                success: false,
                message: "Email and type are required",
            });
        }


        if (!["signup", "login"].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP type",
            });
        }

        const storedOTP = otpStore.get(email);

        if (!storedOTP) {
            return res.status(400).json({
                success: false,
                message: "OTP session not found. Please start again.",
            });
        }

        const otp = generateOTP();

        otpStore.set(email, {
            ...storedOTP,
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000,
        });

        const emailSent = await sendOTPEmail(email, otp);

        if (!emailSent) {
            return res.status(500).json({
                success: false,
                message: "Failed to resend OTP",
            });
        }

        return res.status(200).json({
            success: true,
            message: "OTP resent successfully",
        });

       
    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });

    }
};

module.exports = {
    sendEmailOTP,
    verifyEmailOTP,
    sendLoginOTP,
    verifyLoginOTP,
    resendOTP,
};
