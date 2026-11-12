import env from '../config/env.js';

export async function sendSMS(phone, message) {
  if (!env.sms.apiKey || !env.sms.username) {
    console.log(`[sms-mock] To: ${phone} | Msg: ${message}`);
    return { success: true, mock: true };
  }

  try {
    const response = await fetch('https://api.ebulksms.com/sendsms.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        SMS: {
          auth: { username: env.sms.username, apikey: env.sms.apiKey },
          sender: env.sms.sender,
          messagetext: message,
          flash: '0'
        },
        recipients: [{ msidn: phone }]
      })
    });
    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    console.error('[sms] Failed:', err.message);
    throw err;
  }
}
