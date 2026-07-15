const pool = require("../config/db");

const completeProfile = async (req, res) => {
    try {

        const userId = req.user.id;

        let {
            name,
            phone,
            gender,
            country,
            state,
            district,
            city,
            pincode,
            address,         
            profile_image
        } = req.body;

        phone = phone?.trim();
        const normalizedGenderInput = gender?.trim();
        const normalizedGender =
            normalizedGenderInput?.toLowerCase() === "male" || normalizedGenderInput?.toLowerCase() === "m"
                ? "Male"
                : normalizedGenderInput?.toLowerCase() === "female" || normalizedGenderInput?.toLowerCase() === "f"
                    ? "Female"
                    : normalizedGenderInput?.toLowerCase() === "other" || normalizedGenderInput?.toLowerCase() === "o"
                        ? "Other"
                        : normalizedGenderInput;
        gender = normalizedGender;
        country = country?.trim();
        state = state?.trim();
        district = district?.trim();
        address = address?.trim();

        if (!["Male", "Female", "Other"].includes(gender)) {
            return res.status(400).json({
                success: false,
                message: "Invalid gender",
            });
        }

        const normalizedPhone = phone ? phone.replace(/^\+?91/, "").replace(/^0/, "") : "";

        if (phone && !/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone number",
            });
        }

        // Validation
        if (
            !gender ||
            !country ||
            !state ||
            !district
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }
    
console.log(req.body);
        const [result] = await pool.execute(
            `
            UPDATE users
            SET
                name = ?,
                phone = ?,
                gender = ?,
                country = ?,
                state = ?,
                district = ?,
                address = ?,
                city = ?,
                pincode = ?,
                profile_image = ?,
                is_profile_completed = ?
            WHERE id = ?
            `,
            [
                name || null,
                phone || null,
                gender,
                country,
                state,
                district,
                address || null,
                city || null,
                pincode || null,
                profile_image || null,
                true,
                userId,
            ]
        );

        const [rows] = await pool.execute(
            `
   SELECT
    id,
    name,
    email,
    phone,
    login_method,
    gender,
    country,
    state,
    district,
    city,
    pincode,
    address,
    profile_image,
    is_profile_completed
FROM users
WHERE id = ?
    `,
            [userId]
        );

        return res.status(200).json({
            success: true,
            message: "Profile completed successfully",
            data: {
                user: rows[0],
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

const getProfile = async (req, res) => {
    try {

        const userId = req.user.id;

        const [rows] = await pool.execute(
            `
           SELECT
    id,
    name,
    email,
    phone,
    login_method,
    gender,
    country,
    state,
    district,
    address,
    city,
    pincode,
    profile_image,
    is_profile_completed
FROM users
WHERE id = ?
            `,
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            data: {
                user: rows[0],
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

const uploadProfileImage = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select an image",
            });
        }

        const imagePath = `/uploads/profile/${req.file.filename}`;

        return res.status(200).json({
            success: true,
            message: "Profile image uploaded successfully",
            data: {
                profile_image: imagePath,
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

module.exports = {
    completeProfile,
    getProfile,
    uploadProfileImage,
}