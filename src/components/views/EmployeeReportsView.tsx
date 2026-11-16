import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Search,
  Filter,
  Download,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck,
  UserCheck,
  Terminal,
  Factory,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const EmployeeReportsView: React.FC = () => {
  const { employees, tasks } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');

  const filteredEmployees = employees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.team.toLowerCase().includes(searchQuery.toLowerCase());

    const matchTeam = selectedTeam === 'all' || emp.team === selectedTeam;
    const matchAvail =
      selectedAvailability === 'all' || emp.availability === selectedAvailability;

    return matchSearch && matchTeam && matchAvail;
  });

  const chartData = employees.slice(0, 8).map((emp) => ({
    name: emp.name.split(' ')[0],
    completedTasks: emp.completedTasks,
    qcRate: emp.qcApprovalRate,
    workload: emp.workloadCapacity,
  }));

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Name,Email,Role,Team,Completed Tasks,QC Approval Rate,Workload Capacity,Availability']
        .concat(
          filteredEmployees.map(
            (e) =>
              `"${e.name}","${e.email}","${e.role}","${e.team}",${e.completedTasks},${e.qcApprovalRate}%,${e.workloadCapacity}%,"${e.availability}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Employee_Productivity_Scorecards.csv');
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
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Employee & Engineer Productivity Scorecards
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200">
                {employees.length} Tracked Staff
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Individual developer extraction volumes, QA first-pass yield, active workload capacity, and velocity indices.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          Export Scorecards CSV
        </button>
      </div>

      {/* Top Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-subtle flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Lead Scraper Output</span>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-slate-900 dark:text-zinc-100">Karthik R</span>
              <p className="text-xs text-emerald-600 font-semibold">142 Completed Tasks</p>
            </div>
            <span className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <Terminal className="w-4 h-4" />
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-subtle flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Highest QC Approval Rate</span>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-slate-900 dark:text-zinc-100">Priya Nair</span>
              <p className="text-xs text-indigo-600 font-semibold">99.1% First-Pass</p>
            </div>
            <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-subtle flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Avg Team Workload</span>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100">76%</span>
              <p className="text-xs text-slate-400">Balanced Allocation</p>
            </div>
            <span className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600">
              <Zap className="w-4 h-4" />
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-subtle flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Workforce Status</span>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100">8 / 10</span>
              <p className="text-xs text-emerald-600 font-semibold">Active & Available</p>
            </div>
            <span className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600">
              <UserCheck className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>

      {/* Output Comparison Chart */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Engineer Output & Workload Capacity Comparison
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Lifetime completed tasks vs active current capacity utilization percentage
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-indigo-600 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              Completed Tasks
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Capacity (%)
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="completedTasks" name="Completed Tasks" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="workload" name="Workload %" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Employee Scorecard Table */}
      <div className="rounded-2xl border border-border bg-card shadow-subtle overflow-hidden">
        {/* Table Search & Filters Header */}
        <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by engineer name, designation or team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-slate-50 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border bg-card text-slate-700 dark:text-zinc-300"
            >
              <option value="all">All Teams</option>
              <option value="Core Scraping Engineering Pod">Core Scraping Engineering Pod</option>
              <option value="Lawson Production Team">Lawson Production Team</option>
              <option value="Surya Production Team">Surya Production Team</option>
              <option value="DTS Automation Team">DTS Automation Team</option>
              <option value="Altius Enterprise Team">Altius Enterprise Team</option>
            </select>

            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border bg-card text-slate-700 dark:text-zinc-300"
            >
              <option value="all">All Availabilities</option>
              <option value="available">Available</option>
              <option value="busy">Busy</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-900/60 border-b border-border text-slate-500 dark:text-zinc-400 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Operator / Engineer</th>
                <th className="py-3 px-4">Assigned Team</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Completed Tasks</th>
                <th className="py-3 px-4">QC Approval Rate</th>
                <th className="py-3 px-4">Active Capacity</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-8 h-8 rounded-full object-cover border border-border"
                      />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-zinc-100">{emp.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400">{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-zinc-300 font-medium">
                    {emp.team.includes('Scraping') ? (
                      <span className="font-semibold text-emerald-600">{emp.team}</span>
                    ) : (
                      emp.team
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-zinc-400">
                    {emp.designation}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-zinc-100">
                    {emp.completedTasks}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-emerald-600">{emp.qcApprovalRate}%</span>
                      <div className="w-12 bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${emp.qcApprovalRate}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${
                            emp.workloadCapacity > 80 ? 'bg-amber-500' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${emp.workloadCapacity}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs text-slate-600 dark:text-zinc-400">
                        {emp.workloadCapacity}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        emp.availability === 'available'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {emp.availability === 'available' ? 'Available' : 'Busy'}
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
