// services/sms.js
import axios from "axios";
import { log } from "../middlewares/logger.js";
import Config from "../models/config.js";

/**
 * Ensures req.config is populated
 */
const ensureConfig = async (req) => {
  if (!req.config) {
    console.log(req.config)
    req.config = await Config.getConfig();
  }
};

// Configuration - store these in your .env file

const SMS_CONFIG = (req) => {
  return {
    username: req.config?.sms?.username || process.env.SMS_USERNAME,
    apikey: req.config?.apiKeys?.sms || process.env.SMS_APIKEY,
    sender: req.config?.sms?.senderName || process.env.SMS_SENDER,
    apiUrl: "https://api.ebulksms.com/sendsms.json",
    balanceUrl: "https://api.ebulksms.com/balance",
  };
};

// Helper to generate unique message ID
const generateMsgId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Format phone number to international format
const formatPhoneNumber = (phone) => {
  let cleaned = phone.toString().replace(/\D/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "234" + cleaned.substring(1);
  } else if (!cleaned.startsWith("234")) {
    cleaned = "234" + cleaned;
  }

  return cleaned;
};

// Send single SMS
export const sendSMS = async (req, phone, message, options = {}) => {
  await ensureConfig(req);
  try {
    const formattedPhone = formatPhoneNumber(phone);
    const msgId = options.msgId || generateMsgId();

    const payload = {
      SMS: {
        auth: {
          username: SMS_CONFIG(req).username,
          apikey: SMS_CONFIG(req).apikey,
        },
        message: {
          sender: options.sender || SMS_CONFIG(req).sender,
          messagetext: message,
          flash: options.flash ? "1" : "0",
        },
        recipients: {
          gsm: [
            {
              msidn: formattedPhone,
              msgid: msgId,
            },
          ],
        },
        dndsender: "1", // options.dndsender i put one so it works for nigerians
      },
    };

    log(
      `Sending SMS to ${formattedPhone}: ${message.substring(0, 50)}...`,
      "info",
    );

    const response = await axios.post(SMS_CONFIG(req).apiUrl, payload, {
      headers: { "Content-Type": "application/json" },
    });


    const success = response.data?.response?.status === "SUCCESS";

    if (success) {
      log(
        `SMS sent successfully to ${formattedPhone}, MsgID: ${msgId}`,
        "info",
      );
    } else {
      log(
        `SMS failed to ${formattedPhone}: ${response.data?.response?.status}`,
        "error",
      );
    }

    return {
      success,
      data: response.data,
      messageId: msgId,
      phone: formattedPhone,
    };
  } catch (error) {
    log(`SMS send error: ${error.message}`, "error");
    return {
      success: false,
      error: error.response?.data || error.message,
      phone,
    };
  }
};

// Send bulk SMS to multiple recipients
export const sendBulkSMS = async (req, recipients, message, options = {}) => {
  await ensureConfig(req);
  try {
    const gsmList = recipients.map((recipient) => ({
      msidn: formatPhoneNumber(recipient.phone),
      msgid: recipient.msgId || generateMsgId(),
    }));

    const payload = {
      SMS: {
        auth: {
          username: SMS_CONFIG(req).username,
          apikey: SMS_CONFIG(req).apikey,
        },
        message: {
          sender: options.sender || SMS_CONFIG(req).sender,
          messagetext: message,
          flash: options.flash ? "1" : "0",
        },
        recipients: { gsm: gsmList },
        dndsender: options.dndsender || "0",
      },
    };

    log(`Sending bulk SMS to ${recipients.length} recipients`, "info");

    const response = await axios.post(SMS_CONFIG(req).apiUrl, payload, {
      headers: { "Content-Type": "application/json" },
    });


    const success = response.data?.response?.status === "SUCCESS";

    if (success) {
      log(
        `Bulk SMS sent successfully to ${response.data?.response?.totalsent} recipients`,
        "info",
      );
    } else {
      log(`Bulk SMS failed: ${response.data?.response?.status}`, "error");
    }

    return {
      success,
      data: response.data,
      totalSent: response.data?.response?.totalsent || 0,
      cost: response.data?.response?.cost || 0,
    };
  } catch (error) {
    log(`Bulk SMS error: ${error.message}`, "error");
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};

// Send SMS to all users
export const sendSMSToUsers = async (req, users, message, options = {}) => {
  const recipients = users.map((user) => ({
    phone: user.phone,
    msgId: generateMsgId(),
  }));

  return await sendBulkSMS(req, recipients, message, options);
};

// Send SMS to store owner
export const notifyStoreOwner = async (req, store, message) => {
  return await sendSMS(req, store.phone, message, { sender: "BusyPilot" });
};

// Send order confirmation SMS
export const sendOrderConfirmation = async (req, customerPhone, orderDetails) => {
  const message = `Order Confirmed! #${orderDetails.orderNumber}\nTotal: ₦${orderDetails.totalAmount}\nWe'll notify you when ready.`;
  return await sendSMS(req, customerPhone, message, { sender: "BusyPilot" });
};

// Send order status update SMS
export const sendOrderStatusUpdate = async (
  req,
  customerPhone,
  orderNumber,
  status,
) => {
  const statusMessages = {
    confirmed: "✅ Your order has been confirmed!",
    preparing: "🍳 Your order is being prepared.",
    ready: "📦 Your order is ready for pickup!",
    delivered: "🚚 Your order has been delivered!",
  };

  const message = `Order #${orderNumber}\n${statusMessages[status] || status}`;
  return await sendSMS(req, customerPhone, message, { sender: "BusyPilot" });
};

// Send verification code SMS
export const sendVerificationCode = async (req, phone, code) => {
  const message = `Your BusyPilot verification code is: ${code}`;
  return await sendSMS(req, phone, message, { sender: "BusyPilot" });
};

// Check SMS balance
export const checkSMSBalance = async (req) => {
  await ensureConfig(req);
  try {
    const url = `${SMS_CONFIG(req).balanceUrl}/${SMS_CONFIG(req).username}/${SMS_CONFIG(req).apikey}`;
    const response = await axios.get(url);

    log(`SMS balance checked: ${response.data}`, "info");

    return {
      success: true,
      balance: response.data,
    };
  } catch (error) {
    log(`Balance check error: ${error.message}`, "error");
    return {
      success: false,
      error: error.message,
    };
  }
};

// Update SMS configuration
export const updateSMSConfig = async (req, newConfig) => {
  await ensureConfig(req);
  Object.assign(req.config.sms, newConfig);
  log("SMS configuration updated", "info");
  return SMS_CONFIG(req);
};

// Get current SMS configuration
export const getSMSConfig = async (req) => {
  await ensureConfig(req);
  return { ...SMS_CONFIG(req) };
};


export default {
  sendSMS,
  sendBulkSMS,
  sendSMSToUsers,
  notifyStoreOwner,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendVerificationCode,
  checkSMSBalance,
  updateSMSConfig,
  getSMSConfig,
};
