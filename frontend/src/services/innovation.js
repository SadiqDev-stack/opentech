import { api, USE_MOCK_DATA, mockResponse } from "./api";
import { innovationRequests } from "@/central/util/mockdata";

export async function submitInnovationRequest(payload) {
  if (USE_MOCK_DATA) {
    return mockResponse(
      { request: { id: 999, status: "pending", ...payload, createdAt: new Date().toISOString() } },
      "Innovation request submitted successfully",
      800,
    );
  }
  return api.post("/innovation", payload);
}

export async function getMyInnovationRequests() {
  if (USE_MOCK_DATA) {
    return mockResponse({ requests: innovationRequests.filter((r) => r.userId === 3) }, "Requests retrieved");
  }
  return api.get("/innovation");
}

export async function getInnovationRequest(id) {
  if (USE_MOCK_DATA) {
    const request = innovationRequests.find((r) => String(r.id) === String(id)) || null;
    return mockResponse({ request }, "Request retrieved");
  }
  return api.get(`/innovation/${id}`);
}
