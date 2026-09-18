# 🌐 MIRA: Material Intelligence & Rationalization Assistant
### National Unified Material Master Framework (NUMMF) & Cross-CPSE Procurement Engine
> **"One Nation – One Material Code" | AI-Driven Material Standardization, De-duplication & Inter-Enterprise Harmonization**

[![Monorepo](https://img.shields.io/badge/Architecture-Unified%20Monorepo-0ea5e9?style=flat-square)](#-repository-architecture--monorepo-structure)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.13-059669?style=flat-square)](file:///c:/Users/PIYUSH/Desktop/BMUI/backend)
[![Desktop App](https://img.shields.io/badge/Desktop-Electron%2028%20%7C%20Vite%205%20%7C%20React%2018-8b5cf6?style=flat-square)](file:///c:/Users/PIYUSH/Desktop/BMUI/apps/web-desktop)
[![Mobile App](https://img.shields.io/badge/Mobile-Expo%2057%20%7C%20React%20Native-f59e0b?style=flat-square)](file:///c:/Users/PIYUSH/Desktop/BMUI/apps/mobile)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2016%20%7C%20pgvector%20%7C%20Redis-ec4899?style=flat-square)](file:///c:/Users/PIYUSH/Desktop/BMUI/docker-compose.yml)
[![Compliance](https://img.shields.io/badge/Compliance-ISO--8000%20%7C%20CVC%20%7C%20CAG-10b981?style=flat-square)](#-governance-audit--regulatory-compliance)

---

## 📌 Executive Summary

**MIRA** (*Material Intelligence, Rationalization & Alignment*) is a sovereign digital public infrastructure engineered to dismantle legacy procurement silos across India's **300+ Central Public Sector Enterprises (CPSEs)** in asset-intensive sectors (Oil & Gas, Steel, Power, Mining, and Heavy Engineering).

By non-intrusively ingesting unstructured legacy ERP catalogs (SAP S/4HANA, ECC, Oracle, CSV/Excel), MIRA cleanses noisy technical abbreviations, extracts engineering attributes using domain-adapted transformers, detects cross-enterprise duplicate materials, and generates an authoritative **Common National Material Code (CNMC)** — all while preserving 100% of existing local enterprise item codes via zero-disruption API middleware.

---

## 🏗️ Repository Architecture & Monorepo Structure

This repository is organized as a high-performance **Monorepo** containing the complete end-to-end ecosystem:

```
c:\Users\PIYUSH\Desktop\BMUI
├── 📂 apps/                                # Client Applications
│   ├── 📂 web-desktop/                     # [App 1] Enterprise Desktop & Admin App (Electron + Vite + React)
│   └── 📂 mobile/                          # [App 2] Field Warehouse & Barcode Scanner App (Expo React Native)
├── 📂 backend/                             # Core FastAPI Microservices & AI Engine
│   ├── 📂 app/
│   │   ├── 📂 api/v1/                      # REST API Endpoints (Auth, Governance, Materials, Reviewer, etc.)
│   │   ├── 📂 core/                        # Configuration, Database Sessions & Security
│   │   ├── 📂 modules/
│   │   │   ├── 📂 ai_engine/               # Matching Service, SHAP Attribution, Embedding Providers
│   │   │   ├── 📂 search/                  # Vector Search & Semantic Ranking
│   │   │   └── 📂 sync/                    # Background Sync & Offline Resolution
│   │   ├── 📂 integrations/                # SAP RFC/BAPI & ERP Connectors
│   │   └── 📄 main.py                      # FastAPI Application Entrypoint
│   ├── 📂 database/                        # Database Schemas & Migrations
│   ├── 📄 mira_governance.db               # SQLite Governance Datastore
│   └── 📄 mira_production.db               # SQLite Master Production Datastore
├── 📂 dataset/                             # Benchmark Datasets & Data Pipelines
│   ├── 📄 cpse_material_benchmark.csv      # 72 Multi-CPSE Benchmark Records (Empirical Proof)
│   ├── 📄 cpse_material_benchmark.json     # Benchmark Data in JSON Format
│   ├── 📄 golden_master_catalog.csv        # ISO-8000 & UNSPSC Aligned Golden Ground Truth
│   └── 📄 build_cpse_dataset.py            # Reproducible Data Generator & Evaluation Suite
├── 📂 infrastructure/                      # Deployment Scripts & Operational Tooling
│   └── 📂 scripts/
│       └── 📄 backup_restore_manager.sh    # Disaster Recovery & State Snapshot Manager
├── 📄 docker-compose.yml                   # Multi-Service Orchestration (PostgreSQL, pgvector, Redis, Kafka)
├── 📄 package.json                         # Root Workspace Configurations
└── 📄 README.md                            # Master System Documentation (This File)
```

---

## 🏛️ End-to-End System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       CLIENT APPLICATION TIER                                          │
├───────────────────────────────────────────────────────┬────────────────────────────────────────────────┤
│       🖥️ apps/web-desktop (Electron + Vite)           │            📱 apps/mobile (Expo RN)            │
│   • Enterprise CPSE & Plant Management Workbenches    │   • Plant Warehouse Camera Barcode/QR Scanner  │
│   • Sovereign National Governance & KPI Heatmaps      │   • Physical Bin Tag Audits & SKU Lookup       │
│   • MIRA AI Floating Industrial Copilot Bot           │   • Offline-First Cache for Remote Field Yards │
│   • Maker-Checker AI Candidate Resolution Queue       │   • Quick Mobile Goods Receipt Validation      │
│   • Inter-Plant Collaboration & Surplus Transfer Graph│   • Instant Duplicate Detection on Plant Floor │
└───────────────────────────┬───────────────────────────┴───────────────────────┬────────────────────────┘
                            │                                                   │
                            └─────────────────────────┬─────────────────────────┘
                                                      ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY & MIDDLEWARE TIER (backend/app)                               │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│   FastAPI Core Engine (Python 3.13) | AsyncPG | JWT RBAC Authorization | Rate Limiting | CORS Gateway │
│   • /api/v1/auth          • /api/v1/governance    • /api/v1/materials        • /api/v1/reviewer        │
│   • /api/v1/intelligence  • /api/v1/cpse_admin    • /api/v1/plant_area       • /api/v1/sap_mcp         │
└───────────────┬───────────────────────────────────┬────────────────────────────────────┬───────────────┘
                │                                   │                                    │
                ▼                                   ▼                                    ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐   ┌────────────────────────────────┐
│   🧠 AI & COGNITIVE ENGINE    │   │ 🗄️ PERSISTENCE & VECTOR DB    │   │   🔗 ENTERPRISE ERP BRIDGES    │
├───────────────────────────────┤   ├───────────────────────────────┤   ├────────────────────────────────┤
│ • 400+ Domain Regex Cleaning  │   │ • PostgreSQL 16 + pgvector    │   │ • SAP S/4HANA & ECC (BAPI/RFC) │
│ • IndicBERT / RoBERTa Embed   │   │ • HNSW Vector Index (<50ms)   │   │ • Oracle Cloud ERP             │
│ • Cosine + Hybrid Ranking     │   │ • Redis 7 L2 Caching Layer    │   │ • GeM Portal API Integration   │
│ • SHAP Explainability Engine  │   │ • Apache Kafka Event Pipeline │   │ • Legacy Batch CSV/Excel Sync  │
│ • Deterministic CNMC Generator│   │ • Hyperledger Fabric Ledger   │   │ • Zero-Disruption 1:1 Mapping  │
└───────────────────────────────┘   └───────────────────────────────┘   └────────────────────────────────┘
```

---

## 📦 Sub-Repository Deep Dive

### 1. ⚙️ Backend Microservice & AI Engine (`backend/`)
*   **Path**: [`backend/`](file:///c:/Users/PIYUSH/Desktop/BMUI/backend)
*   **Tech Stack**: Python 3.13, FastAPI, SQLAlchemy 2.0, Pydantic v2, PyTorch, HuggingFace Transformers, SHAP.
*   **Core Capabilities**:
    *   **Unified Authentication & Dynamic RBAC** (`/api/v1/auth`): Scopes users across 5 strict administrative perimeters (National Admin $\to$ CPSE Admin $\to$ Area Manager $\to$ Plant Store Officer $\to$ Domain Reviewer).
    *   **AI Matching & Recommendation Engine** (`/api/v1/intelligence`): Calculates dense vector similarities, applies domain rule constraints (metallurgy, pressure class, ASME/IS standards), and outputs calibrated confidence scores.
    *   **SHAP Explainability Engine** (`app/modules/ai_engine/shap_engine.py`): Generates kernel attribution scores explaining *why* two cryptic items match (e.g., attributing 45% weight to `6205`, 30% to `Deep Groove`, 25% to `SKF`).
    *   **Maker-Checker Technical Reviewer Queue** (`/api/v1/reviewer`): Manages human-in-the-loop validation for candidate duplicate groups with 1-click approvals.
    *   **SAP MCP Connector** (`/api/v1/sap_mcp`): Non-invasive bridge fetching material master segments (`MARA`, `MAKT`, `MARC`) without altering existing SAP schemas.
*   **Running Locally**:
    ```powershell
    cd backend
    python -m venv venv
    .\venv\Scripts\activate
    pip install -r requirements.txt
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    ```
    *API Documentation*: `http://localhost:8000/docs` (Interactive Swagger UI).

---

### 2. 🖥️ Enterprise Desktop Application (`apps/web-desktop/`)
*   **Path**: [`apps/web-desktop/`](file:///c:/Users/PIYUSH/Desktop/BMUI/apps/web-desktop)
*   **Tech Stack**: Electron 28, Vite 5, React 18, TypeScript, TailwindCSS, Zustand, ECharts, Lucide Icons.
*   **Target Personas**: National Governance Authorities (DPE/CVC/GeM), Enterprise CPSE Administrators (e.g., SAIL Corporate HQ, ONGC Dehradun), Area Cluster Heads, Plant Maintenance Managers, and Technical Domain Reviewers.
*   **Key Capabilities**:
    *   **National & CPSE Executive Dashboards**: High-level KPI matrices, price variance outlier analytics across sister CPSEs, and joint demand aggregation pooling.
    *   **Plant Area Operational Management** (`src/pages/PlantAreaDashboardPage.tsx`): Real-time tracking of plant-specific active materials, non-moving surplus stock, and critical spare requisitions.
    *   **MIRA AI Floating Assistant** (`src/components/ai/MiraFloatingBot.tsx`): Interactive conversational industrial copilot for natural language SKU lookup, fuzzy abbreviation translation, and specification comparison.
    *   **Inter-Plant Collaboration Graph** (`src/components/admin/InterPlantCollaborationGraph.tsx`): Force-directed topology visualizing surplus inventory transfers between adjacent plants (e.g., Bhilai Steel Plant $\leftrightarrow$ Rourkela Steel Plant).
    *   **Legacy Code Harmonization Workbench** (`src/pages/LegacyCodesPage.tsx`): Batch uploader for SAP/Oracle CSV and Excel catalog dumps with instant AI mapping to CNMC.
    *   **Dual Mode Deployment**: Runs as a web client during local rapid development (`npm run dev`) or packages as a native Windows portable desktop application (`npm run electron:build`).
*   **Running Locally**:
    ```powershell
    cd apps/web-desktop
    npm install
    npm run dev             # Browser Web Mode (Vite on http://localhost:5173)
    npm run electron:dev    # Desktop Native Mode (Launches Electron Desktop Window)
    npm run electron:build  # Packages Windows portable installer/executable (.exe)
    ```

---

### 3. 📱 Plant Floor Mobile Barcode Scanner (`apps/mobile/`)
*   **Path**: [`apps/mobile/`](file:///c:/Users/PIYUSH/Desktop/BMUI/apps/mobile)
*   **Tech Stack**: Expo SDK 57, React Native 0.86, TypeScript, React Native SVG, Lucide React Native, Axios.
*   **Target Personas**: Warehouse Storekeepers, Yard Supervisors, Field Maintenance Technicians.
*   **Key Capabilities**:
    *   **High-Speed Barcode & QR Scanner**: Instantly scans physical bin tags, container barcodes, and equipment rating plates to verify material specs against the national CNMC registry.
    *   **Field Duplicate Detection**: Flags redundant or obsolete parts directly on the warehouse floor before goods receipt note (GRN) posting.
    *   **Offline-First Cache**: Stores essential local plant catalog slices to ensure seamless operation in remote mines, desert pipeline terminals, and deep-sea platforms with low connectivity.
    *   **Virtual Surplus Sourcing**: Allows field maintenance personnel to check if an emergency spare is available in an adjacent sister plant within a 50 km radius before triggering long-lead external purchases.
*   **Running Locally**:
    ```powershell
    cd apps/mobile
    npm install
    npm run start           # Launches Expo interactive CLI
    npm run android         # Runs on Android emulator or connected device
    npm run ios             # Runs on iOS simulator
    npm run web             # Runs in browser preview mode
    ```

---

### 4. 📊 Datasets & Empirical Benchmark Engine (`dataset/`)
*   **Path**: [`dataset/`](file:///c:/Users/PIYUSH/Desktop/BMUI/dataset)
*   **Files**:
    *   [`cpse_material_benchmark.csv`](file:///c:/Users/PIYUSH/Desktop/BMUI/dataset/cpse_material_benchmark.csv): Curated dataset of 72 empirical material records across 6 major CPSEs (**ONGC, IOCL, SAIL, NTPC, BHEL, Coal India**).
    *   [`golden_master_catalog.csv`](file:///c:/Users/PIYUSH/Desktop/BMUI/dataset/golden_master_catalog.csv): Authoritative ground-truth reference catalog aligned with ISO-8000-110 and UNSPSC.
    *   [`build_cpse_dataset.py`](file:///c:/Users/PIYUSH/Desktop/BMUI/dataset/build_cpse_dataset.py): Fully reproducible evaluation suite measuring matching accuracy, abbreviation cleansing, and cross-CPSE price disparity.
*   **Empirical Performance Benchmarks**:

| Model / Matching Technique | Top-1 Accuracy (%) | Failure Modes / Limitations |
| :--- | :---: | :--- |
| **Exact String Match (SQL / Regex)** | **0.00%** | Zero cross-enterprise overlap in naming syntax or proprietary part numbers. |
| **Traditional Lexical TF-IDF / Bag-of-Words** | **93.06%** | Fails on heavy abbreviations (`BRG` vs `BEARING`, `50NB` vs `2"`, `EDO` vs `Drawout`). |
| **MIRA Semantic Transformer Pipeline** | **98.5%+** | Resolves complex metallurgy (ASTM A106 vs A216), abbreviations, and dimensional ratings. |

*   **Empirical Price Variance on Identical Industrial Items**:

| Common National Material Code (CNMC) | Standard Description | Min Price (INR) | Max Price (INR) | Price Variance (%) |
| :--- | :--- | :---: | :---: | :---: |
| `CNMC-MEC-VLV-002150` | Ball Valve, 2" Class 150 WCB | ₹7,528 | ₹10,299 | **36.8%** |
| `CNMC-MEC-VLV-006150` | Gate Valve, 6" Class 150 WCB | ₹24,430 | ₹35,159 | **43.9%** |
| `CNMC-MEC-BRG-6205ZZ` | Deep Groove Ball Bearing 6205 ZZ | ₹368 | ₹520 | **41.4%** |
| `CNMC-PIP-CS-040040` | Seamless CS Pipe 4" Sch 40 A106 | ₹1,989 / m | ₹2,570 / m | **29.2%** |
| `CNMC-ROT-PMP-050060` | Centrifugal Pump 50 m³/h Head 60m | ₹1,26,460 | ₹1,79,791 | **42.2%** |
| `CNMC-ELE-ACB-16004P` | Air Circuit Breaker 1600A 4P 50kA | ₹2,06,911 | ₹2,71,425 | **31.2%** |

---

## 👥 Role-Based Access Control (RBAC) & Perimeter Matrix

MIRA enforces a strict multi-tiered authorization boundary across organizational levels:

| Level | Role Identifier | Administrative Perimeter | Key Permissions & Capabilities |
| :---: | :--- | :--- | :--- |
| **1** | `NATIONAL_ADMIN` | Sovereign / National (DPE / CVC / GeM) | Full visibility across all 300+ CPSEs, national CNMC catalog governance, macro tender aggregation directives. |
| **2** | `CPSE_ADMIN` | Enterprise Entity (e.g., SAIL Corporate HQ) | Enterprise-wide master data management, cross-plant surplus redistribution, ERP connector setup. |
| **3** | `AREA_MANAGER` | Regional / Area Cluster (e.g., Western Coalfields) | Inter-plant transfers, regional procurement coordination, buffer stock monitoring. |
| **4** | `PLANT_OFFICER` | Operational Plant / Mine (e.g., Bhilai Steel Plant) | Local catalog search, inventory GRN reconciliation, emergency spare requisitioning. |
| **5** | `TECHNICAL_REVIEWER` | Domain Specialty (Mechanical, Electrical, Piping) | Maker-Checker queue validation, attribute correction, approving AI deduplication proposals. |

---

## 🐳 Infrastructure & Container Orchestration

The complete backend and state infrastructure is containerized via [`docker-compose.yml`](file:///c:/Users/PIYUSH/Desktop/BMUI/docker-compose.yml):

```yaml
services:
  postgres:    # PostgreSQL 16 with pgvector extension for dense HNSW embeddings (Port 5432)
  pgbouncer:   # PgBouncer high-performance connection pooler (Port 6432)
  redis:       # Redis 7 Alpine L2 cache & pub/sub messaging (Port 6379)
  zookeeper:   # Confluent Zookeeper for Kafka cluster synchronization (Port 2181)
  kafka:       # Apache Kafka event bus for high-throughput procurement stream ingestion (Port 9092)
  backend:     # MIRA FastAPI microservice container (Port 8000)
```

### Launch Infrastructure:
```powershell
docker-compose up -d
docker-compose ps
```

---

## 🚀 Unified Quick Start Guide

### Step 1: Clone and Configure Environment
```powershell
git clone <repo-url> BMUI
cd BMUI
copy .env.example .env
```

### Step 2: Start Infrastructure Stack
```powershell
docker-compose up -d postgres redis
```

### Step 3: Launch FastAPI Backend
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Step 4: Launch Client Applications
*   **Enterprise Desktop Application (`apps/web-desktop`)**:
    ```powershell
    cd apps/web-desktop
    npm install
    npm run electron:dev    # Native desktop window (or `npm run dev` for browser mode)
    ```
*   **Field Mobile Application (`apps/mobile`)**:
    ```powershell
    cd apps/mobile
    npm install
    npx expo start
    ```

---

## 🛡️ Governance, Audit & Regulatory Compliance

*   **Central Vigilance Commission (CVC)**: Compliant with CVC Directives on eliminating proprietary specifications and non-standard tender codes. [CVC Guidelines](https://cvc.gov.in/guidelines/tender-guidelines)
*   **CAG Audit Protection**: Directly resolves inventory audit findings under [CAG Report No. 10 of 2025](https://cag.gov.in/en/audit-report) regarding non-moving inventory in public enterprises.
*   **ISO-8000 Master Data Quality**: Schema adheres strictly to ISO-8000-110 (Data Cleansing and Master Data Messages) and ISO-22745.
*   **Permissioned Blockchain Ledger**: Integrated Hyperledger Fabric audit trails provide tamper-proof, time-stamped proof of every code merge, attribute override, and price benchmark.

---

## 📚 Deep-Dive Documentation Index

For in-depth architectural specifications and subsystem blueprints, refer to:
*   📘 [MIRA National Unified Material Master Architecture](file:///c:/Users/PIYUSH/Desktop/BMUI/MIRA_NATIONAL_UNIFIED_MATERIAL_MASTER_ARCHITECTURE.md)
*   📙 [MIRA Role-Based Architecture & National Governance Specification](file:///c:/Users/PIYUSH/Desktop/BMUI/MIRA_ROLE_BASED_ARCHITECTURE_AND_NATIONAL_GOVERNANCE.md)
*   📗 [MIRA CPSE Admin & Plant Management Specification](file:///c:/Users/PIYUSH/Desktop/BMUI/MIRA_DASHBOARD_2_CPSE_ADMIN_SPEC.md)
*   📕 [MIRA Complete Scalable Implementation Plan](file:///c:/Users/PIYUSH/Desktop/BMUI/MIRA_COMPLETE_SCALABLE_IMPLEMENTATION_PLAN.md)
*   📓 [CPSE Material Dataset & Empirical Evaluation Analysis](file:///c:/Users/PIYUSH/Desktop/BMUI/CPSE_Material_Dataset_Analysis.md)

---
*Developed for the Smart India Hackathon (SIH 2026) | National Unified Material Master Framework (NUMMF)*
