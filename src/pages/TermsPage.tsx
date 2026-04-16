"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or using Code Craft BD's website and services, you agree to be bound by these Terms & Conditions. If you do not agree, please discontinue use immediately. These terms apply to all clients, visitors, and users of Code Craft BD.`,
  },
  {
    title: "2. Services",
    body: `Code Craft BD provides digital services including web development, AI automation, SEO, and creative media. All services are delivered as described in the chosen package. Custom requirements beyond package scope may incur additional charges discussed in advance.`,
  },
  {
    title: "3. Orders & Payment",
    body: `Orders are confirmed upon successful payment. Code Craft BD reserves the right to decline any order at its discretion. Prices are listed in BDT (৳) with USD equivalent displayed for convenience. Exchange rates are indicative. Payment must be completed before project commencement unless otherwise agreed. We accept bKash, Nagad, bank transfer, and international payments.`,
  },
  {
    title: "4. Delivery & Revisions",
    body: `Delivery timelines begin after full project details are received from the client. Revision counts are as specified in each package tier. Revisions requested outside the scope of the original brief may incur additional fees. Code Craft BD is not liable for delays caused by client-side response delays.`,
  },
  {
    title: "5. Intellectual Property",
    body: `Upon full payment, the client receives full ownership of the final deliverable. Code Craft BD retains the right to showcase completed work in its portfolio unless the client requests otherwise in writing. Source code, design files, and assets are transferred to the client at project completion.`,
  },
  {
    title: "6. Refund Policy",
    body: `Refunds are available before work has commenced. Once work has started, partial refunds may be issued at Code Craft BD's discretion based on work completed. No refunds are issued after project delivery and acceptance. Disputes must be raised within 7 days of delivery.`,
  },
  {
    title: "7. Confidentiality",
    body: `Code Craft BD treats all client information as confidential. We do not disclose project details, business information, or data to third parties without explicit consent. NDAs are available on request for sensitive projects.`,
  },
  {
    title: "8. Limitation of Liability",
    body: `Code Craft BD is not liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability in any case shall not exceed the amount paid for the specific service in question.`,
  },
  {
    title: "9. Governing Law",
    body: `These terms are governed by the laws of Bangladesh. Any disputes shall be resolved through good-faith negotiation. If unresolved, disputes shall be referred to the appropriate courts in Dhaka, Bangladesh.`,
  },
  {
    title: "10. Changes to Terms",
    body: `Code Craft BD reserves the right to update these terms at any time. Continued use of our services after changes constitutes acceptance of the updated terms. Significant changes will be notified via email to registered users.`,
  },
];

const TermsPage = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-24 pb-10 relative">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-12 animate-fade-in-up">
            <p className="text-sm uppercase tracking-widest text-primary mb-3">{t.navTerms ?? "Legal"}</p>
            <h1 className="section-heading">
              Terms & <span className="gradient-text">Conditions</span>
            </h1>
            <p className="text-muted-foreground mt-4">Last updated: March 2026</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
            {sections.map((sec, i) => (
              <div key={i} className="glass-card p-6 md:p-8" data-testid={`terms-section-${i}`}>
                <h2 className="text-lg font-semibold text-foreground mb-3">{sec.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{sec.body}</p>
              </div>
            ))}

            <div className="glass-card p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Questions about our terms?{" "}
                <a href="/contact" className="text-primary hover:underline">Contact us</a>
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default TermsPage;
