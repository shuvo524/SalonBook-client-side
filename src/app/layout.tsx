import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Image from "next/image";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClientToaster from "@/components/ClientToaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SalonBook — Salon Appointment Booking",
  description:
    "Browse salon services, book appointments online, and pay securely with SalonBook.",
  icons: { icon: "/favicon.ico" },
};

/**
 * Static header shell shown while the real navbar streams in.
 *
 * The `suppressHydrationWarning` props below (here, on <html>/<body>, and
 * on the flagged divs in Navbar/Footer/Loader) silence React's hydration
 * mismatch warnings for attributes a browser extension injects into the
 * DOM before React loads (e.g. Bitdefender's `bis_skin_checked` /
 * `bis_register`). Those attributes are not in the app's HTML, so they
 * are not a code bug — but without the flag React logs a console error
 * for every element the extension touches. The flag is per-element in
 * React 19, so it goes on each affected element.
 */
function NavbarFallback() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div
        suppressHydrationWarning
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <div suppressHydrationWarning className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="SalonBook logo"
            width={36}
            height={36}
            className="h-9 w-9 rounded-xl object-cover"
          />
          <span className="font-display text-xl font-bold tracking-tight text-stone-900">
            Salon<span className="text-rose-600">Book</span>
          </span>
        </div>
        <div
          suppressHydrationWarning
          className="h-9 w-24 animate-pulse rounded-lg bg-stone-100"
        />
      </div>
    </header>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="flex min-h-full flex-col bg-stone-50 font-sans text-stone-900"
      >
        <AuthProvider>
          {/*
            The navbar reads the current path (usePathname), which suspends
            while Next.js prerenders routes with dynamic params
            (/services/[id]). The Suspense boundary keeps the build working
            and streams the real navbar in once the path is known.
          */}
          <Suspense fallback={<NavbarFallback />}>
            <Navbar />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Footer />
          {/*
            The toaster renders only after mount (see ClientToaster): its
            container div is created by react-hot-toast, which does not
            forward `suppressHydrationWarning`, so keeping it out of the
            server-rendered HTML is the only way to stop the extension's
            injected attributes from mismatching on it. Toasts are
            client-only anyway, so nothing is lost.
          */}
          <ClientToaster />
        </AuthProvider>
      </body>
    </html>
  );
}
