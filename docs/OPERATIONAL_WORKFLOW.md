# Scraping Operations Management Portal — Operational Workflow Specification

> **Target System:** Scraping Operations Management Portal (Vserve Enterprise SaaS)  
> **Status:** Approved Architecture Blueprint  
> **Workforce Structure:** 1 Core Scraping Pod • Multiple Production Teams • Operations Manager Quality Sign-Off

---

## 1. Executive Summary & Architecture Philosophy

The **Scraping Operations Management Portal** is an enterprise data-extraction operating system designed for high-throughput product catalog harvesting (500k+ SKUs).

### Consolidated Role Hierarchy (Zero Separate QC User)

```
┌──────────────────────────────────────┐       ┌──────────────────────────────────────┐       ┌──────────────────────────────────────┐
│     MULTIPLE PRODUCTION TEAMS        │       │         OPERATIONS MANAGER           │       │    1 CORE SCRAPING ENGINEERING POD   │
│  (Lawson, Surya, DTS, Altius Pods)   │       │          (Lead: Samuel P)            │       │   (Karthik R, Sneha, Rajesh, Ananya) │
│                                      │       │                                      │       │                                      │
│ • Requests Tasks with Seed File      │◄─────►│ • Workload & Capacity Triage         │◄─────►│ • Develops Playwright/Scrapy Scripts  │
│ • Auto-Detects SKU Count from Upload │       │ • Assigns/Reassigns Scraping Pod     │       │ • Manages Execution Phases & Progress│
│ • Auto-Routes to Default Scraper     │       │ • Dedicated 3-Column Manager QC      │       │ • Uploads Scraped Output File        │
│ • Inspects Attribute Stats           │       │ • Grants Approval or Triggers Rework │       │ • Schema Pre-Flight Diff Engine      │
│ • Downloads Deliverable (.xlsx)      │       │ • Configures Team User Assignments   │       │ • Reassigns Tasks to Peer Scrapers   │
└──────────────────────────────────────┘       └──────────────────────────────────────┘       └──────────────────────────────────────┘
```

1. **Multiple Production Teams & Users (Task Initiators & Deliverable Consumers):**
   - Distinct Production Pods manage specific client accounts (e.g., Lawson Production Team, Surya Production Team, DTS Automation Team, Altius Enterprise Team).
   - Users: Priya Nair, Surya Prakash, David Chen, Arun Kumar.
   - **Frictionless Task Creation:** Production users do NOT need to manually select scraping developers. Tasks can automatically route to the configured **Default Scraping Assignee** (e.g. Karthik R) or be submitted for Operations Manager triage.
   - **Automated SKU Count:** Uploading any `.csv` or `.xlsx` seed file automatically calculates and populates the Estimated SKU Count.
   - **Quality Inspection & Download:** Production teams review attribute fill rates, duplicate metrics, and download clean deliverable files for client handoff.

2. **Operations Manager (Portfolio Orchestrator & Quality Authority):**
   - User: Samuel P.
   - Does **NOT** need "My Tasks" (oversees all teams, portfolio health, and cross-pod rebalancing).
   - Audits scraped datasets in the 3-column workspace (Left: Task Specs | Center: 10 Completeness Gauges | Right: Decision Panel).
   - **Consolidated Approval Authority:** Replaces the separate QC role. Approves datasets directly to Production or triggers Rework with pinned defect tags.
   - Sets Default Scraping Assignee and manages Production Team user assignments.

3. **1 Core Scraping Engineering Pod (Extraction Engine):**
   - Lead: Karthik R. Engineers: Sneha Patel, Rajesh Varma, Ananya Joshi.
   - Receives tasks via personal worklists (`My Tasks`).
   - Manages execution phases (DOM Analysis → Scripting → Proxy Harvesting → Normalization).
   - **Peer Reassignment:** Scrapers can reassign assigned tasks to colleague scrapers in the Core Pod if overloaded.
   - **Automated Schema Pre-Flight Diff:** Uploads output `.xlsx`/`.csv` files, and the system automatically checks mandatory columns (`✓ Matches Header` vs `✗ Header Missing`) before permitting submission for Manager Approval.

---

## 2. End-to-End Operational Lifecycle Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Prod as Production User<br/>(Priya Nair - Lawson Pod)
    actor Mgr as Operations Manager<br/>(Samuel P)
    actor Scraper as Scraping Engineer<br/>(Karthik R - Core Pod)
    actor Peer as Peer Scraper<br/>(Sneha Patel - Core Pod)

    Note over Prod: Stage 1: Request & Auto-Calculation
    Prod->>Prod: 1. Uploads Seed File (.csv / .xlsx)
    Note over Prod: System auto-detects row count (12,450 SKUs)
    Prod->>Scraper: 2. Requests Task (Auto-routes to Default Scraper)
    Note right of Scraper: State: in_progress

    opt Workload Rebalancing
        Scraper->>Peer: 3a. Reassigns Task to Peer Scraper
        Note right of Peer: Peer takes over task in Core Pod
    end

    Note over Scraper: Stage 2: Scripting & Pre-Flight Upload
    Scraper->>Scraper: 4. Updates Execution Phase & Progress
    Scraper->>Scraper: 5. Uploads Extracted Dataset
    Note over Scraper: Automated Schema Pre-Flight Diff verifies columns
    Scraper->>Mgr: 6. Submits directly for Manager Approval
    Note right of Mgr: State: awaiting_manager_qc

    Note over Mgr: Stage 3: Consolidated Manager Approval
    Mgr->>Mgr: 7. Audits 3-Column Manager Approval Workspace
    alt Defects Detected (Missing Fields / Broken Images)
        Mgr->>Scraper: 8a. Returns for Scraper Rework with Pinned Defects
        Note right of Scraper: State: rework_required
        Scraper->>Mgr: 8b. Resolves & Re-submits
    else Quality Standards Met (>= 98% Completeness)
        Mgr->>Prod: 9. Grants Manager Approval Sign-Off
        Note right of Prod: State: production_pending
    end

    Note over Prod: Stage 4: Inspection & Deliverable Download
    Prod->>Prod: 10. Inspects Scraped Data Stats (Fill rates, Duplicates)
    Prod->>Prod: 11. Downloads Deliverable Spreadsheet (.xlsx)
    Prod->>Prod: 12. Signs Off & Archives (State: completed)
```

---

## 3. UI Navigation & View Architecture

| Route ID | Label | Target Persona | View Purpose |
| :--- | :--- | :--- | :--- |
| `overview` | **Overview** | Operations Manager & Leads | Executive Operations Dashboard: 8 KPI cards, sparklines, 5 Recharts visualizations (weekly velocity, team productivity, status donut, approval trends, daily SKU volume). |
| `all-tasks` | **All Tasks** | All Internal Roles | Dedicated Linear/Vercel-style Task Master Registry: Multi-tab status filters, multi-faceted filtering (Production Pod, Scraper, Priority), search, bulk assign, export CSV, and slide-over inspector drawer. |
| `my-tasks` | **My Tasks** | Scraping Engineers only | Personal extraction worklist, phase/progress updater, peer reassignment modal, file upload with schema pre-flight diff, submit for Manager Approval. |
| `manager-qc` | **Manager Approval** | Operations Manager | Consolidated 3-column Quality Control workspace: Task requirements, 10 attribute fill-rate gauges with click-to-filter, and sign-off decision panel. |
| `production-qc` | **Production Deliverables** | Production Teams | Request Scraping Task modal trigger, Scraped Data Stats modal, Download Scraped File (.xlsx/.csv), and Client Sign-Off. |
| `teams` | **Teams & Pods** | Operations Manager & Leads | Governance directory showing the 1 Core Scraping Pod, 4 Production Teams, capacity meters, and dynamic user team reassignment. |
| `settings` | **Settings** | All Roles | Theme toggle, Default Scraping Assignee configuration, and Production User Team assignment. |

---

## 4. Key Implementation Files

- **Task Registry View (Linear/Vercel Grid):** [AllTasksView.tsx](file:///D:/Office%20WFH/Web%20Scrap/Vserve%20Scraping/Scraping%20Team%20portal/src/components/views/AllTasksView.tsx)
- **Executive Operations Dashboard:** [ManagerDashboardView.tsx](file:///D:/Office%20WFH/Web%20Scrap/Vserve%20Scraping/Scraping%20Team%20portal/src/components/views/ManagerDashboardView.tsx)
- **Scraper Task Worklist & Peer Reassignment:** [MyTasksScraperView.tsx](file:///D:/Office%20WFH/Web%20Scrap/Vserve%20Scraping/Scraping%20Team%20portal/src/components/views/MyTasksScraperView.tsx)
- **Auto-Calculated Task Creation Modal:** [TaskAssignmentModal.tsx](file:///D:/Office%20WFH/Web%20Scrap/Vserve%20Scraping/Scraping%20Team%20portal/src/components/views/TaskAssignmentModal.tsx)
- **Team Governance & Pod Allocation:** [TeamsView.tsx](file:///D:/Office%20WFH/Web%20Scrap/Vserve%20Scraping/Scraping%20Team%20portal/src/components/views/TeamsView.tsx)
- **System Settings & Default Scraper Routing:** [SettingsView.tsx](file:///D:/Office%20WFH/Web%20Scrap/Vserve%20Scraping/Scraping%20Team%20portal/src/components/views/SettingsView.tsx)
- **Application State Store:** [AppContext.tsx](file:///D:/Office%20WFH/Web%20Scrap/Vserve%20Scraping/Scraping%20Team%20portal/src/context/AppContext.tsx)
- **Navigation & Role-Based Visibility:** [Sidebar.tsx](file:///D:/Office%20WFH/Web%20Scrap/Vserve%20Scraping/Scraping%20Team%20portal/src/components/layout/Sidebar.tsx)
