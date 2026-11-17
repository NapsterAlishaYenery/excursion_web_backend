// templates/contact.template.js
const { COMPANY_INFO } = require('../constants/constants');

const makeHtmlForContactPage = (data, isAdmin = false) => {
  const { fullName, email, phone, message } = data;

  // ========================================
  // Títulos y textos según destinatario
  // ========================================
  const titleHeader = isAdmin
    ? "📩 New Contact Message"
    : `🌴 Hi, ${fullName}!`;

  const subTitleHeader = isAdmin
    ? "You have received a new inquiry from the website"
    : "Thank you for reaching out to us";

  const mainGreeting = isAdmin
    ? `A new contact message has been received with the following details:`
    : `Thank you for contacting <strong>${COMPANY_INFO.name}</strong>. Your message has been received successfully and our team will get back to you as soon as possible.`;

  const actionButtonText = isAdmin
    ? "💬 Contact Client via WhatsApp"
    : "💬 Contact Us via WhatsApp";

  const actionButtonLink = isAdmin
    ? `https://wa.me/${phone.replace(/[^0-9]/g, '')}`
    : `https://wa.me/${COMPANY_INFO.whatsapp}`;

  const footerMessage = isAdmin
    ? "Please respond to this client as soon as possible."
    : "We will get back to you within 24 hours.";

  // ========================================
  // HTML
  // ========================================
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${COMPANY_INFO.name}</title>
    <style>
      /* ========================================
         RESET & BASE
         ======================================== */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 0;
        background: #f0f2ed;
        font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        color: #1a2a1a;
        -webkit-font-smoothing: antialiased;
      }

      .wrapper {
        width: 100%;
        background: linear-gradient(180deg, #f0f2ed 0%, #e6e9e0 100%);
        padding: 50px 20px;
      }

      .main-card {
        max-width: 600px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(26, 42, 26, 0.10);
        border: 1px solid rgba(197, 160, 89, 0.15);
      }

      /* ========================================
         HEADER - TROPICAL / TURISMO
         ======================================== */
      .header {
        background: linear-gradient(145deg, #2a4a2a 0%, #1a3a1a 100%);
        padding: 40px 30px 30px 30px;
        text-align: center;
        position: relative;
        overflow: hidden;
      }

      /* Decoración tropical */
      .header::before {
        content: '🌴🌊☀️';
        position: absolute;
        top: -10px;
        right: -10px;
        font-size: 60px;
        opacity: 0.06;
        letter-spacing: 10px;
        pointer-events: none;
        transform: rotate(15deg);
      }

      .header::after {
        content: '🌴🌊☀️';
        position: absolute;
        bottom: -20px;
        left: -20px;
        font-size: 50px;
        opacity: 0.05;
        letter-spacing: 8px;
        pointer-events: none;
        transform: rotate(-10deg);
      }

      .logo-wrapper {
        position: relative;
        z-index: 1;
        display: inline-block;
      }

      .logo {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #d4a84d;
        box-shadow: 0 4px 20px rgba(212, 168, 77, 0.30);
        transition: transform 0.3s ease;
      }

      .brand-title {
        margin: 14px 0 0 0;
        font-size: 28px;
        font-weight: 800;
        letter-spacing: 1.5px;
        color: #ffffff;
        position: relative;
        z-index: 1;
        text-shadow: 0 2px 10px rgba(0,0,0,0.15);
      }

      .brand-slogan {
        margin: 4px 0 0 0;
        font-size: 13px;
        font-weight: 400;
        color: rgba(255,255,255,0.80);
        letter-spacing: 2px;
        text-transform: uppercase;
        position: relative;
        z-index: 1;
      }

      .brand-slogan span {
        color: #d4a84d;
        font-weight: 600;
      }

      /* ========================================
         CONTENT
         ======================================== */
      .content {
        padding: 35px 30px 25px 30px;
      }

      .headline {
        font-size: 22px;
        font-weight: 700;
        color: #2a4a2a;
        margin-top: 0;
        margin-bottom: 4px;
      }

      .subheadline {
        font-size: 14px;
        color: #6a7a6a;
        margin-top: 0;
        margin-bottom: 18px;
        font-weight: 400;
      }

      .paragraph {
        font-size: 15px;
        line-height: 1.7;
        color: #3a4a3a;
        margin-bottom: 20px;
      }

      .paragraph strong {
        color: #2a4a2a;
      }

      /* ========================================
         DETAILS CARD
         ======================================== */
      .details-card {
        background: #f7f9f5;
        border-radius: 16px;
        border: 1px solid #e8ece4;
        padding: 20px 22px;
        margin-bottom: 25px;
      }

      .detail-row {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 14px;
        font-size: 14px;
        color: #2a3a2a;
        line-height: 1.5;
      }

      .detail-row:last-child {
        margin-bottom: 0;
      }

      .detail-icon {
        font-size: 18px;
        min-width: 28px;
        text-align: center;
        color: #d4a84d;
      }

      .detail-label {
        font-weight: 600;
        color: #2a4a2a;
        min-width: 80px;
      }

      .detail-value {
        color: #3a4a3a;
        word-break: break-word;
      }

      /* ========================================
         BUTTON
         ======================================== */
      .btn-container {
        text-align: center;
        margin: 20px 0 10px 0;
      }

      .btn {
        display: inline-block;
        background: linear-gradient(145deg, #d4a84d 0%, #c49a3d 100%);
        color: #ffffff !important;
        text-decoration: none;
        padding: 14px 32px;
        border-radius: 50px;
        font-weight: 700;
        font-size: 15px;
        letter-spacing: 0.5px;
        box-shadow: 0 6px 24px rgba(212, 168, 77, 0.35);
        transition: all 0.3s ease;
      }

      .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 32px rgba(212, 168, 77, 0.45);
      }

      /* ========================================
         FOOTER - Tropical
         ======================================== */
      .footer {
        background: #1a2a1a;
        padding: 28px 24px 24px 24px;
        text-align: center;
        color: #8a9a8a;
        font-size: 12px;
        line-height: 1.7;
      }

      .footer .footer-brand {
        color: #ffffff;
        font-weight: 700;
        font-size: 14px;
        letter-spacing: 0.5px;
      }

      .footer .footer-brand span {
        color: #d4a84d;
      }

      .footer-divider {
        height: 1px;
        background: rgba(255,255,255,0.06);
        margin: 14px auto;
        width: 50%;
      }

      .footer-message {
        color: #b0c0b0;
        font-size: 12px;
        font-style: italic;
      }

      .footer-social {
        margin-top: 12px;
        font-size: 18px;
        letter-spacing: 6px;
      }

      /* ========================================
         RESPONSIVE
         ======================================== */
      @media (max-width: 600px) {
        .wrapper {
          padding: 30px 12px;
        }

        .main-card {
          border-radius: 16px;
        }

        .header {
          padding: 30px 20px 24px 20px;
        }

        .logo {
          width: 80px;
          height: 80px;
        }

        .brand-title {
          font-size: 22px;
        }

        .brand-slogan {
          font-size: 11px;
        }

        .content {
          padding: 25px 18px 20px 18px;
        }

        .headline {
          font-size: 19px;
        }

        .subheadline {
          font-size: 13px;
        }

        .paragraph {
          font-size: 14px;
        }

        .detail-row {
          font-size: 13px;
          flex-wrap: wrap;
          gap: 4px;
        }

        .detail-label {
          min-width: 70px;
        }

        .btn {
          padding: 12px 24px;
          font-size: 14px;
          width: 100%;
          text-align: center;
        }

        .footer {
          padding: 20px 16px;
          font-size: 11px;
        }

        .header::before,
        .header::after {
          font-size: 40px;
        }
      }

      @media (max-width: 400px) {
        .brand-title {
          font-size: 18px;
        }

        .logo {
          width: 68px;
          height: 68px;
        }

        .headline {
          font-size: 17px;
        }

        .details-card {
          padding: 14px 14px;
        }

        .detail-row {
          font-size: 12px;
        }

        .detail-label {
          min-width: 60px;
        }
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="main-card">

        <!-- ========================================
             HEADER
             ======================================== -->
        <div class="header">
          <div class="logo-wrapper">
            <img
              src="${COMPANY_INFO.logoUrl}"
              alt="${COMPANY_INFO.name}"
              class="logo"
            >
          </div>
          <h1 class="brand-title">${COMPANY_INFO.name}</h1>
          <p class="brand-slogan">🌴 <span>Explore</span> · <span>Enjoy</span> · <span>Experience</span> 🌊</p>
        </div>

        <!-- ========================================
             CONTENT
             ======================================== -->
        <div class="content">
          <h2 class="headline">${titleHeader}</h2>
          <p class="subheadline">${subTitleHeader}</p>

          <p class="paragraph">${mainGreeting}</p>

          <!-- ========================================
               DETAILS CARD
               ======================================== -->
          <div class="details-card">
            <div class="detail-row">
              <span class="detail-icon">👤</span>
              <span class="detail-label">Name:</span>
              <span class="detail-value">${fullName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-icon">✉️</span>
              <span class="detail-label">Email:</span>
              <span class="detail-value">${email}</span>
            </div>
            <div class="detail-row">
              <span class="detail-icon">📞</span>
              <span class="detail-label">Phone:</span>
              <span class="detail-value">${phone}</span>
            </div>
            <div class="detail-row">
              <span class="detail-icon">📝</span>
              <span class="detail-label">Message:</span>
              <span class="detail-value">${message}</span>
            </div>
          </div>

          <!-- ========================================
               BUTTON
               ======================================== -->
          <div class="btn-container">
            <a href="${actionButtonLink}" class="btn" target="_blank">
              ${actionButtonText}
            </a>
          </div>
        </div>

        <!-- ========================================
             FOOTER
             ======================================== -->
        <div class="footer">
          <p class="footer-brand">
            ${COMPANY_INFO.name} <span>✦</span> Tours & Excursions
          </p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #8a9a8a;">
            ${COMPANY_INFO.address} · ${COMPANY_INFO.phone}
          </p>

          <div class="footer-divider"></div>

          <p class="footer-message">${footerMessage}</p>
          <p style="margin: 6px 0 0 0; font-size: 11px; color: #5a6a5a;">
            📧 ${COMPANY_INFO.email}
          </p>

          <div class="footer-social">
            🌴 🌊 ☀️ 🏝️
          </div>

          <p style="margin: 12px 0 0 0; font-size: 10px; color: #4a5a4a;">
            &copy; ${new Date().getFullYear()} ${COMPANY_INFO.name}. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  </body>
  </html>
  `;
};

module.exports = { makeHtmlForContactPage };