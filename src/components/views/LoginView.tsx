import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Layers,
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  Sun,
  Moon,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  X,
  CheckCircle2,
  Key,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const {
    login,
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
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<string>('Production User');
  const [regTeam, setRegTeam] = useState('Lawson Production Team');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your corporate work email.');
      return;
    }
    const success = login(email, password);
    if (!success) {
      setErrorMsg('Invalid operator credentials. Please check your email and password or register a new account.');
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
      password: regPassword.trim() || undefined,
      role: regRole,
      team: regTeam,
      assignedTeams: [regTeam],
      designation: `${regRole} Specialist`,
    });
    login(regEmail.trim(), regPassword.trim() || undefined);
    setShowRegisterModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-indigo-500/20 selection:text-indigo-600 transition-colors">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between max-w-5xl w-full mx-auto pb-4">
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

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Production System
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

      {/* Main Centered Authentication Console */}
      <main className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-card border border-border rounded-3xl p-7 sm:p-9 shadow-premium space-y-6 animate-scale-up">
          <div className="space-y-2 text-center">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-1 border border-indigo-100 dark:border-indigo-900">
              <Key className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              Operator Sign In
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto">
              Enter your corporate credentials to access your role-scoped scraping workflows and deliverables.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-fade-in">
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
                  required
                  placeholder="name@vservetech.com"
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
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg(null);
                  }}
                  className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-border bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
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
                <span className="text-slate-600 dark:text-zinc-400">Remember session</span>
              </label>
              <span className="text-[11px] text-slate-400">
                SSL 256-bit encrypted
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In to Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
            <span className="text-slate-400">Need an operator account?</span>
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
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Set your password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
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
