import { Link } from "react-router-dom";
import { Tractor, Stethoscope, Building2, ArrowRight } from "lucide-react";

const roles = [
  {
    icon: Tractor,
    title: "Farmer",
    desc: "Register cows, track vaccinations, manage RFID tags, and transfer ownership — even offline.",
    cta: "Farmer Dashboard",
    link: "/dashboard",
    gradient: "bg-gradient-saffron",
  },
  {
    icon: Stethoscope,
    title: "Veterinarian",
    desc: "Verify DNA reports, confirm vaccinations, and approve genetic lineage data for registered cattle.",
    cta: "Vet Portal",
    link: "/dashboard",
    gradient: "bg-gradient-forest",
  },
  {
    icon: Building2,
    title: "Government",
    desc: "Monitor breed populations, track disease outbreaks, and access regional cattle analytics dashboards.",
    cta: "Admin Dashboard",
    link: "/dashboard",
    gradient: "bg-gradient-saffron",
  },
];

const RolesSection = () => {
  return (
    <section id="roles" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Built For Everyone</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3">Three Roles, One Platform</h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            GauSetu serves farmers, veterinarians, and government administrators with tailored experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {roles.map((role, i) => (
            <div
              key={role.title}
              className="group text-center p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-saffron transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`w-16 h-16 rounded-2xl ${role.gradient} flex items-center justify-center mx-auto mb-6 shadow-saffron`}>
                <role.icon size={28} className="text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{role.title}</h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{role.desc}</p>
              <Link
                to={role.link}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
              >
                {role.cta} <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RolesSection;
