import { Link } from "@tanstack/react-router";
import logo from "@/assets/opentech-logo.png";

const COLUMNS = [
  {
    title: "QUICK LINKS",
    links: ["Home", "Academy", "Store", "Company", "Contact"],
  },
  {
    title: "ACADEMY",
    links: ["All Courses", "My Courses", "Become an Instructor", "Certifications", "Student Dashboard"],
  },
  {
    title: "STORE",
    links: ["All Products", "New Arrivals", "Best Sellers", "Categories", "Track Order"],
  },
  {
    title: "SUPPORT",
    links: ["Help Center", "Shipping & Delivery", "Returns & Refunds", "FAQs", "Contact Us"],
  },
];

const SOCIALS = ["fa-facebook-f", "fa-x-twitter", "fa-instagram", "fa-youtube", "fa-linkedin-in"];

export default function Footer() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="OpenTech logo" width={40} height={40} loading="lazy" className="h-10 w-10" />
              <span className="leading-tight">
                <span className="block text-lg font-extrabold">OPENTECH</span>
                <span className="block text-[11px] text-ink-muted">Academy Store</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-ink-muted">
              Empowering learners and innovators through quality education, reliable products and
              smart solutions.
            </p>
            <div className="mt-5 flex gap-3">
              {SOCIALS.map((icon) => (
                <a
                  key={icon}
                  href="#"
                  aria-label={icon}
                  className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <i className={`fa-brands ${icon}`} />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-bold tracking-wider text-primary">{col.title}</h3>
              <ul className="mt-4 space-y-2 text-sm text-ink-muted">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="transition-colors hover:text-primary">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-xs font-bold tracking-wider text-primary">CONTACT US</h3>
            <ul className="mt-4 space-y-3 text-sm text-ink-muted">
              <li>
                <i className="fa-solid fa-location-dot mr-2 text-primary" /> Kano, Nigeria
              </li>
              <li>
                <i className="fa-solid fa-phone mr-2 text-primary" /> +234 810 123 4567
              </li>
              <li>
                <i className="fa-solid fa-envelope mr-2 text-primary" /> hello@opentech.ng
              </li>
              <li>
                <i className="fa-regular fa-clock mr-2 text-primary" /> Mon - Sat: 9AM - 6PM
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-ink-muted sm:flex-row sm:px-6">
          <p>© 2026 OpenTech Academy Store. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span>We accept:</span>
            <span className="font-bold italic text-ink-foreground">VISA</span>
            <span className="font-bold text-ink-foreground">Mastercard</span>
            <span className="font-bold text-ink-foreground">Verve</span>
            <span className="font-bold text-ink-foreground">Paystack</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
