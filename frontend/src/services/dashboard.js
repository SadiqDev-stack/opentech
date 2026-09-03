import { api, USE_MOCK_DATA, mockResponse } from "./api";
import {
  dashboardStats,
  adminStats,
  orders,
  enrollments,
  certificates,
  notifications,
  favourites,
  innovationRequests,
  logs,
  users,
} from "@/central/util/mockdata";

export async function getUserDashboard() {
  if (USE_MOCK_DATA) {
    return mockResponse(
      {
        stats: dashboardStats,
        orders: orders.filter((o) => o.userId === dashboardStats.user.id),
        enrollments: enrollments.filter((e) => e.userId === dashboardStats.user.id),
        certificates,
        notifications,
        favourites,
        requests: innovationRequests,
      },
      "Dashboard data retrieved successfully",
    );
  }
  return api.get("/dashboard");
}

export async function getAdminDashboard() {
  if (USE_MOCK_DATA) {
    return mockResponse({ stats: adminStats, logs, users }, "Admin dashboard retrieved successfully");
  }
  return api.get("/admin/dashboard");
}
