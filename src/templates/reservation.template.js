// src/templates/reservation.template.js
const { COMPANY_INFO } = require('../constants/constants');
const { RESERVATION_STATUS_LABELS } = require('../constants/reservation.constants');

const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const formatMoney = (n) => `$${Number(n).toFixed(2)}`;

// ============================================================
// EMAIL AL CLIENTE (factura)
// ============================================================
const makeHtmlForReservationClient = (reservation) => {
    const { bookingCode, excursionSnapshot, shift, reservationDate, guests, pricing, customer, logistics } = reservation;
    const shiftLabel = { morning: 'Morning', afternoon: 'Afternoon', night: 'Night' }[shift] || shift;

    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>Your Reservation - ${bookingCode}</title></head>
    <body style="font-family: Arial, sans-serif; background: #f0f2ed; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(145deg, #2a4a2a, #1a3a1a); color: #fff; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">${COMPANY_INFO.name}</h1>
          <p style="margin: 6px 0 0 0; opacity: 0.85;">Reservation Confirmed</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #2a4a2a; margin-top: 0;">Hi ${customer.fullName},</h2>
          <p>Thank you for booking with us! Your reservation is <strong>confirmed</strong>.</p>

          <div style="background: #f7f9f5; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 6px 0;"><strong>Booking Code:</strong> <span style="color: #d4a84d; font-size: 20px; font-weight: bold;">${bookingCode}</span></p>
            <p style="margin: 6px 0;"><strong>Excursion:</strong> ${excursionSnapshot.name}</p>
            <p style="margin: 6px 0;"><strong>Date:</strong> ${formatDate(reservationDate)}</p>
            <p style="margin: 6px 0;"><strong>Shift:</strong> ${shiftLabel}</p>
            <p style="margin: 6px 0;"><strong>Duration:</strong> ${excursionSnapshot.durationLabel}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f7f9f5;">
              <th style="padding: 8px; text-align: left;">Description</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Unit</th>
              <th style="padding: 8px; text-align: right;">Subtotal</th>
            </tr>
            ${guests.adults > 0 ? `
            <tr>
              <td style="padding: 8px;">Adults</td>
              <td style="padding: 8px; text-align: center;">${guests.adults}</td>
              <td style="padding: 8px; text-align: right;">${formatMoney(pricing.adultUnitPrice)}</td>
              <td style="padding: 8px; text-align: right;">${formatMoney(pricing.adultsSubtotal)}</td>
            </tr>` : ''}
            ${guests.children > 0 ? `
            <tr>
              <td style="padding: 8px;">Children</td>
              <td style="padding: 8px; text-align: center;">${guests.children}</td>
              <td style="padding: 8px; text-align: right;">${formatMoney(pricing.childUnitPrice)}</td>
              <td style="padding: 8px; text-align: right;">${formatMoney(pricing.childrenSubtotal)}</td>
            </tr>` : ''}
            ${guests.infants > 0 ? `
            <tr>
              <td style="padding: 8px;">Infants (free)</td>
              <td style="padding: 8px; text-align: center;">${guests.infants}</td>
              <td style="padding: 8px; text-align: right;">${formatMoney(0)}</td>
              <td style="padding: 8px; text-align: right;">${formatMoney(0)}</td>
            </tr>` : ''}
            <tr style="border-top: 2px solid #2a4a2a;">
              <td colspan="3" style="padding: 12px 8px; text-align: right; font-size: 18px;"><strong>TOTAL</strong></td>
              <td style="padding: 12px 8px; text-align: right; font-size: 18px; color: #d4a84d;"><strong>${formatMoney(pricing.total)}</strong></td>
            </tr>
          </table>

          ${logistics.hotelName ? `<p><strong>Pickup at:</strong> ${logistics.hotelName}${logistics.roomNumber ? ` - Room ${logistics.roomNumber}` : ''}</p>` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://wa.me/${COMPANY_INFO.whatsapp}?text=Hi,%20I%20have%20a%20question%20about%20booking%20${bookingCode}"
               style="display: inline-block; background: #d4a84d; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: bold;">
              💬 Contact us on WhatsApp
            </a>
          </div>

          <p style="font-size: 12px; color: #6a7a6a; text-align: center;">
            We'll contact you within 24 hours to confirm pickup details.
          </p>
        </div>
        <div style="background: #1a2a1a; color: #8a9a8a; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;"><strong style="color: #fff;">${COMPANY_INFO.name}</strong></p>
          <p style="margin: 6px 0 0 0;">${COMPANY_INFO.address} · ${COMPANY_INFO.phone}</p>
          <p style="margin: 6px 0 0 0;">&copy; ${new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
};

// ============================================================
// EMAIL AL ADMIN (notificación + tabla)
// ============================================================
const makeHtmlForReservationAdmin = (reservation) => {
    const { bookingCode, excursionSnapshot, shift, reservationDate, guests, pricing, customer, logistics } = reservation;
    const shiftLabel = { morning: 'Morning', afternoon: 'Afternoon', night: 'Night' }[shift] || shift;

    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>New Reservation</title></head>
    <body style="font-family: Arial, sans-serif; background: #f0f2ed; padding: 20px;">
      <div style="max-width: 700px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden;">
        <div style="background: #2a4a2a; color: #fff; padding: 20px 30px;">
          <h1 style="margin: 0; font-size: 22px;">🔔 New Reservation - ${bookingCode}</h1>
        </div>
        <div style="padding: 30px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 6px 0; width: 140px;"><strong>Code</strong></td><td>${bookingCode}</td></tr>
            <tr><td style="padding: 6px 0;"><strong>Excursion</strong></td><td>${excursionSnapshot.name}</td></tr>
            <tr><td style="padding: 6px 0;"><strong>Date</strong></td><td>${formatDate(reservationDate)}</td></tr>
            <tr><td style="padding: 6px 0;"><strong>Shift</strong></td><td>${shiftLabel}</td></tr>
            <tr><td style="padding: 6px 0;"><strong>Status</strong></td><td><span style="background: #fff3cd; color: #856404; padding: 2px 8px; border-radius: 4px;">${RESERVATION_STATUS_LABELS[reservation.status] || reservation.status}</span></td></tr>
          </table>

          <h3 style="color: #2a4a2a; border-bottom: 2px solid #d4a84d; padding-bottom: 6px;">👤 Customer</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 6px 0; width: 140px;"><strong>Name</strong></td><td>${customer.fullName}</td></tr>
            <tr><td style="padding: 6px 0;"><strong>Email</strong></td><td><a href="mailto:${customer.email}">${customer.email}</a></td></tr>
            <tr><td style="padding: 6px 0;"><strong>Phone</strong></td><td><a href="https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}">${customer.phone}</a></td></tr>
            ${customer.country ? `<tr><td style="padding: 6px 0;"><strong>Country</strong></td><td>${customer.country}</td></tr>` : ''}
            ${logistics.hotelName ? `<tr><td style="padding: 6px 0;"><strong>Hotel</strong></td><td>${logistics.hotelName}${logistics.roomNumber ? ` - Room ${logistics.roomNumber}` : ''}</td></tr>` : ''}
            ${logistics.specialRequests ? `<tr><td style="padding: 6px 0;"><strong>Requests</strong></td><td>${logistics.specialRequests}</td></tr>` : ''}
          </table>

          <h3 style="color: #2a4a2a; border-bottom: 2px solid #d4a84d; padding-bottom: 6px;">👥 Guests & Pricing</h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #e0e0e0;">
            <tr style="background: #f7f9f5;">
              <th style="padding: 8px; text-align: left;">Category</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Unit</th>
              <th style="padding: 8px; text-align: right;">Subtotal</th>
            </tr>
            <tr><td style="padding: 8px;">Adults</td><td style="padding: 8px; text-align: center;">${guests.adults}</td><td style="padding: 8px; text-align: right;">${formatMoney(pricing.adultUnitPrice)}</td><td style="padding: 8px; text-align: right;">${formatMoney(pricing.adultsSubtotal)}</td></tr>
            ${guests.children > 0 ? `<tr><td style="padding: 8px;">Children</td><td style="padding: 8px; text-align: center;">${guests.children}</td><td style="padding: 8px; text-align: right;">${formatMoney(pricing.childUnitPrice)}</td><td style="padding: 8px; text-align: right;">${formatMoney(pricing.childrenSubtotal)}</td></tr>` : ''}
            ${guests.infants > 0 ? `<tr><td style="padding: 8px;">Infants</td><td style="padding: 8px; text-align: center;">${guests.infants}</td><td style="padding: 8px; text-align: right;">$0.00</td><td style="padding: 8px; text-align: right;">$0.00</td></tr>` : ''}
            <tr style="border-top: 2px solid #2a4a2a; background: #f0f2ed;">
              <td colspan="3" style="padding: 10px; text-align: right; font-size: 16px;"><strong>TOTAL</strong></td>
              <td style="padding: 10px; text-align: right; font-size: 16px; color: #d4a84d;"><strong>${formatMoney(pricing.total)}</strong></td>
            </tr>
          </table>

          <div style="margin-top: 30px; text-align: center;">
            <a href="https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}?text=Hi%20${customer.fullName},%20about%20your%20booking%20${bookingCode}"
               style="display: inline-block; background: #25D366; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 50px; font-weight: bold;">
              💬 Contact Customer
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
};

module.exports = { makeHtmlForReservationClient, makeHtmlForReservationAdmin };