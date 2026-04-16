import { useLanguage } from "@/contexts/LanguageContext";

const techStack = [
  "React.js", "Next.js", "Tailwind CSS", "Node.js", "PHP", "MySQL",
  "WordPress", "WooCommerce", "Linux / VPS", "Adobe Illustrator", "Python", "TypeScript",
];

const TechStackSection = () => {
  const { t } = useLanguage();

  return (
    <section id="tech" className="py-10 md:py-14 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div
          className="text-center mb-10 animate-fade-in-up"
          style={{ animationFillMode: "both" }}
        >
          <p className="text-sm uppercase tracking-widest text-primary mb-3">{t.techTag}</p>
          <h2 className="section-heading">
            {t.techHeading} <span className="gradient-text">{t.techHeadingHighlight}</span>
          </h2>
        </div>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
          <div className="flex animate-marquee w-max gap-4">
            {[...techStack, ...techStack].map((tech, i) => (
              <div key={`${tech}-${i}`} className="tech-badge whitespace-nowrap text-base">
                {tech}
              </div>
            ))}
          </div>
        </div>

        <div
          className="mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in"
          style={{ animationDelay: "0.3s", animationFillMode: "both" }}
        >
          {techStack.map((tech, i) => (
            <div
              key={tech}
              className="glass-card-hover p-5 text-center animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s`, animationFillMode: "both" }}
            >
              <span className="text-sm font-medium text-foreground">{tech}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStackSection;
