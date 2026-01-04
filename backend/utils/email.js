const axios = require("axios");

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const res = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Alumni Hub",
          email: "technoverseclub@gmail.com", // verified sender
        },
        to: [{ email: to }],
        subject,
        textContent: text,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
          accept: "application/json",
        },
        timeout: 10000,
      }
    );

    return res.data;
  } catch (err) {
    console.error("BREVO API ERROR:", err.response?.data || err.message);
    throw err;
  }
};

module.exports = sendEmail;

