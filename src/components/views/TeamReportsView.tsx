import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getEmployeeAssociatedTeams } from '../../types';
import {
  FileSpreadsheet,
  Users,
  Download,
  Printer,
  TrendingUp,
  Award,
  Terminal,
  Factory,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const TeamReportsView: React.FC = () => {
  const { teams, tasks, employees, currentUserRole, currentEmployee } = useApp();

  const associatedTeams = useMemo(
    () => getEmployeeAssociatedTeams(currentEmployee),
    [currentEmployee]
  );

  const [selectedPodType, setSelectedPodType] = useState<'all' | 'scraping' | 'production'>('all');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');

  // Multi-pod comparative production telemetry
  const podProductionData = [
    { team: 'Core Scraper Pod', deliveredSkus: 412000, activeTasks: 8, qcPassRate: 98.4, avgCycleHours: 3.8 },
    { team: 'Lawson Prod', deliveredSkus: 194000, activeTasks: 5, qcPassRate: 98.2, avgCycleHours: 4.2 },
    { team: 'DTS Automation', deliveredSkus: 142000, activeTasks: 4, qcPassRate: 97.4, avgCycleHours: 4.8 },
    { team: 'Surya Prod', deliveredSkus: 118000, activeTasks: 3, qcPassRate: 92.8, avgCycleHours: 5.6 },
    { team: 'Altius Enterprise', deliveredSkus: 88000, activeTasks: 2, qcPassRate: 89.6, avgCycleHours: 6.2 },
  ];

  // Scoped pod production data strictly to role and associated team
  const scopedPodProductionData = useMemo(() => {
    if (currentUserRole === 'production_lead' && associatedTeams.length > 0) {
      return podProductionData.filter((p) =>
        associatedTeams.some(
          (at) =>
            at.toLowerCase().includes('lawson') && p.team.includes('Lawson') ||
            at.toLowerCase().includes('dts') && p.team.includes('DTS') ||
            at.toLowerCase().includes('surya') && p.team.includes('Surya') ||
            at.toLowerCase().includes('altius') && p.team.includes('Altius')
        )
      );
    }
    return podProductionData;
  }, [podProductionData, currentUserRole, associatedTeams]);

  // Monthly output trend by pod
  const monthlyPodOutput = [
    { month: 'Jul', scraping: 180, lawson: 82, dts: 54, surya: 42, altius: 30 },
    { month: 'Aug', scraping: 220, lawson: 95, dts: 68, surya: 50, altius: 38 },
    { month: 'Sep', scraping: 290, lawson: 110, dts: 85, surya: 62, altius: 45 },
    { month: 'Oct', scraping: 350, lawson: 140, dts: 98, surya: 75, altius: 52 },
    { month: 'Nov (MTD)', scraping: 412, lawson: 194, dts: 142, surya: 118, altius: 88 },
  ];

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Pod Name,Classification,Lead,Delivered SKUs,QC Pass Rate,Avg Cycle Hours,Productivity Index']
        .concat(
          podProductionData.map(
            (p) =>
              `"${p.team}","${p.team.includes('Scraper') ? 'Scraping Engineering' : 'Production Operations'}","Lead",${p.deliveredSkus},${p.qcPassRate}%,${p.avgCycleHours}h,96.4%`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Team_Pod_Operational_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-2xl border border-border bg-card shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                {currentUserRole === 'production_lead'
                  ? `${associatedTeams[0] || 'Production Pod'} Operational Report`
                  : 'Team & Pod Operational Reports'}
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200">
                {currentUserRole === 'production_lead'
                  ? `${associatedTeams[0] || '1 Production Pod'}`
                  : '1 Scraping Pod • 4 Production Teams'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {currentUserRole === 'production_lead'
                ? `Operational cadence, delivery accuracy, and SKU volume for ${associatedTeams[0] || 'your production team'}.`
                : 'Comparative productivity, delivery cadence, and quality index across technical extraction and production operations.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Team Report CSV
          </button>
        </div>
      </div>

      {/* Pod Breakdown Highlights Cards */}
      <div className={`grid grid-cols-1 ${currentUserRole === 'production_lead' ? 'max-w-md' : 'md:grid-cols-2 lg:grid-cols-5'} gap-4`}>
        {/* Core Scraping Pod Card - Only for Managers */}
        {currentUserRole === 'manager' && (
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-50/60 to-card shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Technical Engine
                </span>
                <Terminal className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mt-2">
                Scraping Engineering
              </h3>
              <p className="text-xs text-slate-500">Lead: Karthik R</p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-100 dark:border-emerald-900/40">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500">Total Output</span>
                <span className="text-base font-bold font-mono text-emerald-600">412k SKUs</span>
              </div>
              <div className="flex items-baseline justify-between mt-1 text-xs">
                <span className="text-slate-400">QC Pass</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">98.4%</span>
              </div>
            </div>
          </div>
        )}

        {/* Lawson Production */}
        {(currentUserRole === 'manager' || associatedTeams.some((at) => at.includes('Lawson'))) && (
          <div className="p-4 rounded-xl border border-border bg-card shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Production Pod 1
                </span>
                <Factory className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mt-2">
                Lawson Team
              </h3>
              <p className="text-xs text-slate-500">Lead: Priya Nair</p>
            </div>
            <div className="mt-4 pt-3 border-t border-border">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500">Delivered</span>
                <span className="text-base font-bold font-mono text-indigo-600">194k SKUs</span>
              </div>
              <div className="flex items-baseline justify-between mt-1 text-xs">
                <span className="text-slate-400">Accuracy</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">98.2%</span>
              </div>
            </div>
          </div>
        )}

        {/* DTS Automation */}
        {(currentUserRole === 'manager' || associatedTeams.some((at) => at.includes('DTS'))) && (
          <div className="p-4 rounded-xl border border-border bg-card shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  Production Pod 2
                </span>
                <Factory className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mt-2">
                DTS Automation
              </h3>
              <p className="text-xs text-slate-500">Lead: David Chen</p>
            </div>
            <div className="mt-4 pt-3 border-t border-border">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500">Delivered</span>
                <span className="text-base font-bold font-mono text-blue-600">142k SKUs</span>
              </div>
              <div className="flex items-baseline justify-between mt-1 text-xs">
                <span className="text-slate-400">Accuracy</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">97.4%</span>
              </div>
            </div>
          </div>
        )}

        {/* Surya Team */}
        {(currentUserRole === 'manager' || associatedTeams.some((at) => at.includes('Surya'))) && (
          <div className="p-4 rounded-xl border border-border bg-card shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  Production Pod 3
                </span>
                <Factory className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mt-2">
                Surya Team
              </h3>
              <p className="text-xs text-slate-500">Lead: Surya Prakash</p>
            </div>
            <div className="mt-4 pt-3 border-t border-border">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500">Delivered</span>
                <span className="text-base font-bold font-mono text-amber-600">118k SKUs</span>
              </div>
              <div className="flex items-baseline justify-between mt-1 text-xs">
                <span className="text-slate-400">Accuracy</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">92.8%</span>
              </div>
            </div>
          </div>
        )}

        {/* Altius Enterprise */}
        {(currentUserRole === 'manager' || associatedTeams.some((at) => at.includes('Altius'))) && (
          <div className="p-4 rounded-xl border border-border bg-card shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  Production Pod 4
                </span>
                <Factory className="w-4 h-4 text-rose-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mt-2">
                Altius Enterprise
              </h3>
              <p className="text-xs text-slate-500">Lead: Arun Kumar</p>
            </div>
            <div className="mt-4 pt-3 border-t border-border">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500">Delivered</span>
                <span className="text-base font-bold font-mono text-rose-600">88k SKUs</span>
              </div>
              <div className="flex items-baseline justify-between mt-1 text-xs">
                <span className="text-slate-400">Accuracy</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">89.6%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comparative Monthly Output Stacked Bar Chart */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Monthly SKU Output & Delivery Cadence (in '000s SKUs)
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Extraction engine output vs client catalog deliveries by production operations
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Scraping Pod
            </span>
            <span className="flex items-center gap-1.5 text-indigo-600 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              Lawson Prod
            </span>
            <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              DTS Auto
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyPodOutput} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
                formatter={(val: any, name: any) => [`${val}k SKUs`, name]}
              />
              <Bar dataKey="scraping" name="Scraping Engine" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="lawson" name="Lawson Production" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="dts" name="DTS Automation" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="surya" name="Surya Production" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="altius" name="Altius Enterprise" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comprehensive Pod Audit Table */}
      <div className="rounded-2xl border border-border bg-card shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Operational Pod Performance Audit Matrix
            </h2>
          </div>

          {currentUserRole !== 'production_lead' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Filter Classification:</span>
              <select
                value={selectedPodType}
                onChange={(e) => setSelectedPodType(e.target.value as any)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border bg-card text-slate-700 dark:text-zinc-300"
              >
                <option value="all">All Pods & Teams</option>
                <option value="scraping">Scraping Engineering Only</option>
                <option value="production">Production Teams Only</option>
              </select>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-900/60 border-b border-border text-slate-500 dark:text-zinc-400 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Pod / Team Name</th>
                <th className="py-3 px-4">Pod Type</th>
                <th className="py-3 px-4">Team Leader</th>
                <th className="py-3 px-4">Active Tasks</th>
                <th className="py-3 px-4">Delivered SKUs</th>
                <th className="py-3 px-4">QC Pass Rate</th>
                <th className="py-3 px-4">Cycle Time</th>
                <th className="py-3 px-4 text-right">Productivity Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {scopedPodProductionData
                .filter((p) => {
                  if (selectedPodType === 'scraping') return p.team.includes('Scraper');
                  if (selectedPodType === 'production') return !p.team.includes('Scraper');
                  return true;
                })
                .map((row) => (
                  <tr key={row.team} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-zinc-100">
                      {row.team}
                    </td>
                    <td className="py-3 px-4">
                      {row.team.includes('Scraper') ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200">
                          Scraping Pod
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200">
                          Production Team
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-zinc-300">
                      {row.team.includes('Scraper') ? 'Karthik R' : row.team.includes('Lawson') ? 'Samuel P' : row.team.includes('DTS') ? 'Priya Nair' : 'Team Lead'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-zinc-200">
                      {row.activeTasks}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-zinc-100">
                      {row.deliveredSkus.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-emerald-600">{row.qcPassRate}%</span>
                        <div className="w-12 bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${row.qcPassRate}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-zinc-400">
                      {row.avgCycleHours} hrs
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {(row.qcPassRate * 0.98).toFixed(1)}%
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
