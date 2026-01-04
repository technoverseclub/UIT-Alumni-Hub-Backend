const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: Number(process.env.BREVO_SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
    tls: {
    rejectUnauthorized: false, // 👈 IMPORTANT for Render
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

const sendEmail = async ({ to, subject, text, html }) => {
  return await transporter.sendMail({
    from: '"Alumni Hub" <technoverseclub@gmail.com>', // Brevo verified sender
    to,
    subject,
    text,
    html,
  });
};

module.exports = sendEmail;




