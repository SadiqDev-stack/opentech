import { Link } from "@tanstack/react-router";
import logo from "@/assets/opentech-logo.png";

const NAV = [
  { label: "Home", to: "/" },
  { label: "Academy", to: "/academy" },
  { label: "Store", to: "/store" },
  { label: "Company", to: "/company" },
  { label: "Contact", to: "/contact" },
] as const;

type HeaderProps = {
  /** Small text under the OPENTECH wordmark, e.g. "Academy Store". */
  tagline?: string;
  cartCount?: number;
};

export default function Header({ tagline = "Academy Store", cartCount = 2 }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-ink text-ink-foreground">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="OpenTech logo" width={36} height={36} className="h-9 w-9" />
          <span className="leading-tight">
            <span className="block text-lg font-extrabold tracking-tight">OPENTECH</span>
            <span className="block text-[11px] text-ink-muted">{tagline}</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-7 text-sm font-medium lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "text-primary" }}
              className="text-ink-foreground/85 transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4 lg:ml-0">
          <button aria-label="Search" className="text-lg transition-colors hover:text-primary">
            <i className="fa-solid fa-magnifying-glass" />
          </button>
          <Link to="/cart" aria-label="Cart" className="relative text-lg hover:text-primary">
            <i className="fa-solid fa-cart-shopping" />
            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {cartCount}
            </span>
          </Link>
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90">
            Login / Register
          </button>
        </div>
      </div>
    </header>
  );
}
