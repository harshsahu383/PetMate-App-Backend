const express = require("express");
const router = express.Router();

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

router.get("/:id", authMiddleware, getPetById);

router.put("/:id", authMiddleware, updatePet);

router.delete("/:id", authMiddleware, deletePet);

module.exports = router;