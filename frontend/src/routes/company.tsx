import { createFileRoute } from "@tanstack/react-router";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { mockProjects, mockServices } from "@/utils/mockData";
import heroCompany from "@/assets/hero-company.jpg";

export const Route = createFileRoute("/company")({
  head: () => ({
    meta: [
      { title: "OpenTech Company — Smart Hardware, Solar & Custom Solutions" },
      {
        name: "description",
        content:
          "OpenTech designs, builds and delivers smart hardware solutions, solar installations and custom innovations for people and businesses.",
      },
      { property: "og:title", content: "OpenTech — We Build Innovative Solutions" },
      {
        property: "og:description",
        content: "Repairs, solar installation, smart devices and custom hardware engineering.",
      },
    ],
  }),
  component: CompanyPage,
});

const HERO_STATS = [
  { icon: "fa-diagram-project", value: "50+", label: "Projects Completed" },
  { icon: "fa-face-smile", value: "20+", label: "Happy Clients" },
  { icon: "fa-lightbulb", value: "5+", label: "Years of Innovation" },
];

const PROCESS = [
  { icon: "fa-comments", title: "1. Tell Us Your Need", text: "Share your idea or problem using our quick form." },
  { icon: "fa-clipboard-list", title: "2. We Analyze & Plan", text: "We study your request and propose the best solution." },
  { icon: "fa-gear", title: "3. Build & Deliver", text: "We design, build and test your solution with quality." },
  { icon: "fa-circle-check", title: "4. You Receive & Enjoy", text: "We deliver and support you every step of the way." },
];

const CTA_POINTS = [
  { icon: "fa-bolt", title: "Quick Response", text: "We reply within 24 hours" },
  { icon: "fa-users-gear", title: "Expert Team", text: "Skilled engineers and innovators" },
  { icon: "fa-headset", title: "Reliable Support", text: "Support even after delivery" },
];

function CompanyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header tagline="Innovate. Build. Impact." />

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        <img
          src={heroCompany}
          alt="Smart attendance device and solar panel on a workbench"
          className="absolute inset-y-0 right-0 h-full w-full object-cover opacity-50 md:w-3/5"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/95 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h1 className="max-w-2xl text-3xl font-extrabold leading-tight sm:text-5xl">
            We Build Innovative Solutions That{" "}
            <span className="text-primary">Solve Real-World Problems.</span>
          </h1>
          <p className="mt-4 max-w-lg text-sm text-ink-muted">
            OpenTech designs, builds and delivers smart hardware solutions, installations and custom
            innovations that empower individuals and businesses.
          </p>

          <div className="mt-6 flex flex-wrap gap-8">
            {HERO_STATS.map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <i className={`fa-solid ${s.icon} text-primary`} />
                <span>
                  <span className="block text-lg font-extrabold">{s.value}</span>
                  <span className="block text-[11px] text-ink-muted">{s.label}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <button className="rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
              Our Services
            </button>
            <button className="rounded-md border border-white/25 px-5 py-2.5 text-sm font-semibold">
              See Our Projects <i className="fa-solid fa-arrow-right ml-1 text-xs" />
            </button>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <p className="text-center text-xs font-bold tracking-widest text-primary">WHAT WE OFFER</p>
        <h2 className="mt-1 text-center text-3xl font-extrabold">Our Services</h2>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {mockServices.map((s) => (
            <div key={s.title} className="rounded-lg border border-border bg-card p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15">
                <i className={`fa-solid ${s.icon} text-primary`} />
              </span>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
              <ul className="mt-3 space-y-1.5 text-xs">
                {s.points.map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-primary" />
                    {p}
                  </li>
                ))}
              </ul>
              <button className="mt-4 rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:border-primary">
                Learn More <i className="fa-solid fa-arrow-right ml-1 text-[10px]" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <p className="text-center text-xs font-bold tracking-widest text-primary">HOW IT WORKS</p>
        <h2 className="mt-1 text-center text-3xl font-extrabold">Our Simple Process</h2>

        <div className="mt-8 grid gap-6 rounded-lg border border-border bg-card p-6 md:grid-cols-4">
          {PROCESS.map((p) => (
            <div key={p.title} className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink">
                <i className={`fa-solid ${p.icon} text-primary`} />
              </span>
              <div>
                <p className="text-sm font-semibold">{p.title}</p>
                <p className="text-xs text-muted-foreground">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest text-primary">FEATURED INNOVATIONS</p>
            <h2 className="mt-1 text-2xl font-extrabold">Our Recent Projects</h2>
          </div>
          <button className="text-xs font-semibold text-primary">View All Projects →</button>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {mockProjects.map((p) => (
            <div key={p.title} className="overflow-hidden rounded-lg border border-border bg-card">
              <img
                src={p.image}
                alt={p.title}
                loading="lazy"
                className="h-36 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="text-sm font-bold">{p.title}</h3>
                <p className="text-[11px] text-muted-foreground">{p.category}</p>
                <p className="mt-2 text-xs text-muted-foreground">{p.description}</p>
                <button className="mt-3 rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
                  View Project
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Request form */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <div className="grid gap-8 rounded-lg bg-ink p-7 text-ink-foreground lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-extrabold">
              Have an Idea or Need a <span className="text-primary">Custom</span> Solution?
            </h2>
            <p className="mt-3 text-sm text-ink-muted">
              Tell us about your project or requirement and we'll get back to you with the best
              solution.
            </p>
            <div className="mt-6 flex flex-wrap gap-6">
              {CTA_POINTS.map((c) => (
                <div key={c.title} className="flex items-start gap-2 text-xs">
                  <i className={`fa-solid ${c.icon} mt-0.5 text-primary`} />
                  <span>
                    <span className="block font-semibold">{c.title}</span>
                    <span className="block text-ink-muted">{c.text}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <input
              placeholder="Your Name"
              className="rounded-md bg-white/10 px-3 py-2.5 text-sm outline-none placeholder:text-ink-muted focus:ring-1 focus:ring-primary"
            />
            <input
              type="email"
              placeholder="Email Address"
              className="rounded-md bg-white/10 px-3 py-2.5 text-sm outline-none placeholder:text-ink-muted focus:ring-1 focus:ring-primary"
            />
            <input
              placeholder="Phone Number"
              className="rounded-md bg-white/10 px-3 py-2.5 text-sm outline-none placeholder:text-ink-muted focus:ring-1 focus:ring-primary"
            />
            <select className="rounded-md bg-white/10 px-3 py-2.5 text-sm text-ink-muted outline-none focus:ring-1 focus:ring-primary">
              <option>Service Needed</option>
              {mockServices.map((s) => (
                <option key={s.title}>{s.title}</option>
              ))}
            </select>
            <textarea
              rows={4}
              placeholder="Tell us about your project or idea..."
              className="rounded-md bg-white/10 px-3 py-2.5 text-sm outline-none placeholder:text-ink-muted focus:ring-1 focus:ring-primary sm:col-span-2"
            />
            <button className="rounded-md bg-primary py-2.5 text-sm font-bold text-primary-foreground sm:col-span-2">
              Send Request <i className="fa-solid fa-paper-plane ml-1 text-xs" />
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
