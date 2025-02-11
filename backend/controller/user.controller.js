const { successResponse, badRequestResponse, notFoundResponse, serverErrorResponse, unauthorizedResponse } = require('../utils/response')
const { pool } = require('../db/dbConfig');
const { findUserByEmail } = require('../repository/user.repository');
const joi_schema = require('../joi_validation/user/register.joi');
const { sendEmail } = require('../utils/email');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const prepare_prompt = require('../utils/prompt');
require('dotenv').config();
// const { OAuth2Client } = require('google-auth-library'); 
const gemini_key = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(gemini_key);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });



const getCredits = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return badRequestResponse(res, 'Email missing');
        }

        const [err, user] = await findUserByEmail(email);
        if (err) {
            if (err.code == 404) return notFoundResponse(res, 'User Not Found');
            if (err.code == 500) return serverErrorResponse(res, 'Internal server error');
        }

        console.log(user.credits);

        return successResponse(res, user.credits, 'Credits fetched successfully');
    }catch (err) {
        console.log(err);
        return serverErrorResponse(res,'Internal server error')
    }
}

const sendQuery = async (req, res) => {
    try {
        const { query,email }  = req.body;

        if (email && query) {
            const [err, user] = await findUserByEmail(email);

            if (err) {
                if (err.code == 404) return notFoundResponse(res, 'User Not Found');
                if (err.code == 500) return serverErrorResponse(res, 'Internal server error');
            }

            if (user.credits === 0) {
                
                await sendEmail(email,'Get Credits',`Please sent new email with ${email} by mentioning in the subject "recharge 5 credits"  to get credits`);
                return badRequestResponse(res, 'Your credits are exhausted. Please check your email to recharge');
                
            }

            user.credits -= 1;
            await pool.promise().query('UPDATE user SET credits = ? WHERE email = ?', [user.credits, email]);
            
            const prompt = await prepare_prompt(query);
            const result = await model.generateContent(prompt);
            const output = result.response.candidates[0].content.parts;
            // console.log(result.response.text());

            // const cleanedOutput = JSON.parse(output[0].text);
            return successResponse(res,output, 'Query processed successfully');
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
            return badRequestResponse(res, 'Invalid data entered');
        }

        const { email } = req.body;
        console.log(email);
        if (!email) {
            return badRequestResponse(res, 'Email is required');
        }

        const [err, user] = await findUserByEmail(email);

        if (!err && user) {
            return successResponse(res, 'User already registered');
        }

        if (err && err.code === 404) {
            const new_user= await pool.promise().query(
                'INSERT INTO user (email, credits, timestamp) VALUES (?, ?, NOW())',
                [email, 5]
            );
            console.log("new_user: ",new_user);

            return successResponse(res, 'User registered successfully');
        }

        return serverErrorResponse(res, user ,'Internal server error');

    } catch (err) {
        console.error('Error in registerUser:', err);
        return serverErrorResponse(res, 'Internal Server Error');
    }
};


module.exports = {
    registerUser,
    sendQuery,
    getCredits
}