const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOTPEmail = async (email, otp) => {
    try {
        await transporter.sendMail({
            from: `"PetMate" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "PetMate - Email Verification OTP",
            html: `
                <div style="font-family: Arial, sans-serif; padding:20px;">
                    <h2>Welcome to PetMate 🐶🐱</h2>

                    <p>Your verification OTP is:</p>

                    <h1 style="letter-spacing:5px; color:#0f766e;">
                        ${otp}
                    </h1>

                    <p>This OTP is valid for <strong>5 minutes</strong>.</p>

                    <p>If you didn't request this OTP, please ignore this email.</p>
                </div>
            `,
        });

        return true;

    } catch (error) {

        console.error("Email Error:", error);

        return false;

    }
};

module.exports = sendOTPEmail;