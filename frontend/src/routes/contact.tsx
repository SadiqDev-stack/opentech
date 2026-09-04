import { createFileRoute } from "@tanstack/react-router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact OpenTech — Talk to our team" },
      {
        name: "description",
        content: "Reach the OpenTech team for courses, products, repairs and custom solutions.",
      },
      { property: "og:title", content: "Contact OpenTech" },
      { property: "og:description", content: "Reach the OpenTech team in Kano, Nigeria." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header tagline="Innovate. Build. Impact." />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-extrabold">
          Get In <span className="text-primary">Touch</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Send us a message and we will get back to you within 24 hours.
        </p>
        {/* POST /api/contact */}
        <form
          className="mt-8 grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <input
            required
            placeholder="Full name"
            className="rounded-md border border-border px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <input
            required
            type="email"
            placeholder="Email address"
            className="rounded-md border border-border px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <input
            required
            placeholder="Subject"
            className="rounded-md border border-border px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <textarea
            required
            rows={5}
            placeholder="Your message"
            className="rounded-md border border-border px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <button className="justify-self-start rounded-md bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">
            Send Message <i className="fa-solid fa-paper-plane ml-2" />
          </button>
        </form>
      </section>
      <Footer />
    </div>
  );
}
