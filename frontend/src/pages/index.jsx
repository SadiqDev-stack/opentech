import { useState } from "react";
import { Link } from "@tanstack/react-router";

const processSteps = [
  ["01", "Tell us about your idea", "Share the challenge, goals, and what success looks like."],
  ["02", "We design the solution", "Our team turns your brief into a practical technical plan."],
  ["03", "We build and test", "We prototype, validate, and refine with you at every stage."],
  ["04", "You launch with confidence", "Get a dependable solution ready for real-world use."],
];

const trustStats = [
  ["50+", "Projects delivered"],
  ["4", "Core disciplines"],
  ["5+", "Years of experience"],
  ["100%", "Client-focused"],
];

export default function HomePage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="bg-background text-foreground">
      <section className="relative overflow-hidden bg-navy-deep text-white">
        <div className="container-page grid min-h-[650px] items-center gap-12 py-16 lg:grid-cols-[1.02fr_.98fr] lg:py-20">
          <div className="relative z-10 max-w-xl">
            <p className="mb-5 flex items-center gap-3 text-xs font-bold tracking-[0.22em] text-primary uppercase">
              <span className="h-px w-8 bg-primary" /> OpenTech innovation studio
            </p>
            <h1 className="text-balance text-4xl font-extrabold leading-[1.08] sm:text-6xl">
              Have an idea?
              <span className="block text-primary">Let&apos;s build it together.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/65 sm:text-lg">
              From software and electronics to automation, we turn ambitious ideas into useful, working technology.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/innovation" className="rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:brightness-110">
                Start a project
              </Link>
              <Link to="/academy" className="rounded-md border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-primary hover:text-primary">
                Explore Academy
              </Link>
            </div>
            <div className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6">
              {["Software", "Hardware", "Research"].map((item) => (
                <div key={item}>
                  <p className="text-sm font-semibold text-white">{item}</p>
                  <p className="mt-1 text-xs text-white/45">Built for impact</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative lg:pl-8">
            <div className="absolute -inset-12 bg-primary/10 blur-3xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-xl border border-white/15 bg-white/10 p-2 shadow-2xl backdrop-blur-sm">
              <div className="aspect-[4/3] overflow-hidden rounded-lg bg-navy-soft">
                <img src="/images/innovation-workshop.jpg" alt="OpenTech team working on a technology prototype" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                <div className="flex h-full items-end bg-gradient-to-t from-navy-deep via-transparent to-transparent p-6">
                  <div>
                    <p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">OpenTech lab</p>
                    <p className="mt-2 text-lg font-bold text-white">Ideas made tangible.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 bg-navy/80">
          <div className="container-page grid gap-4 py-5 sm:grid-cols-4">
            {processSteps.map(([number, title]) => (
              <div key={number} className="flex gap-3">
                <span className="font-mono text-sm text-primary">{number}</span>
                <p className="text-xs font-semibold leading-5 text-white/75">{title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page grid gap-10 py-16 lg:grid-cols-[1.1fr_.9fr] lg:py-24">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Your next breakthrough</p>
          <h2 className="mt-3 max-w-xl text-3xl font-extrabold text-navy-deep sm:text-4xl">Request a custom innovation</h2>
          <p className="mt-4 max-w-xl leading-7 text-muted-foreground">Tell us what you want to create. Our multidisciplinary team will review your brief and get back to you with a clear path forward.</p>
          <form onSubmit={handleSubmit} className="mt-8 grid gap-5 rounded-xl border border-border bg-card p-5 shadow-sm sm:grid-cols-2 sm:p-7">
            <label className="grid gap-2 text-sm font-semibold">Your name<input required className="rounded-md border border-input bg-background px-3 py-3 font-normal outline-none focus:border-primary" placeholder="Full name" /></label>
            <label className="grid gap-2 text-sm font-semibold">Email address<input required type="email" className="rounded-md border border-input bg-background px-3 py-3 font-normal outline-none focus:border-primary" placeholder="you@example.com" /></label>
            <label className="grid gap-2 text-sm font-semibold">What do you need?<select className="rounded-md border border-input bg-background px-3 py-3 font-normal outline-none focus:border-primary" defaultValue=""><option value="" disabled>Select a service</option><option>Software development</option><option>Hardware and IoT</option><option>Research and prototyping</option></select></label>
            <label className="grid gap-2 text-sm font-semibold">Budget range<select className="rounded-md border border-input bg-background px-3 py-3 font-normal outline-none focus:border-primary" defaultValue=""><option value="" disabled>Select a range</option><option>Under $5,000</option><option>$5,000 – $20,000</option><option>$20,000+</option></select></label>
            <label className="grid gap-2 text-sm font-semibold sm:col-span-2">Project summary<textarea required rows="4" className="resize-none rounded-md border border-input bg-background px-3 py-3 font-normal outline-none focus:border-primary" placeholder="Briefly describe your idea or challenge..." /></label>
            <div className="flex items-center justify-between gap-4 sm:col-span-2"><span className="text-xs text-muted-foreground">We respond within two business days.</span><button type="submit" className="rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:brightness-110">{submitted ? "Request sent" : "Submit request"}</button></div>
          </form>
        </div>
        <aside className="space-y-5 lg:pt-14">
          <div className="rounded-xl border border-border bg-surface p-6"><p className="text-sm font-bold text-navy-deep">What happens next?</p><div className="mt-5 grid gap-4">{["We review your brief", "We book a discovery call", "You receive a clear proposal"].map((item, index) => <div key={item} className="flex gap-3 text-sm"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-accent-foreground">{index + 1}</span><span className="pt-1 text-muted-foreground">{item}</span></div>)}</div></div>
          <div className="rounded-xl bg-navy-deep p-6 text-white"><p className="text-sm font-bold">Not sure where to start?</p><p className="mt-2 text-sm leading-6 text-white/60">Explore our services or speak with the OpenTech team about your direction.</p><Link to="/contact" className="mt-5 inline-flex rounded-md border border-primary px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground">Talk to our team</Link></div>
        </aside>
      </section>

      <section className="border-y border-border bg-surface"><div className="container-page grid grid-cols-2 gap-6 py-8 sm:grid-cols-4">{trustStats.map(([value, label]) => <div key={label} className="text-center"><p className="text-2xl font-extrabold text-navy-deep">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>)}</div></section>
      <section className="container-page grid gap-8 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:py-20">{processSteps.map(([number, title, description]) => <article key={number} className="border-t-2 border-primary pt-5"><p className="font-mono text-xs text-primary">{number}</p><h3 className="mt-4 font-bold text-navy-deep">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></article>)}</section>
    </div>
  );
}
