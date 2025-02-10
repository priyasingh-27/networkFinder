const cors=require('cors')
const express = require('express');
const app = express();
const { connectToDB } = require('./db/dbConfig');
connectToDB();

app.use(cors({
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true, // If you're using cookies/sessions
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
