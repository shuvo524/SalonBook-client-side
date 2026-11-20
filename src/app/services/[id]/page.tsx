import { Suspense } from "react";
import ServiceDetails from "./ServiceDetails";
import { PageLoader } from "@/components/Loader";

// The details view reads the route id with useParams, which suspends
// while the dynamic params are unknown — hence the Suspense boundary.
export default function ServiceDetailsPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading service details…" />}>
      <ServiceDetails />
    </Suspense>
  );
}
