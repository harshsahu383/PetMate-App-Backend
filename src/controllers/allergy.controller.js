const pool = require("../config/db");

// Add Allergy
const addAllergy = async (req, res) => {
    try {
        const { pet_uid } = req.params;

        const {
            allergy_name,
            severity,
            symptoms,
            treatment,
            notes,
        } = req.body;

        if (!allergy_name) {
            return res.status(400).json({
                success: false,
                message: "Allergy name is required.",
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
            INSERT INTO pet_allergies
            (
                pet_id,
                allergy_name,
                severity,
                symptoms,
                treatment,
                notes
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                petId,
                allergy_name,
                severity || "Low",
                symptoms || null,
                treatment || null,
                notes || null,
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Allergy added successfully.",
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};

// Get Allergies
const getAllergies = async (req, res) => {
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

        const [allergies] = await pool.execute(
            `
            SELECT
                id,
                allergy_name,
                severity,
                symptoms,
                treatment,
                notes,
                created_at,
                updated_at
            FROM pet_allergies
            WHERE pet_id = ?
            ORDER BY created_at DESC
            `,
            [petId]
        );

        return res.status(200).json({
            success: true,
            message: "Allergies fetched successfully.",
            data: {
                allergies,
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

// Update Allergy
const updateAllergy = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            allergy_name,
            severity,
            symptoms,
            treatment,
            notes,
        } = req.body;

        const [existing] = await pool.execute(
            `SELECT id FROM pet_allergies WHERE id = ?`,
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Allergy not found.",
            });
        }

        await pool.execute(
            `
            UPDATE pet_allergies
            SET
                allergy_name = ?,
                severity = ?,
                symptoms = ?,
                treatment = ?,
                notes = ?
            WHERE id = ?
            `,
            [
                allergy_name,
                severity,
                symptoms,
                treatment,
                notes,
                id,
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Allergy updated successfully.",
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};

// Delete Allergy
const deleteAllergy = async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await pool.execute(
            `SELECT id FROM pet_allergies WHERE id = ?`,
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Allergy not found.",
            });
        }

        await pool.execute(
            `DELETE FROM pet_allergies WHERE id = ?`,
            [id]
        );

        return res.status(200).json({
            success: true,
            message: "Allergy deleted successfully.",
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
    addAllergy,
    getAllergies,
    updateAllergy,
    deleteAllergy,
};