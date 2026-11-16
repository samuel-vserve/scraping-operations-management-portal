import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getEmployeeAssociatedTeams } from '../../types';
import {
  LineChart as LineChartIcon,
  TrendingUp,
  Clock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter,
  Calendar,
  Sparkles,
  Globe,
  RefreshCw,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  Check,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const PerformanceAnalyticsView: React.FC = () => {
  const { tasks, teams, currentUserRole, currentEmployee } = useApp();

  const associatedTeams = useMemo(
    () => getEmployeeAssociatedTeams(currentEmployee),
    [currentEmployee]
  );

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  const toggleTeamFilter = (teamName: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamName) ? prev.filter((t) => t !== teamName) : [...prev, teamName]
    );
  };

  // Velocity telemetry data
  const velocityData = [
    { date: 'Nov 03', actualSkus: 38200, targetSla: 35000, latencyMs: 240 },
    { date: 'Nov 05', actualSkus: 42100, targetSla: 35000, latencyMs: 220 },
    { date: 'Nov 07', actualSkus: 46800, targetSla: 40000, latencyMs: 195 },
    { date: 'Nov 09', actualSkus: 41300, targetSla: 40000, latencyMs: 230 },
    { date: 'Nov 11', actualSkus: 52400, targetSla: 45000, latencyMs: 180 },
    { date: 'Nov 13', actualSkus: 49800, targetSla: 45000, latencyMs: 190 },
    { date: 'Nov 15', actualSkus: 58600, targetSla: 50000, latencyMs: 165 },
    { date: 'Nov 16', actualSkus: 61200, targetSla: 50000, latencyMs: 155 },
  ];

  // Domain Anti-Bot and Friction stats with Team Attribution
  const domainTelemetry = [
    { domain: 'grainger.com', team: 'Lawson Production Team', targetSkus: 84000, extracted: 83200, successRate: 99.0, botTier: 'Cloudflare Turnstile', latency: '185ms', lead: 'Karthik R', status: 'Optimal' },
    { domain: 'mcmaster.com', team: 'Surya Production Team', targetSkus: 62000, extracted: 61400, successRate: 99.0, botTier: 'Akamai Sensor Data', latency: '310ms', lead: 'Sneha Patel', status: 'Optimal' },
    { domain: 'fastenal.com', team: 'Lawson Production Team', targetSkus: 45000, extracted: 43200, successRate: 96.0, botTier: 'PerimeterX / Kasada', latency: '440ms', lead: 'Karthik R', status: 'Attention' },
    { domain: 'zoro.com', team: 'DTS Automation Team', targetSkus: 38000, extracted: 37900, successRate: 99.7, botTier: 'Cloudflare WAF', latency: '160ms', lead: 'Sneha Patel', status: 'Optimal' },
    { domain: 'mscdirect.com', team: 'Altius Enterprise Team', targetSkus: 29000, extracted: 28400, successRate: 97.9, botTier: 'DataDome Challenge', latency: '390ms', lead: 'Karthik R', status: 'Optimal' },
    { domain: 'automationdirect.com', team: 'Core Scraping Engineering Pod', targetSkus: 18000, extracted: 17950, successRate: 99.7, botTier: 'Standard Rate-Limit', latency: '120ms', lead: 'Samuel P', status: 'Optimal' },
  ];

  const filteredDomainTelemetry = useMemo(() => {
    return domainTelemetry.filter((d) => {
      if (currentUserRole === 'production_lead') {
        const belongsToMyTeam = associatedTeams.some(
          (at) => at.toLowerCase().includes(d.team.toLowerCase()) || d.team.toLowerCase().includes(at.toLowerCase())
        );
        if (!belongsToMyTeam) return false;
      }
      const matchDomain = selectedDomain === 'all' || d.domain === selectedDomain;
      const matchTeam = selectedTeams.length === 0 || selectedTeams.includes(d.team);
      return matchDomain && matchTeam;
    });
  }, [domainTelemetry, selectedDomain, selectedTeams, currentUserRole, associatedTeams]);

  // Failure and error distribution
  const failureReasons = [
    { name: '429 Rate Limit Backoff', value: 38, color: '#6366f1' },
    { name: 'Cloudflare WAF Intercept', value: 24, color: '#f59e0b' },
    { name: 'DOM Mutation / Drift', value: 18, color: '#ec4899' },
    { name: 'Proxy Pool Rotation Lag', value: 12, color: '#3b82f6' },
    { name: 'Network Timeout (504)', value: 8, color: '#94a3b8' },
  ];

  // First pass QC quality curve
  const qualityTrend = [
    { week: 'W42', firstPass: 91.2, reworkRate: 8.8 },
    { week: 'W43', firstPass: 93.5, reworkRate: 6.5 },
    { week: 'W44', firstPass: 95.8, reworkRate: 4.2 },
    { week: 'W45', firstPass: 97.4, reworkRate: 2.6 },
    { week: 'W46', firstPass: 98.6, reworkRate: 1.4 },
  ];

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Domain,Target SKUs,Extracted,Success Rate,Bot Tier,Latency,Lead,Status']
        .concat(
          domainTelemetry.map(
            (d) =>
              `"${d.domain}",${d.targetSkus},${d.extracted},${d.successRate}%,"${d.botTier}","${d.latency}","${d.lead}","${d.status}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Scraping_Performance_Telemetry_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-2xl border border-border bg-card shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
            <LineChartIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Performance Analytics & SLA Telemetry
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200">
                Live Engine Feed
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Real-time monitoring of scraping extraction velocity, crawler latency, anti-bot mitigation, and delivery SLA compliance.
            </p>
          </div>
        </div>

        {/* Filter and Export Buttons */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center p-1 rounded-lg border border-border bg-slate-50 dark:bg-zinc-900 text-xs font-semibold">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-card text-slate-900 dark:text-zinc-100 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Telemetry CSV
          </button>
        </div>
      </div>

      {/* Multi-Team Telemetry Filter Bar */}
      <div className="p-3.5 rounded-xl border border-border bg-card shadow-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>{currentUserRole === 'production_lead' ? 'Your Assigned Pod:' : 'Multi-Pod Telemetry:'}</span>
          </span>

          <button
            onClick={() => setSelectedTeams([])}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              selectedTeams.length === 0
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-card border border-border text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            {currentUserRole === 'production_lead' ? 'Your Pod Telemetry' : 'All Pods Aggregate'}
          </button>

          {(currentUserRole === 'production_lead' && associatedTeams.length > 0
            ? associatedTeams.map((tName) => ({ id: tName, name: tName }))
            : teams
          ).map((t) => {
            const isSelected = selectedTeams.includes(t.name);
            return (
              <button
                key={t.id}
                onClick={() => toggleTeamFilter(t.name)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300 shadow-xs'
                    : 'bg-card border-border text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSelected ? 'bg-indigo-600' : 'bg-slate-400'
                  }`}
                />
                <span>{t.name.replace(' Team', '').replace(' Engineering Pod', '')}</span>
                {isSelected && <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
              </button>
            );
          })}
        </div>

        {selectedTeams.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium text-[11px]">
              {selectedTeams.length} Pods Active
            </span>
            <button
              onClick={() => setSelectedTeams([])}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              Reset Multi-Team
            </button>
          </div>
        )}
      </div>

      {/* 4 Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">SLA Adherence Rate</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100">98.6%</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3 h-3" /> +1.4%
              </span>
              <span className="text-[11px] text-slate-400">vs 30d baseline</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '98.6%' }} />
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Extraction Velocity</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100">48,250</span>
            <span className="text-xs text-slate-400 ml-1.5">SKUs / day</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3 h-3" /> +18.2%
              </span>
              <span className="text-[11px] text-slate-400">peak processing</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '88%' }} />
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Mean Turnaround (MTTT)</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100">3.6h</span>
            <span className="text-xs text-slate-400 ml-1.5">per 10k batch</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3 h-3" /> -24 mins
              </span>
              <span className="text-[11px] text-slate-400">cycle time reduction</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '92%' }} />
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Anti-Bot Bypass Rate</span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100">98.2%</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] font-semibold text-indigo-600 flex items-center">
                WAF Friction: 1.8%
              </span>
              <span className="text-[11px] text-slate-400">Cloudflare/Akamai</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '98.2%' }} />
          </div>
        </div>
      </div>

      {/* Charts Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Velocity vs Target SLA (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-border bg-card shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Daily SKU Extraction Velocity vs SLA Target
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Actual mined records compared against contractual delivery commitments
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-indigo-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                Actual SKUs Mined
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-0.5 bg-slate-400" />
                Target SLA Line
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={velocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} SKUs`, '']}
                />
                <Area type="monotone" dataKey="actualSkus" name="Actual SKUs" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#velocityGrad)" />
                <Line type="monotone" dataKey="targetSla" name="Target SLA" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Chart: Anti-Bot & Failure Root Causes (1 col) */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-subtle flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Crawler Friction & Error Distribution
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">
              Breakdown of automated defense friction and retry causes
            </p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={failureReasons}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {failureReasons.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val}%`, 'Incidence']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 mt-2">
            {failureReasons.slice(0, 3).map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-zinc-400 truncate max-w-[170px]">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Domain Performance Breakdown Table */}
      <div className="rounded-2xl border border-border bg-card shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Domain Telemetry & Extraction Health
            </h2>
            <span className="text-xs font-mono text-slate-400">({domainTelemetry.length} Target Domains Monitored)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Filter Domain:</span>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border bg-card text-slate-700 dark:text-zinc-300"
            >
              <option value="all">All Targets</option>
              {domainTelemetry.map((d) => (
                <option key={d.domain} value={d.domain}>{d.domain}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-900/60 border-b border-border text-slate-500 dark:text-zinc-400 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Target Domain</th>
                <th className="py-3 px-4">Assigned Pod</th>
                <th className="py-3 px-4">Target SKUs</th>
                <th className="py-3 px-4">Extracted SKUs</th>
                <th className="py-3 px-4">Success Rate</th>
                <th className="py-3 px-4">Anti-Bot Tier</th>
                <th className="py-3 px-4">Avg Latency</th>
                <th className="py-3 px-4">Lead Engineer</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDomainTelemetry.map((row) => (
                <tr key={row.domain} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {row.domain}
                  </td>
                  <td className="py-3 px-4 text-xs font-medium text-slate-700 dark:text-zinc-300">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-[10px] font-semibold border border-border">
                      {row.team.replace(' Team', '').replace(' Engineering Pod', '')}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700 dark:text-zinc-300">
                    {row.targetSkus.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-zinc-100">
                    {row.extracted.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-emerald-600">{row.successRate}%</span>
                      <div className="w-12 bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${row.successRate}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-zinc-400">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-[11px] font-medium border border-border">
                      {row.botTier}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-zinc-400">
                    {row.latency}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-zinc-300 font-medium">
                    {row.lead}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.status === 'Optimal'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
