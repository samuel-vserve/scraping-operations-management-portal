# Goldfish Review Report: Zoom Out & Inventive Catalyst Audit

**Target:** `D:\Office WFH\Web Scrap\Vserve Scraping\Scraping Team portal\concepts_brief.md` (`1..84`)

## Reviewer Status

| Reviewer | Status |
| --- | --- |
| `egm-zoom-out` | completed |
| `egm-inventive-catalyst` | completed |

## Prioritized Findings (Blockers -> Major -> Nits)

### 1. Client-Side Storage & Main-Thread Saturation for 10k–500k Row Datasets - Severity: Blocker
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Lines 29–30, 74, 79–80
* **Discrepancy Description**: The brief defines operational dataset scales spanning 10,000 to 500,000 SKUs with dozens of attributes (Line 29), while simultaneously prescribing `localStorage` persistence for the AppContext state machine (Line 74) and client-side file upload/download/parsing (Lines 79–80). Browser `localStorage` has a hard 5MB limit, which will immediately trigger fatal `QuotaExceededError` exceptions upon parsing and saving real or simulated scraped datasets. Additionally, parsing 100k+ rows on the browser's main UI thread causes total DOM lockup and frame-rate crashes.
* **Rationale & Recommendation**:
  1. Decouple raw dataset payloads from the reactive AppContext: store only lightweight metadata, column definitions, and pre-computed statistical summaries in persistent state.
  2. Adopt an IndexedDB storage abstraction or ephemeral in-memory Blob/Object URLs for active session uploads and downloads.
  3. Offload raw XLSX/CSV parsing and duplicate hash calculations to a Web Worker, and cap in-memory table virtual preview samples to the first 1,000 rows while generating full exports via streamed synthetic Blobs.

---

### 2. Undefined Production QC vs. Manager QC Lifecycle & Rework Routing - Severity: Major
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Lines 10–22, 34–35, 78–84
* **Discrepancy Description**: The document references two distinct verification tiers—"Manager QC & Production QC" (Lines 8, 16, 21)—yet Lines 80 and 83 describe an upload setting the status directly to `awaiting_manager_qc` and Phase 3 only implements "Manager QC & Dataset Explorer". It leaves the hand-off between Manager QC and Production QC ambiguous: Does Production QC occur before or after Manager QC? When Production QC rejects a batch that Manager QC approved, where does the rework route (back to the Scraping Specialist or to the Manager), and how are rework feedback tags preserved?
* **Rationale & Recommendation**:
  Explicitly specify the complete operational Finite State Machine (FSM):
  `draft` -> `assigned` -> `in_progress` -> `awaiting_manager_qc` -> `awaiting_production_qc` -> `certified_ready_for_download` -> `delivered`.
  Include explicit dual-rework loops (`rework_manager` vs `rework_production`), defining how reviewer notes, defect column tags, and previous file version histories are preserved.

---

### 3. Missing Client-Side Schema Parity Check at Scraper Upload Boundary - Severity: Major
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Lines 12, 20, 50, 80
* **Discrepancy Description**: In the Production loop, Production leads request tasks specifying "required column schemas, client taxonomies, and seed URLs" (Line 12). In the Scraper loop, engineers upload extracted files and submit for review (Line 20, 80). There is no automated schema validation at the upload boundary. If a scraper uploads a file with missing mandatory columns (e.g. missing `price` or misspelled `sku_id` vs `SKU`), the deficient payload reaches the QC queue unnoticed, wasting reviewer time.
* **Rationale & Recommendation**:
  Implement an automated Client-Side Schema Pre-Flight Check in the "Upload Scraped File" modal. When a file is dropped:
  - Parse the header row against the task's required schema.
  - Display an instant column-matching diff: Exact matches (green), Missing mandatory columns (red blocker preventing "Submit for QC"), and Unrecognized/extra columns (amber warning).
  - Guarantee that defective schemas are caught and corrected before entering the QC queue.

---

### 4. Contradiction: Heavy Statistical Calculation vs. Instant Production UI Response - Severity: Major
* **Reviewer Lens:** `egm-inventive-catalyst`
* **Affected Scope:** Lines 14–15, 39–41, 49, 79
* **Discrepancy Description**: Production leads need to immediately inspect data quality statistics (fill rates, duplicate counts, missing values) upon opening a task or downloading a file. If these metrics are computed dynamically by parsing hundreds of thousands of cells every time the statistics panel opens, the UI will suffer noticeable latency and lag.
* **Rationale & Recommendation (TRIZ Principle 10: Prior Action & Principle 2: Separation)**:
  Separate raw data parsing from metric visualization by introducing a lightweight **Dataset Manifest**. When a scraper uploads a file (or when mock datasets are initialized), pre-calculate summary metrics (`totalRecords`, `columnStats: { [col]: { fillRate, nullCount, uniqueCount, type } }`, `duplicateCount`, `dataHealthScore`). Storing this tiny JSON manifest alongside the task record enables instant (0ms) statistical rendering in the Production dashboard while decoupling heavy raw file processing.

---

### 5. Contradiction: Fast Task Creation vs. Rigorous Schema Specifications - Severity: Major
* **Reviewer Lens:** `egm-inventive-catalyst`
* **Affected Scope:** Lines 11–13, 49, 79
* **Discrepancy Description**: Forcing Production leads to manually configure schema fields, validation rules, and data types from scratch for every new scraping task creates friction, slows down operational turnaround, and invites human typo errors.
* **Rationale & Recommendation (TRIZ Principle 25: Self-Service & Standard Blueprints)**:
  Equip the "Request Scraping Task" wizard with curated **Schema Blueprints** (e.g. "E-Commerce Catalog v1.2", "B2B Lead Enrichment", "Real Estate Listings"). Selecting a blueprint auto-populates the schema table with standard mandatory columns, validation regexes, and recommended output formats (.csv / .xlsx), while still allowing leads to append one-off custom fields.

---

### 6. Decoupled Role Simulation & Cross-Role Notification Feed - Severity: Major
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Lines 34–35, 44, 74, 79–80
* **Discrepancy Description**: The brief notes that a role switcher simulates Operations Manager, Production QC Lead, and Scraping Specialist within a single SPA. However, it lacks a reactive notification/activity feed to simulate asynchronous collaboration. When a Scraping Specialist uploads a file and submits for QC, switching to the Production QC or Manager view should immediately surface the incoming task in an active notification badge and recent activity log. Without this, the dual-loop hand-off feels disjointed during evaluation.
* **Rationale & Recommendation**:
  Add a global `ActivityFeed` and `NotificationStore` to the AppContext. Emitting actions (e.g., `TASK_REQUESTED`, `DATASET_UPLOADED`, `QC_REJECTED`, `PRODUCTION_CERTIFIED`) updates a persistent notification tray with timestamped badges and toast alerts, creating a cohesive, living multi-user simulation.

---

### 7. Ambiguity Between Sample/Interim Downloads vs Final Certified Exports - Severity: Nit
* **Reviewer Lens:** `egm-zoom-out`
* **Affected Scope:** Lines 14, 49, 79
* **Discrepancy Description**: Line 49 states Production leads can "download scraped files with a single click". It does not specify whether download access is restricted strictly to certified tasks (`awaiting_production_qc` or `certified`), or if Production can also download interim sample batches for scraper pipeline debugging.
* **Rationale & Recommendation**:
  Clarify download actions: Provide a "Download Sample (First 100 Rows)" button during active scraping (`in_progress`), and unlock the primary "Download Full Dataset (.xlsx/.csv/.json)" button only once an output file has been uploaded and reached QC/Certification status.

---

### 8. Monolithic Task Rejection vs Granular Column-Level Defect Pinning - Severity: Nit
* **Reviewer Lens:** `egm-inventive-catalyst`
* **Affected Scope:** Lines 16, 39–41, 80
* **Discrepancy Description**: When Production or Manager QC identifies deficient columns (e.g. Title and Price are 100% complete, but Image URL is only 60%), rejecting the entire task forces the scraper to parse through unstructured comments to identify what needs remediation.
* **Rationale & Recommendation (TRIZ Principle 15: Dynamicity / Segmentation)**:
  Incorporate column-level defect pinning in the QC center panel. Reviewers can click a "Flag Column" button next to any attribute completeness bar, adding a structured tag (e.g., `[Defect: Image URL fill rate < 90%]`) directly to the rework dispatch payload, accelerating scraper remediation.
