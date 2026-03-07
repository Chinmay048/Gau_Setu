import logo from "@/assets/gausetu-logo.png";

const Footer = () => {
  return (
    <footer className="py-12 bg-foreground">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="GauSetu" className="h-8 w-8" />
            <span className="font-bold text-background">GauSetu</span>
          </div>
          <p className="text-sm text-background/50">
            Building India's digital livestock infrastructure — one cow at a time.
          </p>
          <p className="text-xs text-background/30">© 2026 GauSetu. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
