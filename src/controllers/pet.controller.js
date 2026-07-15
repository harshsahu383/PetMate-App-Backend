const pool = require("../config/db");
const generateUID = require("../utils/generateUid");

const addPet = async (req, res) => {

    try {

        const userId = req.user.id;

        let {
            pet_name,
            pet_type,
            breed,
            gender,
            dob,
            weight,
            vaccinated,
            about_pet,
            pet_image,
        } = req.body;

        if (dob) {
            dob = new Date(dob).toISOString().split("T")[0];
        }

        pet_name = pet_name?.trim();
        pet_type = pet_type?.trim();
        breed = breed?.trim();
        gender = gender?.trim();
        about_pet = about_pet?.trim();
        if (
            !pet_name ||
            !pet_type ||
            !breed ||
            !gender ||
            !dob
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }
        if (!["Dog", "Cat"].includes(pet_type)) {
            return res.status(400).json({
                success: false,
                message: "Pet type must be Dog or Cat",
            });
        }

        if (!["Male", "Female"].includes(gender)) {
            return res.status(400).json({
                success: false,
                message: "Invalid gender",
            });
        }

        const [result] = await pool.execute(
            `
    INSERT INTO pets
    (
        user_id,
        pet_name,
        pet_type,
        breed,
        gender,
        dob,
        weight,
        vaccinated,
        about_pet,
        pet_image
    )
    VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
            [
                userId,
                pet_name,
                pet_type,
                breed,
                gender,
                dob,
                weight ?? null,
                vaccinated ?? false,
                about_pet ?? null,
                pet_image ?? null
            ]
        );
        const petUID = generateUID("PM", result.insertId);
        await pool.execute(
            `
UPDATE pets
SET pet_uid = ?
WHERE id = ?
`,
            [
                petUID,
                result.insertId
            ]
        );
        return res.status(201).json({
            success: true,
            message: "Pet added successfully",
            data: {
                pet: {
                    id: result.insertId,
                    pet_uid: petUID,
                    pet_name,
                    pet_type,
                    breed,
                    gender,
                    dob,
                    weight,
                    vaccinated,
                    about_pet,
                    pet_image,
                },
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


const getMyPets = async (req, res) => {

    try {

        const userId = req.user.id;

        const [pets] = await pool.execute(
            `
            SELECT
                id,
                pet_uid,
                pet_name,
                pet_type,
                breed,
                gender,
                dob,
                weight,
                vaccinated,
                about_pet,
                pet_image,
                created_at
            FROM pets
            WHERE user_id = ?
            ORDER BY created_at DESC
            `,
            [userId]
        );

        return res.status(200).json({
            success: true,
            message: "Pets fetched successfully",
            data: {
                count: pets.length,
                pets,
            },
        });

    } catch (error) {

        console.error(error);

        return res.status(200).json({
            success: true,
            message: "Pets fetched successfully",
            data: {
                count: pets.length,
                pets,
            },
        });

    }

};

const getPetById = async (req, res) => {
    try {

        const userId = req.user.id;
        const { pet_uid } = req.params;

       

        const [rows] = await pool.execute(
            `
            SELECT
                id,
                pet_uid,
                pet_name,
                pet_type,
                breed,
                gender,
                dob,
                weight,
                vaccinated,
                about_pet,
                pet_image,
                created_at
            FROM pets
            WHERE pet_uid = ?
AND user_id = ?
            `,
            pet_uid,
            userId
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Pet not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Pet fetched successfully",
            data: {
                pet: rows[0],
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

const updatePet = async (req, res) => {
    try {

        const userId = req.user.id;
        const { pet_uid } = req.params;

     

        let {
            pet_name,
            pet_type,
            breed,
            gender,
            dob,
            weight,
            vaccinated,
            about_pet,
            pet_image,
        } = req.body;

        if (dob) {
            dob = new Date(dob).toISOString().split("T")[0];
        }

        pet_name = pet_name?.trim();
        pet_type = pet_type?.trim();
        breed = breed?.trim();
        gender = gender?.trim();
        about_pet = about_pet?.trim();

        if (
            !pet_name ||
            !pet_type ||
            !breed ||
            !gender ||
            !dob
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }

        if (!["Dog", "Cat"].includes(pet_type)) {
            return res.status(400).json({
                success: false,
                message: "Pet type must be Dog or Cat",
            });
        }

        if (!["Male", "Female"].includes(gender)) {
            return res.status(400).json({
                success: false,
                message: "Invalid gender",
            });
        }

        const [result] = await pool.execute(
            `
            UPDATE pets
            SET
                pet_name = ?,
                pet_type = ?,
                breed = ?,
                gender = ?,
                dob = ?,
                weight = ?,
                vaccinated = ?,
                about_pet = ?,
                pet_image = ?
            WHERE pet_uid = ?
AND user_id = ?
            `,
            [
                pet_name,
                pet_type,
                breed,
                gender,
                dob,
                weight ?? null,
                vaccinated ?? false,
                about_pet ?? null,
                pet_image ?? null,
                pet_uid,
                userId,
            ]
        );
        const [updatedPet] = await pool.execute(
            `
    SELECT
        id,
        pet_uid,
        pet_name,
        pet_type,
        breed,
        gender,
        dob,
        weight,
        vaccinated,
        about_pet,
        pet_image,
        created_at
    FROM pets
    WHERE pet_uid = ?
AND user_id = ?
    `,
            pet_uid,
            userId
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Pet not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Pet updated successfully",
            data: {
                pet: updatedPet[0],
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

const deletePet = async (req, res) => {
    try {

        const userId = req.user.id;
        const { pet_uid } = req.params;

      

        const [petRows] = await pool.execute(
            `
    SELECT
        id,
        pet_uid,
        pet_name,
        pet_type,
        breed,
        gender,
        dob,
        weight,
        vaccinated,
        about_pet,
        pet_image,
        created_at
    FROM pets
    WHERE pet_uid = ?
AND user_id = ?
    `,
            pet_uid,
            userId
        );

        if (petRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Pet not found",
            });
        }

        const deletedPet = petRows[0];

        const [result] = await pool.execute(
            `
            DELETE FROM pets
            WHERE pet_uid = ?
AND user_id = ?
            `,
            pet_uid,
            userId
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Pet not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Pet deleted successfully",
            data: {
                pet: deletedPet,
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
    addPet,
    getMyPets,
    getPetById,
    updatePet,
    deletePet
};