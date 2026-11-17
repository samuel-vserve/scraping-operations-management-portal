import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Cloud,
  Folder,
  FileSpreadsheet,
  FileCode,
  FileText,
  Download,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Clock,
  HardDrive,
  Sparkles,
  ChevronRight,
  Search,
  Filter,
} from 'lucide-react';

export const GDriveView: React.FC = () => {
  const { tasks, importExportLogs } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const driveFiles = useMemo(() => {
    const list: any[] = [];
    tasks.forEach((t) => {
      if (t.outputFileName) {
        list.push({
          id: `gdf-out-${t.id}`,
          name: t.outputFileName,
          folder: t.productionTeam?.toLowerCase().includes('dts')
            ? 'dts'
            : t.productionTeam?.toLowerCase().includes('surya')
            ? 'surya'
            : t.productionTeam?.toLowerCase().includes('altius')
            ? 'altius'
            : 'lawson',
          taskRef: t.id,
          team: t.productionTeam || 'Production Pod',
          size: t.outputFileSize || '12.4 MB',
          records: t.completedSkus || t.skuCount,
          uploadedBy: t.primaryAssignee || 'Scraping Engineer',
          lastSynced: 'Just now',
          syncStatus: 'synced',
        });
      }
      if (t.inputFileName) {
        list.push({
          id: `gdf-in-${t.id}`,
          name: t.inputFileName,
          folder: 'seeds',
          taskRef: t.id,
          team: t.productionTeam || 'Production Pod',
          size: t.inputFileSize || '2.1 MB',
          records: t.skuCount,
          uploadedBy: t.productionUser || 'Production Lead',
          lastSynced: 'Just now',
          syncStatus: 'synced',
        });
      }
    });

    importExportLogs.forEach((l) => {
      list.push({
        id: `gdf-ie-${l.id}`,
        name: l.fileName,
        folder: 'all',
        taskRef: 'IMPORT',
        team: 'Operational Ingestion',
        size: l.size,
        records: l.recordsCount,
        uploadedBy: l.uploadedBy,
        lastSynced: l.timestamp,
        syncStatus: 'synced',
      });
    });

    return list;
  }, [tasks, importExportLogs]);

  const folders = [
    { id: 'all', name: 'All Cloud Files', count: driveFiles.length },
    { id: 'lawson', name: 'Lawson Industrial', count: driveFiles.filter((f) => f.folder === 'lawson').length, path: '/Vserve-Operations/Lawson-Industrial' },
    { id: 'dts', name: 'DTS Automation', count: driveFiles.filter((f) => f.folder === 'dts').length, path: '/Vserve-Operations/DTS-Automation' },
    { id: 'surya', name: 'Surya Production', count: driveFiles.filter((f) => f.folder === 'surya').length, path: '/Vserve-Operations/Surya-Production' },
    { id: 'altius', name: 'Altius Enterprise', count: driveFiles.filter((f) => f.folder === 'altius').length, path: '/Vserve-Operations/Altius-Enterprise' },
    { id: 'seeds', name: 'Raw Seed Archives', count: driveFiles.filter((f) => f.folder === 'seeds').length, path: '/Vserve-Operations/Raw-Seed-Archives' },
  ];

  const filteredFiles = driveFiles.filter((f) => {
    const matchSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.taskRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.team.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFolder = selectedFolder === 'all' || f.folder === selectedFolder;
    return matchSearch && matchFolder;
  });

  const handleTriggerSync = () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncFeedback('Google Drive synchronized successfully: 18 files up to date.');
      setTimeout(() => setSyncFeedback(null), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-2xl border border-border bg-card shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Google Drive Cloud Storage & File Repository
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200">
                Connected • Workspace Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Synchronized cloud directory structure for input seed files, raw scraped payloads, and validated production client deliverables.
            </p>
          </div>
        </div>

        <button
          onClick={handleTriggerSync}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Synchronizing...' : 'Force Drive Sync Now'}
        </button>
      </div>

      {syncFeedback && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {syncFeedback}
        </div>
      )}

      {/* Cloud Account & Storage Quota Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-subtle flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Connected Account</span>
          <div className="mt-2">
            <div className="font-bold text-slate-900 dark:text-zinc-100 text-sm truncate">samuel.p@vservetech.com</div>
            <p className="text-[11px] text-emerald-600 font-semibold">Google Workspace Active</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-subtle flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Drive Cloud Capacity</span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100">428 GB</span>
            <span className="text-xs text-slate-400 ml-1">/ 2 TB (21%)</span>
            <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '21%' }} />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-subtle flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Synced Client Files</span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100">18 Files</span>
            <p className="text-xs text-indigo-600 font-semibold">Across 4 Production Pods</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-subtle flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Auto-Backup Cadence</span>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100">15 mins</span>
            <p className="text-xs text-slate-400">Instant on QC Approval</p>
          </div>
        </div>
      </div>

      {/* Cloud Directory Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {folders.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFolder(f.id)}
            className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
              selectedFolder === f.id
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                : 'border-border bg-card hover:bg-slate-50 dark:hover:bg-zinc-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Folder className={`w-4 h-4 ${selectedFolder === f.id ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-bold">
                {f.count}
              </span>
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate block">
              {f.name}
            </span>
          </button>
        ))}
      </div>

      {/* Cloud Files Table */}
      <div className="rounded-2xl border border-border bg-card shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search cloud files by name, task ID or pod..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-slate-50 dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="text-xs text-slate-500">
            Showing <strong>{filteredFiles.length}</strong> cloud deliverables
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-900/60 border-b border-border text-slate-500 dark:text-zinc-400 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Cloud File Name</th>
                <th className="py-3 px-4">Task Ref</th>
                <th className="py-3 px-4">Production Team</th>
                <th className="py-3 px-4">Record Count</th>
                <th className="py-3 px-4">File Size</th>
                <th className="py-3 px-4">Sync Status</th>
                <th className="py-3 px-4">Last Synced</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredFiles.length > 0 ? (
                filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                          <FileSpreadsheet className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-zinc-100">{file.name}</div>
                          <div className="text-[10px] text-slate-400">Uploaded by {file.uploadedBy}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {file.taskRef}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-zinc-300 font-medium">
                      {file.team}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-900 dark:text-zinc-100">
                      {file.records.toLocaleString()} SKUs
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {file.size}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        Synced
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {file.lastSynced}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => alert(`Opening Google Drive preview for ${file.name}`)}
                          className="p-1.5 rounded-lg border border-border bg-card hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300"
                          title="Open in Google Drive"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => alert(`Downloading ${file.name}`)}
                          className="p-1.5 rounded-lg border border-border bg-card hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300"
                          title="Download Copy"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Cloud className="w-8 h-8 mx-auto text-slate-300 dark:text-zinc-600 mb-2 stroke-[1.5]" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">No Google Drive Deliverables Synced Yet</p>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-0.5">Scraped data deliverables and approved client Excel/CSV packages will automatically synchronize here once tasks are uploaded and verified.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
