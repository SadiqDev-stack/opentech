import { createFileRoute, Link } from "@tanstack/react-router";
import SiteLayout from "@/components/SiteLayout";
import ProductCard from "@/components/ProductCard";
import CourseCard from "@/components/CourseCard";
import {
  ButtonLink,
  Card,
  CardGridSkeleton,
  ErrorState,
  SectionHeading,
  Stars,
  Badge,
} from "@/components/ui-kit";
import { useApiData } from "@/hooks/useApiData";
import { getLandingData } from "@/services/landing";
import { company } from "@/central/util/mockdata";
import { initials } from "@/utils/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OpenTech — Build. Learn. Innovate." },
      {
        name: "description",
        content:
          "OpenTech builds custom software, hardware and IoT solutions, sells genuine electronic components and trains engineers through practical courses.",
      },
      { property: "og:title", content: "OpenTech — Build. Learn. Innovate." },
      {
        property: "og:description",
        content: "One company, three connected areas: technology solutions, an electronics store and a tech academy.",
      },
    ],
  }),
  component: HomePage,
});

const pillars = [
  {
    label: "OpenTech Company",
    title: "Software, hardware & innovation",
    description:
      "Web platforms, mobile apps, embedded systems, IoT devices and automation built for real problems.",
    to: "/about",
    cta: "Our services",
    dark: true,
  },
  {
    label: "OpenTech Store",
    title: "Components & equipment",
    description:
      "Development boards, sensors, modules, robotics kits and tools, delivered anywhere in Nigeria.",
    to: "/store",
    cta: "Shop now",
    dark: false,
  },
  {
    label: "OpenTech Academy",
    title: "Practical tech training",
    description:
      "Project-based courses in programming, electronics, embedded systems, robotics and IoT.",
    to: "/academy",
    cta: "Explore courses",
    dark: true,
  },
];

const heroPoints = ["Hands-on learning", "Expert engineers", "Verified certificates", "Real-world projects"];

const whyPoints = [
  {
    title: "Engineers, not resellers",
    detail: "The same team that builds production hardware and software teaches the courses and advises on parts.",
  },
  {
    title: "One connected ecosystem",
    detail: "Learn a skill in the Academy, buy the components in the Store, and build with our team when you scale.",
  },
  {
    title: "Genuine components",
    detail: "Boards, sensors and modules sourced from trusted suppliers with technical buying advice included.",
  },
  {
    title: "Support after delivery",
    detail: "Projects and devices come with maintenance, documentation and a team you can reach.",
  },
];

function HomePage() {
  const { data, loading, error, reload } = useApiData(getLandingData);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="gradient-dark-gold relative overflow-hidden">
        <div className="container-page grid gap-10 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <Badge tone="primary">{company.tagline}</Badge>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl">
              Learn. Innovate.
              <br />
              Build the <span className="text-primary">Future.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm text-white/70 sm:text-base">{company.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to="/academy" size="lg">
                Explore Academy →
              </ButtonLink>
              <ButtonLink to="/store" size="lg" variant="outlineLight">
                Visit Store →
              </ButtonLink>
            </div>
            <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
              {heroPoints.map((point) => (
                <li key={point} className="flex items-center gap-2 text-xs font-medium text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">Talk to us</p>
            <h2 className="mt-2 text-lg font-bold text-white">Have an idea or a problem to solve?</h2>
            <p className="mt-2 text-sm text-white/65">
              Tell us what you need and our engineers will come back with a practical plan and a quote.
            </p>
            <div className="mt-5 space-y-2.5 text-sm text-white/75">
              <p>{company.phone}</p>
              <p>{company.email}</p>
              <p>{company.address}</p>
              <p>{company.workingHours}</p>
            </div>
            <ButtonLink to="/innovation" className="mt-6 w-full">
              Request a solution
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Three areas */}
      <section className="container-page -mt-8 pb-4">
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div
              key={pillar.label}
              className={`flex flex-col rounded-xl border p-6 shadow-sm ${
                pillar.dark ? "border-white/10 bg-navy text-white" : "border-border bg-card"
              }`}
            >
              <p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">{pillar.label}</p>
              <h3 className={`mt-3 text-lg font-bold ${pillar.dark ? "text-white" : "text-foreground"}`}>
                {pillar.title}
              </h3>
              <p className={`mt-2 text-sm ${pillar.dark ? "text-white/65" : "text-muted-foreground"}`}>
                {pillar.description}
              </p>
              <ButtonLink
                to={pillar.to}
                size="sm"
                variant={pillar.dark ? "outlineLight" : "outline"}
                className="mt-6 self-start"
              >
                {pillar.cta} →
              </ButtonLink>
            </div>
          ))}
        </div>
      </section>

      {/* Company intro */}
      <section className="container-page py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Who we are"
              title="A Nigerian technology company that builds, supplies and teaches"
              description={company.description}
            />
            <ButtonLink to="/about" variant="dark">
              About OpenTech
            </ButtonLink>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {whyPoints.map((point) => (
              <Card key={point.title} className="p-5">
                <h3 className="text-sm font-bold text-foreground">{point.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{point.detail}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-surface py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="What we offer"
            title="Our services"
            description="From an idea on paper to a deployed product, and the skills and parts to build it yourself."
            align="center"
          />
          {loading ? (
            <CardGridSkeleton count={4} />
          ) : error ? (
            <ErrorState error={error} onRetry={reload} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(data?.services || []).map((service) => (
                <Card key={service.id} className="flex h-full flex-col p-6">
                  <span className="gradient-gold flex h-11 w-11 items-center justify-center rounded-lg text-sm font-black text-primary-foreground">
                    {service.title.slice(0, 1)}
                  </span>
                  <h3 className="mt-4 text-base font-bold text-foreground">{service.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{service.summary}</p>
                  <ul className="mt-4 space-y-1.5">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex gap-2 text-xs text-muted-foreground">
                        <span className="text-primary" aria-hidden="true">
                          ✓
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured courses */}
      <section className="container-page py-16">
        <SectionHeading
          eyebrow="OpenTech Academy"
          title="Featured courses"
          description="Practical, project-based training taught by working engineers."
          action={
            <Link to="/academy" className="text-sm font-semibold text-primary hover:underline">
              View all courses →
            </Link>
          }
        />
        {loading ? (
          <CardGridSkeleton count={4} />
        ) : error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(data?.courses || []).slice(0, 4).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* Featured products */}
      <section className="bg-surface py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="OpenTech Store"
            title="Featured products"
            description="Genuine boards, sensors, modules and tools with nationwide delivery."
            action={
              <Link to="/store" className="text-sm font-semibold text-primary hover:underline">
                View all products →
              </Link>
            }
          />
          {loading ? (
            <CardGridSkeleton count={4} />
          ) : error ? (
            <ErrorState error={error} onRetry={reload} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(data?.products || []).slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Innovation CTA */}
      <section className="container-page py-16">
        <div className="gradient-dark-gold overflow-hidden rounded-2xl px-6 py-12 sm:px-12">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">Innovation</p>
              <h2 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
                Have an idea or need a <span className="text-primary">custom</span> solution?
              </h2>
              <p className="mt-3 max-w-xl text-sm text-white/70">
                Share your project or problem. We study the requirement, propose an approach, then design, build and
                support the solution with you.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <ButtonLink to="/innovation" size="lg">
                Request a solution
              </ButtonLink>
              <ButtonLink to="/contact" size="lg" variant="outlineLight">
                Contact us
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-surface py-16">
        <div className="container-page">
          <SectionHeading eyebrow="Feedback" title="What people say" align="center" />
          {loading ? (
            <CardGridSkeleton count={3} />
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {(data?.testimonials || []).map((item) => (
                <Card key={item.id} className="flex h-full flex-col p-6">
                  <Stars rating={item.rating} />
                  <p className="mt-4 flex-1 text-sm text-muted-foreground">“{item.comment}”</p>
                  <div className="mt-5 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-xs font-bold text-primary">
                      {initials(item.name)}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-foreground">{item.name}</span>
                      <span className="block text-xs text-muted-foreground">{item.role}</span>
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Team */}
      <section className="container-page py-16">
        <SectionHeading eyebrow="Our team" title="The people behind OpenTech" align="center" />
        {loading ? (
          <CardGridSkeleton count={5} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {(data?.staff || []).map((person) => (
              <Card key={person.id} className="p-5 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-navy text-sm font-bold text-primary">
                  {initials(person.fullName)}
                </span>
                <h3 className="mt-3 text-sm font-bold text-foreground">{person.fullName}</h3>
                <p className="text-xs font-medium text-primary">{person.role}</p>
                <p className="mt-2 text-xs text-muted-foreground">{person.bio}</p>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Final CTA */}
      <section className="bg-navy py-14">
        <div className="container-page flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-extrabold text-white">Ready to start with OpenTech?</h2>
            <p className="mt-2 text-sm text-white/65">
              Create a free account to enroll in courses, track orders and follow your projects.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink to="/register" size="lg">
              Create account
            </ButtonLink>
            <ButtonLink to="/login" size="lg" variant="outlineLight">
              Sign in
            </ButtonLink>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
