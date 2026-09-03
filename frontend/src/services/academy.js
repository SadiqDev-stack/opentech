import { api, USE_MOCK_DATA, mockResponse, mockError } from "./api";
import { courses, lessons, courseRatings, categories } from "@/central/util/mockdata";

export async function getCourses({ search = "", category = "", level = "", sort = "newest" } = {}) {
  if (USE_MOCK_DATA) {
    let list = [...courses];
    if (search) {
      const term = search.toLowerCase();
      list = list.filter(
        (c) => c.title.toLowerCase().includes(term) || c.summary?.toLowerCase().includes(term),
      );
    }
    if (category) list = list.filter((c) => c.categorySlug === category);
    if (level) list = list.filter((c) => c.level === level);
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "rating") list.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return mockResponse(
      {
        courses: list,
        categories: categories.filter((c) => c.type === "course"),
        levels: ["Beginner", "Intermediate", "Advanced"],
      },
      "Courses retrieved successfully",
    );
  }
  return api.get("/courses", { search, category, level, sort });
}

export async function getCourse(id) {
  if (USE_MOCK_DATA) {
    const course = courses.find((c) => String(c.id) === String(id) || c.slug === String(id));
    if (!course) return mockError(404, "Course not found");
    return mockResponse(
      {
        course,
        lessons: lessons.filter((l) => l.courseId === course.id).sort((a, b) => a.order - b.order),
        ratings: courseRatings.filter((r) => r.courseId === course.id),
        related: courses
          .filter((c) => c.categorySlug === course.categorySlug && c.id !== course.id)
          .slice(0, 3),
      },
      "Course retrieved successfully",
    );
  }
  return api.get(`/courses/${id}`);
}

export async function enrollInCourse(courseId) {
  if (USE_MOCK_DATA) {
    return mockResponse({ courseId, status: "active" }, "Enrollment created successfully");
  }
  return api.post(`/courses/${courseId}/enroll`, {});
}
