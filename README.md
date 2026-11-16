# Scraping Operations Management Portal (Enterprise SaaS)

A modern, high-throughput Scraping Operations & Catalog Harvesting Management Platform engineered with **React 19**, **TypeScript**, **Tailwind CSS**, **Recharts**, and **Lucide React**. Designed with a sophisticated enterprise SaaS aesthetic inspired by Linear, Stripe, and Vercel.

---

## 🌟 Key Features & Architectural Modules

### 1. Operations Executive Dashboard (`overview`)
- **8 Real-time KPI Cards:** Total Projects, Active Tasks, Pending Assignment, In Progress, Awaiting Manager QC, Rework Required, Production Pending, and Completed Deliverables with trend sparklines.
- **Interactive Recharts Visualizations:**
  - Weekly Task Velocity (Interactive Area Chart)
  - Team Productivity (Horizontal Performance Bars)
  - Scraping Status Distribution (Donut Chart with Legend)
  - Quality Approval Rate Trajectory (Area Chart with Confidence Bands)
  - Daily SKU Volume Processed (High-density Bar Chart)
- **Recent Operational Stream & Live Activity Logs.**

### 2. Dedicated All Tasks Registry (`all-tasks`)
- **Linear / Vercel style high-density task workstation.**
- **Status Tabs:** All Tasks, Pending Assignment, In Progress, Awaiting QC, Rework, Production Ready, Completed.
- **Multi-faceted Filtering:** Filter by Production Pod, Scraping Assignee, Priority, Status, and full-text search across IDs, Titles, Projects, Clients, and Domains.
- **Bulk Actions:** Multi-select rows with Bulk Scraper Assignment and Bulk CSV Export.
- **Slide-Over Task Inspector Drawer:** Deep audit timeline, schema contracts, and direct action triggers.

### 3. Consolidated Manager Approval Workspace (`manager-qc`)
- **Zero Separate QC Bottleneck:** Traditional intermediary QC queues are removed. The Operations Manager executes authoritative quality sign-off in a unified **3-column desktop layout**:
  - **Left Column:** Task specifications, client PO parameters, seed file details, and extraction requirements.
  - **Center Column:** Interactive dataset preview, 10 attribute completeness gauges (SKU, MPN, Title, Price, Category, Images, Specs) with click-to-filter defect rows.
  - **Right Column:** Decision panel with one-click **"Approve & Advance to Production"**, **"Return for Scraper Rework"** (with pinned defect tags), and immutable audit history timeline.

### 4. Production Operations & Client Deliverables (`production-qc`)
- **Task Request Trigger:** Production leads request scraping tasks with seed files and schema requirements.
- **Scraped Data Stats Modal:** Granular quality inspection (fill rates, duplicate rates, CDN image link health, missing technical specs).
- **Deliverable Download:** Instant export of sanitized `.xlsx` and `.csv` files for client handoff.
- **Client Sign-Off & Google Drive Cloud Backup.**

### 5. Scraping Engineer Worklist (`my-tasks`)
- **Workload Management:** Personal task backlog for assigned developers.
- **Phase & Progress Updater:** Track milestones (DOM Analysis → Scripting → Proxy Harvesting → Data Normalization).
- **Peer Reassignment:** Overloaded scrapers can transfer tasks to colleagues in the Core Scraping Pod.
- **Automated Schema Pre-Flight Diff Engine:** Uploaded `.xlsx`/`.csv` files are automatically verified against mandatory columns (`✓ Matches Header` vs `✗ Header Missing`) before permitting submission for Manager Approval.

### 6. Team Governance & Pod Allocation (`teams`)
- **1 Central Scraping Engineering Pod:** Karthik R (Lead), Sneha Patel, Rajesh Varma, Ananya Joshi.
- **Multiple Production Teams:** Lawson Production Team, Surya Production Team, DTS Automation Team, Altius Enterprise Team.
- **Capacity Meters (0–100%)** & Dynamic User Team Reassignment.

### 7. Global Keyboard Command Palette
- **Ctrl + K / Cmd + K** global shortcut for instant task search, quick actions, role navigation, and theme switching.

---

## 🛠️ Technology Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS with custom HSL theme tokens (Light & Dark SaaS mode)
- **Visualizations:** Recharts (Area, Bar, Donut, Line charts)
- **Icons:** Lucide React
- **Celebration Effects:** Canvas-Confetti
- **Build Tool:** Vite with Rolldown compiler

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ / npm

### Installation & Development
```bash
# Clone the repository
git clone https://github.com/samuel-vserve/scraping-operations-management-portal.git

# Navigate to project directory
cd scraping-operations-management-portal

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build
```bash
# Compile TypeScript and bundle production assets
npm run build

# Preview production build locally
npm run preview
```

---

## 📄 Operational Documentation
For the complete operational lifecycle, state machine transitions, and RBAC matrix, refer to:
- [docs/OPERATIONAL_WORKFLOW.md](docs/OPERATIONAL_WORKFLOW.md)

---

## 👥 Organization & Roles
- **Operations Manager:** Samuel P (`samuel.p@vservetech.com`)
- **Production Lead:** Priya Nair (`priya.nair@vservetech.com`)
- **Senior Scraping Engineer:** Karthik R (`karthik.r@vservetech.com`)
