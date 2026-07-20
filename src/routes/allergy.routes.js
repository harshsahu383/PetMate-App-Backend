const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
    addAllergy,
    getAllergies,
    updateAllergy,
    deleteAllergy,
} = require("../controllers/allergy.controller");

router.post(
    "/pets/:pet_uid/allergies",
    authMiddleware,
    addAllergy
);

router.get(
    "/pets/:pet_uid/allergies",
    authMiddleware,
    getAllergies
);

router.put(
    "/allergies/:id",
    authMiddleware,
    updateAllergy
);

router.delete(
    "/allergies/:id",
    authMiddleware,
    deleteAllergy
);

module.exports = router;