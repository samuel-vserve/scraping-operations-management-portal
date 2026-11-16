# Stage 6 Comprehension Test Report

**Target Document:** `concepts_brief.md` (Lines 1–84)  
**Evaluator:** Comprehension Goldfish (Zero-Assumed Institutional Knowledge)

## Summary Table of Findings

| ID | Finding | Category | Severity |
|---|---|---|---|
| **2.1** | LocalStorage 5MB limit vs. 500,000 SKU dataset upload/download | Dual-Loop Assumption | 🔴 **Blocker** |
| **3.1** | Phase 2 lifecycle deadlock at `awaiting_manager_qc` without Phase 3 actions | Phase Structural Ambiguity | 🔴 **Blocker** |
| **1.1** | Undefined sequence & boundary between Manager QC and Production QC | Terminology / Jargon | 🟠 **Major** |
| **1.2** | Undefined "Client Taxonomy" structure vs. "Column Schema" | Terminology / Jargon | 🟠 **Major** |
| **1.4** | Missing FSM specification (only 1 state named out of full lifecycle) | Architectural Clarity | 🟠 **Major** |
| **2.2** | Unstated triage/assignment bridge from Production Request to Scraper Worklist | Dual-Loop Assumption | 🟠 **Major** |
| **2.3** | Undefined validation behavior & UX on structural schema mismatches | Dual-Loop Assumption | 🟠 **Major** |
| **2.4** | Unexplained pipeline execution telemetry between external workers & portal | Cognitive Leap | 🟠 **Major** |
| **3.2** | Redundant UI ergonomics between Phase 2 stats modal & Phase 3 3-column workspace | Phase Structural Ambiguity | 🟠 **Major** |
| **3.3** | Omission of Four-Step Task Assignment Wizard from Phases 1–3 | Implementation Gap | 🟠 **Major** |
| **1.3** | Undefined domain acronyms (`SKU`, `MPN`) and jargon (`seed URLs`) | Terminology / Jargon | 🟡 **Nit** |
| **3.4** | Standalone route vs. embedded placement of TanStack Dataset Explorer | UX Ergonomics | 🟡 **Nit** |

### Key Remediation Recommendations
1. **Explicit Sequential Two-Tier QC FSM**: Specify the full lifecycle: `pending_assignment` → `in_progress` → `awaiting_manager_qc` → `production_pending` → `completed` (with bidirectional rework routing).
2. **Decoupled Dataset Manifest**: Decouple raw tabular blobs from `localStorage`, using lightweight JSON manifests for fast stat rendering.
3. **Task Assignment Wizard Staging**: Explicitly document the 4-step wizard in Phase 1 as the triage mechanism connecting Production requests to Scraper worklists.
4. **Pre-Flight Schema Diff**: Include instant header verification upon scraper file drop before queue entry.
