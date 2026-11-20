import Link from "next/link";

// NOTE: the address, opening hours, phone number and email below are
// PLACEHOLDERS — Shuvo must replace them with the salon's real details
// before submission. The social links point at the platforms' homepages
// until the salon's own pages are added.

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Browse Services" },
  { href: "/sign-in", label: "Sign In" },
  { href: "/sign-up", label: "Sign Up" },
];

const socialLinks = [
  { href: "https://facebook.com", label: "Facebook" },
  { href: "https://instagram.com", label: "Instagram" },
  { href: "https://youtube.com", label: "YouTube" },
];

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-900 text-stone-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="font-display text-2xl font-bold text-white">
            Salon<span className="text-rose-400">Book</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-stone-400">
            Your favourite salon, one tap away. Browse services, book an
            appointment online, and pay securely — all in one place.
          </p>
        </div>

        <nav aria-label="Quick links">
          <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
            Quick Links
          </h3>
          <ul className="mt-4 space-y-2">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-stone-400 transition-colors hover:text-rose-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
            Contact &amp; Hours
          </h3>
          <address className="mt-4 space-y-2 text-sm not-italic text-stone-400">
            <p>123 Beauty Avenue, Dhaka 1212, Bangladesh</p>
            <p>
              <a
                href="tel:+8801700000000"
                className="transition-colors hover:text-rose-300"
              >
                +880 1700-000000
              </a>
            </p>
            <p>
              <a
                href="mailto:hello@salonbook.example"
                className="transition-colors hover:text-rose-300"
              >
                hello@salonbook.example
              </a>
            </p>
            <p>Open every day, 9:00 AM – 8:00 PM</p>
          </address>
        </div>

        <div>
          <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
            Follow Us
          </h3>
          <ul className="mt-4 space-y-2">
            {socialLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-stone-400 transition-colors hover:text-rose-300"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-stone-800">
        <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-stone-500 sm:px-6 lg:px-8">
          © 2026 SalonBook. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
