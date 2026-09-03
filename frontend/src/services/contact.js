import { api, USE_MOCK_DATA, mockResponse } from "./api";

export async function sendContactMessage(payload) {
  if (USE_MOCK_DATA) {
    return mockResponse({ received: true }, "Message sent successfully", 700);
  }
  return api.post("/contact", payload);
}
