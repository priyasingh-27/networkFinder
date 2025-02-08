require('dotenv').config();
const sender = process.env.SENDER;
const pass = process.env.PASS;
const nodemailer = require('nodemailer');

async function sendEmail(email) {
    try {
        // const otp = OTP;
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
            subject: 'Get Free Credits',
            text: `Please sent new email with ${email} by mentioning in the subject "recharge 5 credits"  to get credits`
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!', info.response);
        
    }
    catch (err) {
        console.log('Error sending email', err);
        throw err;
    }
    
};

module.exports = {
    sendEmail
};