const express = require('express');
const app = express();
const { connectToDB } = require('./db/dbConfig');
connectToDB();

app.use(express.json());

const network = require('./routes/network');
const user = require('./routes/user');

app.use('/network', network);
app.use('/user', user);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`); 
 });
