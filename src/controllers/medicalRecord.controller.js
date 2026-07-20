const pool = require("../config/db");

const addMedicalRecord = async (req, res) => {
    try {
        const { pet_uid } = req.params;

        const {
            title,
            diagnosis,
            treatment,
            doctor_name,
            hospital_name,
            visit_date,
            notes,
        } = req.body;

        if (!title || !visit_date) {
            return res.status(400).json({
                success: false,
                message: "Title and visit date are required.",
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
            INSERT INTO pet_medical_records
            (
                pet_id,
                title,
                diagnosis,
                treatment,
                doctor_name,
                hospital_name,
                visit_date,
                notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                petId,
                title,
                diagnosis || null,
                treatment || null,
                doctor_name || null,
                hospital_name || null,
                visit_date,
                notes || null,
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Medical record added successfully.",
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};

const getMedicalRecords = async (req, res) => {
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

        const [records] = await pool.execute(
            `SELECT id, title, diagnosis, treatment, doctor_name, hospital_name, visit_date, notes, created_at, updated_at FROM pet_medical_records WHERE pet_id = ? ORDER BY visit_date DESC`,
            [petId]
        );

        return res.status(200).json({
            success: true,
            data: records,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};

const updateMedicalRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            diagnosis,
            treatment,
            doctor_name,
            hospital_name,
            visit_date,
            notes,
        } = req.body;

        const [existingRows] = await pool.execute(
            `SELECT id FROM pet_medical_records WHERE id = ?`,
            [id]
        );

        if (existingRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Medical record not found.",
            });
        }

        await pool.execute(
            `UPDATE pet_medical_records SET title = ?, diagnosis = ?, treatment = ?, doctor_name = ?, hospital_name = ?, visit_date = ?, notes = ? WHERE id = ?`,
            [
                title || null,
                diagnosis || null,
                treatment || null,
                doctor_name || null,
                hospital_name || null,
                visit_date || null,
                notes || null,
                id,
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Medical record updated successfully.",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};

const deleteMedicalRecord = async (req, res) => {
    try {
        const { id } = req.params;

        const [existingRows] = await pool.execute(
            `SELECT id FROM pet_medical_records WHERE id = ?`,
            [id]
        );

        if (existingRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Medical record not found.",
            });
        }

        await pool.execute(`DELETE FROM pet_medical_records WHERE id = ?`, [id]);

        return res.status(200).json({
            success: true,
            message: "Medical record deleted successfully.",
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
    addMedicalRecord,
    getMedicalRecords,
    updateMedicalRecord,
    deleteMedicalRecord,
};