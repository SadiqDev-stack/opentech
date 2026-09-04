import { Link } from "react-router-dom";

const courses = [
  { title: "Arduino Programming for Beginners", meta: "4.8 (120)", price: "₦15,000", image: "/images/arduino-course.jpg" },
  { title: "Electronics Basics & Circuit Design", meta: "4.7 (89)", price: "₦20,000", image: "/images/electronics-course.jpg" },
  { title: "Robotics & Automation with Arduino", meta: "4.9 (101)", price: "₦25,000", image: "/images/robotics-course.jpg" },
  { title: "Internet of Things (IoT) from Scratch", meta: "4.8 (78)", price: "₦20,000", image: "/images/iot-course.jpg" },
  { title: "Python Programming for Beginners", meta: "4.6 (95)", price: "₦15,000", image: "/images/python-course.jpg" },
];

const products = [
  ["Arduino Uno R3", "₦8,500", "/images/arduino-uno.jpg"],
  ["ESP32 Dev Board", "₦6,500", "/images/esp32.jpg"],
  ["Robot Car Kit", "₦25,000", "/images/robot-car.jpg"],
  ["Jumper Wires Pack", "₦2,000", "/images/jumper-wires.jpg"],
  ["Breadboard (830 Points)", "₦1,500", "/images/breadboard.jpg"],
];

function Arrow() { return <span aria-hidden="true">→</span>; }

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fbfbfa] text-[#11151a]">
      <header className="border-b border-white/10 bg-[#070b10] text-white">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-8 px-6 lg:px-10">
          <Link to="/" className="flex items-center gap-3" aria-label="OpenTech Academy home">
            <div className="flex h-10 w-12 items-center justify-center text-4xl font-black italic text-[#ffc928]">F</div>
            <div className="border-l border-white/20 pl-3 leading-none"><strong className="block text-xl tracking-wide">OPENTECH</strong><span className="text-lg text-white/80">Academy</span></div>
          </Link>
          <nav className="hidden items-center gap-9 text-sm font-semibold lg:flex" aria-label="Primary navigation">
            <Link className="text-[#ffc928]" to="/">Home</Link><Link className="text-white/80 hover:text-[#ffc928]" to="/academy">Academy</Link><Link className="text-white/80 hover:text-[#ffc928]" to="/store">Store</Link><Link className="text-white/80 hover:text-[#ffc928]" to="/about">Company</Link><Link className="text-white/80 hover:text-[#ffc928]" to="/contact">Contact</Link>
          </nav>
          <div className="flex items-center gap-3"><button className="hidden p-2 text-xl text-white sm:block" aria-label="Search">⌕</button><Link to="/cart" className="relative p-2 text-xl" aria-label="Shopping cart">♧<span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ffc928] text-xs font-bold text-black">2</span></Link><Link to="/login" className="rounded-md bg-[#ffc928] px-5 py-3 text-sm font-bold text-black hover:bg-[#ffd95b]">Login / Register</Link></div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[#070b10] text-white"><div className="mx-auto grid max-w-[1440px] items-center lg:min-h-[550px] lg:grid-cols-[.9fr_1.1fr]"><div className="relative z-10 px-6 py-16 lg:px-16"><h1 className="max-w-2xl text-5xl font-black leading-[1.05] sm:text-7xl">Learn. Innovate.<br />Build the <span className="text-[#ffc928]">Future.</span></h1><p className="mt-6 max-w-lg text-lg leading-7 text-white/70">OpenTech Academy is where hardware meets software, ideas become innovations and learners become creators.</p><div className="mt-8 flex flex-wrap gap-4"><Link to="/academy" className="rounded-md bg-[#ffc928] px-6 py-4 text-sm font-bold text-black">Explore Academy <Arrow /></Link><Link to="/store" className="rounded-md border border-white/40 px-6 py-4 text-sm font-bold">Visit Store <Arrow /></Link></div><div className="mt-12 grid grid-cols-2 gap-5 border-t border-white/15 pt-6 sm:grid-cols-4">{[["⚒", "Hands-on", "Learning"], ["♙", "Expert", "Mentors"], ["♧", "Certified", "Programs"], ["↗", "Real World", "Projects"]].map(([icon, a, b]) => <div className="flex items-center gap-2" key={a}><span className="text-2xl text-[#ffc928]">{icon}</span><span className="text-xs leading-4 text-white/80">{a}<br />{b}</span></div>)}</div></div><div className="relative h-full min-h-[450px] bg-cover bg-center" style={{ backgroundImage: "linear-gradient(90deg, #070b10 0%, transparent 45%), url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OpenTech%20Academy%20Tech%20Landing%20Page-Ffijjl66W11xj9REez1awciJwOF2ry.png')" }} aria-label="OpenTech robotics laboratory" role="img"><div className="absolute inset-y-0 left-0 w-1 bg-[#ffc928] shadow-[0_0_20px_#ffc928]" /></div></div></section>

        <section className="mx-auto grid max-w-[1360px] gap-4 px-6 py-8 lg:grid-cols-3">{[["Academy", "Learn Programming, Electronics, Robotics, IoT and more with practical projects.", "/academy", "Explore Courses", true], ["Store", "Shop quality electronic components, robot kits, tools and tech gadgets at the best prices.", "/store", "Shop Now", false], ["Company", "We build custom hardware solutions, prototypes and automation systems.", "/about", "Our Services", true]].map(([title, text, to, action, dark]) => <article key={title} className={`relative min-h-52 overflow-hidden rounded-xl border p-7 ${dark ? "bg-[#090e13] text-white" : "bg-white"}`}><span className="text-3xl text-[#ffc928]">{title === "Academy" ? "⌂" : title === "Store" ? "♧" : "▦"}</span><h2 className="mt-3 text-2xl font-bold">{title}</h2><p className={`mt-3 max-w-xs text-sm leading-6 ${dark ? "text-white/65" : "text-black/65"}`}>{text}</p><Link to={to} className={`mt-5 inline-flex rounded-md border px-4 py-3 text-sm font-semibold ${dark ? "border-white/50" : "border-black/30"}`}>{action} <span className="ml-3"><Arrow /></span></Link></article>)}</section>

        <section className="mx-auto max-w-[1360px] px-6 py-8"><div className="mb-5 flex items-end justify-between"><div><h2 className="text-3xl font-black">Popular Courses</h2><div className="mt-3 h-1 w-10 bg-[#ffc928]" /></div><Link className="text-sm font-semibold" to="/academy">View all courses <Arrow /></Link></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{courses.map((course) => <Link to="/academy" className="overflow-hidden rounded-lg border border-black/10 bg-white" key={course.title}><div className="flex h-28 items-center justify-center bg-[#e9e6dc] text-4xl">▧</div><div className="p-3"><h3 className="min-h-11 text-sm font-bold leading-5">{course.title}</h3><p className="mt-3 text-xs text-black/65"><span className="text-[#e7ae00]">★</span> {course.meta}</p><p className="mt-4 flex justify-between font-black">{course.price}<span className="text-[#e7ae00]">→</span></p></div></Link>)}</div></section>

        <section className="mx-auto max-w-[1360px] px-6 py-8"><div className="grid gap-8 rounded-xl bg-[#090e13] p-8 text-white lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><h2 className="text-3xl font-black">Why Choose<br />OpenTech <span className="text-[#ffc928]">Academy?</span></h2><p className="mt-4 max-w-sm text-sm leading-6 text-white/65">We combine theory with practical experience to prepare you for real world challenges.</p><Link to="/about" className="mt-6 inline-flex rounded-md bg-[#ffc928] px-6 py-3 text-sm font-bold text-black">About Us <Arrow /></Link></div><div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{[["500+", "Students Trained"], ["50+", "Projects Completed"], ["10+", "Expert Instructors"], ["100%", "Hands-on Practice"]].map(([n, l]) => <div className="border-l border-white/20 px-3 text-center" key={l}><p className="text-3xl font-black">{n}</p><p className="mt-2 text-xs text-white/60">{l}</p></div>)}</div></div></section>

        <section className="mx-auto max-w-[1360px] px-6 py-8"><div className="mb-5 flex items-end justify-between"><div><h2 className="text-3xl font-black">Featured Products</h2><div className="mt-3 h-1 w-10 bg-[#ffc928]" /></div><Link className="text-sm font-semibold" to="/store">View all products <Arrow /></Link></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{products.map(([name, price]) => <Link to="/store" className="rounded-lg border border-black/10 bg-white p-4" key={name}><div className="flex h-28 items-center justify-center text-6xl text-[#3568a0]">▱</div><p className="mt-3 text-sm font-semibold">{name}</p><p className="mt-2 font-black">{price}</p></Link>)}</div></section>
      </main>
      <footer className="bg-[#070b10] py-7 text-white"><div className="mx-auto grid max-w-[1360px] grid-cols-2 gap-6 px-6 sm:grid-cols-4">{[["▱", "Fast Delivery", "Across Nigeria"], ["♢", "Secure Payment", "100% Safe"], ["↻", "7 Days Return", "Money Back Guarantee"], ["◉", "24/7 Support", "We are here to help"]].map(([icon, title, text]) => <div className="flex items-center gap-3" key={title}><span className="text-2xl text-[#ffc928]">{icon}</span><span><strong className="block text-xs">{title}</strong><small className="text-xs text-white/55">{text}</small></span></div>)}</div></footer>
    </div>
  );
}

void products;
void courses;
；Content omitted to save context ...
