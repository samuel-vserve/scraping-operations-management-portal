import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Layers,
  Database,
  Search,
  Filter,
  Download,
  ExternalLink,
  Image as ImageIcon,
  FileCode,
  FileText,
  AlertCircle,
  Copy,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Sparkles,
} from 'lucide-react';
import { ScrapedRecord } from '../../types';

interface AnalyticsViewProps {
  mode?: 'analytics' | 'explorer';
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ mode = 'analytics' }) => {
  const { datasetRecords, tasks } = useApp();

  // Active Task File Context
  const activeTask = tasks[0];

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCompletenessFilter, setActiveCompletenessFilter] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [selectedRecordForModal, setSelectedRecordForModal] = useState<ScrapedRecord | null>(null);
  const [modalType, setModalType] = useState<'image' | 'specs' | 'url' | null>(null);

  // Column width resizing state
  const [colWidths, setColWidths] = useState<{ [key: string]: number }>({
    skuId: 130,
    mpn: 120,
    title: 260,
    category: 180,
    price: 90,
    images: 100,
    specs: 120,
    status: 110,
  });

  const handleResize = (colKey: string, delta: number) => {
    setColWidths((prev) => ({
      ...prev,
      [colKey]: Math.max(70, (prev[colKey] || 120) + delta),
    }));
  };

  // 10 Completeness Metrics
  const completenessItems = [
    { key: 'skuId', label: 'SKU ID', percentage: 100 },
    { key: 'productUrl', label: 'Product URL', percentage: 100 },
    { key: 'mpn', label: 'MPN', percentage: 99.8 },
    { key: 'title', label: 'Title', percentage: 100 },
    { key: 'category', label: 'Category', percentage: 98.6 },
    { key: 'images', label: 'Images', percentage: 87.5 },
    { key: 'description', label: 'Description', percentage: 96.2 },
    { key: 'bullets', label: 'Bullet Points', percentage: 92.4 },
    { key: 'documents', label: 'Documents', percentage: 75.0 },
    { key: 'specifications', label: 'Specifications', percentage: 91.8 },
  ];

  // Filtering records
  const filteredRecords = useMemo(() => {
    return datasetRecords.filter((rec) => {
      const matchSearch =
        rec.skuId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.mpn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        activeCategoryFilter === 'all' || rec.category.includes(activeCategoryFilter);

      let matchCompleteness = true;
      if (activeCompletenessFilter) {
        if (activeCompletenessFilter === 'images') {
          matchCompleteness = !rec.imageUrl;
        } else if (activeCompletenessFilter === 'documents') {
          matchCompleteness = !rec.documentUrl;
        } else if (activeCompletenessFilter === 'specifications') {
          matchCompleteness = Object.keys(rec.specifications).length === 0;
        } else {
          matchCompleteness = rec.missingFields.includes(activeCompletenessFilter);
        }
      }

      return matchSearch && matchCategory && matchCompleteness;
    });
  }, [datasetRecords, searchQuery, activeCategoryFilter, activeCompletenessFilter]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['SKU ID', 'MPN', 'Title', 'Category', 'Price', 'Stock', 'Image URL', 'Doc URL'];
    const rows = filteredRecords.map((r) => [
      r.skuId,
      r.mpn,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.category}"`,
      r.price,
      r.stockStatus,
      r.imageUrl,
      r.documentUrl || '',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Dataset_Export_${activeTask.id}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-5 pb-12 animate-fade-in">
      {/* 1. File Overview Banner */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-subtle flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-zinc-100 font-mono">
                {activeTask.outputFileName || 'Grainger_Bearings_Extracted_v1.xlsx'}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                {mode === 'explorer' ? 'Dataset Explorer Mode' : 'Analysis Complete'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Project: <strong className="text-slate-800 dark:text-zinc-200">{activeTask.projectName}</strong> • Task ID:{' '}
              <span className="font-mono text-indigo-600 dark:text-indigo-400">{activeTask.id}</span>
            </p>
          </div>
        </div>

        {/* Metadata stats pill */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600 dark:text-zinc-300">
          <div>
            <span className="text-slate-400 text-[11px] block">Uploaded By</span>
            <span className="font-semibold">{activeTask.primaryAssignee || 'Karthik R'}</span>
          </div>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <div>
            <span className="text-slate-400 text-[11px] block">Upload Date</span>
            <span>{activeTask.createdAt}</span>
          </div>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <div>
            <span className="text-slate-400 text-[11px] block">Total Records</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {activeTask.skuCount.toLocaleString()}
            </span>
          </div>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <div>
            <span className="text-slate-400 text-[11px] block">Total Columns</span>
            <span className="font-bold">24 Cols</span>
          </div>
        </div>
      </div>

      {/* 2. Eight Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {[
          { label: 'Total SKUs', val: activeTask.skuCount.toLocaleString(), color: 'text-indigo-600' },
          { label: 'Exact Matches', val: '12,350', color: 'text-emerald-600' },
          { label: 'Partial Matches', val: '85', color: 'text-blue-600' },
          { label: 'Not Found', val: '15', color: 'text-slate-500' },
          { label: 'Duplicate SKUs', val: '4', color: 'text-amber-600' },
          { label: 'Missing Fields', val: '18', color: 'text-rose-600' },
          { label: 'Total Images', val: '24,800', color: 'text-cyan-600' },
          { label: 'Total Docs', val: '9,450', color: 'text-purple-600' },
        ].map((card, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl border border-border bg-card shadow-subtle text-center flex flex-col justify-between"
          >
            <span className="text-[10px] font-medium text-slate-400 truncate block">
              {card.label}
            </span>
            <span className={`text-base font-bold font-mono ${card.color} my-1`}>
              {card.val}
            </span>
            <span className="text-[9px] text-slate-400">Validated</span>
          </div>
        ))}
      </div>

      {/* 3. Data Completeness Horizontal Progress Bars */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Data Schema Completeness Diagnostics
            </h2>
            <p className="text-[11px] text-slate-400">
              Click any attribute to filter the Dataset Explorer below to deficient rows
            </p>
          </div>
          {activeCompletenessFilter && (
            <button
              onClick={() => setActiveCompletenessFilter(null)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Clear filter (Showing only non-compliant for: {activeCompletenessFilter})
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {completenessItems.map((item) => {
            const isSelected = activeCompletenessFilter === item.key;

            return (
              <button
                key={item.key}
                onClick={() =>
                  setActiveCompletenessFilter(isSelected ? null : item.key)
                }
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm'
                    : 'border-border/60 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50/40 dark:bg-zinc-900/30'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700 dark:text-zinc-300 truncate">
                    {item.label}
                  </span>
                  <span
                    className={`font-mono font-bold text-xs ${
                      item.percentage >= 98
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : item.percentage >= 90
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {item.percentage}%
                  </span>
                </div>

                <div className="h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      item.percentage >= 98
                        ? 'bg-emerald-500'
                        : item.percentage >= 90
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Excel-Like Dataset Explorer Grid */}
      <div className="rounded-2xl border border-border bg-card shadow-subtle overflow-hidden">
        {/* Explorer Toolbar */}
        <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative min-w-[260px] flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search across SKUs, MPNs, titles, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <select
              value={activeCategoryFilter}
              onChange={(e) => setActiveCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs text-slate-700 dark:text-zinc-300 outline-none"
            >
              <option value="all">All Taxonomies</option>
              <option value="Bearings">Power Transmission &gt; Bearings</option>
              <option value="Inserts">Mounted Bearings &gt; Inserts</option>
              <option value="Cylindrical">Cylindrical Bearings</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
              Showing {filteredRecords.length} records
            </span>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Excel Data Grid with Sticky Headers & Resizing */}
        <div className="overflow-x-auto max-h-[550px] relative">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/90 dark:bg-zinc-900 border-b border-border text-[11px] font-semibold text-slate-600 dark:text-zinc-300 uppercase tracking-wider sticky top-0 z-10 select-none">
              <tr>
                <th
                  style={{ width: `${colWidths.skuId}px` }}
                  className="p-2.5 border-r border-border relative group"
                >
                  <div className="flex items-center justify-between">
                    <span>SKU ID</span>
                    <button
                      onClick={() => handleResize('skuId', 20)}
                      className="opacity-0 group-hover:opacity-100 cursor-col-resize text-slate-400 text-xs font-bold"
                      title="Widen column"
                    >
                      ↔
                    </button>
                  </div>
                </th>

                <th
                  style={{ width: `${colWidths.mpn}px` }}
                  className="p-2.5 border-r border-border relative group"
                >
                  <div className="flex items-center justify-between">
                    <span>MPN</span>
                    <button
                      onClick={() => handleResize('mpn', 20)}
                      className="opacity-0 group-hover:opacity-100 cursor-col-resize text-slate-400 text-xs font-bold"
                    >
                      ↔
                    </button>
                  </div>
                </th>

                <th
                  style={{ width: `${colWidths.title}px` }}
                  className="p-2.5 border-r border-border relative group"
                >
                  <div className="flex items-center justify-between">
                    <span>Product Title</span>
                    <button
                      onClick={() => handleResize('title', 30)}
                      className="opacity-0 group-hover:opacity-100 cursor-col-resize text-slate-400 text-xs font-bold"
                    >
                      ↔
                    </button>
                  </div>
                </th>

                <th
                  style={{ width: `${colWidths.category}px` }}
                  className="p-2.5 border-r border-border relative group"
                >
                  <span>Category</span>
                </th>

                <th
                  style={{ width: `${colWidths.price}px` }}
                  className="p-2.5 border-r border-border"
                >
                  <span>Price</span>
                </th>

                <th
                  style={{ width: `${colWidths.images}px` }}
                  className="p-2.5 border-r border-border text-center"
                >
                  <span>Images</span>
                </th>

                <th
                  style={{ width: `${colWidths.specs}px` }}
                  className="p-2.5 border-r border-border text-center"
                >
                  <span>Specs JSON</span>
                </th>

                <th
                  style={{ width: `${colWidths.status}px` }}
                  className="p-2.5 border-r border-border text-center"
                >
                  <span>Status</span>
                </th>

                <th className="p-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRecords.map((rec) => {
                const isDuplicate = rec.status === 'duplicate';
                const hasMissing = rec.status === 'missing_fields';

                return (
                  <tr
                    key={rec.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 font-mono transition-colors ${
                      isDuplicate
                        ? 'bg-amber-50/30 dark:bg-amber-950/20'
                        : hasMissing
                        ? 'bg-rose-50/20 dark:bg-rose-950/20'
                        : ''
                    }`}
                  >
                    {/* SKU ID */}
                    <td className="p-2.5 border-r border-border font-bold text-indigo-600 dark:text-indigo-400 truncate">
                      {rec.skuId}
                    </td>

                    {/* MPN */}
                    <td className="p-2.5 border-r border-border text-slate-700 dark:text-zinc-300 truncate">
                      {rec.mpn}
                    </td>

                    {/* Title */}
                    <td className="p-2.5 border-r border-border font-sans font-medium text-slate-900 dark:text-zinc-100">
                      <div className="truncate max-w-[280px]" title={rec.title}>
                        {rec.title}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-2.5 border-r border-border font-sans text-slate-600 dark:text-zinc-400">
                      <div className="truncate max-w-[180px]" title={rec.category}>
                        {rec.category}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="p-2.5 border-r border-border font-bold text-slate-800 dark:text-zinc-200">
                      {rec.price}
                    </td>

                    {/* Image Preview */}
                    <td className="p-2.5 border-r border-border text-center">
                      {rec.imageUrl ? (
                        <button
                          onClick={() => {
                            setSelectedRecordForModal(rec);
                            setModalType('image');
                          }}
                          className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:underline"
                        >
                          <img
                            src={rec.imageUrl}
                            alt="preview"
                            className="w-5 h-5 rounded object-cover ring-1 ring-border inline"
                          />
                          <span>View</span>
                        </button>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">
                          Missing
                        </span>
                      )}
                    </td>

                    {/* Specs Viewer */}
                    <td className="p-2.5 border-r border-border text-center">
                      <button
                        onClick={() => {
                          setSelectedRecordForModal(rec);
                          setModalType('specs');
                        }}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-[11px] text-slate-700 dark:text-zinc-300 font-mono"
                      >
                        <FileCode className="w-3 h-3 text-indigo-500" />
                        <span>{Object.keys(rec.specifications).length} Keys</span>
                      </button>
                    </td>

                    {/* Integrity Status */}
                    <td className="p-2.5 border-r border-border text-center">
                      {isDuplicate ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                          Duplicate
                        </span>
                      ) : hasMissing ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 text-[10px] font-bold">
                          Deficient ({rec.missingFields.join(', ')})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                          Verified
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-2.5 text-right font-sans">
                      <a
                        href={rec.productUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 inline-flex items-center"
                        title="Open Source Product Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Image Lightbox */}
      {selectedRecordForModal && modalType === 'image' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-indigo-600 font-bold">
                  {selectedRecordForModal.skuId}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 line-clamp-1">
                  {selectedRecordForModal.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedRecordForModal(null);
                  setModalType(null);
                }}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <img
              src={selectedRecordForModal.imageUrl}
              alt="High-res"
              className="w-full h-64 object-contain rounded-lg border border-border bg-white"
            />

            <div className="text-xs text-slate-500 break-all font-mono">
              Source: {selectedRecordForModal.imageUrl}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => {
                  setSelectedRecordForModal(null);
                  setModalType(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Specifications JSON Viewer */}
      {selectedRecordForModal && modalType === 'specs' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-indigo-600 font-bold">
                  Specification Attributes
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 font-mono">
                  {selectedRecordForModal.skuId}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedRecordForModal(null);
                  setModalType(null);
                }}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-h-72">
              <pre>{JSON.stringify(selectedRecordForModal.specifications, null, 2)}</pre>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs">
              <span className="text-slate-400">
                {Object.keys(selectedRecordForModal.specifications).length} parsed key-value pairs
              </span>
              <button
                onClick={() => {
                  setSelectedRecordForModal(null);
                  setModalType(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
