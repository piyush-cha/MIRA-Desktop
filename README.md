# MIRA Enterprise Desktop (v2.0.0)

> **Sovereign Procurement & Material Harmonization Platform**  
> National Governance Board & Cross-CPSE Central Intelligence Engine (ONGC, IOCL, SAIL, NTPC, BHEL, Coal India)

---

## 🏛️ Overview

**MIRA Enterprise Desktop** is an industrial-grade Electron and React application designed for sovereign-tier procurement oversight, automated cross-CPSE material code harmonization, and national catalog governance. Built with authoritative SAP S/4HANA (Fiori Horizon / Quartz) design principles, MIRA unifies federated enterprise ERP data into standardized Central Nomenclature for Material Classification (CNMC) golden records.

---

## 🚀 Recent UI/UX Enhancements & Changelog

### 1. Sovereign Audit Trail & Cryptographic Compliance Hub (`AuditCompliancePage.tsx`)
- **Executive Sovereign Compliance Scorecard**:
  - Official certification ribbon (`LEVEL-4 SOVEREIGN AIR-GAPPED READY · MEITY / DPE AIR-GAP DIRECTIVE 2026`) with animated emerald beacon glow and benchmark status (`EXCEPTIONAL STANDING · 0 Non-Conformances Reported`).
  - 4 Strategic Pillar Cards with micro-progress meter bars, live verification tags, and sanitized grammar (`"6 of 6 Connected CPSE SAP Gateways actively authenticated via SAML 2.0"`).
- **Multi-Dimensional Search & Enterprise Filtering Toolbar**:
  - Integrated search query filter (actions, actors, CPSE entities, PR codes, material details, and values) with quick-clear button.
  - Granular dropdown filters for **Action Type** (`All`, `Autonomous SAP PR`, `CPSE Onboarded`), **CPSE Entity** (`SAIL`, `BHEL`, `HPCL`, `IOCL`, `ONGC`, `YPL`), and **Issuing Authority** (`MIRA Copilot (AI)`, `National Governance (DPE)`).
  - Dynamic 1-click **Reset Filters** and live matching event counter.
  - **Real Sovereign CSV Export**: Downloads a true signed `.csv` ledger report (`MIRA_Sovereign_Audit_Trail_<date>.csv`) with UTF-8 BOM encoding for SAP/Excel audit conformance.
- **Chronological Sovereign Event Stream Table**:
  - Color-coded action badges with icons (`SAP PR Autonomous` with `<Cpu />`, `CPSE Onboarded` with `<Building2 />`).
  - Distinct actor identity tags (MIRA Sovereign Copilot autonomous agent vs National Governance central admin).
  - CPSE entity badges with brand palette colors, copyable PR chips with instant feedback, and automatic sanitization of seed typos (`ndian Oil` → `Indian Oil`, `Vharat Heavy` → `Bharat Heavy`).
  - Formatted payload cards cleanly breaking down material specifications, quantities, INR valuations, license tiers, and admin emails.
  - SHA-256 seal status buttons with 1-click inspection trigger.
- **Interactive Cryptographic Proof & Ledger Inspector Modal**:
  - Displays full 64-character SHA-256 hash digest, canonical timestamp, executing authority, target CPSE, tamper-evident verification banner (`PASSED & VALID`), and formatted canonical JSON event payload block with 1-click copy.
- **Floating Copilot Clearance**:
  - Added bottom clearance padding (`padding-bottom: 120px`) ensuring the floating 3D MIRA Copilot character never obscures timestamps, table actions, or pagination.

### 2. SAP S/4HANA Horizon Officer Profile & Monogram Identity
- **Resolved String Truncation**: Intelligently parses compound backend credentials (e.g., `"Dr. A. P. Sharma — DG, DPE"`) to separate the Officer Name, Designation Badge (`[DG, DPE]`), and Sovereign Role Label (`National Governance`), completely resolving text overflow and clipping issues.
- **Sovereign Sapphire Gradient Avatar**: Replaced generic grey placeholders with an executive sapphire-gradient tile (`#1E3A8A` → `#2563EB`) displaying an intelligent monogram (`AS`) and a live emerald session status indicator.
- **Unified Layout & Proportions**: Adjusted sidebar width to standard enterprise dimensions (`--sidebar-w: 256px`) and eliminated redundant nested padding and double-border artifacts.
- **TopBar Synchronization**: Synchronized the header user widget to match the sidebar's executive identity typography and monogram avatar.

### 3. Interactive Inter-CPSE Harmonization Node Pipeline & Cross-CPSE Parity
- **DAG Workflow Canvas**: Built a node-to-node mapping studio in `CrossCpseIntelPage.tsx` enabling drag-and-drop code alignment across enterprise silos.
- **Precision Pointer Capture**: Implemented HTML5 pointer capture (`setPointerCapture`, `onPointerMove`, `onPointerUp`) with integer pixel anchoring (`Math.round`), eliminating subpixel blur, double transforms, and GPU rasterization issues.
- **Adaptive S-Curve Cable Routing**: SVG Bézier connectors dynamically calculate curvature and loop buffers, anchoring directly to input/output pins via illuminated `<marker>` arrowheads with zero disconnects even when nodes are spaced far apart.
- **Enterprise Nomenclature**: Fully aligned all titles, presets, and action buttons to strict procurement standards (*Commodity Domains*, *Inter-CPSE Harmonization Pipeline*, *Golden CNMC Record*).
- **Multi-CPSE Price Parity Studio**: High-contrast price spread visualizations comparing local ERP material rates against national benchmarks across all 6 CPSEs with joint RFP savings projections.

### 4. CNMC Material Code Chips & Governance
- **Enhanced Code Legibility**: Elevated material code font sizes, contrast ratios, and monospace styling (`--font-mono`).
- **Interactive Copy & Inspection**: Integrated one-click clipboard copying with visual toast feedback and immediate item inspection modals.
- **Category Tagging**: Added high-visibility badges for Category A, B, and C critical capital goods.

### 5. Governance Policies & Audit Timestamps
- **Uncongested Metadata**: Redesigned policy cards and audit logs to prevent date and timestamp crowding.
- **Clean Two-Column Layout**: Structured compliance tracking, policy owners, and modification logs for executive readability.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Desktop Shell** | Electron 28 | Cross-platform desktop runtime with secure IPC |
| **Frontend Framework** | React 18 & TypeScript | Component architecture with strict static typing |
| **Build & Bundler** | Vite 4 & PostCSS | Instant HMR development and optimized production builds |
| **State Management** | Zustand | Lightweight, atomic global stores (`authStore`, `voiceStore`) |
| **Visualization & DAG** | React ECharts & Custom SVG | Global topology charts and directed acyclic graph (DAG) pipelines |
| **Icons & Design Tokens**| Lucide React & Vanilla CSS | Curated enterprise design tokens (SAP S/4HANA theme) |

---

## 💻 Development & Execution

### Prerequisites
- Node.js `>= 18.0.0`
- npm `>= 9.0.0`
- Python `>= 3.10` (for MIRA-Backend services)

### Quick Start

1. **Install Dependencies**:
   ```bash
   cd MIRA-Desktop
   npm install
   ```

2. **Launch Electron in Development Mode**:
   ```bash
   npm run electron:dev
   ```
   *Runs Vite development server on port 5173 and concurrently opens the Electron application with Hot Module Replacement (HMR).*

3. **Run Type Checking**:
   ```bash
   npx tsc --noEmit
   ```

4. **Production Build**:
   ```bash
   npm run build
   ```

5. **Package Windows Executable**:
   ```bash
   npm run electron:build
   ```

---

## 🛡️ Security & Enterprise Integration
- **Authentication**: JWT-based session tokens with role-based access control (`NATIONAL_GOVERNANCE`, `CPSE_ADMIN`).
- **SAP S/4HANA Gateway**: Integration-ready connectors for RFC/BAPI material master synchronization.
- **Audit Logging**: Immutable action history tracking code alignments, policy overrides, and pricing benchmarks.

---

## 📄 License
Confidential & Proprietary — Developed for MIRA Sovereign Platform. All rights reserved.
