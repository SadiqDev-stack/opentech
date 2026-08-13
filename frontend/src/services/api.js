import axios from "axios";

// Use environment variable or default based on environment

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

axios.defaults.withCredentials = true;

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// ============= RESPONSE / ERROR INTERCEPTORS =============
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Build a clean, consistent error message from any shape the server sends
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      (typeof error?.response?.data === "string" ? error.response.data : null) ||
      error?.message ||
      "Something went wrong. Please try again.";

    // Attach normalized message so callers can do: err.message
    error.message = message;

    // Auto-redirect on 401 (session expired / not authenticated)
    if (error?.response?.status === 401) {
      const pathname = window.location.pathname;
      
      // �� PUBLIC PAGES — no redirect, just show error
      const publicPages = [
        "/",
        "/home",
        "/login",
        "/auth",
        "/forgot-password",
        "/reset-password",
        "/terms",
      ];
      
      // Check if current page is public
      const isPublicPage = publicPages.includes(pathname);
      
      // 🛡️ PROTECTED PAGES — starts with /user/ or /admin/
      const isProtectedRoute = pathname.startsWith("/user/") || pathname.startsWith("/admin/");
      
      // If on public page OR not on protected route → just show error, NO redirect
      if (isPublicPage || !isProtectedRoute) {
        console.log(`🔓 401 on public/non-protected page: ${pathname} — showing error only`);
        return Promise.reject(error);
      }

      // ✅ PROTECTED PAGE → redirect to login
      const redirectUrl = error?.response?.data?.redirect || "/auth";
      console.log(`🔒 401 on protected page: ${pathname} — redirecting to ${redirectUrl}`);
      window.location.href = redirectUrl;
    }

    return Promise.reject(error);
  },
);

// services/api.js - Add these methods to userAPI

export const userAPI = {
  login: (email, password) =>
    api.post("/user/authenticate", { email, password }),
  logout: () => api.post("/user/logout"),
  getProfile: () => api.get("/user/profile"),
  getDashboard: () => api.get("/user/dashboard"),
  register: (userData) => api.post("/user/register", userData),

  // Add these new methods
  getMyOrders: () => api.get("/orders/my"),
  getNotifications: (page = 1, limit = 10) =>
    api.get(`/notifications/history?page=${page}&limit=${limit}`),

  resetPassword: (type, data) => {
    if (type === "email") {
      return api.post("/user/reset/email", {
        email: data.email,
        newPassword: data.newPassword,
      });
    }
    return api.post("/user/reset/info", {
      phone: data.phone,
      state: data.state,
      newPassword: data.newPassword,
    });
  },

  // for setting
  updateProfile: (userData) => api.put("/user/profile", userData),
  updateNotificationSettings: (settings) =>
    api.put("/user/notification-settings", settings),
  changePassword: (oldPassword, newPassword) =>
    api.put("/user/change-password", { oldPassword, newPassword }),
};

// services/api.js - Add these methods
export const contactAPI = {
  getHistory: (page, limit, filters) => {
    let url = `/contact/history?page=${page}&limit=${limit}`;
    if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
    return api.get(url);
  },

  getContactById: (id) => api.get(`/contact/${id}`),

  markAsRead: (contactId) => api.put("/see", { contactId }),

  markAllAsRead: () => api.put("/see-all"),

  submit: (contactData) => api.post("/contact/support", contactData),
};
// services/api.js - Add to your existing file
export const storeAPI = {
  // Add these methods to storeAPI
   getStorePaymentFee: () => api.get("/store/fee"),
    
  getProducts: (storeId, page = 1, limit = 9, search = "", available = "") => {
    let url = `/store/products/${storeId}?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (available) url += `&available=${available}`;
    return api.get(url);
  },
  addProduct: (storeId, productData) =>
    api.post(`/store/products/${storeId}`, productData),
  updateProduct: (storeId, productId, productData) =>
    api.put(`/store/products/${storeId}/${productId}`, productData),
  deleteProduct: (storeId, productId) =>
    api.delete(`/store/products/${storeId}/${productId}`),
  createStore: (storeData) => api.post("/store/create", storeData),
  getMyStores: () => api.get("/store/my-stores"),
  getStoreById: (storeId) => api.get(`/store/${storeId}`),
  updateStoreInfo: (storeId, storeData) =>
    api.put(`/store/${storeId}/info`, storeData),
  updateBusinessHours: (storeId, hoursData) =>
    api.put(`/store/${storeId}/business-hours`, hoursData),
  updateAccountDetails: (storeId, accountData) =>
    api.put(`/store/${storeId}/account-details`, accountData),
  addItem: (storeId, itemData) =>
    api.post(`/store/${storeId}/products`, itemData),
  getproducts: (storeId) => api.get(`/store/${storeId}/products`),
  updateItem: (storeId, itemId, itemData) =>
    api.put(`/store/products/${storeId}/${itemId}`, itemData),
  deleteItem: (storeId, itemId) =>
    api.delete(`/store/products/${storeId}/${itemId}`),

  createBot: (config) => api.post("/bot/create", config),
  getBotConfig: () => api.get("/bot/config"),
  getBotDashboard: () => api.get("/bot/dashboard"), // OPTIMIZED: Single endpoint replacing 4 sequential calls
  updateBot: (config) => api.put("/bot/update", config),
  getBotStats: () => api.get("/bot/stats"),
  updateBotStatus: (status) => api.put("/bot/status", { status }),
  testBot: (message) => api.post("/bot/test", { message }),
  updateReminders: (data) => api.put("/bot/reminders", data),
};

// Assistant API
export const assistantAPI = {
  getResponse: (message, contactData) =>
    api.post("/assistant", { message, contactData }),
};

export const sendChatMessage = async (message, userId, userName) => {
  try {
    const response = await fetch(`${API_BASE}/assistant/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, userId, userName }),
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: "Network error. Please try again." };
  }
};

export const notificationAPI = {
  // Get user notifications with filters
  getHistory: (page = 1, limit = 20, filters = {}) => {
    let url = `/notifications/history?page=${page}&limit=${limit}`;
    if (filters.type) url += `&type=${filters.type}`;
    if (filters.isRead !== undefined && filters.isRead !== "")
      url += `&isRead=${filters.isRead}`;
    if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
    return api.get(url);
  },

  // Mark single notification as read
  markAsRead: (notificationId) =>
    api.put("/notifications/mark-read", { notificationId }),

  // Mark all notifications as read
  markAllAsRead: () => api.put("/notifications/mark-all-read"),

  // Delete old notifications
  deleteOld: (days = 30) => api.delete(`/notifications/old?days=${days}`),
};
// services/api.js - Updated chatAPI with params at end
export const chatAPI = {
  // Get all chats for a store (storeId at end)
  getChats: (storeId, page = 1, limit = 20, filters = {}) => {
    let url = `/chat/store/${storeId}?page=${page}&limit=${limit}`;
    if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
    if (filters.hasCart) url += `&hasCart=${filters.hasCart}`;
    if (filters.sortBy) url += `&sortBy=${filters.sortBy}`;
    if (filters.sortOrder) url += `&sortOrder=${filters.sortOrder}`;
    return api.get(url);
  },

  // Get chat statistics (storeId at end)
  getChatStats: (storeId) => api.get(`/chat/stats/${storeId}`),

  // Get single chat with messages (chatId at end)
  getChat: (chatId) => api.get(`/chat/${chatId}`),

  // Send message to customer (chatId at end)
  sendMessage: (chatId, messageData) =>
    api.post(`/chat/send/${chatId}`, messageData),

  // Clear old chats (storeId at end)
  clearOldChats: (storeId, days = 30) =>
    api.delete(`/chat/clear/${storeId}?days=${days}`),

  // Get customer cart (chatId at end)
  getCart: (chatId) => api.get(`/chat/cart/${chatId}`),

  // Clear customer cart (chatId at end)
  clearCart: (chatId) => api.delete(`/chat/cart/${chatId}`),
};

// services/api.js - Add orderAPI
export const orderAPI = {
  getOrders: (page = 1, limit = 20, filters = {}) => {
    let url = `/order?page=${page}&limit=${limit}`;
    if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
    if (filters.status) url += `&status=${filters.status}`;
    if (filters.paymentStatus) url += `&paymentStatus=${filters.paymentStatus}`;
    if (filters.channel) url += `&channel=${filters.channel}`;
    if (filters.sortBy) url += `&sortBy=${filters.sortBy}`;
    if (filters.sortOrder) url += `&sortOrder=${filters.sortOrder}`;
    return api.get(url);
  },
  getOrderStats: () => api.get("/order/stats"),
  updatePickupStatus: (orderId, status, estimatedTime, reason) =>
    api.put(`/order/${orderId}/pickup-status`, {
      status,
      estimatedTime,
      reason,
    }),
  updatePaymentStatus: (orderId, paymentStatus) =>
    api.put(`/order/${orderId}/payment-status`, { paymentStatus }),
  requestBusyPilotPickup: (orderId, message, pickupTime) =>
    api.post(`/order/${orderId}/busypilot-pickup`, { message, pickupTime }),
  notifyCustomer: (orderId, message) =>
    api.post(`/order/${orderId}/notify`, { message }),
};

export const publicAPI = {
  getConfig: () => api.get("/public/config"),
  getMessageToken: (token) => api.get(`/public/message-token?token=${encodeURIComponent(token)}`),
};

export const paymentAPI = {
  generateStorePaymentLink: (storeId) => api.post(`/payment/store/pay`),
  verifyStorePayment: (reference) =>
    api.get(`/payment/store/verify/${reference}`),
  generateSubscriptionPaymentLink: (months) =>
    api.post("/payment/subscription/pay", { months }),
  verifySubscriptionPayment: (reference) =>
    api.get(`/payment/subscription/verify/${reference}`),
  getSubscriptionStatus: () => api.get("/payment/subscription/status"),
};

// services/api.js - Add WhatsApp API methods

export const whatsappAPI = {
  connect: (phoneNumber) => api.post("/whatsapp/connect", { phoneNumber }),
  getStatus: () => api.get("/whatsapp/status"),
  getQRCode: () => api.get("/whatsapp/qrcode"),
  disconnect: (changePhone) =>
    api.post("/whatsapp/disconnect", { changePhone }),
  sendMessage: (to, message) => api.post("/whatsapp/send", { to, message }),
  getChats: (page = 1, limit = 20) =>
    api.get(`/whatsapp/chats?page=${page}&limit=${limit}`),
};

// ============= ADMIN API =============
export const adminAPI = {
  // Stores
  getStores: (page = 1, limit = 20, filters = {}) => {
    let url = `/admin/store/all?page=${page}&limit=${limit}`;
    if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
    if (filters.state) url += `&state=${filters.state}`;
    if (filters.status) url += `&status=${filters.status}`;
    return api.get(url);
  },
  getStore: (storeId) => api.get(`/admin/store/${storeId}`),
  updateStore: (storeId, data) => api.put(`/admin/store/${storeId}`, data),
  verifyStore: (storeId, active = true) =>
    api.put(`/admin/store/${storeId}/verify`, { active }),
  deleteStore: (storeId) => api.delete(`/admin/store/${storeId}`),

  // Users
  getUsers: (page = 1, limit = 20, filters = {}) => {
    let url = `/admin/user/all?page=${page}&limit=${limit}`;
    if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
    if (filters.role) url += `&role=${filters.role}`;
    if (filters.active !== undefined) url += `&active=${filters.active}`;
    return api.get(url);
  },
  getUser: (userId) => api.get(`/admin/user/${userId}`),
  updateUser: (userId, data) => api.put(`/admin/user/${userId}`, data),
  changeUserRole: (userId, role) =>
    api.put(`/admin/user/${userId}/role`, { role }),
  resetUserPassword: (userId, payload) =>
    api.post(`/admin/user/${userId}/reset-password`, payload),
  notifyUser: (userId, payload) =>
    api.post(`/admin/user/${userId}/notify`, payload),

  // Bots
  getBots: (page = 1, limit = 20, filters = {}) => {
    let url = `/admin/bot/all?page=${page}&limit=${limit}`;
    if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
    if (filters.status) url += `&status=${filters.status}`;
    if (filters.storeId) url += `&storeId=${filters.storeId}`;
    return api.get(url);
  },
  getBot: (botId) => api.get(`/admin/bot/${botId}`),
  updateBot: (botId, data) => api.put(`/admin/bot/${botId}`, data),
  updateBotStatus: (botId, status) =>
    api.put(`/admin/bot/${botId}/status`, { status }),
  deleteBot: (botId) => api.delete(`/admin/bot/${botId}`),

  // Orders
  getOrders: (page = 1, limit = 20, filters = {}) => {
    let url = `/admin/order/all?page=${page}&limit=${limit}`;
    if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
    if (filters.pickupStatus) url += `&pickupStatus=${filters.pickupStatus}`;
    if (filters.paymentStatus) url += `&paymentStatus=${filters.paymentStatus}`;
    if (filters.deliveryChannel)
      url += `&deliveryChannel=${filters.deliveryChannel}`;
    if (filters.storeId) url += `&storeId=${filters.storeId}`;
    return api.get(url);
  },
  getOrder: (orderId) => api.get(`/admin/order/${orderId}`),
  updateOrderStatus: (orderId, data) =>
    api.put(`/admin/order/${orderId}/status`, data),
  updateOrderPickup: (orderId, data) =>
    api.put(`/admin/order/${orderId}/pickup`, data),
  reverseOrderPickup: (orderId, data) =>
    api.put(`/admin/order/${orderId}/reverse-pickup`, data),

  // Chats
  getChats: (page = 1, limit = 20, filters = {}) => {
    let url = `/admin/chat/all?page=${page}&limit=${limit}`;
    if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
    if (filters.storeId) url += `&storeId=${filters.storeId}`;
    if (filters.customerPhone) url += `&customerPhone=${filters.customerPhone}`;
    return api.get(url);
  },
  getChat: (chatId) => api.get(`/admin/chat/${chatId}`),
  deleteChat: (chatId) => api.delete(`/admin/chat/${chatId}`),
  deleteOldChats: (days = 30) => api.delete(`/admin/chat/old?days=${days}`),
  // Config
  getConfig: () => api.get(`/admin/config`),
  updateConfig: (data) => api.put(`/admin/config/update`, data), // Make sure this is PUT, not POST
  resetConfig: () => api.post(`/admin/config/reset`),
  getPublicConfig: () => api.get(`/admin/config/public`),
  toggleFeature: (feature, enabled) =>
    api.post(`/admin/config/toggle-feature`, { feature, enabled }),
  updateVariable: (variable, value) =>
    api.put(`/admin/config/variable`, { variable, value }),
  toggleCache: (enabled) => api.post("/admin/config/toggle-cache", { enabled }),
  flushCache: () => api.post("/admin/config/flush-cache"),

  // Transactions
  getTransactions: (page = 1, limit = 20, filters = {}) => {
    let url = `/admin/transaction/all?page=${page}&limit=${limit}`;
    if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
    if (filters.status) url += `&status=${filters.status}`;
    if (filters.type) url += `&type=${filters.type}`;
    if (filters.userId) url += `&userId=${filters.userId}`;
    if (filters.storeId) url += `&storeId=${filters.storeId}`;
    return api.get(url);
  },
  getTransaction: (transactionId) =>
    api.get(`/admin/transaction/${transactionId}`),

  // Logs
  getLogs: (page = 1, limit = 20, filters = {}) => {
    let url = `/admin/log/all?page=${page}&limit=${limit}`;
    if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
    if (filters.type) url += `&type=${filters.type}`;
    if (filters.storeId) url += `&storeId=${filters.storeId}`;
    return api.get(url);
  },
  getLog: (id) => api.get(`/admin/log/${id}`),
  getLogStats: () => api.get(`/admin/log/stats`),
  getErrorLogs: (page = 1, limit = 20) =>
    api.get(`/admin/log/errors?page=${page}&limit=${limit}`),
  getLogsByType: (type, page = 1, limit = 20) =>
    api.get(
      `/admin/log/type/${encodeURIComponent(type)}?page=${page}&limit=${limit}`,
    ),
  getLogsByStore: (storeId, page = 1, limit = 20) =>
    api.get(`/admin/log/store/${storeId}?page=${page}&limit=${limit}`),
  deleteOldLogs: (days = 30, type) =>
    api.delete(
      `/admin/log/old?days=${days}${type ? `&type=${encodeURIComponent(type)}` : ""}`,
    ),
  clearLogsByType: (type) =>
    api.delete(`/admin/log/type/${encodeURIComponent(type)}`),
  deleteLog: (id) => api.delete(`/admin/log/${id}`),
  deleteAllLogs: () => api.delete(`/admin/log/all`),

  // Stats
  getAdminStats: () => api.get(`/admin/stat`),
  getAnalytics: () => api.get(`/admin/stat/analytics`),
  refreshStats: () => api.post(`/admin/stat/refresh`),
  incrementStat: (type) => api.post(`/admin/stat/increment/${type}`),
  resetStats: () => api.delete(`/admin/stat/reset`),
};

export default api;
