import { api, USE_MOCK_DATA, mockResponse, mockError, setToken } from "./api";
import { users, currentUser } from "@/central/util/mockdata";

export async function login({ email, password }) {
  if (USE_MOCK_DATA) {
    if (!password) return mockError(422, "Password is required");
    const user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase()) || currentUser;
    if (!user.active) return mockError(403, "Account is not active");
    setToken(`mock-token-${user.id}`);
    return mockResponse({ user }, "Login successful");
  }
  const response = await api.post("/auth/login", { email, password });
  if (response?.data?.token) setToken(response.data.token);
  return response;
}

export async function register(payload) {
  if (USE_MOCK_DATA) {
    if (users.some((u) => u.email.toLowerCase() === String(payload.email).toLowerCase())) {
      return mockError(409, "An account with this email already exists");
    }
    const user = {
      id: users.length + 1,
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      address: payload.address || "",
      role: "USER",
      active: true,
      firstLogin: false,
      createdAt: new Date().toISOString(),
    };
    setToken(`mock-token-${user.id}`);
    return mockResponse({ user }, "Account created successfully");
  }
  const response = await api.post("/auth/register", payload);
  if (response?.data?.token) setToken(response.data.token);
  return response;
}

export async function logout() {
  setToken(null);
  if (USE_MOCK_DATA) return mockResponse(null, "Logged out", 100);
  return api.post("/auth/logout");
}

export async function forgotPassword(email) {
  if (USE_MOCK_DATA) {
    return mockResponse(null, "If that email exists, a reset link has been sent.");
  }
  return api.post("/auth/forgot-password", { email });
}

export async function resetPassword({ token, password }) {
  if (USE_MOCK_DATA) {
    if (!token) return mockError(422, "Reset token is missing or expired");
    return mockResponse(null, "Password updated successfully");
  }
  return api.post("/auth/reset-password", { token, password });
}

export async function activateAccount(token) {
  if (USE_MOCK_DATA) return mockResponse({ activated: true }, "Account activated");
  return api.get("/activate", { token });
}

export async function getProfile() {
  if (USE_MOCK_DATA) return mockResponse({ user: currentUser }, "Profile retrieved");
  return api.get("/user/profile");
}

export async function updateProfile(payload) {
  if (USE_MOCK_DATA) {
    return mockResponse({ user: { ...currentUser, ...payload } }, "Profile updated");
  }
  return api.patch("/user/profile", payload);
}

export async function changePassword(payload) {
  if (USE_MOCK_DATA) return mockResponse(null, "Password changed");
  return api.patch("/user/password", payload);
}
