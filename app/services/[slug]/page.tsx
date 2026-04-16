import type { Metadata } from "next";
import { listServices, findServiceBySlug } from "@lib/firestore";
import ServiceDetailPage from "@/pages/ServiceDetailPage";

export const revalidate = 3600;

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  try {
    const svcs = await listServices(true);
    return svcs.map((s) => ({ slug: s.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const svc = await findServiceBySlug(params.slug);
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
  } catch {
    return { title: "Service — Code Craft BD" };
  }
}

export default async function Page({ params }: Props) {
  let svc: Awaited<ReturnType<typeof findServiceBySlug>> = null;
  try {
    svc = await findServiceBySlug(params.slug);
  } catch {
    svc = null;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": svc?.title || params.slug,
    "description": svc?.description || "",
    "serviceType": svc?.category || "",
    ...(svc?.imageUrl ? { "image": svc.imageUrl } : {}),
    "provider": {
      "@type": "Organization",
      "name": "Code Craft BD",
      "url": "https://codecraftbd.info",
    },
    "url": `https://codecraftbd.info/services/${params.slug}`,
    "areaServed": {
      "@type": "Place",
      "name": "Worldwide",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServiceDetailPage />
    </>
  );
}
