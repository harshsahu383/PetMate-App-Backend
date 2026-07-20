const express = require("express");
const router = express.Router();

const {
    addHobby,
    getHobbies,
    updateHobby,
    deleteHobby,
} = require("../controllers/hobby.controller");

router.post("/pets/:pet_uid/hobbies", addHobby);

router.get("/pets/:pet_uid/hobbies", getHobbies);

router.put("/hobbies/:id", updateHobby);

router.delete("/hobbies/:id", deleteHobby);

module.exports = router;