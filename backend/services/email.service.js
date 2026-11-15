import nodemailer from 'nodemailer';
import env from '../config/env.js';

let transporter = null;

if (env.smtp.host && env.smtp.user) {
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: { user: env.smtp.user, pass: env.smtp.pass }
  });
}

export async function sendEmail({ to, subject, text, html }) {
  if (!transporter) {
    console.log(`[email-mock] To: ${to} | Subject: ${subject}`);
    return { success: true, mock: true };
  }
  try {
    const info = await transporter.sendMail({
      from: env.smtp.from,
      to, subject, text, html
    });
    return { success: true, info };
  } catch (err) {
    console.error('[email] Failed:', err.message);
    throw err;
  }
}
