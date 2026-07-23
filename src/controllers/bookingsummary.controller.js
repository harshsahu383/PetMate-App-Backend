const pool = require("../config/db");

const getBookingSummary = async (req, res) => {
    try {

        const userId = req.user.id;

        const {
            pet_uid,
            service_uid,
            vendor_uid,
            booking_date,
            booking_time,
        } = req.query;

        if (
            !pet_uid ||
            !service_uid ||
            !vendor_uid ||
            !booking_date ||
            !booking_time
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
        }

        const [pets] = await pool.execute(
            `
    SELECT
        pet_uid,
        pet_name,
        pet_image,
        breed,
        pet_type
    FROM pets
    WHERE
        pet_uid = ?
        AND user_id = ?
    `,
            [pet_uid, userId]
        );

        if (pets.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Pet not found",
            });
        }
        const pet = pets[0];

        const [vendors] = await pool.execute(
            `
    SELECT
        vendor_uid,
        vendor_name,
        phone,
        address,
        city,
        state,
        profile_image
    FROM vendors
    WHERE
        vendor_uid = ?
        AND is_active = TRUE
    `,
            [vendor_uid]
        );

        if (vendors.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Vendor not found",
            });
        }

        const vendor = vendors[0];

        const [services] = await pool.execute(
            `
    SELECT
        s.service_uid,
        s.title,
        s.category,
        s.image,

        vs.price,
        vs.duration

    FROM services s

    INNER JOIN vendor_services vs
        ON s.service_uid = vs.service_uid

    WHERE
        s.service_uid = ?
        AND vs.vendor_uid = ?
        AND vs.is_available = TRUE
        AND s.is_active = TRUE
    `,
            [service_uid, vendor_uid]
        );

        if (services.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Service not available for this vendor",
            });
        }

        const service = services[0];

        const platformFee = 20;
        const total = Number(service.price) + platformFee;
        return res.status(200).json({
            success: true,
            message: "Booking summary fetched successfully",
            data: {
                pet,
                vendor,
                service,
                booking: {
                    booking_date,
                    booking_time,
                },
                pricing: {
                    service_fee: service.price,
                    platform_fee: platformFee,
                    total,
                    duration: service.duration,
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

module.exports = {
    getBookingSummary,
};