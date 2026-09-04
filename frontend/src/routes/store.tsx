import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { CardGridShimmer } from "@/components/Shimmer";
import { fetchWithFallback } from "@/utils/api";
import { mockProducts, productCategories, type Product } from "@/utils/mockData";
import heroRobot from "@/assets/hero-robot.jpg";

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      { title: "OpenTech Store — Quality Electronics, Robotics & Kits" },
      {
        name: "description",
        content:
          "Shop the best electronics, robotics, tools and kits curated for learners, builders and innovators across Nigeria.",
      },
      { property: "og:title", content: "OpenTech Store — Quality Components" },
      {
        property: "og:description",
        content: "Electronics, robotics, tools and starter kits at the best prices.",
      },
    ],
  }),
  component: StorePage,
});

const HERO_BADGES = [
  { icon: "fa-circle-check", title: "100%", text: "Genuine Products" },
  { icon: "fa-truck-fast", title: "Fast Delivery", text: "Across Nigeria" },
  { icon: "fa-shield-halved", title: "Secure Payment", text: "Multiple Options" },
  { icon: "fa-rotate-left", title: "Easy Returns", text: "7 Days Return Policy" },
];

const BRANDS = [
  { name: "Arduino", count: 12 },
  { name: "ESP", count: 8 },
  { name: "Raspberry Pi", count: 6 },
  { name: "DFRobot", count: 10 },
  { name: "Elegoo", count: 7 },
];

const PERKS = [
  { icon: "fa-box", title: "Bulk Order Discount", text: "Get special prices for bulk purchases." },
  { icon: "fa-user-graduate", title: "For Students", text: "Exclusive discounts for learners." },
  { icon: "fa-cubes", title: "Build Your Own Kit", text: "Pick components and we'll help you build." },
];

function StorePage() {
  const [category, setCategory] = useState(productCategories[0]!.name);
  const [brands, setBrands] = useState<string[]>([]);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchWithFallback<Product[]>("/products", mockProducts),
  });

  const visible = (products ?? []).filter(
    (p) => (brands.length === 0 || brands.includes(p.brand)),
  );

  const toggleBrand = (name: string) =>
    setBrands((prev) => (prev.includes(name) ? prev.filter((b) => b !== name) : [...prev, name]));

  return (
    <div className="min-h-screen bg-muted/40">
      <Header tagline="Academy Store" />

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        <img
          src={heroRobot}
          alt="Robot car kit on a circuit board"
          className="absolute inset-y-0 right-0 h-full w-full object-cover opacity-50 md:w-3/5"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/95 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <h1 className="max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl">
            Quality Components.
            <br />
            Build <span className="text-primary">Amazing</span> Things.
          </h1>
          <p className="mt-3 max-w-lg text-sm text-ink-muted">
            Shop the best electronics, robotics, tools and kits curated for learners, builders and
            innovators.
          </p>

          <div className="mt-6 flex flex-wrap gap-6">
            {HERO_BADGES.map((b) => (
              <div key={b.title} className="flex items-center gap-2 text-xs">
                <i className={`fa-solid ${b.icon} text-primary`} />
                <span>
                  <span className="block font-semibold">{b.title}</span>
                  <span className="block text-ink-muted">{b.text}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex max-w-xl overflow-hidden rounded-md">
            <input
              placeholder="Search for products, categories..."
              className="flex-1 bg-white px-4 py-2.5 text-sm text-foreground outline-none"
            />
            <button className="bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Category tabs */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 sm:px-6">
          {productCategories.map((c) => (
            <button
              key={c.name}
              onClick={() => setCategory(c.name)}
              className={`flex shrink-0 items-center gap-2 border-b-2 py-3 text-xs font-medium transition-colors ${
                category === c.name
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <i className={`fa-solid ${c.icon}`} />
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sidebar + grid */}
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-bold">Categories</h2>
            <ul className="mt-3 space-y-1 text-xs">
              {productCategories.map((c) => (
                <li key={c.name}>
                  <button
                    onClick={() => setCategory(c.name)}
                    className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left transition-colors ${
                      category === c.name
                        ? "bg-primary/15 font-semibold text-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {c.name}
                    <i className="fa-solid fa-chevron-right text-[9px]" />
                  </button>
                </li>
              ))}
              <li className="px-2 py-1.5 text-muted-foreground">Communication</li>
              <li className="px-2 py-1.5 text-muted-foreground">Books &amp; Guides</li>
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-bold">Filter by Price</h2>
            <input type="range" className="mt-3 w-full accent-[var(--primary)]" />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>₦500</span>
              <span>₦100,000+</span>
            </div>
            <button className="mt-3 w-full rounded-md bg-primary py-2 text-xs font-bold text-primary-foreground">
              Apply Filter
            </button>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-bold">Brand</h2>
            <ul className="mt-3 space-y-2 text-xs">
              {BRANDS.map((b) => (
                <li key={b.name} className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={brands.includes(b.name)}
                      onChange={() => toggleBrand(b.name)}
                      className="accent-[var(--primary)]"
                    />
                    {b.name}
                  </label>
                  <span className="text-muted-foreground">({b.count})</span>
                </li>
              ))}
            </ul>
            <button className="mt-3 text-xs font-semibold text-primary">View more</button>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 text-center">
            <i className="fa-solid fa-headset text-xl text-primary" />
            <p className="mt-2 text-sm font-bold">Need Help Choosing?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Our experts are here to help you find the right parts.
            </p>
            <button className="mt-3 rounded-md bg-ink px-4 py-2 text-xs font-semibold text-ink-foreground">
              Chat with Us
            </button>
          </div>
        </aside>

        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing 1–{visible.length} of {visible.length} products
            </p>
            <select className="rounded-md border border-border bg-background px-3 py-1.5 text-xs">
              <option>Sort by: Popular</option>
              <option>Price: Low to High</option>
              <option>Top Rated</option>
            </select>
          </div>

          <div className="mt-4">
            {isLoading ? (
              <CardGridShimmer count={8} />
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {visible.map((p) => (
                  <ProductCard key={p.id} product={p} detailed />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Perks strip */}
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
        <div className="grid gap-6 rounded-lg bg-ink p-6 text-ink-foreground md:grid-cols-4">
          {PERKS.map((p) => (
            <div key={p.title} className="flex items-start gap-3">
              <i className={`fa-solid ${p.icon} mt-1 text-primary`} />
              <div>
                <p className="text-sm font-semibold">{p.title}</p>
                <p className="text-xs text-ink-muted">{p.text}</p>
              </div>
            </div>
          ))}
          <div>
            <p className="text-sm font-semibold">Can't find what you need?</p>
            <p className="text-xs text-ink-muted">
              Request a product and we'll source it for you.
            </p>
            <button className="mt-2 rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
              Request Product
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
