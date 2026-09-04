import { createFileRoute, Link } from "@tanstack/react-router";
import SiteLayout from "@/components/SiteLayout";
import ProductCard from "@/components/ProductCard";
import CourseCard from "@/components/CourseCard";
import { ButtonLink, CardGridSkeleton, ErrorState, SectionHeading } from "@/components/ui-kit";
import { useApiData } from "@/hooks/useApiData";
import { getLandingData } from "@/services/landing";
import { company } from "@/central/util/mockdata";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OpenTech Academy | Learn. Innovate. Build the Future." },
      { name: "description", content: "Learn practical technology, shop trusted components, and build ambitious ideas with OpenTech." },
    ],
  }),
  component: HomePage,
});

const benefits = [
  ["⌁", "Hands-on", "Learning"],
  ["♙", "Expert", "Mentors"],
  ["♧", "Certified", "Programs"],
  ["↗", "Real World", "Projects"],
];

const pillars = [
  { icon: "⌂", title: "Academy", text: "Learn Programming, Electronics, Robotics, IoT and more with practical projects.", action: "Explore Courses", to: "/academy", dark: true },
  { icon: "⌑", title: "Store", text: "Shop quality electronic components, robot kits, tools and tech gadgets at the best prices.", action: "Shop Now", to: "/store", dark: false },
  { icon: "▦", title: "Company", text: "We build custom hardware solutions, prototypes and automation systems.", action: "Our Services", to: "/about", dark: true },
];

function HomePage() {
  const { data, loading, error, reload } = useApiData(getLandingData);
  const courses = data?.courses || [];
  const products = data?.products || [];

  return (
    <SiteLayout>
      <main>
        <section className="relative overflow-hidden bg-navy-deep text-white">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 75% 20%, oklch(0.845 0.163 86 / .25), transparent 30%), linear-gradient(105deg, transparent 45%, oklch(0.845 0.163 86 / .12) 45.2%, transparent 45.7%)" }} />
          <div className="container-page relative grid min-h-[510px] items-center gap-10 py-16 lg:grid-cols-[.95fr_1.05fr] lg:py-20">
            <div className="z-10 max-w-xl">
              <h1 className="text-balance text-5xl font-extrabold leading-[1.08] sm:text-7xl">Learn. Innovate.<br />Build the <span className="text-primary">Future.</span></h1>
              <p className="mt-6 max-w-md text-base leading-7 text-white/70">OpenTech Academy is where hardware meets software, ideas become innovations and learners become creators.</p>
              <div className="mt-8 flex flex-wrap gap-4"><ButtonLink to="/academy" size="lg">Explore Academy <span aria-hidden="true">→</span></ButtonLink><ButtonLink to="/store" size="lg" variant="outlineLight">Visit Store <span aria-hidden="true">→</span></ButtonLink></div>
              <div className="mt-12 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-4">{benefits.map(([icon, first, second]) => <div key={first} className="flex items-center gap-2"><span className="text-2xl text-primary" aria-hidden="true">{icon}</span><span className="text-xs font-medium leading-4 text-white/80">{first}<br />{second}</span></div>)}</div>
            </div>
            <div className="relative hidden min-h-[430px] lg:block"><div className="absolute right-0 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full border border-primary/30" /><div className="absolute right-20 top-16 h-72 w-72 rounded-full border border-primary/20" /><div className="absolute bottom-14 right-12 h-2 w-72 rotate-[-28deg] bg-primary shadow-[0_0_24px_var(--color-primary)]" /><div className="absolute bottom-10 right-32 h-52 w-60 rounded-[45%] border-8 border-white/70 bg-navy-soft shadow-2xl"><div className="absolute inset-5 rounded-2xl border border-primary bg-navy-deep p-8 text-center"><span className="text-5xl text-primary">⌁</span><p className="mt-3 text-xs font-bold tracking-widest">OPENTECH</p><p className="text-[10px] text-white/60">Academy</p></div></div><div className="absolute bottom-2 right-14 h-16 w-16 rounded-full border-8 border-white/70 bg-navy-soft" /><div className="absolute bottom-2 right-72 h-16 w-16 rounded-full border-8 border-white/70 bg-navy-soft" /><div className="absolute right-40 top-8 h-36 w-14 rotate-12 rounded-full border-8 border-white/70 bg-navy-soft" /></div>
          </div>
        </section>

        <section className="container-page -mt-1 py-8"><div className="grid gap-4 md:grid-cols-3">{pillars.map((item) => <article key={item.title} className={`relative min-h-52 overflow-hidden rounded-xl border p-6 shadow-sm ${item.dark ? "border-white/10 bg-navy text-white" : "border-border bg-card"}`}><span className="text-3xl text-primary" aria-hidden="true">{item.icon}</span><h2 className="mt-3 text-xl font-bold">{item.title}</h2><p className={`mt-2 max-w-xs text-sm leading-6 ${item.dark ? "text-white/65" : "text-muted-foreground"}`}>{item.text}</p><ButtonLink to={item.to} size="sm" variant={item.dark ? "outlineLight" : "outline"} className="mt-5">{item.action} <span aria-hidden="true">→</span></ButtonLink></article>)}</div></section>

        <section className="container-page py-8"><SectionHeading title="Popular Courses" action={<Link to="/academy" className="text-sm font-semibold hover:text-primary">View all courses →</Link>} />{loading ? <CardGridSkeleton count={5} /> : error ? <ErrorState error={error} onRetry={reload} /> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{courses.slice(0, 5).map((course) => <CourseCard key={course.id} course={course} />)}</div>}</section>

        <section className="container-page py-8"><div className="grid gap-8 rounded-xl bg-navy-deep p-8 text-white lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><h2 className="text-2xl font-extrabold">Why Choose<br />OpenTech <span className="text-primary">Academy?</span></h2><p className="mt-4 max-w-sm text-sm leading-6 text-white/65">We combine theory with practical experience to prepare you for real world challenges.</p><ButtonLink to="/about" className="mt-6">About Us →</ButtonLink></div><div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{[["500+", "Students Trained"], ["50+", "Projects Completed"], ["10+", "Expert Instructors"], ["100%", "Hands-on Practice"]].map(([value, label]) => <div key={label} className="border-l border-white/15 px-4 text-center"><p className="text-3xl font-extrabold text-white">{value}</p><p className="mt-2 text-xs text-white/60">{label}</p></div>)}</div></div></section>

        <section className="container-page py-8"><SectionHeading title="Featured Products" action={<Link to="/store" className="text-sm font-semibold hover:text-primary">View all products →</Link>} />{loading ? <CardGridSkeleton count={5} /> : error ? <ErrorState error={error} onRetry={reload} /> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{products.slice(0, 5).map((product) => <ProductCard key={product.id} product={product} />)}</div>}</section>

        <section className="mt-8 bg-navy-deep py-7 text-white"><div className="container-page grid grid-cols-2 gap-6 sm:grid-cols-4">{[["▱", "Fast Delivery", "Across Nigeria"], ["♢", "Secure Payment", "100% Safe"], ["↻", "7 Days Return", "Money Back Guarantee"], ["◉", "24/7 Support", "We are here to help"]].map(([icon, title, text]) => <div key={title} className="flex items-center gap-3"><span className="text-2xl text-primary" aria-hidden="true">{icon}</span><span><strong className="block text-xs">{title}</strong><small className="text-xs text-white/55">{text}</small></span></div>)}</div></section>
      </main>
    </SiteLayout>
  );
}

void company;
 עוד
