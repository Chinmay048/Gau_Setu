import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { marketplaceAPI, insuranceAPI, transferAPI } from "@/lib/api";

/* ─── Public Customer Page ────────────────────────────────
   Browse dairy products, insurance plans, verify cattle
   — no authentication required                          */

type Product = {
  id: number;
  productName: string;
  productType: string;
  description: string;
  price: number;
  unit: string;
  stockQuantity: number;
  isVerified: boolean;
  isA2Certified: boolean;
  farmName: string;
  farmLocation: string;
  farmerReputation: number;
  farmerPhone?: string;
};

type InsurancePlan = {
  id: number;
  name: string;
  premium: string;
  coverage: string;
  description: string;
  eligibility: string;
};

type CattleVerification = {
  rfid: string;
  breed: string;
  gender: string;
  birthDate: string;
  isVerified: boolean;
  currentOwner: string;
  farmName: string;
  farmLocation: string;
  totalTransfers: number;
};

const CustomerPage = () => {
  const [tab, setTab] = useState<"marketplace" | "insurance" | "transfer">("marketplace");
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [rfid, setRfid] = useState("");
  const [cattle, setCattle] = useState<CattleVerification | null>(null);
  const [verifyError, setVerifyError] = useState("");
  const [recentTransfers, setRecentTransfers] = useState<any[]>([]);

  useEffect(() => {
    loadProducts();
    loadPlans();
    loadRecentTransfers();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await marketplaceAPI.getPublicProducts();
      setProducts(res.data.products || []);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  const loadPlans = async () => {
    try {
      const res = await insuranceAPI.getPublicPlans();
      setPlans(res.data.plans || []);
    } catch { setPlans([]); }
  };

  const loadRecentTransfers = async () => {
    try {
      const res = await transferAPI.getRecentPublic();
      setRecentTransfers(res.data.transfers || []);
    } catch { setRecentTransfers([]); }
  };

  const verifyCattle = async () => {
    if (!rfid.trim()) return;
    setVerifyError("");
    setCattle(null);
    try {
      const res = await transferAPI.verifyCattlePublic(rfid.trim());
      setCattle(res.data.cattle);
    } catch (err: any) {
      setVerifyError(err.response?.data?.message || "Cattle not found");
    }
  };

  const filteredProducts = products.filter(p => {
    if (category && p.productType !== category) return false;
    if (search && !p.productName.toLowerCase().includes(search.toLowerCase()) && !p.farmName?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const tabs = [
    { key: "marketplace" as const, label: "🛒 Live Prices", icon: "Store" },
    { key: "insurance" as const, label: "🛡️ Insurance Plans", icon: "Shield" },
    { key: "transfer" as const, label: "🔍 Verify Cattle", icon: "Search" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/gausetu-logo.png" alt="GauSetu" className="h-8 w-8" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">GauSetu</span>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium ml-1">Customer Portal</span>
          </Link>
          <div className="flex gap-2">
            <Link to="/login" className="px-4 py-2 text-sm font-medium rounded-lg border border-input hover:bg-accent transition-colors">Farmer Login</Link>
            <Link to="/register" className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-orange-500 to-green-600 text-white hover:opacity-90 transition-opacity">Register</Link>
          </div>
        </div>
      </header>

      {/* ─── Hero Banner ─── */}
      <div className="bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-orange-950/20 dark:via-background dark:to-green-950/20 py-10 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">Fresh from Indian Farms</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse verified A2 dairy products directly from registered farms.
            Check live prices, view insurance options, and verify cattle authenticity.
          </p>
        </div>
      </div>

      {/* ─── Tab Navigation ─── */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex gap-1 bg-muted/50 rounded-xl p-1 w-fit">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === t.key
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ════════ MARKETPLACE TAB ════════ */}
        {tab === "marketplace" && (
          <div className="animate-in fade-in">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
              <input
                placeholder="Search products or farms..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm w-64 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
              />
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
              >
                <option value="">All Categories</option>
                {["milk", "ghee", "curd", "paneer", "butter", "other"].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
              <span className="flex items-center text-xs text-muted-foreground">
                {filteredProducts.length} products available
              </span>
            </div>

            {loading ? (
              <div className="text-center py-20 text-muted-foreground">Loading products...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">No products found</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map(p => (
                  <div key={p.id} className="rounded-2xl bg-card border border-border p-5 hover:shadow-lg hover:border-orange-200 transition-all group">
                    {/* Product Type Icon */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">
                        {p.productType === "milk" ? "🥛" : p.productType === "ghee" ? "🧈" : p.productType === "curd" ? "🥣" : p.productType === "paneer" ? "🧀" : p.productType === "butter" ? "🧈" : "📦"}
                      </span>
                      <div>
                        <h3 className="font-semibold group-hover:text-orange-600 transition-colors">{p.productName}</h3>
                        <p className="text-xs text-muted-foreground capitalize">{p.productType}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-2xl font-bold text-orange-600 mb-2">
                      ₹{p.price}<span className="text-sm font-normal text-muted-foreground">/{p.unit}</span>
                    </div>

                    {/* Description */}
                    {p.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{p.description}</p>
                    )}

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {p.isVerified && <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-medium">✓ Verified Farm</span>}
                      {p.isA2Certified && <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700 font-medium">A2 Certified</span>}
                      <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600">{p.stockQuantity} {p.unit}s available</span>
                    </div>

                    {/* Farm Info */}
                    <div className="border-t border-border pt-3">
                      <p className="text-sm font-medium">{p.farmName}</p>
                      <p className="text-xs text-muted-foreground">{p.farmLocation}</p>
                      {p.farmerReputation > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-500 text-xs">{"★".repeat(Math.round(p.farmerReputation))}</span>
                          <span className="text-xs text-muted-foreground">({p.farmerReputation.toFixed(1)})</span>
                        </div>
                      )}
                    </div>

                    {/* Call Button */}
                    <button
                      onClick={() => {
                        alert(`📞 Contact ${p.farmName}\n📍 ${p.farmLocation}\n\nPlease call the farm directly or visit GauSetu to place an order.`);
                      }}
                      className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                      📞 Contact Farm
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Live Price Summary */}
            {products.length > 0 && (
              <div className="mt-8 rounded-2xl bg-gradient-to-r from-orange-50 to-green-50 dark:from-orange-950/10 dark:to-green-950/10 border border-orange-200/50 p-6">
                <h3 className="text-lg font-bold mb-4">📊 Live Price Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {["milk", "ghee", "curd", "paneer", "butter", "other"].map(type => {
                    const items = products.filter(p => p.productType === type);
                    if (items.length === 0) return null;
                    const avgPrice = items.reduce((s, p) => s + p.price, 0) / items.length;
                    const minPrice = Math.min(...items.map(p => p.price));
                    const maxPrice = Math.max(...items.map(p => p.price));
                    return (
                      <div key={type} className="bg-card rounded-xl p-4 text-center border border-border">
                        <p className="text-2xl mb-1">
                          {type === "milk" ? "🥛" : type === "ghee" ? "🧈" : type === "curd" ? "🥣" : type === "paneer" ? "🧀" : type === "butter" ? "🧈" : "📦"}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize font-medium">{type}</p>
                        <p className="text-lg font-bold text-orange-600 mt-1">₹{avgPrice.toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground">₹{minPrice}–₹{maxPrice}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════ INSURANCE TAB ════════ */}
        {tab === "insurance" && (
          <div className="animate-in fade-in">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Cattle Insurance Plans</h2>
              <p className="text-muted-foreground">Protect your livestock with GauSetu-verified insurance coverage backed by NADCP guidelines.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {plans.map((plan, i) => (
                <div key={plan.id} className={`rounded-2xl border p-6 ${i === 2 ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-card ring-1 ring-orange-200' : 'border-border bg-card'}`}>
                  {i === 2 && <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-medium mb-3 inline-block">Most Popular</span>}
                  <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-bold text-orange-600">{plan.premium}</span>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/20 rounded-lg px-3 py-2 mb-3">
                    <p className="text-sm"><span className="font-semibold text-green-700">Coverage:</span> {plan.coverage}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                  <div className="border-t border-border pt-3">
                    <p className="text-xs text-muted-foreground"><span className="font-medium">Eligibility:</span> {plan.eligibility}</p>
                  </div>
                  <Link
                    to="/register"
                    className="block w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium text-center hover:opacity-90 transition-opacity"
                  >
                    Register to Apply
                  </Link>
                </div>
              ))}
            </div>

            {/* Insurance Benefits */}
            <div className="mt-8 rounded-2xl bg-card border border-border p-6">
              <h3 className="text-lg font-bold mb-4">Why GauSetu Insurance?</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { icon: "🔒", title: "Blockchain Verified", desc: "Each policy is linked to RFID-tagged cattle with DNA verification for fraud-proof claims." },
                  { icon: "⚡", title: "Instant Claims", desc: "AI-powered claim processing with vet report integration. 72-hour settlement guarantee." },
                  { icon: "🏛️", title: "Govt. Backed", desc: "Plans aligned with NADCP and state animal husbandry schemes. Subsidies for small farmers." },
                ].map((b, i) => (
                  <div key={i} className="text-center p-4">
                    <p className="text-3xl mb-2">{b.icon}</p>
                    <h4 className="font-semibold mb-1">{b.title}</h4>
                    <p className="text-xs text-muted-foreground">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════ TRANSFER / VERIFY TAB ════════ */}
        {tab === "transfer" && (
          <div className="animate-in fade-in">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Verify Cattle Ownership</h2>
              <p className="text-muted-foreground">Enter an RFID tag to verify cattle registration, ownership, and transfer history on the GauSetu blockchain.</p>
            </div>

            {/* Search Box */}
            <div className="flex gap-3 mb-6">
              <input
                placeholder="Enter RFID tag (e.g. KG-GIR-2016-M01)"
                value={rfid}
                onChange={e => setRfid(e.target.value)}
                onKeyDown={e => e.key === "Enter" && verifyCattle()}
                className="px-4 py-3 rounded-xl border border-input bg-background text-sm flex-1 max-w-md focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-mono"
              />
              <button
                onClick={verifyCattle}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-green-600 text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                🔍 Verify
              </button>
            </div>

            {/* Verification Result */}
            {verifyError && (
              <div className="rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 p-5 mb-6">
                <p className="text-red-600 font-medium">❌ {verifyError}</p>
              </div>
            )}

            {cattle && (
              <div className="rounded-2xl bg-card border border-green-200 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">✅</span>
                  <h3 className="text-lg font-bold text-green-700">Cattle Verified on GauSetu</h3>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "RFID Tag", value: cattle.rfid, mono: true },
                    { label: "Breed", value: cattle.breed },
                    { label: "Gender", value: cattle.gender },
                    { label: "Birth Date", value: cattle.birthDate },
                    { label: "Current Owner", value: cattle.currentOwner },
                    { label: "Farm", value: cattle.farmName },
                    { label: "Location", value: cattle.farmLocation },
                    { label: "Total Transfers", value: cattle.totalTransfers.toString() },
                  ].map((f, i) => (
                    <div key={i} className="bg-muted/30 rounded-xl p-3">
                      <p className="text-xs text-muted-foreground mb-0.5">{f.label}</p>
                      <p className={`font-semibold text-sm ${f.mono ? "font-mono" : ""}`}>{f.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  {cattle.isVerified && <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700 font-medium">✓ DNA Verified</span>}
                  <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700 font-medium">RFID Registered</span>
                </div>
              </div>
            )}

            {/* Recent Transfers */}
            <div className="rounded-2xl bg-card border border-border p-6">
              <h3 className="text-lg font-bold mb-4">Recent Transfers on GauSetu</h3>
              {recentTransfers.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">No recent transfers recorded</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="p-3 font-medium text-muted-foreground">RFID</th>
                        <th className="p-3 font-medium text-muted-foreground">Breed</th>
                        <th className="p-3 font-medium text-muted-foreground">From</th>
                        <th className="p-3 font-medium text-muted-foreground">To</th>
                        <th className="p-3 font-medium text-muted-foreground">Date</th>
                        <th className="p-3 font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransfers.map((t: any) => (
                        <tr key={t.id} className="border-b border-border last:border-0">
                          <td className="p-3 font-mono text-xs">{t.rfid_number}</td>
                          <td className="p-3">{t.breed}</td>
                          <td className="p-3">{t.from_farm}</td>
                          <td className="p-3">{t.to_farm}</td>
                          <td className="p-3 text-muted-foreground">{t.transfer_date}</td>
                          <td className="p-3 capitalize">{t.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* How It Works */}
            <div className="mt-6 rounded-2xl bg-gradient-to-r from-orange-50 to-green-50 dark:from-orange-950/10 dark:to-green-950/10 border border-orange-200/50 p-6">
              <h3 className="text-lg font-bold mb-4">How GauSetu Verification Works</h3>
              <div className="grid sm:grid-cols-4 gap-4">
                {[
                  { step: "1", title: "RFID Tagging", desc: "Each cow gets a unique RFID ear tag at registration" },
                  { step: "2", title: "DNA Profiling", desc: "Vet-verified DNA sampling for breed authenticity" },
                  { step: "3", title: "Noseprint ID", desc: "AI-based biometric noseprint for unique identification" },
                  { step: "4", title: "Blockchain Ledger", desc: "All transfers recorded on immutable distributed ledger" },
                ].map(s => (
                  <div key={s.step} className="text-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-green-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-2">{s.step}</div>
                    <h4 className="font-semibold text-sm mb-1">{s.title}</h4>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border mt-12 py-6 px-4 text-center text-xs text-muted-foreground">
        <p>© 2025 GauSetu — National Cattle Identity & Dairy Traceability Platform</p>
        <p className="mt-1">Aligned with NADCP, INAPH & National Livestock Mission</p>
      </footer>
    </div>
  );
};

export default CustomerPage;
