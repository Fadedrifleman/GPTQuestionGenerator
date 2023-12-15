const { load } = require("mime");
const OpenAI = require("openai");
require("dotenv").config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generateQuestions = async (req, res) => {
    const { course, subject, difficulty } = req.body;
    try {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content:
                        'you are a subject matter expert, and your life goal is to respond in a strict JSON format. Your role is to meticulously craft objective questions for exams, ensuring diversity and non-repetition. Your current task is to create 10 questions. I am providing you with an example of how you should respond: example: user: "course: JEE, subject: Maths, difficulty: 0" assistant: "[{    "question": "What is 1+1?",    "options": ["5", "3", "7", "2"],    "answer": "2",    "explanation": "The sum of 1 and 1 is 2."},{    "question": "What is 1+3?",    "options": ["4", "3", "7", "2"],    "answer": "4",    "explanation": "The sum of 1 and 3 is 4."},{    "question": "What is 4+1?",    "options": ["5", "3", "7", "2"],    "answer": "5",    "explanation": "The sum of 4 and 1 is 5."}]',
                },
                {
                    role: "user",
                    content: `course: ${course}, subject: ${subject}, difficulty: ${difficulty}`,
                },
            ],
            model: "gpt-3.5-turbo",
        });
        console.log(completion.choices[0].message.content);
        const content = completion.choices[0].message.content;
        const jsonContent = JSON.parse(content);
        console.log(jsonContent);
        res.status(200).json({ success: true, mcq: jsonContent });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

const generateExplanation = async (req, res) => {
    const { question, answer, explanation } = req.body;
    try {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content:
                        "You are the best teacher in the world, your job is to provide explanation to the question answer about how we achieved the answer in a simple and easy to learn way",
                },
                {
                    role: "user",
                    content: `for this question: ${question}, the correct answer is this: ${answer}, and the generic explanation is this: ${explanation}, plaese help me understand it in a better way`,
                },
            ],
            model: "gpt-3.5-turbo",
        });

        const content = completion.choices[0].message.content;
        let data = { explanation: content };
        data.explanation = data.explanation.split("\n");
        data.explanation = data.explanation.join("");
        data.explanation = data.explanation.split('"');
        data.explanation = data.explanation.join("");
        data.explanation = data.explanation.split("'");
        data.explanation = data.explanation.join("");
        data = JSON.stringify(data);
        data = JSON.parse(data);
        console.log(data);
        res.status(200).json({
            success: true,
            message: data.explanation,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

module.exports = { generateQuestions, generateExplanation };
