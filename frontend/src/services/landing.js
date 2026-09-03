import { api, USE_MOCK_DATA, mockResponse } from "./api";
import {
  company,
  courses,
  products,
  staff,
  services,
  testimonials,
  config,
} from "@/central/util/mockdata";

export async function getLandingData() {
  if (USE_MOCK_DATA) {
    return mockResponse(
      {
        courses: courses.filter((c) => c.featured).slice(0, 5),
        products: products.filter((p) => p.featured).slice(0, 5),
        contact: company,
        staff,
        services,
        testimonials,
      },
      "Landing data retrieved successfully",
    );
  }
  return api.get("/landing");
}

export async function getPublicConfig() {
  if (USE_MOCK_DATA) {
    return mockResponse(
      { company: config.company, categories: config.categories, maintenanceMode: config.maintenanceMode },
      "Config retrieved",
    );
  }
  return api.get("/config/public");
}
