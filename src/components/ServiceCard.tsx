import Image from "next/image";
import Link from "next/link";
import type { Service } from "@/lib/types";

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

/** Service card used on the home page and the browse page. */
export default function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] bg-stone-100">
        <Image
          src={service.image}
          alt={service.serviceName}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
        <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-rose-700 shadow-sm">
          {service.category}
        </span>
        {service.status === "inactive" && (
          <span className="absolute top-3 right-3 rounded-full bg-stone-900/85 px-3 py-1 text-xs font-semibold text-white">
            Inactive
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-stone-900">
          {service.serviceName}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-stone-600">
          {service.description}
        </p>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="font-display text-xl font-bold text-rose-700">
            {formatPrice(service.price)}
          </span>
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600">
            {service.duration} min
          </span>
        </div>
        <Link
          href={`/services/${service.id}`}
          className="mt-4 rounded-lg bg-rose-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-rose-700"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
