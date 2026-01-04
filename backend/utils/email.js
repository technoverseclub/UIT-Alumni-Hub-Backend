const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: Number(process.env.BREVO_SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
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



