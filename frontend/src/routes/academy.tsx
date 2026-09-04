import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { CardGridShimmer } from "@/components/Shimmer";
import { fetchWithFallback, formatNaira } from "@/utils/api";
import { mockCourses, mockTestimonials, type Course } from "@/utils/mockData";
import heroAcademy from "@/assets/hero-academy.jpg";

export const Route = createFileRoute("/academy")({
  head: () => ({
    meta: [
      { title: "OpenTech Academy — Learn Practical Tech, Build Real Solutions" },
      {
        name: "description",
        content:
          "Hands-on courses in electronics, programming, robotics and more. Learn at your pace and build amazing projects with OpenTech Academy.",
      },
      { property: "og:title", content: "OpenTech Academy — Learn Practical Tech" },
      {
        property: "og:description",
        content: "Hands-on courses in electronics, programming, robotics and AI.",
      },
    ],
  }),
  component: AcademyPage,
});

const HERO_FEATURES = [
  { icon: "fa-flask", title: "Practical Learning", text: "Hands-on Projects" },
  { icon: "fa-clock", title: "Learn at Your Pace", text: "Lifetime Access" },
  { icon: "fa-certificate", title: "Certificate", text: "On Completion" },
  { icon: "fa-users", title: "Supportive Community", text: "Get Help Anytime" },
];

const HERO_STATS = [
  { value: "20+", label: "Courses" },
  { value: "1,200+", label: "Students" },
  { value: "15+", label: "Expert Instructors" },
  { value: "95%", label: "Satisfaction Rate" },
];

const FILTERS = ["All Courses", "Programming", "Electronics", "Robotics", "AI & Data", "Design", "Business"];

const STEPS = [
  { icon: "fa-user-plus", title: "1. Register", text: "Create your account in seconds." },
  { icon: "fa-book-open", title: "2. Choose a Course", text: "Pick a course that matches your goals." },
  { icon: "fa-circle-play", title: "3. Learn & Practice", text: "Access lessons, watch videos, and build projects." },
  { icon: "fa-award", title: "4. Get Certified", text: "Complete the course and earn your certificate." },
];

const WHY = [
  { icon: "fa-screwdriver-wrench", title: "Hands-on Projects", text: "Build real-world projects that strengthen your portfolio." },
  { icon: "fa-users", title: "Community Support", text: "Join a community of learners and get support." },
  { icon: "fa-chalkboard-user", title: "Expert Instructors", text: "Learn from experienced developers and industry professionals." },
  { icon: "fa-tag", title: "Affordable Learning", text: "High-quality education at student-friendly prices." },
  { icon: "fa-infinity", title: "Lifetime Access", text: "Access your courses forever, anytime, anywhere." },
  { icon: "fa-certificate", title: "Certificate of Completion", text: "Showcase your skills with a certificate." },
];

const PATHS = [
  { title: "Full-Stack Web Developer Path", courses: 12, price: 60000, was: 80000 },
  { title: "Robotics Engineer Path", courses: 8, price: 55000, was: 70000 },
  { title: "AI & Data Science Path", courses: 10, price: 65000, was: 85000 },
];

function AcademyPage() {
  const [filter, setFilter] = useState("All Courses");
  const [search, setSearch] = useState("");

  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: () => fetchWithFallback<Course[]>("/courses", mockCourses),
  });

  const visible = (courses ?? []).filter(
    (c) =>
      (filter === "All Courses" || c.category === filter) &&
      c.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background">
      <Header tagline="ACADEMY" />

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        <img
          src={heroAcademy}
          alt="Student building an electronics project"
          className="absolute inset-y-0 right-0 h-full w-full object-cover opacity-45 md:w-3/5"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/95 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <span className="inline-block rounded-full border border-primary px-3 py-1 text-[11px] font-bold tracking-wide text-primary">
            LEARN. BUILD. INNOVATE.
          </span>
          <h1 className="mt-4 max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Learn Practical Tech.
            <br />
            Build <span className="text-primary">Real Solutions.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm text-ink-muted">
            Hands-on courses in electronics, programming, robotics and more. Learn at your pace and
            build amazing projects.
          </p>

          <div className="mt-6 flex flex-wrap gap-6">
            {HERO_FEATURES.map((f) => (
              <div key={f.title} className="flex items-center gap-2 text-xs">
                <i className={`fa-solid ${f.icon} text-primary`} />
                <span>
                  <span className="block font-semibold">{f.title}</span>
                  <span className="block text-ink-muted">{f.text}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-4">
            {HERO_STATS.map((s) => (
              <div key={s.label} className="bg-ink px-4 py-4 text-center">
                <p className="text-xl font-extrabold text-primary">{s.value}</p>
                <p className="text-[11px] text-ink-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore courses */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Explore Courses</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for courses..."
                className="w-56 rounded-md border border-border py-2 pl-8 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <select className="rounded-md border border-border px-3 py-2 text-sm">
              <option>Sort by: Popular</option>
              <option>Price: Low to High</option>
              <option>Newest</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-4 py-2 text-xs font-semibold transition-colors ${
                filter === f
                  ? "bg-ink text-ink-foreground"
                  : "border border-border text-muted-foreground hover:border-primary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {isLoading ? (
            <CardGridShimmer count={5} />
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {visible.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <button className="rounded-md border border-primary px-5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
            View All Courses <i className="fa-solid fa-arrow-right ml-1 text-xs" />
          </button>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
        <div className="grid items-center gap-6 rounded-lg border border-border bg-card p-6 lg:grid-cols-[180px_1fr]">
          <h2 className="text-xl font-bold">How It Works</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.title} className="flex items-start gap-3">
                <i className={`fa-solid ${s.icon} mt-1 text-lg text-primary`} />
                <div>
                  <p className="text-sm font-semibold">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why + learning paths */}
      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-2">
        <div className="rounded-lg bg-ink p-6 text-ink-foreground">
          <h2 className="text-lg font-bold">
            Why Learn with <span className="text-primary">OpenTech Academy?</span>
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {WHY.map((w) => (
              <div key={w.title} className="flex gap-3">
                <i className={`fa-solid ${w.icon} mt-1 text-primary`} />
                <div>
                  <p className="text-sm font-semibold">{w.title}</p>
                  <p className="text-xs text-ink-muted">{w.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Popular Learning Paths</h2>
            <button className="text-xs font-semibold text-primary">View All Paths →</button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {PATHS.map((p) => (
              <div key={p.title} className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm font-semibold">{p.title}</p>
                <p className="mt-3 text-xs text-muted-foreground">{p.courses} Courses</p>
                <p className="mt-1 text-sm font-bold">
                  {formatNaira(p.price)}{" "}
                  <span className="text-xs font-normal text-muted-foreground line-through">
                    {formatNaira(p.was)}
                  </span>
                </p>
                <button className="mt-3 w-full rounded-md bg-ink px-3 py-2 text-xs font-semibold text-ink-foreground">
                  Start Path
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <h2 className="text-xl font-bold">What Students Say</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...mockTestimonials, mockTestimonials[0]!].map((t, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <img src={t.image} alt={t.name} className="h-9 w-9 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">"{t.quote}"</p>
              <p className="mt-3 text-xs text-primary">
                <i className="fa-solid fa-star" /> <i className="fa-solid fa-star" />{" "}
                <i className="fa-solid fa-star" /> <i className="fa-solid fa-star" />{" "}
                <i className="fa-solid fa-star" />{" "}
                <span className="ml-1 font-semibold text-foreground">{t.rating}.0</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-ink px-6 py-6 text-ink-foreground">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-graduation-cap text-2xl text-primary" />
            <div>
              <p className="text-lg font-bold">Ready to Start Your Learning Journey?</p>
              <p className="text-xs text-ink-muted">
                Join thousands of learners building the future with OpenTech Academy.
              </p>
            </div>
          </div>
          <button className="rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
            Register Now <i className="fa-solid fa-arrow-right ml-1 text-xs" />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
