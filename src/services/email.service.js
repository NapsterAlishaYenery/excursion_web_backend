// services/email.service.js
const transporter = require('../config/email.config');
const { COMPANY_INFO } = require('../constants/constants');

const sendMailService = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: `"${COMPANY_INFO.name}" <${process.env.EMAIL_SENDER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return info;

  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error.message);
    throw new Error('Failed to send email');
  }
};

module.exports = { sendMailService };