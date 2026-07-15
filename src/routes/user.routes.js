const express = require("express");
const router = express.Router();
const upload = require("../config/multer");

const authMiddleware = require("../middleware/auth.middleware");
const {
    completeProfile,
    getProfile,
    uploadProfileImage,
} = require("../controllers/user.controller");

router.post("/complete-profile", authMiddleware, completeProfile);

router.get("/profile", authMiddleware, getProfile);
router.post(
    "/upload-profile-image",
    authMiddleware,
    upload.single("profile_image"),
    uploadProfileImage
);
module.exports = router;