const pool = require("../config/db");

// Add Hobby
exports.addHobby = async (req, res) => {
    try {
        const { pet_uid } = req.params;
        const { hobby_name, rating } = req.body;

        if (!hobby_name || !rating) {
            return res.status(400).json({
                success: false,
                message: "Hobby name and rating are required.",
            });
        }

        await pool.query(
            `INSERT INTO pet_hobbies (pet_uid, hobby_name, rating)
       VALUES (?, ?, ?)`,
            [pet_uid, hobby_name, rating]
        );

        return res.status(201).json({
            success: true,
            message: "Hobby added successfully.",
        });
    } catch (error) {
        console.error("Add Hobby Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

// Get Hobbies
exports.getHobbies = async (req, res) => {
    try {
        const { pet_uid } = req.params;

        const [hobbies] = await pool.query(
            `SELECT * FROM pet_hobbies
       WHERE pet_uid = ?
       ORDER BY id DESC`,
            [pet_uid]
        );

        return res.status(200).json({
            success: true,
            message: "Hobbies fetched successfully.",
            data: {
                hobbies,
            },
        });
    } catch (error) {
        console.error("Get Hobbies Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

// Update Hobby
exports.updateHobby = async (req, res) => {
    try {
        const { id } = req.params;
        const { hobby_name, rating } = req.body;

        await pool.query(
            `UPDATE pet_hobbies
       SET hobby_name = ?, rating = ?
       WHERE id = ?`,
            [hobby_name, rating, id]
        );

        return res.status(200).json({
            success: true,
            message: "Hobby updated successfully.",
        });
    } catch (error) {
        console.error("Update Hobby Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

// Delete Hobby
exports.deleteHobby = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(
            `DELETE FROM pet_hobbies WHERE id = ?`,
            [id]
        );

        return res.status(200).json({
            success: true,
            message: "Hobby deleted successfully.",
        });
    } catch (error) {
        console.error("Delete Hobby Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};