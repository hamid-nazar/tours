const nodemailer = require("nodemailer");



async function sendEmail({ email, subject, message}) {

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: subject,
        text: message
    };

    await transporter.sendMail(mailOptions);
}


module.exports = sendEmail