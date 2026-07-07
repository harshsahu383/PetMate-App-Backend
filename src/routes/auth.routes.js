const express = require("express");

const router = express.Router();

const {
    sendEmailOTP,
    verifyEmailOTP,sendLoginOTP,verifyLoginOTP,resendOTP
} = require("../controllers/auth.controller");

router.post("/send-email-otp", sendEmailOTP);

router.post("/verify-email-otp", verifyEmailOTP);

router.post("/send-login-otp", sendLoginOTP);

router.post("/verify-login-otp", verifyLoginOTP);

router.post("/resend-otp", resendOTP);
module.exports = router;