import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Terminal, Database, Lock, Unlock, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface User {
  id: number;
  username: string;
  email: string;
  minkasu_id: string;
  balance: number;
}

interface ApiResponse {
  user?: User;
  query: string;
  status: string;
  error?: string;
}

export default function App() {
  const [vulnerableInput, setVulnerableInput] = useState('1');
  const [secureInput, setSecureInput] = useState('1');
  const [vulnerableResult, setVulnerableResult] = useState<ApiResponse | null>(null);
  const [secureResult, setSecureResult] = useState<ApiResponse | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      console.error("Failed to fetch users", e);
    }
  };

  const testVulnerable = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/vulnerable/user?id=${encodeURIComponent(vulnerableInput)}`);
      const data = await res.json();
      setVulnerableResult(data);
    } catch (e: any) {
      setVulnerableResult({ status: 'error', query: '', error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const testSecure = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/secure/user?id=${encodeURIComponent(secureInput)}`);
      const data = await res.json();
      setSecureResult(data);
    } catch (e: any) {
      setSecureResult({ status: 'error', query: '', error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const payloads = [
    { label: 'Normal ID', value: '1' },
    { label: 'SQL Injection (OR 1=1)', value: '1 OR 1=1' },
    { label: 'Union Attack', value: '1 UNION SELECT 1, "hacker", "hacked@evil.com", "MK_HACKED", 999999' },
    { label: 'Drop Table (Simulated)', value: '1; DROP TABLE users' },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-12 border-b border-ink/20 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-8 h-8 text-ink" />
            <h1 className="text-4xl font-serif italic font-light tracking-tight">Minkasu Secure Shield</h1>
          </div>
          <p className="text-ink/60 font-sans max-w-xl">
            Security Lab: Defending Minkasu SDK integrations against SQL Injection attacks using parameterized queries.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 border border-ink/10 rounded-sm bg-white/50 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-mono font-bold">System Active</span>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Data Grid */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white/40 border border-ink/10 rounded-sm overflow-hidden">
            <div className="p-4 border-b border-ink/10 bg-ink/5 flex items-center justify-between">
              <h2 className="font-serif italic text-lg">Database Registry</h2>
              <Database className="w-4 h-4 opacity-40" />
            </div>
            <div className="overflow-x-auto">
              <div className="data-row bg-ink/5">
                <span className="col-header">ID</span>
                <span className="col-header">Username</span>
                <span className="col-header">Minkasu ID</span>
              </div>
              {users.map((user) => (
                <div key={user.id} className="data-row">
                  <span className="data-value text-xs">{user.id}</span>
                  <span className="font-medium text-sm">{user.username}</span>
                  <span className="data-value text-[10px] opacity-60">{user.minkasu_id}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="p-6 bg-ink text-bg rounded-sm space-y-4">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-emerald-400" />
              <h3 className="font-serif italic text-xl">Security Brief</h3>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              SQL Injection occurs when untrusted data is concatenated directly into SQL strings. 
              The <span className="text-emerald-400 font-mono">Minkasu SDK</span> relies on secure backend handling of transaction and user IDs.
            </p>
            <div className="pt-4 border-t border-bg/20">
              <h4 className="text-[10px] uppercase tracking-widest font-bold mb-2 opacity-60">Best Practices</h4>
              <ul className="text-xs space-y-2 opacity-80">
                <li className="flex gap-2">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                  Always use parameterized queries (Prepared Statements).
                </li>
                <li className="flex gap-2">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                  Validate input types (e.g., ensure ID is numeric).
                </li>
                <li className="flex gap-2">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                  Implement Least Privilege for DB users.
                </li>
              </ul>
            </div>
          </section>
        </div>

        {/* Right Column: Lab Environment */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Vulnerable Lab */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-600">
                <Unlock className="w-5 h-5" />
                <h2 className="font-serif italic text-2xl">Vulnerable Implementation</h2>
              </div>
              <div className="p-6 bg-white border-l-4 border-red-500 shadow-sm space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Input ID (Unfiltered)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={vulnerableInput}
                      onChange={(e) => setVulnerableInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-ink/20 font-mono text-sm focus:outline-none focus:border-red-500"
                      placeholder="Enter ID or payload..."
                    />
                    <button 
                      onClick={testVulnerable}
                      disabled={loading}
                      className="px-4 py-2 bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Execute
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {payloads.map((p) => (
                    <button 
                      key={p.label}
                      onClick={() => setVulnerableInput(p.value)}
                      className="text-[9px] px-2 py-1 border border-red-200 text-red-700 hover:bg-red-50 rounded-full transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {vulnerableResult && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3 pt-4 border-t border-ink/5"
                    >
                      <div className="bg-ink/5 p-3 rounded-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Terminal className="w-3 h-3 opacity-40" />
                          <span className="text-[9px] uppercase tracking-widest font-bold opacity-40">Generated Query</span>
                        </div>
                        <code className="text-xs text-red-600 break-all">{vulnerableResult.query}</code>
                      </div>

                      {vulnerableResult.status === 'success' ? (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span className="text-xs font-bold text-red-800">Data Leaked / Query Succeeded</span>
                          </div>
                          <pre className="text-[10px] font-mono overflow-x-auto">
                            {JSON.stringify(vulnerableResult.user, null, 2)}
                          </pre>
                        </div>
                      ) : (
                        <div className="p-3 bg-gray-100 border border-gray-200 rounded-sm">
                          <span className="text-xs font-bold text-gray-600">Query Error</span>
                          <p className="text-[10px] text-gray-500 mt-1">{vulnerableResult.error}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Secure Lab */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <Lock className="w-5 h-5" />
                <h2 className="font-serif italic text-2xl">Secure Implementation</h2>
              </div>
              <div className="p-6 bg-white border-l-4 border-emerald-500 shadow-sm space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-60">Input ID (Parameterized)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={secureInput}
                      onChange={(e) => setSecureInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-ink/20 font-mono text-sm focus:outline-none focus:border-emerald-500"
                      placeholder="Enter ID or payload..."
                    />
                    <button 
                      onClick={testSecure}
                      disabled={loading}
                      className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      Execute
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {payloads.map((p) => (
                    <button 
                      key={p.label}
                      onClick={() => setSecureInput(p.value)}
                      className="text-[9px] px-2 py-1 border border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-full transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {secureResult && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3 pt-4 border-t border-ink/5"
                    >
                      <div className="bg-ink/5 p-3 rounded-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Terminal className="w-3 h-3 opacity-40" />
                          <span className="text-[9px] uppercase tracking-widest font-bold opacity-40">Prepared Query</span>
                        </div>
                        <code className="text-xs text-emerald-600 break-all">{secureResult.query}</code>
                      </div>

                      {secureResult.user ? (
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-bold text-emerald-800">Securely Fetched</span>
                          </div>
                          <pre className="text-[10px] font-mono overflow-x-auto">
                            {JSON.stringify(secureResult.user, null, 2)}
                          </pre>
                        </div>
                      ) : (
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-bold text-emerald-800">Attack Blocked / No Result</span>
                          </div>
                          <p className="text-[10px] text-emerald-600">The database treated your payload as a literal string value, preventing injection.</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>

          {/* Code Comparison */}
          <section className="bg-ink text-bg p-8 rounded-sm">
            <h2 className="font-serif italic text-3xl mb-6">Implementation Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-red-400">❌ Vulnerable (Node.js)</h3>
                <div className="bg-black/40 p-4 rounded font-mono text-[11px] leading-relaxed overflow-x-auto border border-red-900/30">
                  <span className="text-gray-500">// DANGEROUS: String interpolation</span><br/>
                  <span className="text-blue-300">const</span> query = <span className="text-orange-300">`SELECT * FROM users WHERE id = <span className="text-white">{"${userId}"}</span>`</span>;<br/>
                  <span className="text-blue-300">const</span> user = db.prepare(query).get();
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400">✅ Secure (Node.js)</h3>
                <div className="bg-black/40 p-4 rounded font-mono text-[11px] leading-relaxed overflow-x-auto border border-emerald-900/30">
                  <span className="text-gray-500">// SAFE: Parameterized query</span><br/>
                  <span className="text-blue-300">const</span> stmt = db.prepare(<span className="text-orange-300">"SELECT * FROM users WHERE id = ?"</span>);<br/>
                  <span className="text-blue-300">const</span> user = stmt.get(userId);
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-bg/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src="https://picsum.photos/seed/minkasu/100/40" alt="Minkasu Partner" className="grayscale opacity-50 h-6" referrerPolicy="no-referrer" />
                <span className="text-[10px] uppercase tracking-widest opacity-40">Minkasu SDK Security Standard v2.4</span>
              </div>
              <button 
                onClick={() => {
                  setVulnerableResult(null);
                  setSecureResult(null);
                  setVulnerableInput('1');
                  setSecureInput('1');
                }}
                className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold hover:text-emerald-400 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Lab
              </button>
            </div>
          </section>
        </div>
      </main>

      <footer className="mt-16 pt-8 border-t border-ink/10 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30">
          Built for Secure Minkasu SDK Integration &bull; 2026
        </p>
      </footer>
    </div>
  );
}
