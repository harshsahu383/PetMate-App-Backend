const pool = require("../config/db");

const getAllServices = async (req, res) => {
    try {

        let { category } = req.query;

        if (!category) {
            return res.status(400).json({
                success: false,
                message: "Category is required",
            });
        }

        category = category.trim();

        const allowedCategories = [
            "Grooming",
            "Veterinary",
            "Training",
            "Boarding",
            "Walking",
        ];

        if (!allowedCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category",
            });
        }

        const [services] = await pool.execute(
            `
            SELECT
                id,
                service_uid,
                category,
                title,
                description,
                price,
                duration,
                image
            FROM services
            WHERE category = ?
            AND is_active = TRUE
            ORDER BY price ASC
            `,
            [category]
        );

        return res.status(200).json({
            success: true,
            message: "Services fetched successfully",
            data: {
                count: services.length,
                services,
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

const getServiceById = async (req, res) => {
    try {

        const serviceId = Number(req.params.id);

        if (!Number.isInteger(serviceId) || serviceId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid Service ID",
            });
        }

        const [rows] = await pool.execute(
            `
            SELECT
                id,
                service_uid,
                category,
                title,
                description,
                price,
                duration,
                image
            FROM services
            WHERE id = ?
            AND is_active = TRUE
            `,
            [serviceId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Service fetched successfully",
            data: {
                service: rows[0],
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
    getAllServices,
    getServiceById,
};