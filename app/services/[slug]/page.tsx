import type { Metadata } from "next";
import { getActiveLocalServices, findLocalService } from "@lib/local-services-store";
import ServiceDetailPage from "@/pages/ServiceDetailPage";

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getActiveLocalServices().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const svc = findLocalService(params.slug);
  if (!svc) return { title: "Service — Code Craft BD" };

  const title = `${svc.title} — Code Craft BD`;
  const description = svc.description || `Professional ${svc.title} services from Code Craft BD.`;
  const canonical = `https://codecraftbd.info/services/${params.slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Code Craft BD",
      url: canonical,
      ...(svc.imageUrl ? { images: [{ url: svc.imageUrl }] } : {}),
    },
    twitter: {
      card: svc.imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(svc.imageUrl ? { images: [svc.imageUrl] } : {}),
    },
  };
}

export default function Page({ params }: Props) {
  const svc = findLocalService(params.slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": svc?.title || params.slug,
    "description": svc?.description || "",
    "serviceType": svc?.category || "",
    ...(svc?.imageUrl ? { "image": svc.imageUrl } : {}),
    "provider": { "@type": "Organization", "name": "Code Craft BD", "url": "https://codecraftbd.info" },
    "url": `https://codecraftbd.info/services/${params.slug}`,
    "areaServed": { "@type": "Place", "name": "Worldwide" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ServiceDetailPage />
    </>
  );
}
