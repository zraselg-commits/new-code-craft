"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const sections = [
  {
    title: "1. Information We Collect",
    body: `When you use Code Craft BD, we may collect: your name, email address, and phone number (provided during registration); Google account information (if you sign in with Google); project notes and order details; and technical data such as IP address, browser type, and usage analytics.`,
  },
  {
    title: "2. How We Use Your Information",
    body: `We use your information to: process and deliver your service orders; send order confirmations and support communications; improve our website and services; prevent fraud and ensure platform security; and comply with legal obligations. We do not sell your personal data to any third party.`,
  },
  {
    title: "3. Google Sign-In",
    body: `If you choose to sign in with Google, we receive your name, email address, and Google account ID. We only use this to create and authenticate your Code Craft BD account. We do not access your Google Drive, Gmail, or any other Google services.`,
  },
  {
    title: "4. Data Storage & Security",
    body: `All data is stored on secure, encrypted servers. Passwords are hashed using bcrypt and are never stored in plain text. Firebase ID tokens are verified server-side and never stored. We use HTTPS (TLS) for all data in transit.`,
  },
  {
    title: "5. Cookies",
    body: `We use minimal cookies and localStorage to: maintain your login session (JWT token); remember your preferred language and currency; and store your cart contents. No third-party advertising cookies are used.`,
  },
  {
    title: "6. Third-Party Services",
    body: `We use Firebase Authentication for Google sign-in, which is governed by Google's Privacy Policy. We may use analytics tools to understand site usage patterns. No personally identifiable information is shared with these services beyond what is necessary.`,
  },
  {
    title: "7. Data Retention",
    body: `We retain your account data for as long as your account is active. Order history is retained for legal and business record purposes. You may request deletion of your account and associated data by contacting us.`,
  },
  {
    title: "8. Your Rights",
    body: `You have the right to: access the personal data we hold about you; correct inaccurate data; request deletion of your account and data; withdraw consent for marketing communications; and lodge a complaint with the relevant data protection authority.`,
  },
  {
    title: "9. Children's Privacy",
    body: `Code Craft BD's services are not directed to children under 13. We do not knowingly collect personal data from children. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.`,
  },
  {
    title: "10. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by posting a prominent notice on our website. Continued use of our services after changes indicates acceptance of the updated policy.`,
  },
];

const PrivacyPage = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-24 pb-10 relative">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-12 animate-fade-in-up">
            <p className="text-sm uppercase tracking-widest text-primary mb-3">{t.navPrivacy ?? "Privacy"}</p>
            <h1 className="section-heading">
              Privacy <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-muted-foreground mt-4">Last updated: March 2026</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
            <div className="glass-card p-6 border-primary/30 bg-primary/5">
              <p className="text-sm text-muted-foreground">
                At Code Craft BD, your privacy matters. This policy explains what data we collect, how we use it, and how
                we protect it. We are committed to transparency and will never sell your personal information.
              </p>
            </div>

            {sections.map((sec, i) => (
              <div key={i} className="glass-card p-6 md:p-8" data-testid={`privacy-section-${i}`}>
                <h2 className="text-lg font-semibold text-foreground mb-3">{sec.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{sec.body}</p>
              </div>
            ))}

            <div className="glass-card p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Privacy questions?{" "}
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

export default PrivacyPage;
