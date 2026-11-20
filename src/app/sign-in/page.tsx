import { Suspense } from "react";
import SignInForm from "./SignInForm";
import { PageLoader } from "@/components/Loader";

// The form reads `?next=` via useSearchParams, which must sit behind a
// Suspense boundary so the page can prerender its static shell.
export default function SignInPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading sign-in…" />}>
      <SignInForm />
    </Suspense>
  );
}
