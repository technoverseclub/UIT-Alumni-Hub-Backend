// utils/email.js

const sendEmail = async ({ to, subject, text, html }) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "Alumni Hub",
        email: "technoverseclub@gmail.com", // VERIFIED sender
      },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Brevo API error: ${err}`);
  }

  return response.json();
};

module.exports = sendEmail;

