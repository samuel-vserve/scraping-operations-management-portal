import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserCheck,
  Search,
  Filter,
  UserPlus,
  ShieldCheck,
  Terminal,
  Factory,
  Edit2,
  Check,
  X,
  MoreVertical,
  Key,
  Lock,
} from 'lucide-react';
import { Employee, UserRole } from '../../types';

export const UserManagementView: React.FC = () => {
  const { employees, updateUserTeam, updateUserTeams } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<Employee | null>(null);
  const [targetTeams, setTargetTeams] = useState<string[]>(['Lawson Production Team']);
  const [targetRole, setTargetRole] = useState<string>('Production Lead');
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);

  // Available Pods / Teams in the Organization
  const ALL_AVAILABLE_PODS = [
    { id: 'lawson', name: 'Lawson Production Team', type: 'production', label: 'Lawson Production Pod' },
    { id: 'surya', name: 'Surya Production Team', type: 'production', label: 'Surya Production Pod' },
    { id: 'dts', name: 'DTS Automation Team', type: 'production', label: 'DTS Automation Pod' },
    { id: 'altius', name: 'Altius Enterprise Team', type: 'production', label: 'Altius Enterprise Pod' },
    { id: 'scraping', name: 'Core Scraping Engineering Pod', type: 'scraping', label: 'Core Scraping Engineering Pod (Extraction)' },
    { id: 'operations', name: 'Operations Leadership', type: 'operations', label: 'Operations Leadership & QA' },
  ];

  // New user form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('scraper');
  const [newUserTeam, setNewUserTeam] = useState('Core Scraping Engineering Pod');

  const filteredUsers = employees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.assignedTeams && emp.assignedTeams.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchRole =
      roleFilter === 'all' ||
      emp.role.toLowerCase().includes(roleFilter.toLowerCase()) ||
      (roleFilter === 'scraper' && emp.team.includes('Scraping'));

    return matchSearch && matchRole;
  });

  const toggleTeamSelection = (teamName: string) => {
    setTargetTeams((prev) =>
      prev.includes(teamName) ? prev.filter((t) => t !== teamName) : [...prev, teamName]
    );
  };

  const handleSelectAllProduction = () => {
    setTargetTeams([
      'Lawson Production Team',
      'Surya Production Team',
      'DTS Automation Team',
      'Altius Enterprise Team',
    ]);
  };

  const handleSaveUserEdit = () => {
    if (!editingUser) return;
    updateUserTeams(editingUser.id, targetTeams.length > 0 ? targetTeams : ['Lawson Production Team'], targetRole);
    setEditingUser(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-2xl border border-border bg-card shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                User Management & Access Governance
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200">
                RBAC Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Administer team operator credentials, role-based access permissions, and pod team assignments.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddUserModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors self-start md:self-auto"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Add New User
        </button>
      </div>

      {/* User Management Table */}
      <div className="rounded-2xl border border-border bg-card shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-slate-50 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border bg-card text-slate-700 dark:text-zinc-300"
            >
              <option value="all">All Roles</option>
              <option value="manager">Operations Manager</option>
              <option value="production">Production Lead / Specialist</option>
              <option value="scraper">Scraping Engineer</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-900/60 border-b border-border text-slate-500 dark:text-zinc-400 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Assigned Pods / Multi-Team</th>
                <th className="py-3 px-4">Active Tasks</th>
                <th className="py-3 px-4">QC Approval Rate</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => {
                const userTeams = user.assignedTeams && user.assignedTeams.length > 0 ? user.assignedTeams : [user.team];

                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border border-border"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-zinc-100">{user.name}</div>
                          <div className="text-[11px] font-mono text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {user.role.toLowerCase().includes('manager') ? (
                        <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 text-[10px] font-bold">
                          Operations Manager
                        </span>
                      ) : user.team.includes('Scraping') ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 text-[10px] font-bold">
                          Scraping Engineer
                        </span>
                      ) : user.role.toLowerCase().includes('lead') ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 text-[10px] font-bold">
                          Production Lead ({userTeams.length} Pods)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 text-[10px] font-bold">
                          Production User
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-1 max-w-[260px]">
                        {userTeams.map((t) => (
                          <span
                            key={t}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              t.includes('Scraping')
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200'
                                : t.includes('Operations')
                                ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200'
                                : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200'
                            }`}
                          >
                            {t.replace(' Team', '').replace(' Engineering Pod', '')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-zinc-100">
                      {user.activeTasksCount}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                      {user.qcApprovalRate}%
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setTargetRole(user.role);
                          setTargetTeams(user.assignedTeams && user.assignedTeams.length > 0 ? user.assignedTeams : [user.team]);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-border bg-card hover:bg-slate-100 dark:hover:bg-zinc-800 text-[11px] font-semibold text-slate-700 dark:text-zinc-300 transition-colors shadow-xs"
                      >
                        <Edit2 className="w-3 h-3" />
                        Configure
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Team Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Configure User Team & Role
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-border">
              <img
                src={editingUser.avatar}
                alt={editingUser.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">{editingUser.name}</p>
                <p className="text-[11px] text-slate-400">{editingUser.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Role Configuration */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                  Operational Role
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-slate-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Operations Manager">Operations Manager (Super Admin)</option>
                  <option value="Production Lead">Production Lead (Multi-Pod Manager)</option>
                  <option value="Production User">Production User (Task Owner & QC)</option>
                  <option value="Scraping Engineer">Scraping Engineer (Extraction Pod)</option>
                  <option value="Guest User">Guest User (Requestor Only)</option>
                </select>
              </div>

              {/* Multi-Team Pod Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Assigned Teams / Multi-Pod Selection ({targetTeams.length} Selected)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleSelectAllProduction}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      + All 4 Production
                    </button>
                    <span className="text-slate-300 dark:text-zinc-600 text-xs">•</span>
                    <button
                      type="button"
                      onClick={() => setTargetTeams([])}
                      className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 font-semibold"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Selected Pods Preview Chips */}
                {targetTeams.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-border mb-2.5">
                    {targetTeams.map((teamName) => (
                      <span
                        key={teamName}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 text-[10px] font-semibold border border-indigo-200 dark:border-indigo-800"
                      >
                        <span>{teamName}</span>
                        <button
                          type="button"
                          onClick={() => toggleTeamSelection(teamName)}
                          className="hover:text-rose-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Checkbox Options List */}
                <div className="space-y-1.5 max-h-56 overflow-y-auto border border-border rounded-xl p-2 bg-card">
                  {ALL_AVAILABLE_PODS.map((pod) => {
                    const isChecked = targetTeams.includes(pod.name);

                    return (
                      <label
                        key={pod.id}
                        className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors text-xs ${
                          isChecked
                            ? 'bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 font-medium'
                            : 'border-border/60 hover:bg-slate-50 dark:hover:bg-zinc-800/50 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleTeamSelection(pod.name)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <span className="font-semibold block">{pod.name}</span>
                            <span className="text-[10px] text-slate-400 block">{pod.label}</span>
                          </div>
                        </div>

                        <span
                          className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded font-bold ${
                            pod.type === 'scraping'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : pod.type === 'operations'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {pod.type}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => setEditingUser(null)}
                className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUserEdit}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Add New Portal Operator
              </h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-slate-50 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                  Work Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. ramesh.k@vservetech.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-slate-50 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                  Assigned Team / Pod
                </label>
                <select
                  value={newUserTeam}
                  onChange={(e) => setNewUserTeam(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-slate-800 dark:text-zinc-200"
                >
                  <option value="Core Scraping Engineering Pod">Core Scraping Engineering Pod (Extraction)</option>
                  <option value="Lawson Production Team">Lawson Production Team</option>
                  <option value="Surya Production Team">Surya Production Team</option>
                  <option value="DTS Automation Team">DTS Automation Team</option>
                  <option value="Altius Enterprise Team">Altius Enterprise Team</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`User ${newUserName || 'New Operator'} created successfully.`);
                  setShowAddUserModal(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
