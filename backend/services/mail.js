// services/mail.js
import { composeMail } from "../utilities/general.js";
import { FrontendURL, log, serverUrl } from "../middlewares/logger.js";
import Config from '../models/config.js'

let { APP_NAME = "BusyPilot", SENDER_MAIL = "support@busypilot.ng" } =
  process.env;

const ensureConfig = async (req) => {

  if (!req.config) {
    req.config = await Config.getConfig();
  }
};


const templates = {
  // Email verification template
  confirmation: (data) => {
    let {
      title = data.subject,
      description,
      url,
      buttonText = "Verify Account",
    } = data;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | ${APP_NAME}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      background-color: #FFF5F0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    .container {
      max-width: 560px;
      margin: 40px auto;
      background: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #FF6A00 0%, #FF8C00 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .brand-name { font-size: 24px; font-weight: 700; color: #FFFFFF; }
    .brand-name span { color: #FFD700; }
    .content { padding: 32px 28px; background: #FFFFFF; }
    .title {
      color: #111827;
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 16px;
      text-align: center;
    }
    .description {
      color: #6B7280;
      font-size: 15px;
      line-height: 1.6;
      text-align: center;
      margin-bottom: 28px;
    }
    .button-container { text-align: center; margin: 28px 0; }
    .button {
      display: inline-block;
      background: #FF6A00;
      color: #FFFFFF;
      text-decoration: none;
      padding: 12px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
    }
    .divider { height: 1px; background: #E5E7EB; margin: 24px 0; }
    .footer {
      background: #F9FAFB;
      padding: 24px 28px;
      text-align: center;
      border-top: 1px solid #E5E7EB;
    }
    .footer-text { color: #6B7280; font-size: 12px; line-height: 1.5; margin: 0; }
    .footer-links { margin-top: 12px; }
    .footer-links a {
      color: #FF6A00;
      text-decoration: none;
      font-size: 12px;
      margin: 0 8px;
    }
    @media (max-width: 600px) {
      .container { margin: 16px; border-radius: 12px; }
      .header { padding: 24px 20px; }
      .content { padding: 24px 20px; }
      .title { font-size: 20px; }
      .button { padding: 10px 28px; font-size: 14px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-name">BusyPilot<span>Bot</span></div>
    </div>
    <div class="content">
      <h1 class="title">${title}</h1>
      <p class="description">${description}</p>
      <div class="button-container">
        <a href="${url}" class="button">${buttonText}</a>
      </div>
      <div class="divider"></div>
      <p style="color: #9CA3AF; font-size: 12px; text-align: center;">If you didn't request this, please ignore this email.</p>
      <p style="color: #9CA3AF; font-size: 11px; text-align: center; margin-top: 12px;">This link expires in 24 hours.</p>
    </div>
    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      <div class="footer-links">
        <a href="${FrontendURL}">Home</a>
        <a href="${FrontendURL}/contact">Support</a>
      </div>
    </div>
  </div>
</body>
</html>`;
  },

  // Password reset template
  resetPassword: (data) => {
    let {
      title = "Reset Your Password",
      description,
      url,
      buttonText = "Reset Password",
    } = data;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | ${APP_NAME}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      background-color: #FFF5F0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    .container {
      max-width: 560px;
      margin: 40px auto;
      background: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #FF6A00 0%, #FF8C00 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .brand-name { font-size: 24px; font-weight: 700; color: #FFFFFF; }
    .brand-name span { color: #FFD700; }
    .content { padding: 32px 28px; background: #FFFFFF; }
    .title { color: #111827; font-size: 24px; font-weight: 700; margin-bottom: 16px; text-align: center; }
    .description { color: #6B7280; font-size: 15px; line-height: 1.6; text-align: center; margin-bottom: 28px; }
    .warning-box {
      background: #FFF5F0;
      border-left: 4px solid #FF6A00;
      padding: 16px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .warning-text { color: #111827; font-size: 13px; line-height: 1.5; }
    .button-container { text-align: center; margin: 28px 0; }
    .button {
      display: inline-block;
      background: #FF6A00;
      color: #FFFFFF;
      text-decoration: none;
      padding: 12px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
    }
    .divider { height: 1px; background: #E5E7EB; margin: 24px 0; }
    .footer {
      background: #F9FAFB;
      padding: 24px 28px;
      text-align: center;
      border-top: 1px solid #E5E7EB;
    }
    .footer-text { color: #6B7280; font-size: 12px; line-height: 1.5; margin: 0; }
    .footer-links { margin-top: 12px; }
    .footer-links a { color: #FF6A00; text-decoration: none; font-size: 12px; margin: 0 8px; }
    @media (max-width: 600px) {
      .container { margin: 16px; border-radius: 12px; }
      .content { padding: 24px 20px; }
      .title { font-size: 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-name">BusyPilot<span>Bot</span></div>
    </div>
    <div class="content">
      <h1 class="title">${title}</h1>
      <p class="description">${description}</p>
      <div class="warning-box">
        <p class="warning-text">🔒 For security reasons, this password reset link will expire in 24 hours. If you didn't request this, please ignore this email.</p>
      </div>
      <div class="button-container">
        <a href="${url}" class="button">${buttonText}</a>
      </div>
      <div class="divider"></div>
      <p style="color: #9CA3AF; font-size: 12px; text-align: center;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="color: #FF6A00; font-size: 11px; text-align: center; word-break: break-all;">${url}</p>
    </div>
    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      <div class="footer-links">
        <a href="${FrontendURL}">Home</a>
        <a href="${FrontendURL}/contact">Support</a>
      </div>
    </div>
  </div>
</body>
</html>`;
  },

  // Store verification template
  storeVerification: (data) => {
    let {
      title = "Store Verification",
      description,
      url,
      buttonText = "View Store",
      storeName = "",
    } = data;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | ${APP_NAME}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      background-color: #FFF5F0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    .container {
      max-width: 560px;
      margin: 40px auto;
      background: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #FF6A00 0%, #FF8C00 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .brand-name { font-size: 24px; font-weight: 700; color: #FFFFFF; }
    .brand-name span { color: #FFD700; }
    .content { padding: 32px 28px; background: #FFFFFF; }
    .title { color: #111827; font-size: 24px; font-weight: 700; margin-bottom: 16px; text-align: center; }
    .description { color: #6B7280; font-size: 15px; line-height: 1.6; text-align: center; margin-bottom: 28px; }
    .store-card {
      background: #FFF5F0;
      border: 1px solid #FFE0B3;
      border-radius: 12px;
      padding: 16px;
      margin: 20px 0;
      text-align: center;
    }
    .store-name { color: #FF6A00; font-weight: 700; font-size: 18px; }
    .button-container { text-align: center; margin: 28px 0; }
    .button {
      display: inline-block;
      background: #FF6A00;
      color: #FFFFFF;
      text-decoration: none;
      padding: 12px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
    }
    .divider { height: 1px; background: #E5E7EB; margin: 24px 0; }
    .footer {
      background: #F9FAFB;
      padding: 24px 28px;
      text-align: center;
      border-top: 1px solid #E5E7EB;
    }
    .footer-text { color: #6B7280; font-size: 12px; line-height: 1.5; margin: 0; }
    @media (max-width: 600px) {
      .container { margin: 16px; }
      .content { padding: 24px 20px; }
      .title { font-size: 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-name">BusyPilot<span>Bot</span></div>
    </div>
    <div class="content">
      <h1 class="title">${title}</h1>
      ${storeName ? `<div class="store-card"><div class="store-name">${storeName}</div></div>` : ""}
      <p class="description">${description}</p>
      <div class="button-container">
        <a href="${url}" class="button">${buttonText}</a>
      </div>
      <div class="divider"></div>
      <p style="color: #9CA3AF; font-size: 12px; text-align: center;">Thank you for choosing ${APP_NAME} for your business!</p>
    </div>
    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
  },

  // Welcome email template
  welcome: (data) => {
    let {
      title = "Welcome to BusyPilot",
      description,
      url,
      buttonText = "Go to Dashboard",
      userName = "",
    } = data;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | ${APP_NAME}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      background-color: #FFF5F0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    .container {
      max-width: 560px;
      margin: 40px auto;
      background: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #FF6A00 0%, #FF8C00 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .brand-name { font-size: 24px; font-weight: 700; color: #FFFFFF; }
    .brand-name span { color: #FFD700; }
    .content { padding: 32px 28px; background: #FFFFFF; }
    .title { color: #111827; font-size: 24px; font-weight: 700; margin-bottom: 16px; text-align: center; }
    .description { color: #6B7280; font-size: 15px; line-height: 1.6; text-align: center; margin-bottom: 28px; }
    .features {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin: 24px 0;
      justify-content: center;
    }
    .feature {
      background: #FFF5F0;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 13px;
      color: #FF6A00;
    }
    .button-container { text-align: center; margin: 28px 0; }
    .button {
      display: inline-block;
      background: #FF6A00;
      color: #FFFFFF;
      text-decoration: none;
      padding: 12px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
    }
    .footer {
      background: #F9FAFB;
      padding: 24px 28px;
      text-align: center;
      border-top: 1px solid #E5E7EB;
    }
    .footer-text { color: #6B7280; font-size: 12px; line-height: 1.5; margin: 0; }
    @media (max-width: 600px) {
      .container { margin: 16px; }
      .content { padding: 24px 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-name">BusyPilot<span>Bot</span></div>
    </div>
    <div class="content">
      <h1 class="title">${title}</h1>
      <p class="description">${description}</p>
      <div class="features">
        <span class="feature">🤖 WhatsApp Bot</span>
        <span class="feature">📊 Analytics</span>
        <span class="feature">💰 Payments</span>
        <span class="feature">🚀 24/7 Support</span>
      </div>
      <div class="button-container">
        <a href="${url}" class="button">${buttonText}</a>
      </div>
    </div>
    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
  },

  // General message template
  message: (data) => {
    const {
      title = "Notification",
      description = "Please wait while we redirect you...",
      redirectTime = 3000,
      redirect = "/",
    } = data;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="${redirectTime / 1000}; url=${redirect}">
  <title>${title} | ${APP_NAME}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: linear-gradient(135deg, #FF6A00 0%, #FF8C00 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 48px 40px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }
    .logo { font-size: 56px; margin-bottom: 20px; }
    .title { font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 16px; }
    .description { font-size: 15px; color: #6B7280; line-height: 1.6; margin-bottom: 24px; }
    .icon { width: 64px; height: 64px; margin: 0 auto 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .icon-success { background: #D1FAE5; }
    .icon-success svg { color: #10B981; }
    .icon-error { background: #FEF2F2; }
    .icon-error svg { color: #EF4444; }
    .icon-info { background: #FFF5F0; }
    .icon-info svg { color: #FF6A00; }
    .redirect-text { font-size: 13px; color: #6B7280; margin-top: 24px; }
    .redirect-link { color: #FF6A00; text-decoration: none; font-weight: 500; }
    .footer { margin-top: 28px; padding-top: 20px; border-top: 1px solid #F3F4F6; font-size: 11px; color: #9CA3AF; }
    .footer-brand { color: #FF6A00; font-weight: 600; }
    @media (max-width: 480px) {
      .card { padding: 32px 24px; }
      .title { font-size: 20px; }
      .logo { font-size: 48px; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🤖</div>
    <h1 class="title">${title}</h1>
    <div class="description">${description}</div>
    ${title.toLowerCase().includes("success") ||
        title.toLowerCase().includes("welcome") ||
        title.toLowerCase().includes("verified")
        ? `
    <div class="icon icon-success">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>`
        : ""
      }
    ${title.toLowerCase().includes("error") ||
        title.toLowerCase().includes("failed")
        ? `
    <div class="icon icon-error">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    </div>`
        : ""
      }
    ${redirect && redirect !== "false" && redirect !== "null"
        ? `
    <div class="redirect-text">
      Redirecting in ${redirectTime / 1000} seconds...<br>
      <a href="${redirect}" class="redirect-link">Click here if not redirected</a>
    </div>`
        : ""
      }
    <div class="footer">
      <span class="footer-brand">${APP_NAME}</span> - WhatsApp Bot for Your Business
    </div>
  </div>
  <script>
    const redirectUrl = '${redirect}';
    const delay = ${redirectTime};
    if (redirectUrl && redirectUrl !== 'false' && redirectUrl !== 'null' && redirectUrl !== '') {
      setTimeout(() => { window.location.href = redirectUrl; }, delay);
    }
  </script>
</body>
</html>`;
  },
};

const sendMail = async (data = {}, req, cb = () => null) => {
  try {
    await ensureConfig(req);

    SENDER_MAIL = req.config?.mail?.senderEmail || process.env?.SENDER_MAIL;

    const defaultData = {
      subject: `Verify Your ${APP_NAME} Account`,
      template: "confirmation",
      buttonText: "Verify Account",
      description: `Thank you for choosing ${APP_NAME}! Please click the button below to verify your email address and complete your registration.`,
      req,
      email: SENDER_MAIL,
      mail: data.email || SENDER_MAIL,
      url: `${serverUrl}/api/user/verify?token=${req.token}&type=email`,
    };

    data = { ...defaultData, ...data };

    if (typeof data.email !== "string") {
      data = { ...data, bcc: data.email };
    }

    const template = templates[data.template](data);
    const sent = await composeMail(
      req,
      data.mail,
      data.subject,
      template,
      data,
    );


    cb(sent);
  } catch (er) {
    log(er, "bad");
    cb(false);
  }
};

export { sendMail, templates };
