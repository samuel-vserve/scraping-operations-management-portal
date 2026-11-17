import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Factory,
  Terminal,
  ArrowRight,
  UserCheck,
  Sun,
  Moon,
  Sparkles,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  X,
} from 'lucide-react';
import { UserRole } from '../../types';

export const LoginView: React.FC = () => {
  const {
    login,
    quickLoginAs,
    employees,
    addEmployee,
    darkMode,
    toggleDarkMode,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New Operator registration state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<string>('Production User');
  const [regTeam, setRegTeam] = useState('Lawson Production Team');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your work email address.');
      return;
    }
    const success = login(email, password);
    if (!success) {
      setErrorMsg('Operator account not found. Please check your email or select an operator below.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      alert('Please fill out all required fields.');
      return;
    }
    addEmployee({
      name: regName.trim(),
      email: regEmail.trim(),
      role: regRole,
      team: regTeam,
      assignedTeams: [regTeam],
      designation: `${regRole} Specialist`,
    });
    login(regEmail.trim());
    setShowRegisterModal(false);
  };

  const standardProfiles: { role: UserRole; name: string; title: string; email: string; avatar: string }[] = [
    {
      role: 'manager',
      name: 'Samuel P',
      title: 'Operations Manager (Super Admin)',
      email: 'samuel.p@vservetech.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    {
      role: 'production_lead',
      name: 'Priya Nair',
      title: 'Production Lead (Multi-Pod)',
      email: 'priya.nair@vservetech.com',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    },
    {
      role: 'production_user',
      name: 'Divya Murugan',
      title: 'Production User (QC & Owner)',
      email: 'divya.m@vservetech.com',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    },
    {
      role: 'scraper',
      name: 'Karthik R',
      title: 'Scraping Engineer (Extraction Pod)',
      email: 'karthik.r@vservetech.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    },
    {
      role: 'guest',
      name: 'Mark Stevens',
      title: 'Guest Client (Requestor)',
      email: 'mark.stevens@client.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-indigo-500/20 selection:text-indigo-600 transition-colors">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between max-w-5xl w-full mx-auto pb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-zinc-100 block">
              Vserve Scraping Ops
            </span>
            <span className="text-[11px] font-mono text-slate-400 block -mt-0.5">
              Live Operations Management Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live System Online
          </span>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl border border-border bg-card text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shadow-xs"
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Login Card & Quick Login Grid */}
      <main className="max-w-5xl w-full mx-auto space-y-8 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Authentication Form */}
          <div className="lg:col-span-5 bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-premium space-y-6 animate-scale-up">
            <div className="space-y-1.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                Operator Sign In
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Access your production tasks, scraping pods, QC approvals, and deliverables.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 block">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="e.g. samuel.p@vservetech.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMsg(null);
                    }}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-border bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">
                    Password / Access Key
                  </label>
                  <span className="text-[11px] text-slate-400">Default: password</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-border bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-600 dark:text-zinc-400">Remember this session</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>Sign In to Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
              <span className="text-slate-400">Need a new portal account?</span>
              <button
                type="button"
                onClick={() => setShowRegisterModal(true)}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register Operator</span>
              </button>
            </div>
          </div>

          {/* Right Column: Quick Role Sign-In Menu */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>One-Click Operator Sessions</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Select a live operational account to instantly authenticate into role-scoped console.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {standardProfiles.map((p) => {
                const isMatching = employees.find((e) => e.email === p.email) || p;

                return (
                  <div
                    key={p.role}
                    onClick={() => quickLoginAs(p.role, p.email)}
                    className="group p-4 rounded-2xl border border-border bg-card hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-premium cursor-pointer transition-all active:scale-[0.98] relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900 dark:text-zinc-100 truncate block">
                            {p.name}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        </div>
                        <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 block truncate">
                          {p.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block truncate mt-0.5">
                          {p.email}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 text-[10px] uppercase font-mono">
                        {p.role.replace('_', ' ')}
                      </span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Launch <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Created Operators Quick List */}
            {employees.length > 5 && (
              <div className="p-4 rounded-2xl border border-border bg-card/60 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block">
                  Other Registered Personnel ({employees.length - 5} Custom Operators)
                </span>
                <div className="flex flex-wrap gap-2">
                  {employees.slice(5).map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => quickLoginAs('production_user', emp.email)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 transition-colors shadow-xs"
                    >
                      <img src={emp.avatar} alt={emp.name} className="w-4 h-4 rounded-full object-cover" />
                      <span>{emp.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({emp.role})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto pt-6 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Vserve Scraping Operations Portal • Enterprise Production Live Edition</span>
        </div>
        <div>
          <span>Role-Based Access Governance • Multi-Pod Routing Active</span>
        </div>
      </footer>

      {/* Register New Operator Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <span>Register Portal Operator</span>
              </h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh.k@vservetech.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                  Operational Role
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-slate-900 dark:text-zinc-100 outline-none"
                >
                  <option value="Production User">Production User (Task Owner & QC)</option>
                  <option value="Production Lead">Production Lead (Multi-Pod Manager)</option>
                  <option value="Scraping Engineer">Scraping Engineer (Extraction Pod)</option>
                  <option value="Operations Manager">Operations Manager (Super Admin)</option>
                  <option value="Guest User">Guest User (Requestor Only)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                  Primary Team / Pod
                </label>
                <select
                  value={regTeam}
                  onChange={(e) => setRegTeam(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-slate-900 dark:text-zinc-100 outline-none"
                >
                  <option value="Lawson Production Team">Lawson Production Team</option>
                  <option value="Surya Production Team">Surya Production Team</option>
                  <option value="DTS Automation Team">DTS Automation Team</option>
                  <option value="Altius Enterprise Team">Altius Enterprise Team</option>
                  <option value="Core Scraping Engineering Pod">Core Scraping Engineering Pod (Extraction)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-border text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm"
                >
                  Register & Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
