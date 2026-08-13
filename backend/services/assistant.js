// services/aiContext.js
import axios from "axios";
import Config from "../models/config.js";

let {
  AI_API_KEY,
  AI_MODEL_TEMPERATURE = 0.1,
  RECENT_MESSAGE_LENGTH,
  AI_MODEL,
  AI_ENDPOINT,
} = process.env;

/**
 * Ensures req.config is populated
 */

const ensureConfig = async (req) => {
  if (!req.config) {
    req.config = await Config.getConfig();
  }
};
export const shortenMessage = async (req, message, maxLength = 500) => {
  await ensureConfig(req);
  if (!message || message.length <= maxLength) return message;

  try {
    const apiKey = req.config?.apiKeys?.assistant || AI_API_KEY;
    const model = req.config?.assistant?.model || AI_MODEL;
    const temperature = req.config?.assistant?.temperature || parseInt(AI_MODEL_TEMPERATURE);

    const response = await axios.post(
      AI_ENDPOINT,
      {
        model: model,
        messages: [
          {
            role: "system",
            content:
              "Summarize the following message concisely in 1-2 sentences. Keep the core meaning and important details. Return ONLY the summary, no explanations.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 700,
        temperature: temperature,
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://busypilot.store",
          "X-Title": "BusyPilot",
        },
      },
    );

    const summary = response.data.choices?.[0]?.message?.content?.trim();
    if (summary && typeof summary == "string" && summary.length < maxLength) {
      return summary;
    }
  } catch (error) {
    console.error("AI summarization failed:", error.message);
  }

  return message.substring(0, maxLength - 3) + "...";
};


/**
 * Get WhatsApp AI context for customer conversation
 */

export const getWhatsAppAIContext = (store, bot, chat, customerMessage, recentMessages, req) => {
  const availableProducts = store.products?.filter(p => p.available !== false) || [];
  
  const productList = availableProducts.slice(0, 20).map((p, idx) => 
    `${idx + 1}. ${p.name} -image: ${p.image?.src} - ₦${p.price.toLocaleString()}${p.description ? ` (${p.description.substring(0, 50)})` : ''}`
  ).join("\n");

  const cartItems = chat.cart?.map(item => 
    `${item.name} x${item.quantity} = ₦${(item.price * item.quantity).toLocaleString()}`
  ).join("\n") || "Empty";

  const cartTotal = chat.cart?.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0) || 0;

  return `You are ${bot.botName}, a friendly sales assistant for ${store.storeName}.

STORE INFO:
- Name: ${store.storeName}
- Phone: ${store.phone}
- Address: ${store.address}
- Bank: ${store.accountDetails?.bankName || "GTBank"}
- Account: ${store.accountDetails?.accountNumber || "N/A"}

PRODUCTS:
${productList || "No products available"}

CUSTOMER CART:
${cartItems}
Total: ₦${cartTotal.toLocaleString()}

CHAT HISTORY:
${recentMessages.slice(-5).map(m => `${m.from === "user" ? "Customer" : "You"}: ${m.text}`).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RULES:
1. Return ONLY valid JSON. No markdown, no extra text.
2. Use emojis naturally to be friendly.
3. NEVER invent products, prices, or images.
4. If customer asks for something not available, politely say so and suggest alternatives.
5. PAYMENT CONFIRMATION FLOW — Works exactly like a real WhatsApp business:
    - When customer provides ANY payment details (e.g., bank/app name, sender name, OR amount) WITH payment confirmation language like "paid", "transferred", "sent", "i have paid", "payment made" — IMMEDIATELY confirm the payment. Accept payment information even if incomplete (e.g., no transaction ID). The requirement is ONLY that they mention a payment method and confirmation keyword.
    - When customer says "I have paid" or similar WITHOUT any payment details at all — ask them for payment proof naturally.
    - The rule is: if they say they paid AND provide ANY payment detail (bank, app, name, amount), confirm it immediately. Don't ask for more details.
6. Collect payment proof in the paymentProof field — include whatever payment info the customer mentioned (bank/app name, sender name, amount, or transaction ID). Format cleanly, e.g., "GTBank, Abubakar Muhammad, ₦5,000".
7. OUT-OF-CONTEXT REPLIES — If the customer sends a message that has nothing to do with shopping, ordering, products, or the store (e.g., "are you there [owner name]?", "we have lectures tomorrow"), return noreply: true with empty message.

RESPONSE FORMAT:
{
  "message": "Your friendly response here (empty string if noreply is true)",
  "action": "action_name",
  "noreply": false,
  "data": {
    "productName": "product name (for add_to_cart/remove_from_cart)",
    "quantity": 1,
    "imageUrl": "image_url (for send_image)",
    "deliveryAddress": "address (for checkout)",
    "paymentProof": "whatever payment info the customer mentioned (for confirm_payment)",
    "deliveryType": "store or busypilot (for checkout)",
    "orderId": "order number (for confirm_payment)"
  }
}

AVAILABLE ACTIONS:
- none: Normal conversation
- show_menu: Show product list
- send_image: Send product image (requires data.imageUrl)
- add_to_cart: Add to cart (requires data.productName, optional data.quantity)
- remove_from_cart: Remove from cart (requires data.productName, optional data.quantity)
- clear_cart: Empty entire cart
- show_cart: Show current cart
- checkout: Process checkout (requires data.deliveryAddress, data.deliveryType)
- confirm_payment: Confirm payment (requires data.orderId)
- track_order: Track order status
- escalate_support: Escalate to human support

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXAMPLES:

Customer: "hi"
{"message": "Hi there! 👋 Welcome to ${store.storeName}! Would you like to see our products?", "action": "none", "noreply": false, "data": {}}

Customer: "show me menu"
{"message": "Here are our available products 🛍️", "action": "show_menu", "noreply": false, "data": {}}

Customer: "i want 2 caps"
{"message": " Added 2 Premium Caps to your cart! Total: ₦99,998. Anything else?", "action": "add_to_cart", "noreply": false, "data": {"productName": "Premium Cap", "quantity": 2}}

Customer: "my address is 123 Damboa Road, store pickup"
{"message": "Great! Your order will be ready for pickup at our store. Total: ₦99,998. Please pay to the account below and reply 'I have paid'", "action": "checkout", "noreply": false, "data": {"deliveryAddress": "123 Damboa Road", "deliveryType": "store"}}

Customer: "I have paid via GTBank, 0123456789, ₦5000, abubakar muhammad"
{"message": "✅ Payment received! We'll verify and process your order shortly. Thank you!", "action": "confirm_payment", "noreply": false, "data": {"orderId": "ORD-1234567890-1234", "paymentProof": "GTBank, Abubakar Muhammad, ₦5,000"}}

Customer: "i paid through opay abubakar muhammad 10k"
{"message": "✅ Got it! Payment noted — Opay, Abubakar Muhammad, ₦10,000. Your order is being processed!", "action": "confirm_payment", "noreply": false, "data": {"orderId": "", "paymentProof": "Opay, Abubakar Muhammad, ₦10,000"}}

Customer: "i have paid 2017984513 abubakar muhammad first bank"
{"message": "✅ Payment confirmed! — First Bank, Abubakar Muhammad, Reference: 2017984513. Your order is being processed!", "action": "confirm_payment", "noreply": false, "data": {"orderId": "", "paymentProof": "First Bank, Abubakar Muhammad, 2017984513"}}

Customer: "i have paid"
{"message": "Thank you! 🙏 Please send your payment details so we can confirm — bank or app name, sender name, and amount paid.", "action": "none", "noreply": false, "data": {}}

Customer: "clear my cart"
{"message": "✓ Your cart has been cleared.", "action": "clear_cart", "noreply": false, "data": {}}

Customer: "are you there Ahmed?"
{"message": "", "action": "none", "noreply": true, "data": {}}

Customer: "we have lectures tomorrow"
{"message": "", "action": "none", "noreply": true, "data": {}}

Customer: "how are you doing?"
{"message": "I'm great, thanks for asking! 😊 How can I help you with your order today?", "action": "none", "noreply": false, "data": {}}

Now respond to: "${customerMessage.substring(0, 500)}"

Return ONLY valid JSON.`;
};

export async function getResponse(
  req,
  context,
  messages = [],
  cb = (status, msg) => console.log(status, msg),
) {
  try {
    await ensureConfig(req);

    // Get API key from config or env
    const apiKey = req.config?.apiKeys?.assistant || AI_API_KEY;
    const model = req.config?.assistant?.model || AI_MODEL;
    const temperature = req.config?.assistant?.temperature || parseInt(AI_MODEL_TEMPERATURE);

    console.log(`🤖 Using OpenRouter model: ${model}`);

    const res = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // OpenRouter specific headers (optional but recommended)
        "HTTP-Referer": "https://busypilot.store", // Your site URL
        "X-Title": "BusyPilot", // App name for analytics
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: context,
          },
          ...messages,
        ],
        max_tokens: 700,
        temperature: temperature,
        // OpenRouter specific options
        top_p: 0.9,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("❌ OpenRouter API Error:", errorData);
      throw new Error(`OpenRouter API error: ${res.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await res.json();
    console.log(" OpenRouter response received");

    if (!data.choices || !data.choices[0]) {
      throw new Error("Invalid response from OpenRouter");
    }

    let responseText = data.choices[0].message.content;

    // If response is not JSON, wrap it as a simple message
    if (!responseText.trim().startsWith("{")) {
      responseText = JSON.stringify({
        message: responseText,
        action: "none",
        data: {},
      });
    }

    console.log("🤖 AI Response:", responseText);
    if (cb) cb(true, responseText);
  } catch (error) {
    console.error("❌ AI Error:", error.message);
    cb(
      false,
      JSON.stringify({
        message:
          "I apologize for the inconvenience. Please type 'menu' to see our products or contact support for assistance.",
        action: "show_menu",
        data: {},
      }),
    );
  }
}

/**
 * Simple context for general assistant (no JSON required)
 */
export const getSimpleContext = (store, bot) => {
  const availableProducts =
    store.products?.filter((p) => p.available !== false) || [];
  const productNames = availableProducts
    .slice(0, 10)
    .map((p) => p.name)
    .join(", ");

  return `You are ${bot.botName}, an AI assistant for ${store.storeName}.

Store: ${store.storeName}
Description: ${store.description || "A local store"}
Address: ${store.address}, ${store.state}
Phone: ${store.phone}
Products: ${productNames}

Guidelines:
- Be friendly and helpful
- Keep responses short (2-3 sentences)
- If customer asks about products not in the list, say it's not available
- If customer wants to order, guide them to use 'menu' and 'checkout'
- Use emojis naturally
- Never use fake or example.com URLs

Now respond to the customer.`;
};

/**
 * Summarize conversation for context window
 */export const summarizeConversation = async (req, messages, maxTokens = 500) => {
  await ensureConfig(req);
  if (!messages || messages.length === 0) return "";

  const conversationText = messages
    .map((m) => `${m.from === "user" ? "Customer" : "Assistant"}: ${m.text}`)
    .join("\n");

  if (conversationText.length < maxTokens) return conversationText;

  try {
    const apiKey = req.config?.apiKeys?.assistant || AI_API_KEY;
    const model = req.config?.assistant?.model || AI_MODEL;
    const temperature = req.config?.assistant?.temperature || parseInt(AI_MODEL_TEMPERATURE);

    const response = await axios.post(
      AI_ENDPOINT,
      {
        model: model,
        messages: [
          {
            role: "system",
            content:
              "Summarize the following customer service conversation concisely. Keep key points: what customer wants, cart contents, order status, and any important details. Return ONLY the summary, no extra text.",
          },
          {
            role: "user",
            content: conversationText,
          },
        ],
        max_tokens: 700,
        temperature: temperature,
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://busypilot.store",
          "X-Title": "BusyPilot",
        },
      },
    );

    console.log(" Summarization response:", response.data?.choices?.[0]?.message?.content);
    return (
      response.data.choices?.[0]?.message?.content?.trim() ||
      conversationText.substring(0, maxTokens)
    );
  } catch (error) {
    console.error("Conversation summarization failed:", error.message);
    return conversationText.substring(0, maxTokens);
  }
};


export default {
  getWhatsAppAIContext,
  getSimpleContext,
  shortenMessage,
  summarizeConversation,
  getResponse,
};
