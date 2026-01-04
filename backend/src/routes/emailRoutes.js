const express = require("express");
const router = express.Router();
const sendEmail = require("../../utils/email");

router.post("/test", async (req, res) => {
  try {
    const { email } = req.body;

    await sendEmail({
      to: email,
      subject: "Brevo SMTP Test",
      text: "Brevo SMTP is working 🚀",
    });

    res.json({ message: "Email sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Email failed" });
  }
});

module.exports = router;
