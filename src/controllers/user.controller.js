const pool = require("../config/db");

const completeProfile = async (req, res) => {
    try {

        const userId = req.user.id;

        let {
            phone,
            gender,
            country,
            state,
            district,
            address,
            profile_image
        } = req.body;

        // Validation
        if (
            !phone ||
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

        const [result] = await pool.execute(
            `
            UPDATE users
            SET
                phone = ?,
                gender = ?,
                country = ?,
                state = ?,
                district = ?,
                address = ?,
                profile_image = ?,
                is_profile_completed = ?
            WHERE id = ?
            `,
            [
                phone,
                gender,
                country,
                state,
                district,
                address || null,
                profile_image || null,
                true,
                userId,
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Profile completed successfully",
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
                gender,
                country,
                state,
                district,
                address,
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
            user: rows[0],
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
    getProfile
}