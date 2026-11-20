import { Suspense } from "react";
import PaymentSuccessContent from "./PaymentSuccessContent";
import { PageLoader } from "@/components/Loader";

// The page reads `?session_id=` via useSearchParams, which must sit
// behind a Suspense boundary so the page can prerender its static shell.
//
// Note: this page never calls any endpoint to "confirm" the payment.
// The payment status changes only when the server's Stripe webhook
// verifies the payment.
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PageLoader label="Confirming your payment…" />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
