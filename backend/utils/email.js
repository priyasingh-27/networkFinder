const {findUserWithZeroCredits, findUserByEmail}=require('../repository/user.repository');
const nodemailer = require('nodemailer');
require('dotenv').config();
const {google}=require('googleapis');
const cron =require('node-cron');
const { pool } = require('../db/dbConfig');

const sender = process.env.SENDER;
const pass = process.env.PASS;
const GMAIL_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const GMAIL_REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;


const oAuth2Client = new google.auth.OAuth2(
    GMAIL_CLIENT_ID,
    CLIENT_SECRET,
    GMAIL_REDIRECT_URI
);

const SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify'
];

oAuth2Client.setCredentials({
    access_token: ACCESS_TOKEN,
    refresh_token: REFRESH_TOKEN,
    scope: SCOPES.join(' ')
});


async function checkEmailForRecharge(userEmail) {
    try {
        // Get fresh access token
        const { token } = await oAuth2Client.getAccessToken();
        const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

        // First, search for emails matching our criteria
        const searchResponse = await gmail.users.messages.list({
            userId: 'me',
            q: `subject:"recharge 5 credits" from:${userEmail} is:unread`,
            maxResults: 1
        });

        if (!searchResponse.data.messages || searchResponse.data.messages.length === 0) {
            console.log('No matching emails found');
            return false;
        }

        // Get the full message details
        const messageId = searchResponse.data.messages[0].id;
        const message = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            format: 'full'
        });

        // Extract subject and sender from headers
        const headers = message.data.payload.headers;
        const subject = headers.find(header => header.name === 'Subject')?.value;
        const from = headers.find(header => header.name === 'From')?.value;

        console.log('Found email:', {
            subject,
            from,
            date: new Date(parseInt(message.data.internalDate)).toLocaleString()
        });

        // Mark the message as read by only removing the UNREAD label
        await gmail.users.messages.modify({
            userId: 'me',
            id: messageId,
            requestBody: {
                removeLabelIds: ['UNREAD']
            }
        });

        return true;
    } catch (error) {
        console.error('Error in checkEmailForRecharge:', error.message);
        if (error.response) {
            console.error('Response error data:', error.response.data);
        }
        throw error;
    }
}

// Update handleCreditRecharge to handle errors better
async function handleCreditRecharge(email) {
    try {
        const [err, user] = await findUserByEmail(email);
        if (err) {
            console.error('Error finding user:', err);
            return;
        }

        const emailExists = await checkEmailForRecharge(email);
        if (!emailExists) {
            console.log(`No recharge email found for ${email}`);
            return;
        }

        if (!user.has_recharged) {
            await pool.promise().query(
                'UPDATE user SET credits = ?, has_recharged = ? WHERE email = ?', 
                [5, true, email]
            );
            await sendEmail(
                email, 
                'Credits Recharged', 
                'Your account has been recharged with 5 credits.'
            );
        } else {
            await sendEmail(
                email, 
                'Credit Recharge Request', 
                'Sorry, we are not offering additional credits at this time.'
            );
        }
    } catch (err) {
        console.error('Error handling credit recharge:', err);
    }
}

async function sendEmail(email,sub,text) {
    try {
       
        const transporter = nodemailer.createTransport({
            name:"nodemailer",
            service: 'gmail',
            auth: {
                user:sender,
                pass:pass
            },
            port: 3000,
            host:'smtp.gmail.com'
        });

        const mailOptions = {
            from: sender,
            to: email,
            subject:sub,
            text: text
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!', info.response);
        
    }
    catch (err) {
        console.log('Error sending email', err);
        throw err;
    }
    
};



cron.schedule('*/1 * * * *', async () => {
    try {
        console.log('Checking for recharge mail...');
        const [err, users] = await findUserWithZeroCredits();
        if (err) {
            console.error('Error finding users with zero credits:', err);
            return;
        }
        for (const user of users) {
            await handleCreditRecharge(user.email);
        }
    } catch (err) {
        console.error('Cron job error:', err);
    }
});

module.exports = {
    sendEmail,
};