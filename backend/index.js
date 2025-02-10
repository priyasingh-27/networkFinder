const cors=require('cors')
const express = require('express');
const app = express();
const { connectToDB } = require('./db/dbConfig');
connectToDB();
require('dotenv').config();
const frontend_url = process.env.FRONTEND_URL;

app.use(cors({
    origin: frontend_url, 
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const network = require('./routes/network');
const user = require('./routes/user');

app.use('/network', network);
app.use('/user', user);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`); 
 });
