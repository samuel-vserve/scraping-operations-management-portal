# Scraping Operations Management Portal Specification

* **Author:** Samuel P
* **Date:** 2026-11-16
* **Version:** 2.0 (Resolved)

## Overview

This specification defines the architecture, workflows, and user interface for the Scraping Operations Management Portal. The system replaces spreadsheet handoffs with a deterministic operational state machine and synchronized handoff loops between the **Production Team**, **Scraping Team**, and **Operations Management**.

The primary operational hand-off is governed by two synchronized loops:
1. **Production Team Loop**:
   * **Task Inception**: Production leads request scraping tasks, specifying target websites, expected SKU volumes, required column schemas, and input seed URLs.
   * **Output Retrieval**: Once scraping is processed, Production leads download the scraped output dataset (.xlsx, .csv, .json).
   * **Data Quality Audit**: Production leads inspect real-time statistics of the scraped dataset (record counts, exact matches, duplicate SKUs, and attribute fill rates) before certifying the deliverable for client transfer.
2. **Scraping Team Loop**:
   * **Task Intake**: Scraping engineers receive assigned extraction tasks in their personal worklist.
   * **Scrape Execution**: Engineers execute extraction scripts locally or via automated nodes.
   * **Output Upload & Validation**: Engineers upload the extracted dataset file to the task record with automated schema pre-flight verification.
   * **QC Submission**: Engineers submit the task for sequential Manager QC and Production QC verification.

---

## Role-Based Access Control (RBAC) Matrix

| Operational Capability | Operations Manager | Production QC Lead | Scraping Engineer | Guest Client |
| :--- | :---: | :---: | :---: | :---: |
| **View Operations Dashboard** | Full Access | Full Access | Scoped View | Hidden |
| **Request / Create Task** | Full Access | Full Access | No | Request Only |
| **Assign Task & Pod Workload** | Full Access | Pod Routing | No | No |
| **Upload Scraped File** | Full Access | No | Assigned Tasks | Deliverable Only |
| **Manager QC Review & Sign-Off** | Full Access | Read-Only | Read-Only | Hidden |
| **Production QC Certification** | Oversight | Full Access | Read-Only | Hidden |
| **Download Scraped Dataset** | Full Access | Full Access | Assigned Tasks | Certified Deliverable |
| **Inspect Dataset Statistics** | Full Access | Full Access | Assigned Tasks | High-Level Summary |
| **Google Drive Synchronization** | Full Access | Full Access | No | Read-Only |

---

## Operational Finite State Machine (FSM)

The lifecycle of every scraping task follows deterministic sequential transitions:

```
[ pending_assignment ]
         │ (Manager assigns pod & primary engineer)
         ▼
  [ in_progress ]
         │ (Scraping engineer uploads scraped file & submits)
         ▼
[ awaiting_manager_qc ] ──(Rework Requested)──► [ rework_required ]
         │ (Manager approves schema & data integrity)         │
         ▼                                                    │ (Re-extract & re-upload)
[ production_pending ]  ◄─────────────────────────────────────┘
         │
         ├──(Production approves & syncs to Drive)──► [ completed ]
         │
         └──(Production flags client defect)───────► [ rework_required ]
```

* **`pending_assignment`**: Task requested with seed feed and required schema; awaiting pod assignment.
* **`in_progress`**: Scraping engineer actively extracts data from target website.
* **`awaiting_manager_qc`**: Scraped dataset uploaded; under review in 3-column Manager QC workspace.
* **`rework_required`**: Deficiencies or missing attributes flagged; task returns to scraper with pinned column defect tags.
* **`production_pending`**: Manager QC passed; awaiting final Production packaging, schema conformity check, and Google Drive upload.
* **`completed`**: Certified by Production; exported to client deliverable storage.
* **`rejected`**: Critical project failure or invalid seed scope.

---

## Technical Architecture & State Strategy

### 1. Storage & Memory Architecture
* **Lightweight Application State**: Persistent user configurations, active workspace filters, dark mode preference, notification feeds, and task metadata records are managed in reactive application state.
* **Pre-Computed Dataset Manifest**: Raw datasets (10,000 to 500,000 rows) are not serialized into synchronous `localStorage`. Instead, each scraped dataset generates a compact JSON summary manifest storing:
  - `totalRecords`: Total extracted rows.
  - `columnStats`: Fill rate percentages, null counts, and data types per attribute.
  - `duplicateCount`: Number of duplicate SKU identifiers.
  - `dataHealthScore`: Weighted composite score (0–100%).
  This architecture delivers sub-10ms statistical rendering in the Production dashboard without main-thread blocking.
* **Ephemeral In-Memory Blob Streaming**: Scraped file downloads (.xlsx, .csv, .json) are generated as streaming Blob URLs upon request, preventing client memory exhaustion.

### 2. Schema Pre-Flight Verification at Scraper Upload Boundary
When a scraping engineer uploads an output file, a client-side parser compares the file header against the task's `requiredColumns`:
* **Exact Column Match**: Highlighted in green; verifies required fields.
* **Missing Mandatory Column**: Highlighted in red; blocks "Submit for QC" until rectified.
* **Unrecognized / Extra Column**: Highlighted in amber; flagged as non-standard metadata.

---

## Goals vs. Non-Goals

### In-Scope Goals
* **Production Request Workflow**: Dedicated modal allowing Production leads to request tasks with target domain, SKU estimate, schema blueprints, and seed file attachment.
* **Scraper Task Upload Interface**: Dedicated "My Tasks" view enabling scraping engineers to upload output files, execute schema diff checks, and submit for QC.
* **Production Output Download & Stats**: Direct download action and modal viewer displaying pre-computed statistics (records, fill rates, duplicates) for any uploaded dataset.
* **Manager 3-Column QC Workspace**: Left column for task metadata; center column for attribute completeness and sample inspection; right column for decision actions and historical timeline.
* **Four-Step Task Assignment Wizard**: Guided workflow featuring team member capacity meters, primary assignee routing, and output schema definitions.
* **Operations Dashboard**: 8 live KPI summary cards, 5 Recharts visualizations, and a multi-filter task table with bulk operations.
* **Theme & Command Palette**: High-contrast light theme with dark mode toggle, and a global `Ctrl + K` search modal.

### Out-of-Scope Non-Goals
* **Cloud Proxy Infrastructure Management**: Remote browser node provisioning and proxy rotation are executed by external scraper nodes.
* **Payment Processing Integration**: Internal enterprise platform without external billing gateways.

---

## Detailed Implementation Plan

### Phase 1: Core Portal Architecture & Layout
* **UI Component Primitives**: Reusable StatCard, StatusBadge, PriorityBadge, TaskProgress, DataTable, CommandPalette, and DashboardLayout.
* **Reactive Operational State**: AppContext state machine managing tasks, teams, employees, projects, and notifications.
* **Multi-Persona Navigation**: Collapsible sidebar with role-filtered views and topbar role switcher.
* **Four-Step Task Assignment Wizard**: Multi-step assignment wizard with capacity indicators and schema configuration.

### Phase 2: Dual Operational Hand-off Loops
* **Production Request Loop**: "Request Scraping Task" workflow with schema blueprints, "Download Scraped File" action, and "View Scraped Data Stats" modal.
* **Scraper Processing & Upload Loop**: "My Tasks" scraper workspace, "Upload Scraped File" modal with client-side schema diff check, and "Submit for QC" action updating FSM to `awaiting_manager_qc`.

### Phase 3: Quality Control & Dataset Exploration
* **Manager QC Workspace**: 3-column desktop workspace with checklist, attribute completeness gauges, and decision audit timeline.
* **Dataset Explorer & Analytics**: High-density table with column resizing, sticky headers, missing value alerts, image previews, and JSON specification viewers.
