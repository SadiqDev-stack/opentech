import { useState } from "react";
import { Link } from "@tanstack/react-router";
import Logo from "./Logo";
import { ButtonLink } from "./ui-kit";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { company } from "@/central/util/mockdata";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/academy", label: "Academy" },
  { to: "/store", label: "Store" },
  { to: "/about", label: "Company" },
  { to: "/contact", label: "Contact" },
];

function Navbar() {
  const cart = useCart();
  const auth = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-navy-deep/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              activeProps={{ className: "text-primary" }}
              className="text-sm font-medium text-white/75 transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            className="relative rounded-md p-2 text-white/80 transition-colors hover:text-primary"
            aria-label={`Cart, ${cart.count} items`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6" />
              <circle cx="10" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
            </svg>
            {cart.count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {cart.count}
              </span>
            )}
          </Link>

          {auth.isAuthenticated ? (
            <ButtonLink to={auth.isAdmin ? "/admin" : "/dashboard"} size="sm" className="hidden sm:inline-flex">
              Dashboard
            </ButtonLink>
          ) : (
            <ButtonLink to="/login" size="sm" className="hidden sm:inline-flex">
              Login / Register
            </ButtonLink>
          )}

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label="Toggle menu"
            className="rounded-md p-2 text-white lg:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-navy-deep lg:hidden">
          <nav className="container-page flex flex-col py-3" aria-label="Mobile">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm font-medium text-white/80"
              >
                {link.label}
              </Link>
            ))}
            <Link to="/login" onClick={() => setOpen(false)} className="py-2.5 text-sm font-semibold text-primary">
              Login / Register
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

const footerGroups = [
  {
    title: "Company",
    links: [
      { to: "/about", label: "About Us" },
      { to: "/about", label: "Our Team" },
      { to: "/innovation", label: "Request a Solution" },
      { to: "/contact", label: "Contact Us" },
    ],
  },
  {
    title: "Store",
    links: [
      { to: "/store", label: "All Products" },
      { to: "/store", label: "Development Boards" },
      { to: "/store", label: "Sensors" },
      { to: "/cart", label: "Your Cart" },
    ],
  },
  {
    title: "Academy",
    links: [
      { to: "/academy", label: "All Courses" },
      { to: "/academy", label: "Programming" },
      { to: "/academy", label: "Electronics" },
      { to: "/register", label: "Create Account" },
    ],
  },
];

function Footer() {
  return (
    <footer className="bg-navy-deep pt-14 pb-6 text-white/70">
      <div className="container-page grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm">{company.description}</p>
          <div className="mt-5 flex gap-3">
            {Object.entries(company.socials).map(([name, href]) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-xs font-bold uppercase transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                {name.slice(0, 2)}
              </a>
            ))}
          </div>
        </div>

        {footerGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-xs font-bold tracking-[0.18em] text-white uppercase">{group.title}</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {group.links.map((link) => (
                <li key={`${group.title}-${link.label}`}>
                  <Link to={link.to} className="transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container-page mt-10 border-t border-white/10 pt-5">
        <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} OpenTech. All rights reserved.</p>
          <p>
            {company.address} · {company.phone} · {company.email}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function SiteLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHero({ eyebrow, title, description, children }) {
  return (
    <section className="gradient-dark-gold py-14 sm:py-20">
      <div className="container-page">
        {eyebrow && (
          <p className="mb-3 text-xs font-bold tracking-[0.18em] text-primary uppercase">{eyebrow}</p>
        )}
        <h1 className="max-w-3xl text-3xl font-extrabold text-white sm:text-4xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-sm text-white/70 sm:text-base">{description}</p>}
        {children && <div className="mt-7">{children}</div>}
      </div>
    </section>
  );
}
