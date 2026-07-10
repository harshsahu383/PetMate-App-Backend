const pool = require("../config/db");
const generateUID = require("../utils/generateUid");
const createBooking = async (req, res) => {

    try {

        const userId = req.user.id;

        const {
            pet_id,
            service_id,
            booking_date,
            booking_time,
            address,
            notes,
        } = req.body;


        if (
            !pet_id ||
            !service_id ||
            !booking_date ||
            !booking_time ||
            !address
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }
        const [pet] = await pool.execute(
            `
    SELECT id, pet_name
    FROM pets
    WHERE id = ?
    AND user_id = ?
    `,
            [pet_id, userId]
        );

        if (pet.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Pet not found",
            });
        }

        const [service] = await pool.execute(
            `
    SELECT
        id,
        title,
        price
    FROM services
    WHERE id = ?
    AND is_active = TRUE
    `,
            [service_id]
        );

        if (service.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        const totalPrice = service[0].price;

        const [result] = await pool.execute(
            `
    INSERT INTO bookings
    (
        user_id,
        pet_id,
        service_id,
        booking_date,
        booking_time,
        address,
        notes,
        total_price
    )
    VALUES
    (?, ?, ?, ?, ?, ?, ?, ?)
    `,
            [
                userId,
                pet_id,
                service_id,
                booking_date,
                booking_time,
                address,
                notes ?? null,
                totalPrice,
            ]
        );

        const bookingUID = generateUID("BK", result.insertId);

        await pool.execute(
            `
    UPDATE bookings
    SET booking_uid = ?
    WHERE id = ?
    `,
            [bookingUID, result.insertId]
        );

        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: {
                booking: {
                    id: result.insertId,
                    booking_uid: bookingUID,
                    pet: pet[0],
                    service: service[0],
                    booking_date,
                    booking_time,
                    total_price: totalPrice,
                    status: "Pending",
                },
            },
        });

     } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

}

const getMyBookings = async (req, res) => {
    try {

        const userId = req.user.id;

        const [rows] = await pool.execute(
            `
            SELECT

                b.id,
                b.booking_uid,
                b.booking_date,
                b.booking_time,
                b.address,
                b.notes,
                b.status,
                b.payment_status,
                b.total_price,

                p.id AS pet_id,
                p.pet_uid,
                p.pet_name,
                p.pet_image,

                s.id AS service_id,
                s.service_uid,
                s.category,
                s.title,
                s.price,
                s.duration,
                s.image

            FROM bookings b

            INNER JOIN pets p
                ON b.pet_id = p.id

            INNER JOIN services s
                ON b.service_id = s.id

            WHERE b.user_id = ?

            ORDER BY b.created_at DESC
            `,
            [userId]
        );
        const bookings = rows.map((booking) => ({
            id: booking.id,
            booking_uid: booking.booking_uid,

            booking_date: booking.booking_date,
            booking_time: booking.booking_time,

            address: booking.address,
            notes: booking.notes,

            status: booking.status,
            payment_status: booking.payment_status,

            total_price: booking.total_price,

            pet: {
                id: booking.pet_id,
                pet_uid: booking.pet_uid,
                name: booking.pet_name,
                image: booking.pet_image,
            },

            service: {
                id: booking.service_id,
                service_uid: booking.service_uid,
                category: booking.category,
                title: booking.title,
                duration: booking.duration,
                price: booking.price,
                image: booking.image,
            },
        }));

        return res.status(200).json({
            success: true,
            message: "Bookings fetched successfully",
            data: {
                count: bookings.length,
                bookings,
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

const getBookingById = async (req, res) => {
    const userId = req.user.id;
    const { bookingUID } = req.params;

    if (!bookingUID) {
        return res.status(400).json({
            success: false,
            message: "Booking UID is required",
        });
    }

  

    const [rows] = await pool.execute(
        `
SELECT

    b.id,
    b.booking_uid,
    b.booking_date,
    b.booking_time,
    b.address,
    b.notes,
    b.status,
    b.payment_status,
    b.total_price,

    p.id AS pet_id,
    p.pet_uid,
    p.pet_name,
    p.pet_image,
    p.pet_type,
    p.breed,

    s.id AS service_id,
    s.service_uid,
    s.category,
    s.title,
    s.description,
    s.price,
    s.duration,
    s.image

FROM bookings b

INNER JOIN pets p
ON b.pet_id = p.id

INNER JOIN services s
ON b.service_id = s.id

WHERE
b.booking_uid = ?
AND
b.user_id = ?
`,
        [
            bookingUID,
            userId
        ]
    );

    if (rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: "Booking not found",
        });
    }

    const booking = rows[0];

    return res.status(200).json({
        success: true,
        message: "Booking fetched successfully",
        data: {
            booking: {
                id: booking.id,
                booking_uid: booking.booking_uid,

                booking_date: booking.booking_date,
                booking_time: booking.booking_time,

                address: booking.address,
                notes: booking.notes,

                status: booking.status,
                payment_status: booking.payment_status,

                total_price: booking.total_price,

                pet: {
                    id: booking.pet_id,
                    pet_uid: booking.pet_uid,
                    name: booking.pet_name,
                    type: booking.pet_type,
                    breed: booking.breed,
                    image: booking.pet_image,
                },

                service: {
                    id: booking.service_id,
                    service_uid: booking.service_uid,
                    category: booking.category,
                    title: booking.title,
                    description: booking.description,
                    duration: booking.duration,
                    price: booking.price,
                    image: booking.image,
                },
            },
        },
    });  



};

const cancelBooking = async (req, res) => {
    try {

        const userId = req.user.id;
        const { bookingUID } = req.params;

        if (!bookingUID) {
            return res.status(400).json({
                success: false,
                message: "Booking UID is required",
            });
        }

        const [rows] = await pool.execute(
            `
    SELECT
        id,
        booking_uid,
        status
    FROM bookings
    WHERE booking_uid = ?
    AND user_id = ?
    `,
            [bookingUID, userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        const booking = rows[0];

        if (booking.status === "Completed") {
            return res.status(400).json({
                success: false,
                message: "Completed bookings cannot be cancelled",
            });
        }

        if (booking.status === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "Booking is already cancelled",
            });
        }

        await pool.execute(
            `
    UPDATE bookings
    SET status = 'Cancelled'
    WHERE id = ?
    `,
            [booking.id]
        );

        const [updatedBooking] = await pool.execute(
            `
    SELECT
        booking_uid,
        status,
        booking_date,
        booking_time
    FROM bookings
    WHERE id = ?
    `,
            [booking.id]
        );

        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
            data: {
                booking: updatedBooking[0],
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
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking
}