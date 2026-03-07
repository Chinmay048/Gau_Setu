import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  cowAPI, vaccinationAPI, breedingAPI, milkAPI, marketplaceAPI,
  insuranceAPI, transferAPI, vetAPI, governmentAPI,
} from "@/lib/api";
import logo from "@/assets/gausetu-logo.png";
import {
  Home, PlusCircle, List, Syringe, ArrowRightLeft, Activity, LogOut, Menu, X,
  ScanLine, Dna, Bell, ChevronRight, Tag, Calendar, Fingerprint, Loader2,
  Heart, Milk, ShoppingCart, Shield, BarChart3, FileText, AlertTriangle,
  Search, CheckCircle2, XCircle, Clock, TrendingUp, MapPin, Eye,
  Beaker, Package, Star, DollarSign, Users, Building2, ChevronsUpDown,
} from "lucide-react";

/* ─── Role-based sidebar configs ────────────────────────── */
const farmerSidebar = [
  { icon: Home, label: "Overview", id: "overview" },
  { icon: PlusCircle, label: "Register Cow", id: "register" },
  { icon: List, label: "My Cattle", id: "cattle" },
  { icon: Syringe, label: "Vaccinations", id: "vaccinations" },
  { icon: Dna, label: "DNA Status", id: "dna" },
  { icon: Heart, label: "Breeding Advisor", id: "breeding" },
  { icon: Milk, label: "Milk Tracking", id: "milk" },
  { icon: ShoppingCart, label: "Marketplace", id: "marketplace" },
  { icon: Shield, label: "Insurance", id: "insurance" },
  { icon: ArrowRightLeft, label: "Transfers", id: "transfers" },
];
const vetSidebar = [
  { icon: Home, label: "Overview", id: "vet-overview" },
  { icon: FileText, label: "My Reports", id: "vet-reports" },
  { icon: Dna, label: "DNA Verification", id: "vet-dna" },
  { icon: Syringe, label: "Verify Vaccination", id: "vet-vacc" },
];
const govSidebar = [
  { icon: BarChart3, label: "Dashboard", id: "gov-dashboard" },
  { icon: List, label: "Breed Statistics", id: "gov-breeds" },
  { icon: Syringe, label: "Vaccination Coverage", id: "gov-vacc" },
  { icon: AlertTriangle, label: "Disease Alerts", id: "gov-alerts" },
];

/* ─── Main Dashboard ──────────────────────────────────── */
const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || "farmer";

  const sidebarItems = role === "vet" ? vetSidebar : role === "government" ? govSidebar : farmerSidebar;
  const [activeTab, setActiveTab] = useState(sidebarItems[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Farmer data
  const [cattle, setCattle] = useState<any[]>([]);
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [milkStats, setMilkStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  // Vet data
  const [vetReports, setVetReports] = useState<any[]>([]);
  // Gov data
  const [govDashboard, setGovDashboard] = useState<any>(null);
  const [diseaseAlerts, setDiseaseAlerts] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { loadData(); }, [role]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      if (role === "farmer") {
        const [cattleRes, vaccRes] = await Promise.all([
          cowAPI.getMyCows(), vaccinationAPI.getUpcoming(),
        ]);
        setCattle(cattleRes.data.cows || []);
        setVaccinations(vaccRes.data.vaccinations || []);
        // Load secondary data in background
        milkAPI.getStats().then(r => setMilkStats(r.data)).catch(() => {});
        marketplaceAPI.getProducts().then(r => setProducts(r.data.products || [])).catch(() => {});
        insuranceAPI.getMyPolicies().then(r => setPolicies(r.data.policies || [])).catch(() => {});
        transferAPI.getPending().then(r => setTransfers(r.data.transfers || [])).catch(() => {});
      } else if (role === "vet") {
        const res = await vetAPI.getMyReports();
        setVetReports(res.data.reports || []);
      } else if (role === "government") {
        const [dashRes, alertRes] = await Promise.all([
          governmentAPI.getDashboard(), governmentAPI.getDiseaseAlerts(),
        ]);
        setGovDashboard(dashRes.data);
        setDiseaseAlerts(alertRes.data.alerts || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const roleName = role === "vet" ? "Veterinarian" : role === "government" ? "Government" : "Farmer";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-2 px-5 h-16 border-b border-border">
          <img src={logo} alt="GauSetu" className="h-8 w-8" />
          <span className="font-bold text-foreground">GauSetu</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-muted-foreground"><X size={20} /></button>
        </div>
        <div className="px-5 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2">{roleName} Dashboard</div>
        <nav className="space-y-1 px-3">
          {sidebarItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border">
          <button onClick={() => { logout(); navigate("/login"); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-64">
        <header className="h-16 border-b border-border flex items-center justify-between px-4 lg:px-8 bg-card/50 backdrop-blur-sm sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground"><Menu size={22} /></button>
          <h2 className="text-lg font-semibold text-foreground capitalize">{sidebarItems.find(s => s.id === activeTab)?.label}</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">{user?.email}</span>
            <div className="w-8 h-8 rounded-full bg-gradient-saffron flex items-center justify-center text-primary-foreground text-sm font-bold">
              {(user?.farmName || user?.name || "U")[0]}
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-primary" size={48} /></div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive">{error}</div>
          ) : (
            <>
              {/* Farmer tabs */}
              {activeTab === "overview" && <FarmerOverview cattle={cattle} vaccinations={vaccinations} milkStats={milkStats} transfers={transfers} />}
              {activeTab === "register" && <RegisterTab onSuccess={loadData} />}
              {activeTab === "cattle" && <CattleTab cattle={cattle} onRefresh={loadData} />}
              {activeTab === "vaccinations" && <VaccinationsTab vaccinations={vaccinations} cattle={cattle} />}
              {activeTab === "dna" && <DnaTab cattle={cattle} />}
              {activeTab === "breeding" && <BreedingTab cattle={cattle} />}
              {activeTab === "milk" && <MilkTab cattle={cattle} milkStats={milkStats} onRefresh={() => milkAPI.getStats().then(r => setMilkStats(r.data))} />}
              {activeTab === "marketplace" && <MarketplaceTab products={products} onRefresh={() => marketplaceAPI.getProducts().then(r => setProducts(r.data.products || []))} />}
              {activeTab === "insurance" && <InsuranceTab cattle={cattle} policies={policies} onRefresh={() => insuranceAPI.getMyPolicies().then(r => setPolicies(r.data.policies || []))} />}
              {activeTab === "transfers" && <TransfersTab cattle={cattle} transfers={transfers} onRefresh={loadData} />}
              {/* Vet tabs */}
              {activeTab === "vet-overview" && <VetOverview reports={vetReports} />}
              {activeTab === "vet-reports" && <VetReportsTab reports={vetReports} onRefresh={loadData} />}
              {activeTab === "vet-dna" && <VetDnaTab onRefresh={loadData} />}
              {activeTab === "vet-vacc" && <VetVaccTab />}
              {/* Gov tabs */}
              {activeTab === "gov-dashboard" && <GovDashboardTab data={govDashboard} />}
              {activeTab === "gov-breeds" && <GovBreedsTab />}
              {activeTab === "gov-vacc" && <GovVaccTab />}
              {activeTab === "gov-alerts" && <GovAlertsTab alerts={diseaseAlerts} onRefresh={() => governmentAPI.getDiseaseAlerts().then(r => setDiseaseAlerts(r.data.alerts || []))} />}
            </>
          )}
        </div>
      </main>
      {sidebarOpen && <div className="fixed inset-0 bg-foreground/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
};

/* ─── Shared Components ──────────────────────────────── */
const Stat = ({ label, value, icon: Icon, color = "primary" }: any) => (
  <div className="p-5 rounded-2xl bg-card border border-border">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className={`w-9 h-9 rounded-lg bg-${color}/10 flex items-center justify-center`}><Icon size={18} className={`text-${color}`} /></div>
    </div>
    <div className="text-2xl font-bold text-foreground">{value}</div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    verified: "bg-green-100 text-green-700", active: "bg-green-100 text-green-700",
    uploaded: "bg-blue-100 text-blue-700", pending: "bg-yellow-100 text-yellow-700",
    lost: "bg-red-100 text-red-700", rejected: "bg-red-100 text-red-700",
    completed: "bg-green-100 text-green-700", default: "bg-gray-100 text-gray-700",
  };
  const c = colors[status?.toLowerCase()] || colors.default;
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${c}`}>{status}</span>;
};

const age = (bd: string) => {
  if (!bd) return "??";
  const d = (Date.now() - new Date(bd).getTime()) / 86400000;
  return d > 365 ? `${(d / 365).toFixed(1)}y` : `${Math.floor(d / 30)}m`;
};

/* ═══════════════════════════════════════════════════════
   FARMER TABS
   ═══════════════════════════════════════════════════════ */

const FarmerOverview = ({ cattle, vaccinations, milkStats, transfers }: any) => {
  const verified = cattle.filter((c: any) => c.dnaStatus === "verified" || c.isVerified).length;
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total Cattle" value={cattle.length} icon={List} />
        <Stat label="DNA Verified" value={verified} icon={Dna} />
        <Stat label="Vaccinations Due" value={vaccinations.length} icon={Syringe} />
        <Stat label="Today's Milk" value={milkStats ? `${milkStats.todayTotal}L` : "—"} icon={Milk} />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-card border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4">Upcoming Vaccinations</h3>
          <div className="space-y-3">
            {vaccinations.length === 0 ? <p className="text-sm text-muted-foreground">All up to date!</p> :
              vaccinations.slice(0, 5).map((v: any) => (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div><span className="text-sm font-medium">{v.cowRFID}</span> <span className="text-sm text-muted-foreground">— {v.vaccineName}</span></div>
                  <span className="text-xs text-muted-foreground">{v.nextDueDate ? new Date(v.nextDueDate).toLocaleDateString() : "N/A"}</span>
                </div>
              ))
            }
          </div>
        </div>
        <div className="rounded-2xl bg-card border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4">Cattle Summary</h3>
          <div className="space-y-3">
            {cattle.slice(0, 6).map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-saffron flex items-center justify-center text-primary-foreground text-xs font-bold">{c.rfidNumber?.slice(0, 2)}</div>
                  <div><p className="text-sm font-medium">{c.rfidNumber}</p><p className="text-xs text-muted-foreground">{c.breed} • {age(c.birthDate)}</p></div>
                </div>
                <StatusBadge status={c.dnaStatus || "pending"} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Register Tab ────────────────────────────────────── */
const RegisterTab = ({ onSuccess }: { onSuccess: () => void }) => {
  const [regType, setRegType] = useState<"newborn" | "purchased">("newborn");
  const [form, setForm] = useState({ rfidNumber: "", gender: "female", birthDate: "", breed: "Gir", fatherRFID: "", motherRFID: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = async () => {
    if (!form.rfidNumber || !form.birthDate) { setErr("RFID and birth date required"); return; }
    setLoading(true); setErr(""); setMsg("");
    try {
      const fn = regType === "newborn" ? cowAPI.registerNewborn : cowAPI.registerPurchased;
      const payload: any = { rfidNumber: form.rfidNumber, gender: form.gender, birthDate: form.birthDate, breed: form.breed };
      if (regType === "newborn" && form.fatherRFID) payload.fatherRFID = form.fatherRFID;
      if (regType === "newborn" && form.motherRFID) payload.motherRFID = form.motherRFID;
      await fn(payload);
      setMsg("Cow registered successfully!");
      setForm({ rfidNumber: "", gender: "female", birthDate: "", breed: "Gir", fatherRFID: "", motherRFID: "" });
      onSuccess();
    } catch (e: any) {
      setErr(e.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="rounded-2xl bg-card border border-border p-8">
        <h3 className="text-xl font-bold mb-1">Register New Cow</h3>
        <p className="text-sm text-muted-foreground mb-6">Add a newborn or purchased cow to GauSetu.</p>

        <div className="flex gap-4 mb-6">
          {(["newborn", "purchased"] as const).map(t => (
            <button key={t} onClick={() => setRegType(t)} className={`flex-1 p-3 rounded-xl border-2 text-center text-sm font-semibold transition-all ${regType === t ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>
              {t === "newborn" ? "🐄 Newborn Calf" : "🔄 Purchased Cow"}
            </button>
          ))}
        </div>

        {err && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm mb-4">{err}</div>}
        {msg && <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm mb-4">{msg}</div>}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">RFID Tag Number *</label>
            <input value={form.rfidNumber} onChange={e => setForm({ ...form, rfidNumber: e.target.value })} placeholder="e.g. COW-FARM-2026-001" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Gender</label>
              <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm">
                <option value="female">Female</option><option value="male">Male</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Birth Date *</label>
              <input type="date" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Breed</label>
            <select value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm">
              {["Gir", "Sahiwal", "Red Sindhi", "Tharparkar", "Rathi", "Kankrej"].map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          {regType === "newborn" && (
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">Father RFID</label><input value={form.fatherRFID} onChange={e => setForm({ ...form, fatherRFID: e.target.value })} placeholder="Optional" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm" /></div>
              <div><label className="text-sm font-medium mb-1 block">Mother RFID</label><input value={form.motherRFID} onChange={e => setForm({ ...form, motherRFID: e.target.value })} placeholder="Optional" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm" /></div>
            </div>
          )}
          <button onClick={handleSubmit} disabled={loading} className="w-full py-3 rounded-xl bg-gradient-saffron text-primary-foreground font-semibold shadow-saffron hover:opacity-90 disabled:opacity-50">
            {loading ? "Registering..." : "Register Cow"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Cattle Tab ──────────────────────────────────────── */
const CattleTab = ({ cattle, onRefresh }: { cattle: any[]; onRefresh: () => void }) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [detail, setDetail] = useState<any>(null);

  const filtered = cattle.filter((c: any) =>
    c.rfidNumber?.toLowerCase().includes(search.toLowerCase()) || c.breed?.toLowerCase().includes(search.toLowerCase())
  );

  const openDetail = async (cow: any) => {
    setSelected(cow);
    try {
      const res = await cowAPI.getCowDetail(cow.id.toString());
      setDetail(res.data.cow);
    } catch { setDetail(cow); }
  };

  if (selected) return <CowDetailView cow={detail || selected} onBack={() => { setSelected(null); setDetail(null); }} />;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">My Cattle ({cattle.length})</h3>
        <input placeholder="Search RFID or breed..." value={search} onChange={e => setSearch(e.target.value)} className="px-4 py-2 rounded-lg border border-input bg-background text-sm w-64" />
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-card border border-border p-12 text-center"><p className="text-muted-foreground">No cattle found.</p></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((cow: any) => (
            <div key={cow.id} onClick={() => openDetail(cow)} className="rounded-2xl bg-card border border-border p-5 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-muted-foreground">#{cow.id}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary">{cow.gender}</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-saffron flex items-center justify-center text-primary-foreground font-bold mb-3">{cow.rfidNumber?.slice(0, 2)}</div>
              <h4 className="font-semibold">{cow.rfidNumber}</h4>
              <p className="text-sm text-muted-foreground">{cow.breed} • {age(cow.birthDate)}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <StatusBadge status={cow.dnaStatus || "pending"} />
                {cow.isVerified && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">✓ Verified</span>}
                {cow.a2GeneStatus === "A2A2" && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">A2</span>}
              </div>
              <div className="mt-3 pt-2 border-t border-border flex items-center justify-between">
                <span className="text-xs text-primary font-medium">View Details</span>
                <ChevronRight size={14} className="text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Cow Detail View ─────────────────────────────────── */
const CowDetailView = ({ cow, onBack }: { cow: any; onBack: () => void }) => {
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [genetics, setGenetics] = useState<any>(null);

  useEffect(() => {
    vaccinationAPI.getHistory(cow.id.toString()).then(r => setVaccinations(r.data.vaccinations || [])).catch(() => {});
    breedingAPI.getGenetics(cow.id.toString()).then(r => setGenetics(r.data.genetics)).catch(() => {});
  }, [cow.id]);

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">← Back to Cattle</button>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="rounded-2xl bg-card border border-border p-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-saffron flex items-center justify-center text-primary-foreground text-xl font-bold mb-4">{cow.rfidNumber?.slice(0, 2)}</div>
          <h3 className="text-xl font-bold mb-1">{cow.rfidNumber}</h3>
          <p className="text-muted-foreground mb-4">{cow.breed} • {cow.gender} • {age(cow.birthDate)}</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Registration</span><span>{cow.registrationType}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">DNA Status</span><StatusBadge status={cow.dnaStatus || "pending"} /></div>
            <div className="flex justify-between"><span className="text-muted-foreground">RFID Status</span><StatusBadge status={cow.rfidStatus || "active"} /></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Verified</span><span>{cow.isVerified ? "✅ Yes" : "❌ No"}</span></div>
            {cow.a2GeneStatus && <div className="flex justify-between"><span className="text-muted-foreground">A2 Gene</span><span className="font-semibold">{cow.a2GeneStatus}</span></div>}
            {cow.fatherRFID && <div className="flex justify-between"><span className="text-muted-foreground">Father</span><span>{cow.fatherRFID}</span></div>}
            {cow.motherRFID && <div className="flex justify-between"><span className="text-muted-foreground">Mother</span><span>{cow.motherRFID}</span></div>}
          </div>
        </div>

        {/* Genetics & Vaccination */}
        <div className="lg:col-span-2 space-y-6">
          {genetics && (
            <div className="rounded-2xl bg-card border border-border p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2"><Dna size={18} className="text-primary" /> Genetic Profile</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "A2 Gene", value: genetics.a2GeneStatus },
                  { label: "Heat Tolerance", value: `${genetics.heatTolerance}%` },
                  { label: "Disease Resistance", value: `${genetics.diseaseResistance}%` },
                  { label: "Milk Yield", value: `${genetics.milkYieldPotential}%` },
                ].map(g => (
                  <div key={g.label} className="p-3 rounded-xl bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground mb-1">{g.label}</p>
                    <p className="font-bold text-lg">{g.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="rounded-2xl bg-card border border-border p-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2"><Syringe size={18} className="text-primary" /> Vaccination History</h4>
            {vaccinations.length === 0 ? <p className="text-sm text-muted-foreground">No vaccinations recorded</p> : (
              <div className="space-y-2">
                {vaccinations.map((v: any) => (
                  <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <div><span className="text-sm font-medium">{v.vaccineName}</span></div>
                    <span className="text-xs text-muted-foreground">{new Date(v.administeredDate || v.administered_date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Family Tree */}
          {cow.familyTree && (
            <div className="rounded-2xl bg-card border border-border p-6">
              <h4 className="font-semibold mb-4">Family Tree</h4>
              <pre className="text-xs text-muted-foreground overflow-auto">{JSON.stringify(cow.familyTree, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Vaccinations Tab ────────────────────────────────── */
const VaccinationsTab = ({ vaccinations, cattle }: { vaccinations: any[]; cattle: any[] }) => (
  <div className="animate-fade-in max-w-4xl">
    <h3 className="text-xl font-bold mb-6">Vaccination Calendar</h3>
    {vaccinations.length === 0 ? (
      <div className="rounded-2xl bg-card border border-border p-12 text-center"><p className="text-muted-foreground">All vaccinations up to date!</p></div>
    ) : (
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-left p-4 font-medium text-muted-foreground">Cow RFID</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Vaccine</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Due Date</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
          </tr></thead>
          <tbody>
            {vaccinations.map((v: any) => {
              const days = v.nextDueDate ? Math.floor((new Date(v.nextDueDate).getTime() - Date.now()) / 86400000) : null;
              return (
                <tr key={v.id} className="border-b border-border last:border-0">
                  <td className="p-4 font-medium">{v.cowRFID || "—"}</td>
                  <td className="p-4 text-muted-foreground">{v.vaccineName}</td>
                  <td className="p-4 text-muted-foreground">{v.nextDueDate ? new Date(v.nextDueDate).toLocaleDateString() : "N/A"}</td>
                  <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${days !== null && days <= 7 ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>{days !== null && days <= 7 ? "Urgent" : "Upcoming"}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

/* ─── DNA Tab ─────────────────────────────────────────── */
const DnaTab = ({ cattle }: { cattle: any[] }) => (
  <div className="animate-fade-in">
    <h3 className="text-xl font-bold mb-6">DNA Verification Status</h3>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cattle.map((cow: any) => (
        <div key={cow.id} className="rounded-2xl bg-card border border-border p-5">
          <div className="flex items-start justify-between mb-3">
            <div><p className="font-semibold">{cow.rfidNumber}</p><p className="text-xs text-muted-foreground">{cow.breed}</p></div>
            <Dna size={20} className={cow.dnaStatus === "verified" ? "text-green-600" : cow.dnaStatus === "uploaded" ? "text-blue-600" : "text-muted-foreground"} />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <StatusBadge status={cow.dnaStatus || "pending"} />
            {cow.a2GeneStatus && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">{cow.a2GeneStatus}</span>}
          </div>
          {cow.dnaStatus === "verified" && cow.isVerified && <p className="text-xs text-green-600 mt-2 font-medium">✓ Identity Verified</p>}
        </div>
      ))}
    </div>
  </div>
);

/* ─── Breeding Tab ────────────────────────────────────── */
const BreedingTab = ({ cattle }: { cattle: any[] }) => {
  const [selectedCow, setSelectedCow] = useState("");
  const [recs, setRecs] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const females = cattle.filter((c: any) => c.gender === "female");

  const loadRecs = async (cowId: string) => {
    setSelectedCow(cowId); setLoading(true); setErr(""); setRecs(null);
    try {
      const res = await breedingAPI.getRecommendations(cowId);
      setRecs(res.data);
    } catch (e: any) {
      setErr(e.response?.data?.error || "Failed to load recommendations");
    } finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in">
      <h3 className="text-xl font-bold mb-2">Genetic Breeding Advisor</h3>
      <p className="text-sm text-muted-foreground mb-6">Select a DNA-verified female cow to get breeding recommendations.</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {females.map((c: any) => (
          <button key={c.id} onClick={() => loadRecs(c.id.toString())}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCow === c.id.toString() ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:border-primary/30"}`}>
            {c.rfidNumber} {c.dnaStatus === "verified" ? "✓" : "⏳"}
          </button>
        ))}
      </div>
      {loading && <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>}
      {err && <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">{err}</div>}
      {recs && (
        <div>
          <div className="p-4 rounded-2xl bg-card border border-border mb-4">
            <p className="text-sm text-muted-foreground">Showing recommendations for <span className="font-bold text-foreground">{recs.cow?.rfidNumber}</span> ({recs.cow?.breed}, A2: {recs.cow?.a2GeneStatus})</p>
          </div>
          <div className="space-y-4">
            {recs.recommendations?.map((r: any) => (
              <div key={r.bullId} className="rounded-2xl bg-card border border-border p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{r.bullRFID}</h4>
                    <p className="text-sm text-muted-foreground">{r.breed} • {r.farmName}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{r.compatibilityScore}%</div>
                    <span className={`text-xs font-medium ${r.compatibilityScore >= 85 ? "text-green-600" : r.compatibilityScore >= 70 ? "text-yellow-600" : "text-red-600"}`}>{r.recommendation}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
                  {[
                    { label: "A2", value: `${r.a2Score}%` }, { label: "Breed", value: r.breedMatch ? "✓" : "✗" },
                    { label: "Diversity", value: `${r.geneticDiversityScore}%` }, { label: "Heat", value: `${r.heatScore}%` },
                    { label: "Disease", value: `${r.diseaseScore}%` }, { label: "Milk", value: `${r.milkScore}%` },
                  ].map(s => (
                    <div key={s.label} className="p-2 rounded-lg bg-muted/50 text-center">
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                      <p className="text-sm font-bold">{s.value}</p>
                    </div>
                  ))}
                </div>
                {r.inbreedingRisk !== "none" && <p className="text-xs text-destructive mt-2">⚠️ Inbreeding risk: {r.inbreedingRisk}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Milk Tab ────────────────────────────────────────── */
const MilkTab = ({ cattle, milkStats, onRefresh }: any) => {
  const [form, setForm] = useState({ cowId: "", quantityLiters: "", session: "morning" });
  const [records, setRecords] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { milkAPI.getRecords().then(r => setRecords(r.data.records || [])).catch(() => {}); }, []);

  const logMilk = async () => {
    if (!form.cowId || !form.quantityLiters) return;
    setLoading(true); setMsg("");
    try {
      const res = await milkAPI.logProduction({ cowId: parseInt(form.cowId), quantityLiters: parseFloat(form.quantityLiters), session: form.session });
      setMsg(`Logged! Batch: ${res.data.batch?.batchCode || "created"}`);
      setForm({ ...form, quantityLiters: "" });
      onRefresh();
      milkAPI.getRecords().then(r => setRecords(r.data.records || []));
    } catch (e: any) {
      setMsg(e.response?.data?.error || "Failed");
    } finally { setLoading(false); }
  };

  const femaleCows = cattle.filter((c: any) => c.gender === "female");

  return (
    <div className="animate-fade-in">
      <h3 className="text-xl font-bold mb-6">Milk Production</h3>
      <div className="grid lg:grid-cols-4 gap-4 mb-6">
        <Stat label="Today's Total" value={milkStats ? `${milkStats.todayTotal}L` : "—"} icon={Milk} />
        <Stat label="Week Total" value={milkStats ? `${milkStats.weekTotal}L` : "—"} icon={TrendingUp} />
        <Stat label="Daily Avg" value={milkStats ? `${milkStats.dailyAverage}L` : "—"} icon={BarChart3} />
        <Stat label="Top Producers" value={milkStats?.topProducers?.length || 0} icon={Star} />
      </div>

      {/* Log Form */}
      <div className="rounded-2xl bg-card border border-border p-6 mb-6">
        <h4 className="font-semibold mb-4">Log Milk Production</h4>
        {msg && <div className="p-2 rounded-lg bg-green-50 text-green-700 text-sm mb-3">{msg}</div>}
        <div className="grid sm:grid-cols-4 gap-3">
          <select value={form.cowId} onChange={e => setForm({ ...form, cowId: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
            <option value="">Select Cow</option>
            {femaleCows.map((c: any) => <option key={c.id} value={c.id}>{c.rfidNumber}</option>)}
          </select>
          <input type="number" step="0.1" placeholder="Liters" value={form.quantityLiters} onChange={e => setForm({ ...form, quantityLiters: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
          <select value={form.session} onChange={e => setForm({ ...form, session: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
            <option value="morning">Morning</option><option value="evening">Evening</option>
          </select>
          <button onClick={logMilk} disabled={loading} className="px-4 py-2 rounded-lg bg-gradient-saffron text-primary-foreground text-sm font-medium">
            {loading ? "..." : "Log"}
          </button>
        </div>
      </div>

      {/* Recent Records */}
      {records.length > 0 && (
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-left p-3 font-medium text-muted-foreground">Cow</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Session</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Liters</th>
              <th className="text-left p-3 font-medium text-muted-foreground">A2</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Batch</th>
            </tr></thead>
            <tbody>
              {records.slice(0, 15).map((r: any) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="p-3 font-medium">{r.cowRFID}</td>
                  <td className="p-3 text-muted-foreground">{r.collectionDate}</td>
                  <td className="p-3 text-muted-foreground capitalize">{r.collectionTime}</td>
                  <td className="p-3 font-semibold">{r.quantityLiters}L</td>
                  <td className="p-3">{r.isA2 ? <span className="text-green-600 font-bold">A2</span> : <span className="text-muted-foreground">Std</span>}</td>
                  <td className="p-3 text-xs text-muted-foreground font-mono">{r.batchId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ─── Marketplace Tab ─────────────────────────────────── */
const MarketplaceTab = ({ products, onRefresh }: any) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ productName: "", productType: "milk", description: "", pricePerUnit: "", unit: "liter", quantityAvailable: "" });
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => { marketplaceAPI.getMyOrders().then(r => setOrders(r.data.orders || [])).catch(() => {}); }, []);

  const listProduct = async () => {
    try {
      await marketplaceAPI.listProduct({ ...form, pricePerUnit: parseFloat(form.pricePerUnit), quantityAvailable: parseInt(form.quantityAvailable) });
      setShowForm(false); onRefresh();
    } catch { }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Dairy Marketplace</h3>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-lg bg-gradient-saffron text-primary-foreground text-sm font-medium">
          {showForm ? "Cancel" : "+ List Product"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl bg-card border border-border p-6 mb-6">
          <h4 className="font-semibold mb-4">List New Product</h4>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <input placeholder="Product Name" value={form.productName} onChange={e => setForm({ ...form, productName: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
            <select value={form.productType} onChange={e => setForm({ ...form, productType: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
              {["milk", "ghee", "curd", "paneer", "butter", "other"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="number" placeholder="Price/unit (₹)" value={form.pricePerUnit} onChange={e => setForm({ ...form, pricePerUnit: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
            <input type="number" placeholder="Qty Available" value={form.quantityAvailable} onChange={e => setForm({ ...form, quantityAvailable: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
          </div>
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm mb-3" rows={2} />
          <button onClick={listProduct} className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">List Product</button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {products.map((p: any) => (
          <div key={p.id} className="rounded-2xl bg-card border border-border p-5">
            <div className="flex items-start justify-between mb-2">
              <div><h4 className="font-semibold">{p.productName}</h4><p className="text-xs text-muted-foreground capitalize">{p.productType}</p></div>
              <span className="text-lg font-bold text-primary">₹{p.pricePerUnit}/{p.unit}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{p.description?.slice(0, 80)}</p>
            <div className="flex flex-wrap gap-1">
              {p.isVerified && <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">✓ Verified</span>}
              {p.isA2 && <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">A2 Milk</span>}
              <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">{p.quantityAvailable} {p.unit}s</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">by {p.farmName} {p.farmerReputation ? `★ ${p.farmerReputation}` : ""}</p>
          </div>
        ))}
      </div>

      {orders.length > 0 && (
        <>
          <h4 className="font-semibold mb-3">My Orders</h4>
          <div className="space-y-2">
            {orders.map((o: any) => (
              <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
                <div><span className="text-sm font-medium">{o.productName}</span> <span className="text-sm text-muted-foreground">× {o.quantity}</span></div>
                <div className="flex items-center gap-3"><span className="font-semibold">₹{o.totalPrice}</span><StatusBadge status={o.status} /></div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/* ─── Insurance Tab ───────────────────────────────────── */
const InsuranceTab = ({ cattle, policies, onRefresh }: any) => {
  const [selectedCow, setSelectedCow] = useState("");
  const [eligibility, setEligibility] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const checkEligibility = async (cowId: string) => {
    setSelectedCow(cowId); setLoading(true); setEligibility(null);
    try {
      const res = await insuranceAPI.checkEligibility(cowId);
      setEligibility(res.data);
    } catch (e: any) {
      setEligibility({ eligible: false, message: e.response?.data?.error || "Check failed" });
    } finally { setLoading(false); }
  };

  const purchase = async (provider: string, tier: string) => {
    try {
      await insuranceAPI.purchasePolicy({ cowId: parseInt(selectedCow), provider, tier });
      setMsg("Policy purchased!"); onRefresh();
    } catch (e: any) { setMsg(e.response?.data?.error || "Failed"); }
  };

  return (
    <div className="animate-fade-in">
      <h3 className="text-xl font-bold mb-6">Livestock Insurance</h3>

      {/* Existing policies */}
      {policies.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Active Policies</h4>
          <div className="grid sm:grid-cols-2 gap-3">
            {policies.map((p: any) => (
              <div key={p.id} className="rounded-xl bg-card border border-border p-4">
                <div className="flex justify-between mb-2"><span className="font-medium">{p.providerName || p.provider}</span><StatusBadge status={p.status} /></div>
                <p className="text-sm text-muted-foreground">Cow #{p.cowId} • {p.tier} tier</p>
                <p className="text-sm">Premium: ₹{p.premiumAmount} • Coverage: ₹{p.coverageAmount}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {msg && <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm mb-4">{msg}</div>}

      <div className="rounded-2xl bg-card border border-border p-6">
        <h4 className="font-semibold mb-4">Check Insurance Eligibility</h4>
        <div className="flex gap-3 flex-wrap mb-4">
          {cattle.map((c: any) => (
            <button key={c.id} onClick={() => checkEligibility(c.id.toString())}
              className={`px-3 py-1.5 rounded-lg text-sm ${selectedCow === c.id.toString() ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
              {c.rfidNumber}
            </button>
          ))}
        </div>
        {loading && <Loader2 className="animate-spin text-primary" size={24} />}
        {eligibility && (
          <div>
            <div className={`p-4 rounded-xl mb-4 ${eligibility.eligible ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
              <p className={`font-semibold ${eligibility.eligible ? "text-green-700" : "text-red-700"}`}>
                {eligibility.eligible ? "✅ Eligible for Insurance" : "❌ Not Eligible"}
              </p>
              {eligibility.checks && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
                  {Object.entries(eligibility.checks).map(([k, v]: any) => (
                    <div key={k} className="flex items-center gap-1 text-xs">
                      {v ? <CheckCircle2 size={12} className="text-green-600" /> : <XCircle size={12} className="text-red-600" />}
                      <span className="capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {eligibility.eligible && eligibility.availablePlans?.map((provider: any) => (
              <div key={provider.provider} className="mb-3">
                <p className="text-sm font-semibold mb-2">{provider.provider}</p>
                <div className="grid grid-cols-3 gap-2">
                  {provider.plans?.map((plan: any) => (
                    <button key={plan.type} onClick={() => purchase(provider.provider, plan.type)}
                      className="p-3 rounded-xl border border-border hover:border-primary text-center transition-all">
                      <p className="text-xs text-muted-foreground capitalize">{plan.type}</p>
                      <p className="font-bold">₹{plan.premium}/yr</p>
                      <p className="text-xs text-muted-foreground">Cover: ₹{plan.coverage?.toLocaleString()}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Transfers Tab ───────────────────────────────────── */
const TransfersTab = ({ cattle, transfers, onRefresh }: any) => {
  const [form, setForm] = useState({ cowId: "", targetIdentifier: "", notes: "" });
  const [allTransfers, setAllTransfers] = useState<any[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => { transferAPI.getMy().then(r => setAllTransfers(r.data.transfers || [])).catch(() => {}); }, []);

  const initiate = async () => {
    if (!form.cowId || !form.targetIdentifier) return;
    try {
      await transferAPI.initiate({ cowId: parseInt(form.cowId), targetIdentifier: form.targetIdentifier, notes: form.notes });
      setMsg("Transfer initiated!"); setForm({ cowId: "", targetIdentifier: "", notes: "" }); onRefresh();
      transferAPI.getMy().then(r => setAllTransfers(r.data.transfers || []));
    } catch (e: any) { setMsg(e.response?.data?.error || "Failed"); }
  };

  const respond = async (id: string, action: "accept" | "reject") => {
    try {
      if (action === "accept") await transferAPI.accept(id); else await transferAPI.reject(id);
      onRefresh(); transferAPI.getMy().then(r => setAllTransfers(r.data.transfers || []));
    } catch { }
  };

  return (
    <div className="animate-fade-in max-w-3xl">
      <h3 className="text-xl font-bold mb-6">Ownership Transfers</h3>

      {transfers.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-3 text-destructive">Pending Transfers ({transfers.length})</h4>
          {transfers.map((t: any) => (
            <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border mb-2">
              <div><p className="font-medium">Cow #{t.cowId}</p><p className="text-sm text-muted-foreground">From: {t.fromFarmerEmail || t.from_farmer_id}</p></div>
              <div className="flex gap-2">
                <button onClick={() => respond(t.id.toString(), "accept")} className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm">Accept</button>
                <button onClick={() => respond(t.id.toString(), "reject")} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl bg-card border border-border p-6 mb-6">
        <h4 className="font-semibold mb-4">Initiate Transfer</h4>
        {msg && <div className="p-2 rounded-lg bg-blue-50 text-blue-700 text-sm mb-3">{msg}</div>}
        <div className="space-y-3">
          <select value={form.cowId} onChange={e => setForm({ ...form, cowId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
            <option value="">Select Cow</option>
            {cattle.map((c: any) => <option key={c.id} value={c.id}>{c.rfidNumber} ({c.breed})</option>)}
          </select>
          <input placeholder="Recipient email/phone/ID" value={form.targetIdentifier} onChange={e => setForm({ ...form, targetIdentifier: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
          <input placeholder="Notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
          <button onClick={initiate} className="px-6 py-2.5 rounded-lg bg-gradient-saffron text-primary-foreground text-sm font-semibold">Initiate Transfer</button>
        </div>
      </div>

      {allTransfers.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Transfer History</h4>
          {allTransfers.map((t: any) => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border mb-2">
              <div><span className="text-sm font-medium">Cow #{t.cowId || t.cow_id}</span></div>
              <StatusBadge status={t.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   VET TABS
   ═══════════════════════════════════════════════════════ */

const VetOverview = ({ reports }: { reports: any[] }) => (
  <div className="animate-fade-in space-y-6">
    <div className="grid sm:grid-cols-3 gap-4">
      <Stat label="Total Reports" value={reports.length} icon={FileText} />
      <Stat label="Health Reports" value={reports.filter((r: any) => r.reportType === "health").length} icon={Heart} />
      <Stat label="DNA Reports" value={reports.filter((r: any) => r.reportType === "dna").length} icon={Dna} />
    </div>
    <div className="rounded-2xl bg-card border border-border p-6">
      <h4 className="font-semibold mb-4">Recent Reports</h4>
      <div className="space-y-2">
        {reports.slice(0, 10).map((r: any) => (
          <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <div><span className="font-medium">{r.cowRFID}</span> <span className="text-sm text-muted-foreground">— {r.reportType}</span></div>
            <StatusBadge status={r.status} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const VetReportsTab = ({ reports, onRefresh }: { reports: any[]; onRefresh: () => void }) => {
  const [form, setForm] = useState({ cowId: "", reportType: "health", findings: "", recommendation: "" });
  const [msg, setMsg] = useState("");

  const createReport = async () => {
    if (!form.cowId || !form.findings) return;
    try {
      const res = await vetAPI.createReport({ cowId: parseInt(form.cowId), reportType: form.reportType, findings: form.findings, recommendation: form.recommendation });
      const reportId = res.data.report?.id;
      if (reportId) await vetAPI.submitReport(reportId.toString());
      setMsg("Report submitted!"); setForm({ cowId: "", reportType: "health", findings: "", recommendation: "" }); onRefresh();
    } catch (e: any) { setMsg(e.response?.data?.error || "Failed"); }
  };

  return (
    <div className="animate-fade-in max-w-3xl">
      <h3 className="text-xl font-bold mb-6">Vet Reports</h3>
      <div className="rounded-2xl bg-card border border-border p-6 mb-6">
        <h4 className="font-semibold mb-4">Create New Report</h4>
        {msg && <div className="p-2 rounded-lg bg-blue-50 text-blue-700 text-sm mb-3">{msg}</div>}
        <div className="space-y-3">
          <input placeholder="Cow ID" value={form.cowId} onChange={e => setForm({ ...form, cowId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
          <select value={form.reportType} onChange={e => setForm({ ...form, reportType: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
            <option value="health">Health Report</option><option value="dna">DNA Report</option>
          </select>
          <textarea placeholder="Findings" value={form.findings} onChange={e => setForm({ ...form, findings: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" rows={3} />
          <input placeholder="Recommendation" value={form.recommendation} onChange={e => setForm({ ...form, recommendation: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
          <button onClick={createReport} className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Submit Report</button>
        </div>
      </div>
      <div className="space-y-2">
        {reports.map((r: any) => (
          <div key={r.id} className="p-4 rounded-xl bg-card border border-border">
            <div className="flex justify-between mb-1"><span className="font-medium">{r.cowRFID} — {r.reportType}</span><StatusBadge status={r.status} /></div>
            <p className="text-sm text-muted-foreground">{r.diagnosis || r.treatment}</p>
            <p className="text-xs text-muted-foreground mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const VetDnaTab = ({ onRefresh }: { onRefresh: () => void }) => {
  const [form, setForm] = useState({ cowId: "", a2GeneStatus: "A2A2", heatTolerance: "85", diseaseResistance: "80", milkYieldPotential: "75", lineagePurity: "90" });
  const [msg, setMsg] = useState("");

  const submit = async () => {
    if (!form.cowId) return;
    try {
      await vetAPI.uploadDNAVerification({
        cowId: parseInt(form.cowId),
        geneticProfile: {
          a2GeneStatus: form.a2GeneStatus,
          heatTolerance: parseInt(form.heatTolerance),
          diseaseResistance: parseInt(form.diseaseResistance),
          milkYieldPotential: parseInt(form.milkYieldPotential),
          lineagePurity: parseInt(form.lineagePurity),
        },
      });
      setMsg("DNA verification uploaded!"); onRefresh();
    } catch (e: any) { setMsg(e.response?.data?.error || "Failed"); }
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      <h3 className="text-xl font-bold mb-6">DNA Verification</h3>
      <div className="rounded-2xl bg-card border border-border p-6">
        {msg && <div className="p-2 rounded-lg bg-blue-50 text-blue-700 text-sm mb-3">{msg}</div>}
        <div className="space-y-3">
          <input placeholder="Cow ID" value={form.cowId} onChange={e => setForm({ ...form, cowId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
          <select value={form.a2GeneStatus} onChange={e => setForm({ ...form, a2GeneStatus: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
            <option value="A2A2">A2A2 (Pure A2)</option><option value="A1A2">A1A2 (Hybrid)</option><option value="A1A1">A1A1</option>
          </select>
          <div className="grid grid-cols-2 gap-3">
            {["heatTolerance", "diseaseResistance", "milkYieldPotential", "lineagePurity"].map(field => (
              <div key={field}><label className="text-xs text-muted-foreground capitalize">{field.replace(/([A-Z])/g, " $1")}</label>
                <input type="number" min="0" max="100" value={(form as any)[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
              </div>
            ))}
          </div>
          <button onClick={submit} className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Upload DNA Verification</button>
        </div>
      </div>
    </div>
  );
};

const VetVaccTab = () => {
  const [vaccId, setVaccId] = useState("");
  const [msg, setMsg] = useState("");

  const verify = async () => {
    if (!vaccId) return;
    try {
      await vetAPI.verifyVaccination(vaccId);
      setMsg("Vaccination verified!"); setVaccId("");
    } catch (e: any) { setMsg(e.response?.data?.error || "Failed"); }
  };

  return (
    <div className="animate-fade-in max-w-md">
      <h3 className="text-xl font-bold mb-6">Verify Vaccination</h3>
      <div className="rounded-2xl bg-card border border-border p-6">
        {msg && <div className="p-2 rounded-lg bg-blue-50 text-blue-700 text-sm mb-3">{msg}</div>}
        <input placeholder="Vaccination ID" value={vaccId} onChange={e => setVaccId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm mb-3" />
        <button onClick={verify} className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Verify</button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   GOVERNMENT TABS
   ═══════════════════════════════════════════════════════ */

const GovDashboardTab = ({ data }: { data: any }) => {
  if (!data) return <div className="text-muted-foreground">Loading...</div>;
  const o = data.overview || {};
  return (
    <div className="animate-fade-in space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total Cattle" value={o.totalCattle || 0} icon={List} />
        <Stat label="Registered Farmers" value={o.totalFarmers || 0} icon={Users} />
        <Stat label="Verified Cattle" value={`${o.verifiedCattle || 0} (${o.verificationRate || 0}%)`} icon={CheckCircle2} />
        <Stat label="Active Alerts" value={o.activeAlerts || 0} icon={AlertTriangle} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-card border border-border p-6">
          <h4 className="font-semibold mb-4">Cattle Statistics</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Indigenous Breeds</span><span className="font-semibold">{o.indigenousPercentage || 0}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Vaccination Coverage</span><span className="font-semibold">{o.vaccinationCoverage || 0}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">DNA Verified</span><span className="font-semibold">{data.cattleStats?.dnaVerified || 0}</span></div>
          </div>
        </div>
        <div className="rounded-2xl bg-card border border-border p-6">
          <h4 className="font-semibold mb-4">Region: {data.region || "All India"}</h4>
          <div className="space-y-2 text-sm">
            {data.breedStats?.breeds?.slice(0, 5).map((b: any) => (
              <div key={b.breed} className="flex justify-between">
                <span className="text-muted-foreground">{b.breed}</span>
                <span className="font-semibold">{b.count} cattle</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const GovBreedsTab = () => {
  const [data, setData] = useState<any>(null);
  useEffect(() => { governmentAPI.getBreedStats().then(r => setData(r.data)).catch(() => {}); }, []);

  if (!data) return <Loader2 className="animate-spin text-primary mx-auto mt-12" size={32} />;
  return (
    <div className="animate-fade-in">
      <h3 className="text-xl font-bold mb-6">Breed Statistics</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Stat label="Total Breeds" value={data.breeds?.length || 0} icon={List} />
        <Stat label="Indigenous" value={`${data.indigenousPercentage || 0}%`} icon={TrendingUp} />
        <Stat label="A2A2 Cattle" value={data.a2Distribution?.find((a: any) => a.status === "A2A2")?.count || 0} icon={Beaker} />
      </div>
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50">
            <th className="text-left p-4 font-medium text-muted-foreground">Breed</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Count</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Male</th>
            <th className="text-left p-4 font-medium text-muted-foreground">Female</th>
          </tr></thead>
          <tbody>
            {data.breeds?.map((b: any) => (
              <tr key={b.breed} className="border-b last:border-0">
                <td className="p-4 font-medium">{b.breed}</td>
                <td className="p-4">{b.count}</td>
                <td className="p-4 text-muted-foreground">{b.males}</td>
                <td className="p-4 text-muted-foreground">{b.females}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const GovVaccTab = () => {
  const [data, setData] = useState<any>(null);
  useEffect(() => { governmentAPI.getVaccinationCoverage().then(r => setData(r.data)).catch(() => {}); }, []);

  if (!data) return <Loader2 className="animate-spin text-primary mx-auto mt-12" size={32} />;
  return (
    <div className="animate-fade-in">
      <h3 className="text-xl font-bold mb-6">Vaccination Coverage</h3>
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Stat label="Overall Rate" value={`${data.coverageRate || 0}%`} icon={Syringe} />
        <Stat label="Total Vaccinations" value={data.totalVaccinations || 0} icon={CheckCircle2} />
        <Stat label="Cattle Covered" value={data.cattleWithVaccinations || 0} icon={Shield} />
      </div>
      {data.vaccineBreakdown && (
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50">
              <th className="text-left p-4 font-medium text-muted-foreground">Vaccine</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Administered</th>
            </tr></thead>
            <tbody>
              {data.vaccineBreakdown.map((v: any) => (
                <tr key={v.vaccine} className="border-b last:border-0">
                  <td className="p-4 font-medium">{v.vaccine}</td>
                  <td className="p-4">{v.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const GovAlertsTab = ({ alerts, onRefresh }: { alerts: any[]; onRefresh: () => void }) => {
  const [form, setForm] = useState({ diseaseName: "", region: "", severity: "medium", description: "" });
  const [msg, setMsg] = useState("");

  const create = async () => {
    if (!form.diseaseName || !form.region) return;
    try {
      await governmentAPI.createDiseaseAlert(form);
      setMsg("Alert created!"); setForm({ diseaseName: "", region: "", severity: "medium", description: "" }); onRefresh();
    } catch (e: any) { setMsg(e.response?.data?.error || "Failed"); }
  };

  return (
    <div className="animate-fade-in max-w-3xl">
      <h3 className="text-xl font-bold mb-6">Disease Alerts</h3>

      <div className="rounded-2xl bg-card border border-border p-6 mb-6">
        <h4 className="font-semibold mb-4">Issue New Alert</h4>
        {msg && <div className="p-2 rounded-lg bg-blue-50 text-blue-700 text-sm mb-3">{msg}</div>}
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <input placeholder="Disease Name" value={form.diseaseName} onChange={e => setForm({ ...form, diseaseName: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
          <input placeholder="Region" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background text-sm" />
        </div>
        <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm mb-3">
          <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
        </select>
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm mb-3" rows={2} />
        <button onClick={create} className="px-6 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium">Issue Alert</button>
      </div>

      <div className="space-y-3">
        {alerts.map((a: any) => (
          <div key={a.id} className={`p-4 rounded-xl border ${a.severity === "critical" ? "border-red-300 bg-red-50" : a.severity === "high" ? "border-orange-300 bg-orange-50" : "border-border bg-card"}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold">{a.diseaseName || a.disease_name}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${a.severity === "critical" ? "bg-red-200 text-red-800" : a.severity === "high" ? "bg-orange-200 text-orange-800" : "bg-yellow-200 text-yellow-800"}`}>{a.severity}</span>
            </div>
            <p className="text-sm text-muted-foreground">{a.region} • {a.affectedCount || a.affected_count || 0} affected</p>
            {a.description && <p className="text-sm mt-1">{a.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
