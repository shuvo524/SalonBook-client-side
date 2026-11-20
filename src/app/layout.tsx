import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

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
};

/** Static header shell shown while the real navbar streams in. */
function NavbarFallback() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-600 font-display text-lg font-bold text-white">
            S
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-stone-900">
            Salon<span className="text-rose-600">Book</span>
          </span>
        </div>
        <div className="h-9 w-24 animate-pulse rounded-lg bg-stone-100" />
      </div>
    </header>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-stone-50 font-sans text-stone-900">
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
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "0.75rem",
                background: "#1c1917",
                color: "#fafaf9",
                fontSize: "0.875rem",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
