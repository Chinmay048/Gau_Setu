import { Link } from "react-router-dom";
import logo from "@/assets/gausetu-logo.png";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="GauSetu" className="h-9 w-9" />
          <span className="text-xl font-bold text-foreground">GauSetu</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#phases" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Roadmap</a>
          <a href="#roles" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">For You</a>
          <Link to="/login" className="px-5 py-2 rounded-lg bg-gradient-saffron text-primary-foreground text-sm font-semibold shadow-saffron hover:opacity-90 transition-opacity">
            Login
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-foreground">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-background border-b border-border px-4 pb-4 space-y-3">
          <a href="#features" onClick={() => setOpen(false)} className="block text-sm font-medium text-muted-foreground">Features</a>
          <a href="#phases" onClick={() => setOpen(false)} className="block text-sm font-medium text-muted-foreground">Roadmap</a>
          <a href="#roles" onClick={() => setOpen(false)} className="block text-sm font-medium text-muted-foreground">For You</a>
          <Link to="/login" className="block px-5 py-2 rounded-lg bg-gradient-saffron text-primary-foreground text-sm font-semibold text-center">
            Login
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
