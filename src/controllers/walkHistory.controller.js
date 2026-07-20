const pool = require("../config/db");

// Add Walk History
const addWalkHistory = async (req, res) => {
    try {
        const { pet_uid } = req.params;

        const {
            walk_date,
            start_time,
            end_time,
            duration,
            distance,
            notes,
        } = req.body;

        if (!walk_date) {
            return res.status(400).json({
                success: false,
                message: "Walk date is required.",
            });
        }

        const [petRows] = await pool.execute(
            `SELECT id FROM pets WHERE pet_uid = ?`,
            [pet_uid]
        );

        if (petRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Pet not found.",
            });
        }

        const petId = petRows[0].id;

        await pool.execute(
            `
            INSERT INTO pet_walk_history
            (
                pet_id,
                walk_date,
                start_time,
                end_time,
                duration,
                distance,
                notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                petId,
                walk_date,
                start_time || null,
                end_time || null,
                duration || null,
                distance || null,
                notes || null,
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Walk history added successfully.",
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};

// Get Walk History
const getWalkHistory = async (req, res) => {
    try {
        const { pet_uid } = req.params;

        const [petRows] = await pool.execute(
            `SELECT id FROM pets WHERE pet_uid = ?`,
            [pet_uid]
        );

        if (petRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Pet not found.",
            });
        }

        const petId = petRows[0].id;

        const [walks] = await pool.execute(
            `
            SELECT
                id,
                walk_date,
                start_time,
                end_time,
                duration,
                distance,
                notes,
                created_at,
                updated_at
            FROM pet_walk_history
            WHERE pet_id = ?
            ORDER BY walk_date DESC
            `,
            [petId]
        );

        return res.status(200).json({
            success: true,
            message: "Walk history fetched successfully.",
            data: {
                walks,
            },
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};

// Update Walk History
const updateWalkHistory = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            walk_date,
            start_time,
            end_time,
            duration,
            distance,
            notes,
        } = req.body;

        const [existing] = await pool.execute(
            `SELECT id FROM pet_walk_history WHERE id = ?`,
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Walk history not found.",
            });
        }

        await pool.execute(
            `
            UPDATE pet_walk_history
            SET
                walk_date = ?,
                start_time = ?,
                end_time = ?,
                duration = ?,
                distance = ?,
                notes = ?
            WHERE id = ?
            `,
            [
                walk_date,
                start_time,
                end_time,
                duration,
                distance,
                notes,
                id,
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Walk history updated successfully.",
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};

// Delete Walk History
const deleteWalkHistory = async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await pool.execute(
            `SELECT id FROM pet_walk_history WHERE id = ?`,
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Walk history not found.",
            });
        }

        await pool.execute(
            `DELETE FROM pet_walk_history WHERE id = ?`,
            [id]
        );

        return res.status(200).json({
            success: true,
            message: "Walk history deleted successfully.",
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};

module.exports = {
    addWalkHistory,
    getWalkHistory,
    updateWalkHistory,
    deleteWalkHistory,
};