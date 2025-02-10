const {findUserWithZeroCredits, findUserByEmail}=require('../repository/user.repository');
const nodemailer = require('nodemailer');
require('dotenv').config();
const {google}=require('googleapis');
const cron =require('node-cron');
const { pool } = require('../db/dbConfig');

const sender = process.env.SENDER;
const pass = process.env.PASS;
const GMAIL_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.CLIENT_SECRET;
const GMAIL_REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const GMAIL_REDIRECT_URI = 'https://developers.google.com/oauthplayground';

const oAuth2Client= new google.auth.OAuth2(
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    GMAIL_REDIRECT_URI
);

oAuth2Client.setCredentials({refresh_token: GMAIL_REFRESH_TOKEN});

async function checkEmailForRecharge(userEmail){
    try {
        const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
        
        const response = await gmail.users.messages.list({
          userId: 'me',
          q: `subject:"recharge 5 credits" from:${userEmail}`,
          maxResults: 1
        });
    
        if (response.data.messages && response.data.messages.length > 0) {
            const messageId = response.data.messages[0].id;
          // Get the full message details
            const message = await gmail.users.messages.get({
                userId: 'me',
                id: messageId,
                format: 'full'
            });

            console.log('Message labels before:', message.data.labelIds);
    

            await gmail.users.messages.modify({
              userId: 'me',
              id: messageId,
              requestBody: {
                removeLabelIds: ['UNREAD'],
                addLabelIds: ['READ']
              }
            });
            
            // Verify the change
            const updatedMessage = await gmail.users.messages.get({
                userId: 'me',
                id: messageId
            });
            console.log('Message labels after:', updatedMessage.data.labelIds);

            return true; 
          
        }
        
        return false; 
      } catch (error) {
        console.error('Error checking email:', error);
        throw error;
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

async function handleCreditRecharge(email) {
    try{
        const [err,user]=await findUserByEmail(email);
        if (err) {
            if (err.code == 404) return notFoundResponse(res, 'User Not Found');
            if (err.code == 500) return serverErrorResponse(res, 'Internal server error');
        }
        if(!user.has_recharged){
            await pool.promise().query('UPDATE user SET credits = ?, has_recharged=? WHERE email = ?', [5, true ,email]);
            await sendEmail(email, 'Credits Recharged', 'Your account has been recharged with 5 credits.');

        }else{
            await sendEmail(email, 'Credit Recharge Request', 'Sorry, we are not offering additional credits at this time.');
        }
    }catch(err){
        console.log('Error handling credit recharge: ',err);
    }
}

cron.schedule('*/3 * * * *',async()=>{
    try{
        console.log('Checking for recharge mail...');
        const [err,users]=await findUserWithZeroCredits();
        if (err) {
            if (err.code == 404) return notFoundResponse(res, 'User Not Found');
            if (err.code == 500) return serverErrorResponse(res, 'Internal server error');
        }
        for(const user of users){
            await handleCreditRecharge(user.email);
        }
    }catch(err){
        console.log(err);
    }
})

module.exports = {
    sendEmail,
};