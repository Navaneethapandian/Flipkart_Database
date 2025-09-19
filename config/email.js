const nodemailer = require('nodemailer');
require('dotenv').config(); // fixed

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_PASS, // use App Password
    }
});

const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: 'navaneethapandiants@gmail.com',
        to: to,
        subject,
        text
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (err) {
        console.error(err);
        console.log('Error sending Email');
    }
};

module.exports = { sendEmail };
