import {
  Fingerprint,
  ScanLine,
  Dna,
  Syringe,
  ArrowRightLeft,
  WifiOff,
  TreeDeciduous,
  Activity,
} from "lucide-react";

const features = [
  { icon: ScanLine, title: "RFID + Nose Print", desc: "Dual-layer identity using RFID tags and unique nose-print biometrics for every cow." },
  { icon: Fingerprint, title: "Real-Time Scan", desc: "Identify any cow instantly using phone camera nose scanning or RFID reader." },
  { icon: TreeDeciduous, title: "Genetic Lineage", desc: "Track father/mother RFID links to build verifiable genetic family trees." },
  { icon: Dna, title: "DNA Verification", desc: "Pipeline from testing to verified status, confirmed by licensed veterinarians." },
  { icon: Syringe, title: "Smart Vaccination", desc: "Auto-generated vaccination calendar based on age with vet-verified entries." },
  { icon: ArrowRightLeft, title: "Ownership Transfer", desc: "Secure cow transfer between farmers with identity verification — no duplicates." },
  { icon: Activity, title: "Activity Audit Log", desc: "Every registration, vaccination, transfer, and RFID change is permanently logged." },
  { icon: WifiOff, title: "Offline Support", desc: "Capture data in rural areas without internet. Auto-syncs when connectivity returns." },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Phase 1 Features</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3">Digital Cattle Identity System</h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            A complete identity layer for every cow — from birth registration to ownership transfer.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-saffron transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-gradient-saffron group-hover:text-primary-foreground transition-all">
                <f.icon size={22} className="text-primary group-hover:text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
