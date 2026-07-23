const pool = require("../config/db");

const getVendorsByService = async (req, res) => {
    try {
        const { service_uid } = req.params;

        if (!service_uid) {
            return res.status(400).json({
                success: false,
                message: "Service UID is required",
            });
        }

        const [vendors] = await pool.execute(
            `
     SELECT
    v.vendor_uid,
    v.vendor_name,
    v.profile_image,
    v.rating,
    v.address,
    v.city,
    v.state,
    vs.price,
    vs.duration
FROM vendor_services vs
INNER JOIN vendors v
    ON vs.vendor_uid = v.vendor_uid
WHERE
    vs.service_uid = ?
    AND vs.is_available = TRUE
    AND v.is_active = TRUE
ORDER BY v.rating DESC;
      `,
            [service_uid]
        );

        return res.status(200).json({
            success: true,
            message: "Vendors fetched successfully",
            data: {
                count: vendors.length,
                vendors,
            },
        });
    } catch (error) {
        console.error("Get Vendors Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

module.exports = {
    getVendorsByService,
};