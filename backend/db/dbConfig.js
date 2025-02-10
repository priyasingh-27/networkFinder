const mysql = require('mysql2');
require('dotenv').config();
const host = process.env.HOST;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const db_name = process.env.DB_NAME;

const pool = mysql.createPool({
    host: host,
    user: user,
    password: password,
    database: db_name,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const connectToDB = async () => {
    try {
        const connection = await pool.promise().getConnection();
        console.log(`Connected to mysql database..`);
        connection.release();
    } catch (err) {
        console.log('Could not connect to mysql...',err);
    }
}

module.exports = {
    pool,
    connectToDB
};