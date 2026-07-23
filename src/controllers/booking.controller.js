const pool = require("../config/db");
const generateUID = require("../utils/generateUid");
const createBooking = async (req, res) => {

    try {

        const userId = req.user.id;

        const {
            pet_uid,
            service_uid,
            vendor_uid,
            booking_date,
            booking_time,
            address,
            notes,
        } = req.body;


        if (
            !pet_uid ||
            !service_uid ||
            !vendor_uid ||
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
SELECT
    id,
    pet_uid,
    pet_name
FROM pets
WHERE pet_uid = ?
AND user_id = ?
`,
            [pet_uid, userId]
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
    service_uid,
    title,
    price
FROM services
WHERE service_uid = ?
AND is_active = TRUE
`,
            [service_uid]
        );

        if (service.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        const [vendor] = await pool.execute(
            `
SELECT
    id,
    vendor_uid,
    vendor_name
FROM vendors
WHERE vendor_uid = ?
`,
            [vendor_uid]
        );

        if (vendor.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Vendor not found",
            });
        }

        const totalPrice = service[0].price;

        function convertTo24Hour(time12h) {
            const [time, modifier] = time12h.match(/(\d+:\d+)(AM|PM)/i).slice(1);

            let [hours, minutes] = time.split(":");

            hours = parseInt(hours, 10);

            if (modifier.toUpperCase() === "PM" && hours !== 12) {
                hours += 12;
            }

            if (modifier.toUpperCase() === "AM" && hours === 12) {
                hours = 0;
            }

            return `${String(hours).padStart(2, "0")}:${minutes}:00`;
        }
        const formattedBookingTime = convertTo24Hour(booking_time);
       
        const formattedBookingDate = new Date(booking_date)
            .toISOString()
            .split("T")[0];
        const [result] = await pool.execute(
           
            `
INSERT INTO bookings
(
    user_id,
    pet_uid,
    vendor_uid,
    service_uid,
    booking_date,
    booking_time,
    total_amount,
    notes
)
VALUES
(?, ?, ?, ?, ?, ?, ?, ?)
`,
            [
                userId,
                pet_uid,
                vendor_uid,
                service_uid,
                formattedBookingDate,
                formattedBookingTime,
                totalPrice,
                notes ?? null
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
                    booking_date: formattedBookingDate,
                    booking_time,
                    total_price: totalPrice,
                    status: "Pending",
                },
            },
        });

    } catch (error) {
        console.log("====================");
        console.log("BOOKING ERROR");
        console.log(error);
        console.log(error.message);
        console.log(error.stack);
        console.log("====================");

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
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

                p.id AS pet_uid,
                p.pet_uid,
                p.pet_name,
                p.pet_image,

                s.id AS service_uid,
                s.service_uid,
                s.category,
                s.title,
                s.price,
                s.duration,
                s.image

            FROM bookings b

            INNER JOIN pets p
                ON b.pet_uid = p.pet_uid

            INNER JOIN services s
                ON b.service_uid = s.service_uid

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
                id: booking.pet_uid,
                pet_uid: booking.pet_uid,
                name: booking.pet_name,
                image: booking.pet_image,
            },

            service: {
                id: booking.service_uid,
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

    p.id AS pet_uid,
    p.pet_uid,
    p.pet_name,
    p.pet_image,
    p.pet_type,
    p.breed,

    s.id AS service_uid,
    s.service_uid,
    s.category,
    s.title,
    s.description,
    s.price,
    s.duration,
    s.image

FROM bookings b

INNER JOIN pets p
ON b.pet_uid = p.pet_uid

INNER JOIN services s
ON b.service_uid = s.service_uid

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
                    id: booking.pet_uid,
                    pet_uid: booking.pet_uid,
                    name: booking.pet_name,
                    type: booking.pet_type,
                    breed: booking.breed,
                    image: booking.pet_image,
                },

                service: {
                    id: booking.service_uid,
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