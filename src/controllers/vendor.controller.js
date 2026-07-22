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
          v.email,
          v.phone,
          v.address,
          v.city,
          v.state,
          v.pincode,
          v.profile_image,
          v.rating,
          v.total_reviews
      FROM vendor_services vs
      INNER JOIN vendors v
          ON vs.vendor_uid = v.vendor_uid
      WHERE
          vs.service_uid = ?
          AND v.is_active = TRUE
      ORDER BY v.rating DESC
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