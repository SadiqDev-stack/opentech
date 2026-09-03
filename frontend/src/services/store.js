import { api, USE_MOCK_DATA, mockResponse, mockError } from "./api";
import { products, productReviews, categories } from "@/central/util/mockdata";

export async function getProducts({
  search = "",
  category = "",
  sort = "newest",
  page = 1,
  limit = 12,
} = {}) {
  if (USE_MOCK_DATA) {
    let list = [...products];
    if (search) {
      const term = search.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(term) || p.description?.toLowerCase().includes(term),
      );
    }
    if (category) list = list.filter((p) => p.categorySlug === category);
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "rating") list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sort === "newest") list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = list.length;
    const start = (page - 1) * limit;
    return mockResponse(
      {
        products: list.slice(start, start + limit),
        categories: categories.filter((c) => c.type === "product"),
        pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      },
      "Products retrieved successfully",
    );
  }
  return api.get("/products", { search, category, sort, page, limit });
}

export async function getProduct(id) {
  if (USE_MOCK_DATA) {
    const product = products.find((p) => String(p.id) === String(id) || p.slug === String(id));
    if (!product) return mockError(404, "Product not found");
    return mockResponse(
      {
        product,
        reviews: productReviews.filter((r) => r.productId === product.id),
        related: products
          .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
          .slice(0, 4),
      },
      "Product retrieved successfully",
    );
  }
  return api.get(`/products/${id}`);
}

export async function getRelatedProducts(limit = 5) {
  if (USE_MOCK_DATA) {
    return mockResponse(
      { products: products.filter((p) => p.featured).slice(0, limit) },
      "Products retrieved",
    );
  }
  return api.get("/products", { featured: true, limit });
}
