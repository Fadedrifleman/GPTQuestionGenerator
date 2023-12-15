const express = require("express");
const router = express.Router();

const {
    generateQuestions,
    generateExplanation,
} = require("../controllers/controllers");

router.post("/generate", generateQuestions);
router.post("/explain", generateExplanation);

module.exports = router;
