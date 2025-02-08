const { successResponse, badRequestResponse, notFoundResponse, serverErrorResponse, unauthorizedResponse } = require('../utils/response')
const { pool } = require('../db/dbConfig');
const { findUserByEmail } = require('../repository/user.repository');
const joi_schema = require('../joi_validation/user/register.joi');
const { sendEmail } = require('../utils/email');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const prepare_prompt = require('../utils/prompt');
require('dotenv').config();
const gemini_key = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(gemini_key);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


const sendQuery = async (req, res) => {
    try {
        const { email, query } = req.body;

        if (email && query) {
            const [err, user] = await findUserByEmail(email);
            if (err) {
                return notFoundResponse(res, 'User Not Found');
            }

            if (user.credits === 0) {
                await sendEmail(email);
                return badRequestResponse(res, 'Your credits are exhausted. Please check your email to recharge');
            }

            user.credits -= 1;
            await pool.promise().query('UPDATE user SET credits = ? WHERE email = ?', [user.credits, email]);
            
            const prompt = prepare_prompt(query);
            const result = await model.generateContent(prompt);
            const output = result.response.candidates[0].content.parts;
            // console.log(result.response.text());

            return successResponse(res, output,'Query processed successfully');
        }
        else {
            return badRequestResponse(res, 'Bad Request');
        }

    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Internal Server Error');
    }
}

const registerUser = async (req, res) => {
    try {
        const { error } = joi_schema.validate(req.body);
        if (error) {
            return badRequestResponse(res,'Invalid data entered')
        }

        const [err, user] = await findUserByEmail(email);

        if (err) {

            if (err.code === 404) {
                
                await connection.query(
                    'INSERT INTO user ( email, credits, timestamp) VALUES (?,?,?)',
                    [email, 5,  ]
                );

                return successResponse(res, 'User registered successfully');
                
            }
            else {
                return serverErrorResponse(res, 'Internal server error');
            }

        }
    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Internal Server Error');
    }
}

module.exports = {
    sendQuery
}