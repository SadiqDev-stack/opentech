import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { CardGridShimmer } from "@/components/Shimmer";
import { fetchWithFallback, formatNaira } from "@/utils/api";
import {
  mockCourses,
  mockProducts,
  mockStats,
  mockTeam,
  mockTestimonials,
  type Course,
  type Product,
} from "@/utils/mockData";
import heroRobot from "@/assets/hero-robot.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OpenTech Academy Store — Learn. Innovate. Build the Future." },
      {
        name: "description",
        content:
          "Hardware meets software at OpenTech. Learn practical tech, shop quality electronics and build real world projects.",
      },
      { property: "og:title", content: "OpenTech Academy Store" },
      {
        property: "og:description",
        content: "Learn practical tech, shop quality electronics and build real world projects.",
      },
    ],
  }),
  component: LandingPage,
});

const HERO_POINTS = [
  { icon: "fa-screwdriver-wrench", label: "Hands-on Learning" },
  { icon: "fa-user-tie", label: "Expert Mentors" },
  { icon: "fa-award", label: "Certified Programs" },
  { icon: "fa-rocket", label: "Real World Projects" },
];

const PILLARS = [
  {
    icon: "fa-graduation-cap",
    title: "Academy",
    text: "Learn Programming, Electronics, Robotics, IoT and more with practical projects.",
    cta: "Explore Courses",
    to: "/academy" as const,
    dark: true,
  },
  {
    icon: "fa-cart-shopping",
    title: "Store",
    text: "Shop quality electronic components, robot kits, tools and tech gadgets at the best prices.",
    cta: "Shop Now",
    to: "/store" as const,
    dark: false,
  },
  {
    icon: "fa-building",
    title: "Company",
    text: "We build custom hardware solutions, prototypes and automation systems.",
    cta: "Our Services",
    to: "/company" as const,
    dark: true,
  },
];

const WHY_STATS = [
  { icon: "fa-users", value: "500+", label: "Students Trained" },
  { icon: "fa-clipboard-check", value: "50+", label: "Projects Completed" },
  { icon: "fa-chalkboard-user", value: "10+", label: "Expert Instructors" },
  { icon: "fa-circle-down", value: "100%", label: "Hands-on Practice" },
];

const SERVICE_STRIP = [
  { icon: "fa-truck-fast", title: "Fast Delivery", text: "Across Nigeria" },
  { icon: "fa-shield-halved", title: "Secure Payment", text: "100% Safe" },
  { icon: "fa-rotate-left", title: "7 Days Return", text: "Money Back Guarantee" },
  { icon: "fa-headset", title: "24/7 Support", text: "We are here to help" },
];

const BRANDS = ["Arduino", "Raspberry Pi", "ESPRESSIF", "micro:bit", "ST", "JLCPCB"];

function LandingPage() {
  const products = useQuery({
    queryKey: ["landing", "products"],
    queryFn: () => fetchWithFallback<Product[]>("/products?featured=true", mockProducts),
  });
  const courses = useQuery({
    queryKey: ["landing", "courses"],
    queryFn: () => fetchWithFallback<Course[]>("/courses/featured", mockCourses),
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink text-ink-foreground">
        <img
          src={heroRobot}
          alt="Robot car kit on a circuit board"
          width={1600}
          height={1008}
          className="absolute inset-y-0 right-0 h-full w-full object-cover opacity-70 lg:w-3/5"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/95 to-ink/20" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <h1 className="max-w-xl text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Learn. Innovate.
            <br />
            Build the <span className="text-primary">Future.</span>
          </h1>
          <p className="mt-5 max-w-md text-sm text-ink-muted">
            OpenTech Academy is where hardware meets software, ideas become innovations and learners
            become creators.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/academy"
              className="rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Explore Academy <i className="fa-solid fa-arrow-right ml-2" />
            </Link>
            <Link
              to="/store"
              className="rounded-md border border-white/40 px-5 py-3 text-sm font-bold transition-colors hover:border-primary hover:text-primary"
            >
              Visit Store <i className="fa-solid fa-arrow-right ml-2" />
            </Link>
          </div>
          <ul className="mt-12 flex flex-wrap gap-x-10 gap-y-4 text-xs">
            {HERO_POINTS.map((p) => (
              <li key={p.label} className="flex items-center gap-2">
                <i className={`fa-solid ${p.icon} text-lg text-primary`} />
                <span className="max-w-[7rem]">{p.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Three pillars */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className={`rounded-xl p-6 ${
                p.dark ? "bg-ink text-ink-foreground" : "border border-border bg-card"
              }`}
            >
              <div className="flex items-center gap-3">
                <i className={`fa-solid ${p.icon} text-2xl text-primary`} />
                <h2 className="text-xl font-bold">{p.title}</h2>
              </div>
              <p
                className={`mt-3 max-w-xs text-sm ${
                  p.dark ? "text-ink-muted" : "text-muted-foreground"
                }`}
              >
                {p.text}
              </p>
              <Link
                to={p.to}
                className={`mt-6 inline-block rounded-md border px-4 py-2 text-xs font-semibold transition-colors ${
                  p.dark
                    ? "border-white/30 hover:border-primary hover:text-primary"
                    : "border-border hover:border-primary hover:text-primary"
                }`}
              >
                {p.cta} <i className="fa-solid fa-arrow-right ml-1" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Popular courses */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <SectionHead title="Popular Courses" linkLabel="View all courses" to="/academy" />
        {courses.isLoading ? (
          <CardGridShimmer />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {courses.data?.slice(0, 5).map((course) => (
              <div key={course.id} className="rounded-lg border border-border bg-card p-3">
                <img
                  src={course.image}
                  alt={course.title}
                  loading="lazy"
                  className="h-28 w-full rounded-md object-cover"
                />
                <h3 className="mt-3 line-clamp-2 text-sm font-semibold">{course.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  <i className="fa-solid fa-star mr-1 text-primary" />
                  {course.rating} ({course.ratingCount})
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold">{formatNaira(course.price)}</span>
                  <i className="fa-solid fa-arrow-right text-primary" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Why choose */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <div className="grid gap-8 rounded-xl bg-ink p-8 text-ink-foreground lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">
              Why Choose
              <br />
              OpenTech <span className="text-primary">Academy?</span>
            </h2>
            <p className="mt-3 max-w-sm text-sm text-ink-muted">
              We combine theory with practical experience to prepare you for real world challenges.
            </p>
            <Link
              to="/company"
              className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
            >
              About Us <i className="fa-solid fa-arrow-right ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-6 rounded-lg border border-white/10 p-6 sm:grid-cols-4">
            {WHY_STATS.map((s) => (
              <div key={s.label} className="text-center">
                <i className={`fa-solid ${s.icon} text-2xl text-primary`} />
                <p className="mt-2 text-2xl font-extrabold">{s.value}</p>
                <p className="text-[11px] text-ink-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <SectionHead title="Featured Products" linkLabel="View all products" to="/store" />
        {products.isLoading ? (
          <CardGridShimmer />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {products.data
              ?.filter((p) => p.featured)
              .slice(0, 5)
              .map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </section>

      {/* Service strip */}
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {SERVICE_STRIP.map((s) => (
            <div key={s.title} className="flex items-center gap-3">
              <i className={`fa-solid ${s.icon} text-xl text-primary`} />
              <div>
                <p className="text-sm font-semibold">{s.title}</p>
                <p className="text-xs text-ink-muted">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-6 rounded-xl bg-ink p-8 text-ink-foreground sm:grid-cols-3 lg:grid-cols-5">
          {mockStats.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <i className={`fa-solid ${s.icon} text-2xl text-primary`} />
              <div>
                <p className="text-xl font-extrabold">{s.value}</p>
                <p className="text-[11px] text-ink-muted">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About / vision-mission-values */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-4">
          <div>
            <p className="text-xs font-bold tracking-widest text-primary">ABOUT US</p>
            <h2 className="mt-2 text-2xl font-extrabold leading-tight">
              Empowering Innovators. Building the <span className="text-primary">Future.</span>
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              OpenTech is an innovative technology company focused on education, products and
              solutions that empower individuals and businesses to build, learn and grow.
            </p>
            <Link
              to="/company"
              className="mt-5 inline-block rounded-md bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
            >
              Learn More About Us <i className="fa-solid fa-arrow-right ml-1" />
            </Link>
          </div>

          <div className="rounded-xl bg-ink p-6 text-ink-foreground">
            <i className="fa-regular fa-eye text-2xl text-primary" />
            <h3 className="mt-3 font-bold">Our Vision</h3>
            <p className="mt-2 text-sm text-ink-muted">
              To become Africa's leading technology ecosystem empowering the next generation of
              innovators and problem solvers.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <i className="fa-solid fa-bullseye text-2xl text-primary" />
            <h3 className="mt-3 font-bold">Our Mission</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              To provide quality education, reliable products and smart solutions that make
              technology accessible and impactful for everyone.
            </p>
          </div>

          <div className="rounded-xl bg-accent p-6">
            <i className="fa-solid fa-rocket text-2xl text-primary" />
            <h3 className="mt-3 font-bold">Our Values</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {["Innovation", "Excellence", "Integrity", "Impact", "Community"].map((v) => (
                <li key={v}>
                  <i className="fa-solid fa-circle-check mr-2 text-primary" />
                  {v}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <p className="text-xs font-bold tracking-widest text-primary">MEET THE TEAM</p>
        <div className="mt-2 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold">
            The Minds Behind <span className="text-primary">OpenTech</span>
          </h2>
          <button className="rounded-md border border-border px-4 py-2 text-xs font-semibold hover:border-primary">
            View All Team Members <i className="fa-solid fa-arrow-right ml-1" />
          </button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {mockTeam.map((member) => (
            <div key={member.name} className="text-center">
              <img
                src={member.image}
                alt={member.name}
                loading="lazy"
                className="h-44 w-full rounded-lg object-cover"
              />
              <p className="mt-3 text-sm font-semibold">{member.name}</p>
              <p className="text-xs text-primary">{member.role}</p>
              <div className="mt-2 flex justify-center gap-3 text-xs text-muted-foreground">
                <i className="fa-brands fa-linkedin-in" />
                <i className="fa-brands fa-x-twitter" />
                <i className="fa-solid fa-envelope" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brands */}
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <p className="text-[11px] font-bold tracking-widest text-primary">
            TRUSTED BY LEARNERS & INNOVATORS
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-6 text-sm font-semibold text-ink-muted">
            {BRANDS.map((brand) => (
              <span key={brand}>{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <p className="text-xs font-bold tracking-widest text-primary">WHAT OUR STUDENTS SAY</p>
        <div className="mt-2 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold">Real People. Real Impact.</h2>
          <button className="rounded-md border border-border px-4 py-2 text-xs font-semibold hover:border-primary">
            View All Testimonials <i className="fa-solid fa-arrow-right ml-1" />
          </button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {mockTestimonials.map((t) => (
            <div key={t.name} className="rounded-lg border border-border bg-card p-5">
              <i className="fa-solid fa-quote-left text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">{t.quote}</p>
              <div className="mt-4 flex items-center gap-3">
                <img
                  src={t.image}
                  alt={t.name}
                  loading="lazy"
                  className="h-9 w-9 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
                <span className="text-xs font-semibold text-primary">
                  <i className="fa-solid fa-star mr-1" />
                  {t.rating.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <div className="flex flex-col items-center gap-6 rounded-xl bg-ink p-8 text-ink-foreground lg:flex-row">
          <i className="fa-solid fa-envelope-open-text rounded-lg bg-primary p-4 text-2xl text-primary-foreground" />
          <div className="flex-1">
            <h2 className="text-xl font-bold">Stay Updated. Stay Ahead.</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Subscribe to get the latest courses, products, events and tech tips straight to your
              inbox.
            </p>
          </div>
          <form
            className="flex w-full max-w-md"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <input
              type="email"
              required
              placeholder="Enter your email address"
              className="w-full rounded-l-md bg-white px-4 py-3 text-sm text-foreground outline-none"
            />
            <button className="rounded-r-md bg-primary px-5 text-sm font-bold text-primary-foreground">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function SectionHead({
  title,
  linkLabel,
  to,
}: {
  title: string;
  linkLabel: string;
  to: "/academy" | "/store";
}) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <h2 className="border-b-4 border-primary pb-2 text-2xl font-extrabold">{title}</h2>
      <Link to={to} className="text-sm font-medium text-muted-foreground hover:text-primary">
        {linkLabel} <i className="fa-solid fa-arrow-right ml-1" />
      </Link>
    </div>
  );
}
