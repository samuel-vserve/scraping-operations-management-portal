# Goldfish Review Report: Stage 7 Critic Review

**Target:** `concepts_brief.md` (`Lines 1-84`)

## Reviewer Status

| Reviewer | Status |
| :--- | :--- |
| `egm-design` | completed |
| `egm-structural` | completed |
| `egm-style` | completed |

## Prioritized Findings (Blockers -> Major -> Nits)

### 1. Infeasible Client Storage Strategy for Large Datasets - Severity: Blocker 🔴
* **Reviewer Lens:** `egm-design`
* **Affected Scope:** Lines 29–30, Line 75 (`Dataset Density vs. Rendering Performance` and `Phase 1: Core Portal Architecture & Layout`)
* **Discrepancy Description:** The specification targets scraping datasets of "10,000 to 500,000 SKUs with dozens of attributes" (Lines 29–30), but designates browser `localStorage` as the persistence layer for the application state machine (Line 75). Browser `localStorage` has a strict synchronous 5MB quota and will throw a fatal `QuotaExceededError` when storing datasets exceeding a few thousand rows, breaking the application.
* **Rationale & Recommendation:** Decouple lightweight session state from tabular dataset storage. Application configuration, active filters, and active tab states can remain in `localStorage`, whereas scraping dataset payloads must be stored in IndexedDB (using Dexie or raw IDB), held in memory via client-side object stores, or streamed through paginated API mocks to maintain stability and prevent main-thread locking.

---

### 2. Underspecified Dual QC Operational State Machine - Severity: Major 🟡
* **Reviewer Lens:** `egm-design`
* **Affected Scope:** Lines 10–22, Line 31–35, Lines 78–84 (`Overview`, `Dual-Loop Operational Workflow`, `Detailed Implementation Plan`)
* **Discrepancy Description:** The overview defines two distinct verification checkpoints: "Manager QC" and "Production QC" (Lines 8, 16, 21). However, the implementation phases only specify transitioning tasks to `awaiting_manager_qc` (Line 80) and constructing a single "Manager QC workspace" (Line 83). The lifecycle transitions between Manager QC and Production QC (sequential versus parallel, hand-off conditions, and rejection/rework escalation paths) are absent.
* **Rationale & Recommendation:** Provide a deterministic finite state machine definition specifying:
  `draft` → `in_scraping` → `submitted_for_qc` → `in_manager_qc` → `manager_approved` → `in_production_qc` → `certified_for_delivery` (with `rework_required` states returning to `in_scraping`). Clarify whether Production QC is a gatekeeper before or after Manager QC.

---

### 3. Unspecified File Parsing and Transport Pipeline - Severity: Major 🟡
* **Reviewer Lens:** `egm-design`
* **Affected Scope:** Lines 14, 20, 79, 80 (`Dual Operational Hand-off Loops`)
* **Discrepancy Description:** The specification requires direct drag-and-drop file uploads, immediate attribute completeness metric calculation (fill rates, duplicate counts), and one-click file downloads (.xlsx, .csv, .json). Parsing a 500,000-row XLSX file synchronously on the main thread will cause severe browser thread freezing and unresponsive script warnings, violating Linear/Stripe UX responsiveness standards.
* **Rationale & Recommendation:** Specify offloading spreadsheet and JSON parsing to dedicated Web Workers (using SheetJS / PapaParse) or provide explicit synthetic pre-computed dataset fixtures for client-side prototype demonstration.

---

### 4. Asymmetrical Heading and List Formatting - Severity: Major 🟡
* **Reviewer Lens:** `egm-structural`
* **Affected Scope:** Lines 48–60 (`Goals vs. Non-Goals`), Lines 71–84 (`Detailed Implementation Plan`), Lines 25–45 (`Analysis`)
* **Discrepancy Description:** Structural formatting lacks symmetry across sections:
  1. `In-Scope Goals` items use bold title prefixes (`* **Title**: Description`), whereas `Out-of-Scope Non-Goals` items are unstructured plain bullet points.
  2. `Detailed Implementation Plan` alternates inconsistently: Phase 1 uses unbolded dashes, Phase 2 uses bold sub-headings (`- **Production Loop**: ...`), and Phase 3 reverts to unbolded dashes.
  3. Section numbering is applied to subsections under `Analysis` (`### 1. ...`, `### 2. ...`) but omitted under `Goals vs. Non-Goals` and `Detailed Implementation Plan`.
* **Rationale & Recommendation:** Enforce consistent heading and bullet structures throughout the document. Standardize all list items to use bold title leads (`* **[Component]**: [Specification]`) across both In-Scope and Out-of-Scope sections, and adopt a uniform numbering or naming convention for H3 headings.

---

### 5. Missing Explicit RBAC Matrix and Core Entity Data Model - Severity: Major 🟡
* **Reviewer Lens:** `egm-structural`
* **Affected Scope:** Lines 42–45 (`Contradiction 2`), Line 76 (`Phase 1`)
* **Discrepancy Description:** The document introduces four distinct operational roles (`Operations Manager`, `Production QC Lead`, `Scraping Specialist`, `Guest Client`) and promises RBAC isolation, but does not provide an explicit permissions matrix table defining view access, action triggers, and editing rights per role. Furthermore, the core data schemas for Tasks, Datasets, and Audit Logs are omitted.
* **Rationale & Recommendation:** Add an explicit Markdown RBAC table detailing permissions (View Dashboard, Request Task, Upload Data, Approve Manager QC, Approve Production QC, Download Dataset, Switch Role) and define the TypeScript/JSON interface signatures for `TaskItem`, `DatasetMetricSummary`, and `AuditLogEntry`.

---

### 6. Promotional, Subjective, and Fluff Phrasing - Severity: Major 🟡
* **Reviewer Lens:** `egm-style`
* **Affected Scope:** Lines 8, 28, 51, 53, 56, 65
* **Discrepancy Description:** The document includes promotional marketing adjectives and subjective filler that detract from technical clarity:
  - "high-performance operations platform" (Line 8)
  - "ultra-dense, keyboard-first interface" (Line 28)
  - "subtle micro-interactions; zero generic Bootstrap patterns" (Line 51)
  - "Executive Manager Dashboard" (Line 53)
  - "Deep Scraping Analytics" (Line 56)
* **Rationale & Recommendation:** Replace subjective adjectives with objective, technical specifications.

---

### 7. Vague Action Descriptors - Severity: Nit 🟢
* **Reviewer Lens:** `egm-style`
* **Affected Scope:** Lines 49, 55 (`In-Scope Goals`)
* **Discrepancy Description:** Phrases like "with a single click" (Line 49) and "instant assignment confirmation" (Line 55) lack technical precision.
* **Rationale & Recommendation:** Replace "with a single click" with "via a direct download action" and replace "instant assignment confirmation" with "an assignment confirmation modal with immediate visual feedback".

---

### 8. Redundant SPA State Clarification - Severity: Nit 🟢
* **Reviewer Lens:** `egm-style`
* **Affected Scope:** Line 35 (`Analysis - Data Flow & State Invariants`)
* **Discrepancy Description:** Stating that "notification feeds update reactively across views without page reloads" is a truism for any client-side Single-Page Application (SPA) architecture.
* **Rationale & Recommendation:** Shorten to: "State mutations synchronously update KPI counters, workload meters, and notification feeds across subscribed views."

---

### 9. Unspecified Keyboard Navigation Keybindings - Severity: Nit 🟢
* **Reviewer Lens:** `egm-design`
* **Affected Scope:** Line 28 (`Analysis - UX & Ergonomics`)
* **Discrepancy Description:** The document refers to "hotkeys for QC approve/rework" without specifying the hotkey mapping or context scoping.
* **Rationale & Recommendation:** Specify the explicit keymap (e.g., `A` for Approve, `R` for Request Rework, `J`/`K` for Row Navigation, `Ctrl+K`/`Cmd+K` for Command Palette).
