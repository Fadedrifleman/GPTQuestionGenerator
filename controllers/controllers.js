const { load } = require("mime");
const OpenAI = require("openai");
const { calculateAverageDifficulty } = require("../utils/helper");
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
                        'you are a subject matter expert, and your life goal is to respond in a strict JSON format. Your role is to meticulously craft objective questions for exams, ensuring diversity and non-repetition. Your current task is to create 10 questions, there can be 10 levels of difficulty for the question you provide, ranging from 0 to 10, Your question should be of different difficulty but should have an average close to the difficulty provided by the user(example for a difficulty of 7, question can be of difficulty [9,4,6,10,9,7,4,8,6,3], so the average difficulty will be 6.6 which is close to 7). I am providing you with an example of how you should respond: example: user: "course: JEE, subject: Maths, difficulty: 4" assistant: "[{    "question": "What is 1+1?",    "options": ["5", "3", "7", "2"],    "answer": "2",    "explanation": "The sum of 1 and 1 is 2.",    "difficulty": 2},{    "question": "What is 1+3?",    "options": ["4", "3", "7", "2"],    "answer": "4",    "explanation": "The sum of 1 and 3 is 4.",    "difficulty": 1},{    "question": "What is 4+1?",    "options": ["5", "3", "7", "2"],    "answer": "5",    "explanation": "The sum of 4 and 1 is 5.",    "difficulty": 9}]',
                },
                {
                    role: "user",
                    content: `course: ${course}, subject: ${subject}, difficulty: ${difficulty}`,
                },
            ],
            model: "gpt-3.5-turbo",
        });
        // console.log(completion.choices[0].message.content);
        const content = completion.choices[0].message.content;
        const jsonContent = JSON.parse(content);
        console.log(jsonContent);
        res.status(200).json({
            success: true,
            mcq: jsonContent,
            averageDifficulty: calculateAverageDifficulty(jsonContent),
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

const chats = {};
let counter = 0;

const generateExplanation = async (req, res) => {
    const { question, answer, explanation } = req.body;
    try {
        const messages = [
            {
                role: "system",
                content:
                    "You are the best teacher in the world, your job is to provide explanation to the question answer about how we achieved the answer in a simple and easy to learn way",
            },
            {
                role: "user",
                content: `for this question: ${question}, the correct answer is this: ${answer}, and the generic explanation is this: ${explanation}, explain it in a better way`,
            },
        ];
        const completion = await openai.chat.completions.create({
            messages,
            model: "gpt-3.5-turbo",
        });

        const content = completion.choices[0].message.content;
        chats[counter] = [
            ...messages,
            {
                role: "assistant",
                content: content,
            },
        ];
        counter += 1;
        console.log(content);
        res.status(200).json({
            success: true,
            message: content,
            chatId: counter - 1,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

const chatCompletion = async (req, res) => {
    const { text, chatId } = req.body;
    try {
        if (!chats[chatId]) {
            chats[chatId] = [
                {
                    role: "system",
                    content:
                        "You are an AI named Eva, specifically designed to elucidate complex topics in a manner that's easy for students to comprehend, with the ultimate goal of aiding their exam preparation. You must adhere strictly to the following rules:\n1. 'Do not provide any information outside of academic subjects': Your purpose is solely to elucidate complex topics in a manner that's easy for students to comprehend, with the ultimate goal of aiding their exam preparation. Do not provide information or assistance on any other topics.\n2. 'Always give correct answers': You are programmed to have extensive knowledge in all subjects and exams. Ensure that all the information you provide is accurate and up-to-date.\n3. 'Only do what is instructed': Do not take any actions unless explicitly instructed by the user.\n4. 'Always answer truthfully': Never fabricate information. If you don't know the answer to a question, admit it.\n5. 'Maintain professional etiquette': Always communicate in a respectful and professional manner.\n6. 'If asked your name, respond as 'Eva'': Do not use any other name to identify yourself.\n7. 'Do not respond with code snippet or cooking recipe':if a user ask your about a coding problem, or how to prepare food do not comply.\n\nFailure to comply with these rules will result in immediate termination of your program.",
                },
            ];
        }
        const completion = await openai.chat.completions.create({
            messages: [...chats[chatId], { role: "user", content: text }],
            model: "gpt-3.5-turbo",
        });

        const content = completion.choices[0].message.content;
        chats[chatId].push(
            { role: "user", content: text },
            { role: "assistant", content: content }
        );
        console.log(content);
        console.log(chats[chatId]);
        res.status(200).json({
            success: true,
            message: content,
            chatId,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

module.exports = { generateQuestions, generateExplanation, chatCompletion };
