// controllers/email.controller.js
const { sendMailService } = require('../services/email.service');
const { makeHtmlForContactPage } = require('../templates/contact.template');

exports.sendContactEmail = async (req, res) => {
    try {
        const { fullName, email, phone, message } = req.body;

        if (!fullName || !email || !phone || !message) {
            return res.status(400).json({
                ok: false,
                type: 'BadRequest',
                message: 'All fields are mandatory.'
            });
        }

        const payload = { fullName, email, phone, message };


        const timestamp = new Date().toLocaleString('es-DO', {
            dateStyle: 'short',
            timeStyle: 'short'
        });

        const userHtml = makeHtmlForContactPage(payload, false);
        const adminHtml = makeHtmlForContactPage(payload, true);

        await Promise.all([
            // 1. Correo para el cliente (Diverso y personalizado)
            sendMailService({
                to: email,
                subject: `🌴 We received your request - ${fullName} (${timestamp})`,
                html: userHtml,
            }),
            // 2. Correo para el administrador
            sendMailService({
                to: process.env.CONTACT_EMAIL_RECEIVER,
                subject: `📩 New Contact: ${fullName} - ${email} (${timestamp})`,
                html: adminHtml,
            })
        ]);

        return res.status(200).json({
            ok: true,
            message: 'Request successfully submitted.',
            data: null
        });

    } catch (error) {
        console.error('Error al enviar emails:', error);
        return res.status(500).json({
            ok: false,
            message: 'An error occurred while processing your request',
            type: 'ServerError',
        });
    }
};