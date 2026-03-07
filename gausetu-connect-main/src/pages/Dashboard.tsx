import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cowAPI, vaccinationAPI } from "@/lib/api";
import logo from "@/assets/gausetu-logo.png";
import {
  Home,
  PlusCircle,
  List,
  Syringe,
  ArrowRightLeft,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  ScanLine,
  Dna,
  Bell,
  ChevronRight,
  Tag,
  Calendar,
  Fingerprint,
  Loader2,
} from "lucide-react";

const sidebarItems = [
  { icon: Home, label: "Overview", id: "overview" },
  { icon: PlusCircle, label: "Register Cow", id: "register" },
  { icon: List, label: "My Cattle", id: "cattle" },
  { icon: ScanLine, label: "Scan & Identify", id: "scan" },
  { icon: Syringe, label: "Vaccinations", id: "vaccinations" },
  { icon: Dna, label: "DNA Status", id: "dna" },
  { icon: ArrowRightLeft, label: "Transfers", id: "transfers" },
  { icon: Activity, label: "Activity Log", id: "activity" },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cattle, setCattle] = useState<any[]>([]);
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading dashboard data...');
      
      const [cattleRes, vaccinationRes] = await Promise.all([
        cowAPI.getMyCows(),
        vaccinationAPI.getUpcoming()
      ]);
      
      console.log('✅ Cattle loaded:', cattleRes.data);
      console.log('✅ Vaccinations loaded:', vaccinationRes.data);
      
      setCattle(cattleRes.data.cows || []);
      setVaccinations(vaccinationRes.data.vaccinations || []);
    } catch (err: any) {
      console.error('❌ Failed to load dashboard data:', err);
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-2 px-5 h-16 border-b border-border">
          <img src={logo} alt="GauSetu" className="h-8 w-8" />
          <span className="font-bold text-foreground">GauSetu</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-muted-foreground">
            <X size={20} />
          </button>
        </div>

        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2 px-5">
          Farmer Dashboard
        </div>

        <nav className="space-y-1 px-3">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted">
            <Settings size={18} /> Settings
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-4 lg:px-8 bg-card/50 backdrop-blur-sm sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground">
            <Menu size={22} />
          </button>
          <h2 className="text-lg font-semibold text-foreground capitalize">{activeTab}</h2>
          <div className="flex items-center gap-4">
            <button className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell size={20} />
              {vaccinations.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                  {vaccinations.length}
                </span>
              )}
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-saffron flex items-center justify-center text-primary-foreground text-sm font-bold">
              {user?.farmName?.[0] || 'F'}
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive">
              {error}
            </div>
          ) : (
            <>
              {activeTab === "overview" && <OverviewTab cattle={cattle} vaccinations={vaccinations} />}
              {activeTab === "register" && <RegisterTab onSuccess={loadDashboardData} />}
              {activeTab === "cattle" && <CattleTab cattle={cattle} />}
              {activeTab === "vaccinations" && <VaccinationsTab vaccinations={vaccinations} />}
              {activeTab === "activity" && <ActivityTab cattle={cattle} />}
              {activeTab === "scan" && <ScanTab />}
              {activeTab === "dna" && <DnaTab cattle={cattle} />}
              {activeTab === "transfers" && <TransfersTab />}
            </>
          )}
        </div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, trend }: { label: string; value: string; icon: any; trend?: string }) => (
  <div className="p-5 rounded-2xl bg-card border border-border">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon size={18} className="text-primary" />
      </div>
    </div>
    <div className="text-2xl font-bold text-foreground">{value}</div>
    {trend && <span className="text-xs text-secondary mt-1">{trend}</span>}
  </div>
);

const OverviewTab = ({ cattle, vaccinations }: { cattle: any[]; vaccinations: any[] }) => {
  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    return `${years}y ${months}m`;
  };

  const activeCattle = cattle.filter(c => c.registrationType);
  const dnaVerifiedCattle = cattle.filter(c => c.dnaReportUrl);
  const urgentVaccinations = vaccinations.filter(v => {
    if (!v.nextDueDate) return false;
    const daysUntilDue = Math.floor((new Date(v.nextDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 7;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Cattle" value={cattle.length.toString()} icon={List} />
        <StatCard label="Active" value={activeCattle.length.toString()} icon={Activity} />
        <StatCard label="DNA Uploaded" value={dnaVerifiedCattle.length.toString()} icon={Dna} />
        <StatCard 
          label="Vaccinations Due" 
          value={vaccinations.length.toString()} 
          icon={Syringe} 
          trend={urgentVaccinations.length > 0 ? `${urgentVaccinations.length} urgent` : undefined} 
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Vaccinations */}
        <div className="rounded-2xl bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-foreground">Upcoming Vaccinations</h3>
            <Calendar size={18} className="text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {vaccinations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming vaccinations</p>
            ) : (
              vaccinations.slice(0, 5).map((v: any) => {
                const daysUntilDue = v.nextDueDate ? 
                  Math.floor((new Date(v.nextDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
                  null;
                const isUrgent = daysUntilDue !== null && daysUntilDue <= 7;

                return (
                  <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <div>
                      <span className="text-sm font-medium text-foreground">{v.cowRFID || 'Unknown'}</span>
                      <span className="text-sm text-muted-foreground ml-2">— {v.vaccineName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {v.nextDueDate ? new Date(v.nextDueDate).toLocaleDateString() : 'N/A'}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${isUrgent ? "bg-destructive" : "bg-primary"}`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-foreground">Recent Activity</h3>
            <Activity size={18} className="text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {cattle.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              cattle.slice(0, 4).map((c: any, i: number) => (
                <div key={c.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <PlusCircle size={14} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Cow Registered</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {c.rfidNumber} - {c.breed || 'Unknown breed'}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const RegisterTab = () => (
  <div className="max-w-2xl animate-fade-in">
    <div className="rounded-2xl bg-card border border-border p-8">
      <h3 className="text-xl font-bold text-foreground mb-1">Register New Cow</h3>
      <p className="text-sm text-muted-foreground mb-8">Add a newborn or purchased cow to the GauSetu platform.</p>

      <div className="flex gap-4 mb-8">
        <button className="flex-1 p-4 rounded-xl border-2 border-primary bg-primary/5 text-center">
          <PlusCircle size={24} className="mx-auto mb-2 text-primary" />
          <span className="text-sm font-semibold text-foreground">Newborn Calf</span>
        </button>
        <button className="flex-1 p-4 rounded-xl border border-border text-center hover:border-muted-foreground/30 transition-colors">
          <ArrowRightLeft size={24} className="mx-auto mb-2 text-muted-foreground" />
          <span className="text-sm font-semibold text-muted-foreground">Purchased Cow</span>
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">RFID Tag Number</label>
          <div className="flex gap-2">
            <input type="text" placeholder="Scan or enter RFID..." className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <button className="px-4 py-2.5 rounded-lg bg-gradient-saffron text-primary-foreground text-sm font-medium shadow-saffron">
              <ScanLine size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Gender</label>
            <select className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option>Female</option>
              <option>Male</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Birth Date</label>
            <input type="date" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Breed</label>
          <select className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option>Gir</option>
            <option>Sahiwal</option>
            <option>Red Sindhi</option>
            <option>Tharparkar</option>
            <option>Rathi</option>
            <option>Kankrej</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Nose-Print Capture</label>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/30 transition-colors cursor-pointer">
            <Fingerprint size={32} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Tap to open camera and capture nose-print samples</p>
            <p className="text-xs text-muted-foreground mt-1">5–10 samples recommended</p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Cow Photo</label>
          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/30 transition-colors cursor-pointer">
            <p className="text-sm text-muted-foreground">Tap to upload photo</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Father RFID (optional)</label>
            <input type="text" placeholder="Enter father's RFID" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Mother RFID (optional)</label>
            <input type="text" placeholder="Enter mother's RFID" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        <button className="w-full py-3 rounded-xl bg-gradient-saffron text-primary-foreground font-semibold shadow-saffron hover:opacity-90 transition-opacity">
          Register Cow
        </button>
      </div>
    </div>
  </div>
);

const CattleTab = ({ cattle }: { cattle: any[] }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    return `${years}y ${months >= 0 ? months : 12 + months}m`;
  };

  const filteredCattle = cattle.filter(cow => 
    cow.rfidNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cow.breed?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground">My Cattle</h3>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Search by RFID or breed..." 
            className="px-4 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-64" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredCattle.length === 0 ? (
        <div className="rounded-2xl bg-card border border-border p-12 text-center">
          <p className="text-muted-foreground">No cattle found. Register your first cow to get started!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCattle.map((cow: any) => (
            <div key={cow.id} className="rounded-2xl bg-card border border-border p-5 hover:border-primary/30 hover:shadow-saffron transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-muted-foreground">#{cow.id}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                  {cow.gender}
                </span>
              </div>

              <div className="w-14 h-14 rounded-xl bg-gradient-saffron flex items-center justify-center text-primary-foreground text-lg font-bold mb-3">
                {cow.rfidNumber.substring(0, 2)}
              </div>

              <h4 className="font-semibold text-foreground">{cow.rfidNumber}</h4>
              <p className="text-sm text-muted-foreground">{cow.breed || 'Unknown'} • {calculateAge(cow.birthDate)}</p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Tag size={12} /> {cow.registrationType || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Dna size={12} />
                  <span className={cow.dnaReportUrl ? "text-secondary" : "text-muted-foreground"}>
                    DNA: {cow.dnaReportUrl ? 'UPLOADED' : 'PENDING'}
                  </span>
                </div>
                {cow.noseprintId && (
                  <div className="flex items-center gap-2 text-xs text-secondary">
                    <Fingerprint size={12} /> Biometric ID
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-primary font-medium group-hover:underline">View Profile</span>
                <ChevronRight size={14} className="text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const VaccinationsTab = ({ vaccinations }: { vaccinations: any[] }) => (
  <div className="animate-fade-in max-w-3xl">
    <h3 className="text-xl font-bold text-foreground mb-6">Vaccination Calendar</h3>
    {vaccinations.length === 0 ? (
      <div className="rounded-2xl bg-card border border-border p-12 text-center">
        <p className="text-muted-foreground">No upcoming vaccinations scheduled</p>
      </div>
    ) : (
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-4 font-medium text-muted-foreground">Cow RFID</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Vaccine</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Due Date</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {vaccinations.map((v: any) => {
              const daysUntilDue = v.nextDueDate ? 
                Math.floor((new Date(v.nextDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
                null;
              const isUrgent = daysUntilDue !== null && daysUntilDue <= 7;

              return (
                <tr key={v.id} className="border-b border-border last:border-0">
                  <td className="p-4 font-medium text-foreground">{v.cowRFID || 'Unknown'}</td>
                  <td className="p-4 text-muted-foreground">{v.vaccineName}</td>
                  <td className="p-4 text-muted-foreground">
                    {v.nextDueDate ? new Date(v.nextDueDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      isUrgent ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                    }`}>
                      {isUrgent ? "Urgent" : "Upcoming"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const ActivityTab = ({ cattle }: { cattle: any[] }) => (
  <div className="animate-fade-in max-w-3xl">
    <h3 className="text-xl font-bold text-foreground mb-6">Activity Log</h3>
    {cattle.length === 0 ? (
      <div className="rounded-2xl bg-card border border-border p-12 text-center">
        <p className="text-muted-foreground">No activity yet</p>
      </div>
    ) : (
      <div className="space-y-4">
        {cattle.map((cow: any, i: number) => (
          <div key={cow.id} className="flex items-start gap-4 p-4 rounded-2xl bg-card border border-border">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <PlusCircle size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Cow Registered</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {cow.rfidNumber} - {cow.breed || 'Unknown breed'} ({cow.gender})
              </p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {new Date(cow.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const DnaTab = ({ cattle }: { cattle: any[] }) => (
  <div className="animate-fade-in max-w-4xl">
    <h3 className="text-xl font-bold text-foreground mb-6">DNA Status</h3>
    {cattle.length === 0 ? (
      <div className="rounded-2xl bg-card border border-border p-12 text-center">
        <p className="text-muted-foreground">No cattle registered yet</p>
      </div>
    ) : (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cattle.map((cow: any) => (
          <div key={cow.id} className="rounded-2xl bg-card border border-border p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-foreground">{cow.rfidNumber}</p>
                <p className="text-xs text-muted-foreground">{cow.breed || 'Unknown'}</p>
              </div>
              <Dna size={20} className={cow.dnaReportUrl ? "text-secondary" : "text-muted-foreground"} />
            </div>
            <div className="mt-4">
              <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                cow.dnaReportUrl 
                  ? "bg-secondary/10 text-secondary" 
                  : "bg-muted text-muted-foreground"
              }`}>
                {cow.dnaReportUrl ? "DNA Uploaded" : "Pending Upload"}
              </span>
            </div>
            {cow.dnaReportUrl && (
              <button className="mt-3 text-xs text-primary hover:underline">
                View Report
              </button>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

const ScanTab = () => (
  <div className="animate-fade-in max-w-lg mx-auto text-center">
    <div className="rounded-2xl bg-card border border-border p-12">
      <div className="w-24 h-24 rounded-3xl bg-gradient-saffron flex items-center justify-center mx-auto mb-6 shadow-saffron">
        <ScanLine size={40} className="text-primary-foreground" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">Scan & Identify</h3>
      <p className="text-sm text-muted-foreground mb-8">Use RFID reader or nose-print camera to identify a cow in real time.</p>
      <div className="space-y-3">
        <button className="w-full py-3 rounded-xl bg-gradient-saffron text-primary-foreground font-semibold shadow-saffron">
          Scan RFID Tag
        </button>
        <button className="w-full py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-muted transition-colors">
          Open Nose-Print Camera
        </button>
      </div>
    </div>
  </div>
);

const TransfersTab = () => (
  <div className="animate-fade-in max-w-lg mx-auto text-center">
    <div className="rounded-2xl bg-card border border-border p-12">
      <div className="w-24 h-24 rounded-3xl bg-gradient-forest flex items-center justify-center mx-auto mb-6 shadow-forest">
        <ArrowRightLeft size={40} className="text-primary-foreground" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">Ownership Transfer</h3>
      <p className="text-sm text-muted-foreground mb-8">Securely transfer cow ownership to another registered farmer.</p>
      <button className="w-full py-3 rounded-xl bg-gradient-forest text-primary-foreground font-semibold shadow-forest">
        Initiate Transfer
      </button>
    </div>
  </div>
);

export default Dashboard;
