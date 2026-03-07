import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import PhaseTimeline from "@/components/PhaseTimeline";
import RolesSection from "@/components/RolesSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <PhaseTimeline />
      <RolesSection />
      <Footer />
    </div>
  );
};

export default Index;
