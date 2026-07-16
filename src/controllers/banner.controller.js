const pool = require("../config/db");

const getBanners = async (req, res) => {
    try {

        const [rows] = await pool.execute(`
            SELECT
                id,
                title,
                subtitle,
                image,
                banner_type,
                target,
                sort_order
            FROM banners
            WHERE is_active = 1
            ORDER BY sort_order ASC
        `);

        return res.status(200).json({
            success: true,
            message: "Banners fetched successfully",
            data: {
                banners: rows,
            },
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });

    }
};

module.exports = {
    getBanners,
};