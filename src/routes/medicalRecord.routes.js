const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
    addMedicalRecord,
    getMedicalRecords,
    updateMedicalRecord,
    deleteMedicalRecord,
} = require("../controllers/medicalRecord.controller");

router.post(
    "/pets/:pet_uid/medical-records",
    authMiddleware,
    addMedicalRecord
);

router.get(
    "/pets/:pet_uid/medical-records",
    authMiddleware,
    getMedicalRecords
);

router.put(
    "/medical-records/:id",
    authMiddleware,
    updateMedicalRecord
);

router.delete(
    "/medical-records/:id",
    authMiddleware,
    deleteMedicalRecord
);

module.exports = router;