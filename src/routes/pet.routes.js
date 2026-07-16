const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const { uploadPetImage } = require("../controllers/pet.controller");
const authMiddleware = require("../middleware/auth.middleware");

const {
    addPet,
    getMyPets,
    getPetById,
    updatePet,
    deletePet,
} = require("../controllers/pet.controller");

router.post("/", authMiddleware, addPet);

router.get("/", authMiddleware, getMyPets);

router.get("/:pet_uid", authMiddleware, getPetById);

router.put("/:pet_uid", authMiddleware, updatePet);

router.delete("/:pet_uid", authMiddleware, deletePet);

router.post(
    "/upload-pet-image",
    authMiddleware,
    upload.single("image"),
    uploadPetImage
);
module.exports = router;