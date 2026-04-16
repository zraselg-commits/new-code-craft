export const dynamic = "force-dynamic";
import IndexPage from "@/pages/Index";

/**
 * Homepage — JSON-LD structured data is injected globally in app/layout.tsx
 * (Organization + WebSite schemas). Additional local-business schema below.
 */
export default function Page() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Code Craft BD Services",
    "description": "Digital services offered by Code Craft BD — Web Development, AI Automation, SEO, Video Editing & Brand Design",
    "url": "https://codecraftbd.info/services",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Custom Web Development",
        "description": "Enterprise-grade websites, admin dashboards, e-commerce platforms & management systems",
        "url": "https://codecraftbd.info/services",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "AI Agent Automation",
        "description": "AI agents for social media, chatbots & business workflow automation",
        "url": "https://codecraftbd.info/services",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "SEO & Digital Growth",
        "description": "Technical SEO, content strategy & performance optimization for Bangladesh businesses",
        "url": "https://codecraftbd.info/services",
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Creative Media & Design",
        "description": "Video editing, motion graphics, biography design & brand identity",
        "url": "https://codecraftbd.info/services",
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What services does Code Craft BD offer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Code Craft BD offers custom web development, AI automation, SEO, video editing, biography design & brand identity packages.",
        },
      },
      {
        "@type": "Question",
        "name": "How long does a typical project take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Landing pages: 1-2 weeks, Admin panels: 3-6 weeks, Enterprise AI: 4-8 weeks.",
        },
      },
      {
        "@type": "Question",
        "name": "Does Code Craft BD accept BDT payments?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! We accept bKash, Nagad, bank transfer, and USD. All prices are displayed in both BDT and USD.",
        },
      },
      {
        "@type": "Question",
        "name": "Do you offer SEO alongside web development?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! We handle everything from building your website to ranking it on Google.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <IndexPage />
    </>
  );
}
