const express = require("express");
const router = express.Router();

const {
    generateQuestions,
    generateExplanation,
    chatCompletion,
} = require("../controllers/controllers");

router.post("/generate", generateQuestions);
router.post("/explain", generateExplanation);
router.post("/completion", chatCompletion);

module.exports = router;
