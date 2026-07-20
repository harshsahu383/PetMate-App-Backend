const pool = require("../config/db");

const addVaccine = async (req, res) => {
    try {

        const { pet_uid } = req.params;

        const {
            vaccine_name,
            vaccination_date,
            next_due_date,
            doctor_name,
            hospital_name,
            notes,
        } = req.body;

        if (!vaccine_name || !vaccination_date) {
            return res.status(400).json({
                success: false,
                message: "Vaccine name and vaccination date are required.",
            });
        }

        // Find Pet
        const [petRows] = await pool.execute(
            `
            SELECT id
            FROM pets
            WHERE pet_uid = ?
            `,
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
            INSERT INTO pet_vaccines
            (
                pet_id,
                vaccine_name,
                vaccination_date,
                next_due_date,
                doctor_name,
                hospital_name,
                notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                petId,
                vaccine_name,
                vaccination_date,
                next_due_date || null,
                doctor_name || null,
                hospital_name || null,
                notes || null,
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Vaccine added successfully.",
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });

    }
};

const getVaccines = async (req, res) => {
    try {
        const { pet_uid } = req.params;

        // Find Pet
        const [petRows] = await pool.execute(
            `
            SELECT id
            FROM pets
            WHERE pet_uid = ?
            `,
            [pet_uid]
        );

        if (petRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Pet not found.",
            });
        }

        const petId = petRows[0].id;

        const [vaccines] = await pool.execute(
            `
            SELECT
                id,
                vaccine_name,
                vaccination_date,
                next_due_date,
                doctor_name,
                hospital_name,
                notes,
                created_at,
                updated_at
            FROM pet_vaccines
            WHERE pet_id = ?
            ORDER BY vaccination_date DESC
            `,
            [petId]
        );

        return res.status(200).json({
            success: true,
            message: "Vaccines fetched successfully.",
            data: vaccines,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

const updateVaccine = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            vaccine_name,
            vaccination_date,
            next_due_date,
            doctor_name,
            hospital_name,
            notes,
        } = req.body;

        const [existing] = await pool.execute(
            `SELECT id FROM pet_vaccines WHERE id = ?`,
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Vaccine not found.",
            });
        }

        await pool.execute(
            `
            UPDATE pet_vaccines
            SET
                vaccine_name = ?,
                vaccination_date = ?,
                next_due_date = ?,
                doctor_name = ?,
                hospital_name = ?,
                notes = ?
            WHERE id = ?
            `,
            [
                vaccine_name,
                vaccination_date,
                next_due_date || null,
                doctor_name || null,
                hospital_name || null,
                notes || null,
                id,
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Vaccine updated successfully.",
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

const deleteVaccine = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if vaccine exists
        const [rows] = await pool.execute(
            `
            SELECT id
            FROM pet_vaccines
            WHERE id = ?
            `,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Vaccine record not found."
            });
        }

        // Delete vaccine
        await pool.execute(
            `
            DELETE FROM pet_vaccines
            WHERE id = ?
            `,
            [id]
        );

        return res.status(200).json({
            success: true,
            message: "Vaccine deleted successfully."
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        });
    }
};

module.exports = {
    addVaccine,
    getVaccines,
    updateVaccine,
    deleteVaccine,
};