import { Dna, Milk, Shield } from "lucide-react";

const phases = [
  {
    number: "01",
    title: "Digital Cattle Identity",
    subtitle: "Foundation",
    icon: Shield,
    status: "active" as const,
    color: "primary",
    items: [
      "RFID + Nose-Print Registration",
      "Genetic Lineage Tracking",
      "Vaccination Calendar",
      "DNA Verification Pipeline",
      "Ownership Transfer System",
      "Offline Data Capture",
    ],
  },
  {
    number: "02",
    title: "Genetic Breeding Intelligence",
    subtitle: "Intelligence Layer",
    icon: Dna,
    status: "upcoming" as const,
    color: "secondary",
    items: [
      "A2 Gene Status Analysis",
      "Breeding Match Scoring",
      "Inbreeding Risk Warnings",
      "Bull Genetic Database",
      "Disease Resistance Markers",
      "Premium Genetic Reports",
    ],
  },
  {
    number: "03",
    title: "Verified Dairy Ecosystem",
    subtitle: "Marketplace & Insurance",
    icon: Milk,
    status: "upcoming" as const,
    color: "accent",
    items: [
      "Milk Production Tracking",
      "QR-Based Authentication",
      "A2 Milk Verification",
      "Digital Dairy Marketplace",
      "Livestock Insurance Claims",
      "Government Analytics Portal",
    ],
  },
];

const PhaseTimeline = () => {
  return (
    <section id="phases" className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Product Roadmap</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3">Three Phases to Transform Livestock</h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            From digital identity to a verified dairy ecosystem — building India's livestock infrastructure step by step.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {phases.map((phase, i) => (
            <div
              key={phase.number}
              className={`relative rounded-2xl p-8 border transition-all duration-300 animate-fade-in ${
                phase.status === "active"
                  ? "bg-card border-primary/30 shadow-saffron"
                  : "bg-card border-border hover:border-muted-foreground/20"
              }`}
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              {phase.status === "active" && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-saffron text-primary-foreground text-xs font-semibold">
                  In Progress
                </div>
              )}

              <div className="text-5xl font-extrabold text-gradient-saffron opacity-30 mb-2">
                {phase.number}
              </div>

              <div className="flex items-center gap-3 mb-2">
                <phase.icon size={20} className="text-primary" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{phase.subtitle}</span>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-6">{phase.title}</h3>

              <ul className="space-y-3">
                {phase.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PhaseTimeline;
