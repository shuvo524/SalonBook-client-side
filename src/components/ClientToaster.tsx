"use client";

import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

/**
 * Toast container, rendered only after the component mounts.
 *
 * react-hot-toast renders its own container div and does not forward
 * `suppressHydrationWarning` to it, so a browser extension that injects
 * attributes into the DOM (e.g. Bitdefender's `bis_skin_checked`) makes
 * React log a hydration mismatch for that div. Rendering the toaster
 * client-side only keeps it out of the server HTML entirely, so there is
 * nothing to mismatch. Toasts are client-only anyway, and react-hot-toast
 * queues toasts created before the container mounts, so none are lost.
 */
export default function ClientToaster() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: "0.75rem",
          background: "#1c1917",
          color: "#fafaf9",
          fontSize: "0.875rem",
          // Toasts are 350px by default — cap them so a long message
          // can never push past the edges of a phone screen.
          maxWidth: "calc(100vw - 32px)",
        },
      }}
    />
  );
}
