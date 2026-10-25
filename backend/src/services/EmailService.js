const { Notificacao } = require('../models');

let transporter = null;
if (process.env.SMTP_HOST) {
  const nodemailer = require('nodemailer');
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

/**
 * Envia e-mail. Se SMTP_HOST estiver configurado, envia de verdade via nodemailer;
 * em qualquer caso registra a notificação no banco (visível na "Caixa de E-mails" do portal).
 */
async function enviarEmail({ para, assunto, html, id_usuario = null }) {
  let enviado = false;
  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'Moeda Estudantil <no-reply@moedaestudantil.com>',
        to: para, subject: assunto, html
      });
      enviado = true;
    } catch (err) {
      console.error('⚠️ Falha ao enviar e-mail via SMTP:', err.message);
    }
  }
  console.log(`📧 E-mail ${enviado ? 'enviado' : 'registrado'} -> ${para}: ${assunto}`);
  return Notificacao.create({ destinatario: para, assunto, corpo: html, enviado_smtp: enviado, id_usuario });
}

module.exports = { enviarEmail };
