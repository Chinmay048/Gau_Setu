import heroImg from "@/assets/hero-cow.jpg";
import { Link } from "react-router-dom";
import { Fingerprint, Shield, Wifi } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img src={heroImg} alt="Indigenous Indian cow in green pasture" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/30" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-primary-foreground/90">India's Digital Livestock Infrastructure</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <span className="text-primary-foreground">Every Cow</span>
            <br />
            <span className="text-gradient-saffron">Deserves a</span>
            <br />
            <span className="text-primary-foreground">Digital Identity</span>
          </h1>

          <p className="text-lg text-primary-foreground/70 mb-8 max-w-lg animate-fade-in" style={{ animationDelay: "0.2s" }}>
            GauSetu connects RFID tags, nose-print biometrics, and genetic data to create a trusted digital ecosystem for indigenous cattle across India.
          </p>

          <div className="flex flex-wrap gap-4 mb-12 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Link to="/dashboard" className="px-8 py-3.5 rounded-xl bg-gradient-saffron text-primary-foreground font-semibold shadow-saffron hover:opacity-90 transition-opacity text-base">
              Get Started Free
            </Link>
            <a href="#phases" className="px-8 py-3.5 rounded-xl border border-primary-foreground/20 text-primary-foreground/90 font-semibold hover:bg-primary-foreground/10 transition-colors text-base">
              View Roadmap
            </a>
          </div>

          <div className="flex flex-wrap gap-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {[
              { icon: Fingerprint, label: "Nose-Print Biometrics" },
              { icon: Shield, label: "Tamper-Proof Records" },
              { icon: Wifi, label: "Offline-First Design" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-primary-foreground/60">
                <Icon size={16} className="text-primary" />
                <span className="text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
