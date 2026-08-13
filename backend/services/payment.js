// services/paystack.js
import axios from "axios";
import crypto from "crypto";
import { FrontendURL } from "../middlewares/logger.js";
import Config from "../models/config.js";

/**
 * Ensures req.config is populated
 */
const ensureConfig = async (req) => {
 
  if (!req.config) {
    req.config = await Config.getConfig();
  }
};

const PAYSTACK_CONFIG = (req) => {

  return {
    secretKey:
      req.config?.apiKeys?.paymentSecret || process.env.PAYSTACK_SECRET_KEY,
    publicKey: process.env.PAYSTACK_PUBLIC_KEY,
    baseUrl: "https://api.paystack.co",
    callbackUrl:
      req.config?.payment?.callbackUrl ||
      process.env.PAYSTACK_CALLBACK_URL ||
      `${FrontendURL}/verifypayment`,
    webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET,
  };
};

// Initialize Paystack transaction
export const initializePayment = async (
  req,
  {
    amount,
    email,
    reference,
    metadata = {},
    callback_url = null,
  },
) => {
  await ensureConfig(req);
  const config = PAYSTACK_CONFIG(req);
  const finalCallbackUrl = callback_url || config.callbackUrl;

  try {
    const response = await axios.post(
      `${config.baseUrl}/transaction/initialize`,
      {
        amount: amount * 100, // Convert to kobo/cents
        email,
        reference,
        metadata,
        callback_url: finalCallbackUrl,
        channels: ["card", "bank", "ussd", "qr", "bank_transfer"],
      },
      {
        headers: {
          Authorization: `Bearer ${config.secretKey}`,
          "Content-Type": "application/json",
        },
      },
    );


    const { status, data, message } = response.data;

    return {
      success: status,
      authorizationUrl: data?.authorization_url,
      reference: data?.reference,
      accessCode: data?.access_code,
      message,
    };
  } catch (error) {
    console.error(
      "Paystack initialization error:",
      error.response?.data || error.message,
    );
    return {
      success: false,
      message: error.response?.data?.message || "Failed to initialize payment",
    };
  }
};

// Verify Paystack transaction
export const verifyTransaction = async (req, reference) => {
  await ensureConfig(req);
  const config = PAYSTACK_CONFIG(req);
  try {
    const response = await axios.get(
      `${config.baseUrl}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${config.secretKey}`,
        },
      },
    );


    const { status, data, message } = response.data;

    return {
      success: status,
      data: {
        reference: data?.reference,
        amount: data?.amount / 100, // Convert back from kobo
        status: data?.status,
        transactionDate: data?.transaction_date,
        paidAt: data?.paid_at,
        channel: data?.channel,
        currency: data?.currency,
        fees: data?.fees ? data?.fees / 100 : 0,
        authorization: data?.authorization,
        customer: data?.customer,
        metadata: data?.metadata,
      },
      message,
    };
  } catch (error) {
    console.error(
      "Paystack verification error:",
      error.response?.data || error.message,
    );
    return {
      success: false,
      message: error.response?.data?.message || "Failed to verify transaction",
    };
  }
};

// Verify webhook signature
export const verifyWebhookSignature = async (req) => {
  await ensureConfig(req);
  const signature = req.headers["x-paystack-signature"];
  const hash = crypto
    .createHmac("sha512", PAYSTACK_CONFIG(req).secretKey)
    .update(JSON.stringify(req.body))
    .digest("hex");

  return signature === hash;
};


// List banks for transfer
export const listBanks = async (req) => {
  await ensureConfig(req);
  try {
    const response = await axios.get(`${PAYSTACK_CONFIG(req).baseUrl}/bank`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_CONFIG(req).secretKey}`,
      },
    });


    return {
      success: response.data.status,
      data: response.data.data,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Create transfer recipient
export const createTransferRecipient = async (
  req,
  name,
  accountNumber,
  bankCode,
) => {
  await ensureConfig(req);
  try {
    const response = await axios.post(
      `${PAYSTACK_CONFIG(req).baseUrl}/transferrecipient`,

      {
        type: "nuban",
        name,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: "NGN",
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_CONFIG(req).secretKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    return {
      success: response.data.status,
      recipientCode: response.data.data?.recipient_code,
      data: response.data.data,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export default {
  initializePayment,
  verifyTransaction,
  verifyWebhookSignature,
  listBanks,
  createTransferRecipient,
};
