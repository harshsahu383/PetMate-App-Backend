const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
    addVaccine,
    getVaccines,
    updateVaccine,
    deleteVaccine,
} = require("../controllers/vaccine.controller");

router.post("/pets/:pet_uid/vaccines", authMiddleware, addVaccine);

router.get("/pets/:pet_uid/vaccines", authMiddleware, getVaccines);

router.put("/vaccines/:id", authMiddleware, updateVaccine);

router.delete("/vaccines/:id", authMiddleware, deleteVaccine);

module.exports = router;