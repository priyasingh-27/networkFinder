const { pool } = require('../db/dbConfig');

async function findAllNetwork() {
    try {
        const [rows] = await pool.promise().query('SELECT * FROM network ');
        if (rows.length == 0) {
            let errObj = {
                code: 404,
                message:'No network not found'
            }
            return [errObj, null];
        }
        return [null, rows];
    } catch (err) {
        let errObj = {
            code: 500,
            message:'Internal server error'
        }
        return [errObj, null];
    }
}

module.exports = {
    findAllNetwork
}