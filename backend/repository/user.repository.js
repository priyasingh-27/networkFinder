const { pool } = require('../db/dbConfig');

async function findUserByEmail(email) {
    try {
        const [rows] = await pool.promise().query('SELECT * FROM user WHERE email=?', [email]);
        if (rows.length == 0) {
            let errObj = {
                code: 404,
                message:'User not found'
            }
            return [errObj, null];
        }
        return [null, rows[0]];
    } catch (err) {
        let errObj = {
            code: 500,
            message:'Internal server error'
        }
        return [errObj, null];
    }
}

module.exports = {
    findUserByEmail
}