import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  FileSpreadsheet,
  AlertTriangle,
  UserCheck,
  Plus,
  Trash2,
  UploadCloud,
  Check,
  Layers,
  ShieldCheck,
  User,
  Zap,
} from 'lucide-react';
import { TaskPriority } from '../../types';
import confetti from 'canvas-confetti';

export const TaskAssignmentModal: React.FC = () => {
  const {
    isCreateTaskModalOpen,
    setIsCreateTaskModalOpen,
    teams,
    employees,
    projects,
    assignTask,
    defaultScrapingAssignee,
    currentUserRole,
  } = useApp();

  const [step, setStep] = useState<number>(1);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Form state - Step 1: Task Information
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [client, setClient] = useState<string>('Industrial Supplies Co.');
  const [website, setWebsite] = useState<string>('grainger.com');
  const [title, setTitle] = useState<string>('Grainger Roller Bearings & Bushings Extraction');
  const [description, setDescription] = useState<string>(
    'Extract full technical attributes, high-res product photos, PDF cut sheets, and tier-1 pricing for ball and roller bearings.'
  );
  const [inputFileName, setInputFileName] = useState<string>('Grainger_Bearings_Seed_12k.xlsx');
  const [skuCount, setSkuCount] = useState<number>(12450);
  const [autoDetectedNote, setAutoDetectedNote] = useState<string>('⚡ Auto-detected from file: 12,450 SKUs');

  // Step 2: Scraping Routing & Assignment Mode
  // Default is 'default' (Auto-assign to default scraping user without forcing production user to pick)
  const [assignmentMode, setAssignmentMode] = useState<'default' | 'triage' | 'manual'>('default');
  const [selectedTeamName, setSelectedTeamName] = useState<string>('Core Scraping Engineering Pod');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([defaultScrapingAssignee || 'Karthik R']);
  const [primaryAssignee, setPrimaryAssignee] = useState<string>(defaultScrapingAssignee || 'Karthik R');

  // Step 3: Config
  const [priority, setPriority] = useState<TaskPriority>('high');
  const [deadline, setDeadline] = useState<string>('2026-11-28');
  const [productionTeam, setProductionTeam] = useState<string>('Lawson Production Team');
  const [productionAssignee, setProductionAssignee] = useState<string>('Priya Nair');
  const [requiredColumns, setRequiredColumns] = useState<string[]>([
    'SKU_ID',
    'MPN',
    'Title',
    'Category',
    'Price',
    'Images',
    'Specs_JSON',
  ]);
  const [newColInput, setNewColInput] = useState<string>('');
  const [additionalInstructions, setAdditionalInstructions] = useState<string>(
    'Capture all secondary image URLs without watermark. Parse specification tables into JSON.'
  );

  if (!isCreateTaskModalOpen) return null;

  const currentProject = projects.find((p) => p.id === selectedProjectId);

  // Filter scraping engineers (from Core Scraping Engineering Pod or role=Scraping Engineer)
  const scrapingEngineers = employees.filter(
    (e) => e.team === 'Core Scraping Engineering Pod' || e.role.toLowerCase().includes('scraping')
  );

  // File Upload handler with instant row count auto-calculation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setInputFileName(file.name);

    if (file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const lines = text.split('\n').filter((l) => l.trim().length > 0);
          const detected = Math.max(1, lines.length - 1);
          setSkuCount(detected);
          setAutoDetectedNote(`⚡ Auto-calculated from CSV (${detected.toLocaleString()} rows detected)`);
        }
      };
      reader.readAsText(file);
    } else {
      // Approximate rows based on file size for xlsx/binary formats
      const approxRows = Math.round(file.size / 280) || 14250;
      setSkuCount(approxRows);
      setAutoDetectedNote(`⚡ Auto-calculated from spreadsheet (${approxRows.toLocaleString()} SKUs estimated)`);
    }
  };

  const selectPresetFile = (name: string, count: number) => {
    setInputFileName(name);
    setSkuCount(count);
    setAutoDetectedNote(`⚡ Auto-detected from seed file: ${count.toLocaleString()} SKUs`);
  };

  const handleToggleEmployee = (name: string) => {
    if (selectedEmployees.includes(name)) {
      if (selectedEmployees.length > 1) {
        const filtered = selectedEmployees.filter((e) => e !== name);
        setSelectedEmployees(filtered);
        if (primaryAssignee === name) {
          setPrimaryAssignee(filtered[0]);
        }
      }
    } else {
      setSelectedEmployees([...selectedEmployees, name]);
    }
  };

  const handleAddColumn = () => {
    if (newColInput.trim() && !requiredColumns.includes(newColInput.trim())) {
      setRequiredColumns([...requiredColumns, newColInput.trim()]);
      setNewColInput('');
    }
  };

  const handleRemoveColumn = (col: string) => {
    setRequiredColumns(requiredColumns.filter((c) => c !== col));
  };

  const handleConfirmAssignment = () => {
    const effectivePrimary =
      assignmentMode === 'triage'
        ? ''
        : assignmentMode === 'default'
        ? defaultScrapingAssignee || 'Karthik R'
        : primaryAssignee;

    const effectiveEmployees =
      assignmentMode === 'triage' ? [] : [effectivePrimary, ...selectedEmployees.filter((e) => e !== effectivePrimary)];

    assignTask({
      projectId: selectedProjectId,
      projectName: currentProject?.name || 'Grainger US Catalog Refresh',
      website: website || 'grainger.com',
      client: client || 'Industrial Supplies Co.',
      title: title || 'Catalog Extraction & Enrichment',
      description,
      inputFileName,
      inputFileSize: '3.6 MB',
      skuCount,
      priority,
      deadline,
      team: 'Core Scraping Engineering Pod',
      employees: effectiveEmployees,
      primary: effectivePrimary,
      productionTeam,
      productionUser: productionAssignee,
      requiredColumns,
      scrapingRequirements: additionalInstructions.split('\n').filter(Boolean),
    });

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore in test
    }

    setIsSuccess(true);
  };

  const handleClose = () => {
    setIsCreateTaskModalOpen(false);
    setIsSuccess(false);
    setStep(1);
  };

  const stepsList = [
    { num: 1, title: 'Task & Seed File' },
    { num: 2, title: 'Scraping Routing' },
    { num: 3, title: 'Schema Specs' },
    { num: 4, title: 'Review & Dispatch' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                {currentUserRole === 'production' ? 'Request Scraping Task' : 'New Task Assignment & Routing'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Configure extraction scope, auto-detect SKUs from file, and route to Scraping Pod.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Multi-step Breadcrumb */}
        {!isSuccess && (
          <div className="px-6 py-3 border-b border-border bg-slate-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between">
              {stepsList.map((s, idx) => (
                <div key={s.num} className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                      step === s.num
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : step > s.num
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 dark:bg-zinc-800 text-slate-500'
                    }`}
                  >
                    {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:inline ${
                      step === s.num ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-zinc-400'
                    }`}
                  >
                    {s.title}
                  </span>
                  {idx < stepsList.length - 1 && (
                    <div className="w-6 sm:w-10 h-0.5 bg-slate-200 dark:bg-zinc-800 mx-1" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800 animate-fade-in">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                  {assignmentMode === 'triage'
                    ? 'Task Request Submitted for Operations Manager Triage!'
                    : 'Task Successfully Assigned to Scraping Pod!'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                  {assignmentMode === 'triage'
                    ? 'Task entered "Pending Assignment". Operations Manager Samuel P will allocate developer capacity.'
                    : `Assigned to Lead Scraper ${primaryAssignee} (Core Scraping Pod). Notifications dispatched.`}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-border max-w-sm mx-auto text-left text-xs space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Production Pod:</span>
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">{productionTeam}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Scraping Assignee:</span>
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">
                    {assignmentMode === 'triage' ? 'Pending Manager Triage' : primaryAssignee}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Auto-Detected SKUs:</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{skuCount.toLocaleString()} SKUs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Deadline:</span>
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">{deadline}</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleClose}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: Task Information & Automated SKU Extraction */}
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Target Project
                    </label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => {
                        setSelectedProjectId(e.target.value);
                        const p = projects.find((proj) => proj.id === e.target.value);
                        if (p) {
                          setClient(p.client);
                          setWebsite(p.website);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-slate-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.website})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        Client Entity
                      </label>
                      <input
                        type="text"
                        value={client}
                        onChange={(e) => setClient(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-slate-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        Target Website Domain
                      </label>
                      <input
                        type="text"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-slate-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Task Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Grainger Industrial AC Motors & Drive Units"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-slate-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* AUTOMATED SKU COUNT & INPUT FILE UPLOAD BOX */}
                  <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                        <label className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                          Upload Input Seed File (.csv or .xlsx)
                        </label>
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                        Auto-Parsing Engine
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Upload your seed file. The system automatically reads rows and sets the <strong>Estimated SKU Count</strong>.
                    </p>

                    {/* File Drop/Upload */}
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all shrink-0">
                        <UploadCloud className="w-4 h-4" />
                        <span>Select File from Computer</span>
                        <input
                          type="file"
                          accept=".csv, .xlsx, .xls"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>

                      <div className="flex-1 truncate font-mono text-xs px-3 py-2 rounded-lg border border-border bg-card text-slate-700 dark:text-zinc-300">
                        {inputFileName}
                      </div>
                    </div>

                    {/* Quick Preset Buttons for Instant Testing */}
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">
                        Or test with sample seed catalogs:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: 'Grainger_Bearings_12450.xlsx', count: 12450 },
                          { name: 'Fastenal_HexBolts_8200.csv', count: 8200 },
                          { name: 'McMaster_Valves_6500.xlsx', count: 6500 },
                          { name: 'Zoro_CircuitBreakers_15300.csv', count: 15300 },
                        ].map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => selectPresetFile(preset.name, preset.count)}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[10px] font-mono text-slate-700 dark:text-zinc-300 transition-colors"
                          >
                            +{preset.name} ({preset.count.toLocaleString()})
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* SKU Count Auto-Calculated Display */}
                    <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                          Estimated SKU Count:
                        </span>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          {autoDetectedNote}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={skuCount}
                          onChange={(e) => {
                            setSkuCount(Number(e.target.value));
                            setAutoDetectedNote('Custom count specified');
                          }}
                          className="w-28 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 outline-none text-right"
                        />
                        <span className="text-xs text-slate-400 font-mono">SKUs</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Scraping Routing (Production user can assign without choosing scraper) */}
              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                        Flexible Scraping Routing Options
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                      Production users can assign tasks automatically without manually picking individual scraping developers.
                    </p>
                  </div>

                  {/* 3 Routing Radio Options */}
                  <div className="space-y-2.5">
                    {/* OPTION 1: Auto-assign to default scraping assignee */}
                    <div
                      onClick={() => setAssignmentMode('default')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        assignmentMode === 'default'
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                          : 'border-border bg-card hover:bg-slate-50 dark:hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="routing_mode"
                            checked={assignmentMode === 'default'}
                            onChange={() => setAssignmentMode('default')}
                            className="text-indigo-600"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                              Auto-Assign to Default Lead Scraper
                            </span>
                            <span className="ml-2 text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 font-semibold">
                              Recommended for Production
                            </span>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-indigo-600">
                          {defaultScrapingAssignee || 'Karthik R'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 pl-6">
                        Routes task straight to the Core Scraping Pod's designated lead ({defaultScrapingAssignee || 'Karthik R'}). No manual scraper picking required.
                      </p>
                    </div>

                    {/* OPTION 2: Leave for Operations Manager Triage */}
                    <div
                      onClick={() => setAssignmentMode('triage')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        assignmentMode === 'triage'
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                          : 'border-border bg-card hover:bg-slate-50 dark:hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="routing_mode"
                          checked={assignmentMode === 'triage'}
                          onChange={() => setAssignmentMode('triage')}
                          className="text-indigo-600"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                            Submit for Operations Manager Triage (Unassigned)
                          </span>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                            Task enters "Pending Assignment". Operations Manager Samuel P will balance developer capacity and assign the pod.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* OPTION 3: Manual selection */}
                    <div
                      onClick={() => setAssignmentMode('manual')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        assignmentMode === 'manual'
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                          : 'border-border bg-card hover:bg-slate-50 dark:hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="routing_mode"
                          checked={assignmentMode === 'manual'}
                          onChange={() => setAssignmentMode('manual')}
                          className="text-indigo-600"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                            Manually Choose Scraping Engineer(s)
                          </span>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                            Select specific scraping developers from the Core Scraping Engineering Pod.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Manual selector details if chosen */}
                  {assignmentMode === 'manual' && (
                    <div className="space-y-2 pt-2 border-t border-border animate-fade-in">
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 block">
                        Core Scraping Pod Engineers:
                      </span>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {scrapingEngineers.map((emp) => {
                          const isSelected = selectedEmployees.includes(emp.name);
                          return (
                            <div
                              key={emp.id}
                              onClick={() => {
                                handleToggleEmployee(emp.name);
                                setPrimaryAssignee(emp.name);
                              }}
                              className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer text-xs ${
                                isSelected ? 'border-indigo-600 bg-indigo-50/40' : 'border-border'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <img src={emp.avatar} alt="avatar" className="w-6 h-6 rounded-full" />
                                <div>
                                  <span className="font-semibold text-slate-900 dark:text-zinc-100">{emp.name}</span>
                                  <span className="text-[10px] text-slate-400 block">{emp.designation}</span>
                                </div>
                              </div>
                              <span className="font-mono text-[10px] text-indigo-600 font-bold">
                                {emp.workloadCapacity}% capacity
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Configuration & Required Columns */}
              {step === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        Task Priority
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as TaskPriority)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-slate-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                        <option value="urgent">Urgent Priority</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        Target Delivery Deadline
                      </label>
                      <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-slate-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Required Output Column Schema
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mb-2">
                      These headers will be strictly enforced during the scraper's automated Pre-Flight Diff.
                    </p>

                    <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-border bg-slate-50/50 dark:bg-zinc-900/50 min-h-[60px]">
                      {requiredColumns.map((col) => (
                        <span
                          key={col}
                          className="px-2 py-1 rounded-md bg-white dark:bg-zinc-800 border border-border text-xs font-mono text-slate-800 dark:text-zinc-200 flex items-center gap-1.5 shadow-xs"
                        >
                          <span>{col}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveColumn(col)}
                            className="text-slate-400 hover:text-rose-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Add custom attribute (e.g. Thread_Pitch, PDF_CutSheet)"
                        value={newColInput}
                        onChange={(e) => setNewColInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddColumn())}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-card text-xs text-slate-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddColumn}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-300 transition-colors"
                      >
                        Add Column
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Additional Extraction Requirements
                    </label>
                    <textarea
                      rows={2}
                      value={additionalInstructions}
                      onChange={(e) => setAdditionalInstructions(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-slate-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: Review & Dispatch */}
              {step === 4 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 rounded-xl border border-border bg-slate-50/50 dark:bg-zinc-900/50 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                        {title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold uppercase text-[10px]">
                        {priority} Priority
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 font-mono">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Target Website:</span>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200">{website}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Auto-Detected SKUs:</span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {skuCount.toLocaleString()} SKUs
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Production Pod:</span>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200">{productionTeam}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Scraping Routing:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {assignmentMode === 'triage'
                            ? 'Operations Manager Triage'
                            : `${primaryAssignee} (Core Pod)`}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Seed Input File:</span>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate block">
                          {inputFileName}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Deadline:</span>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200">{deadline}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <span className="text-slate-400 block text-[10px] mb-1">Enforced Columns ({requiredColumns.length}):</span>
                      <div className="flex flex-wrap gap-1">
                        {requiredColumns.map((col) => (
                          <span key={col} className="px-1.5 py-0.5 rounded bg-card border border-border text-[10px] font-mono text-slate-600 dark:text-zinc-400">
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!isSuccess && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-slate-50/50 dark:bg-zinc-900/50">
            <button
              onClick={() => (step > 1 ? setStep(step - 1) : handleClose())}
              className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>{step === 1 ? 'Cancel' : 'Back'}</span>
            </button>

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleConfirmAssignment}
                className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Confirm & Dispatch Task</span>
                <Check className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
