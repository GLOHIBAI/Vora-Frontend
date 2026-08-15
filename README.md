# 🌟 VORA Frontend

VORA is a high-fidelity, enterprise-grade talent assessment, clinical simulation, mentor matching, and vacancy fulfillment platform. Built with **React 19**, **TypeScript**, **Vite 8**, **Tailwind CSS v4**, and **TanStack Query v5**, VORA powers dynamic candidate evaluations across cognitive, psychometric, clinical, and practical domains while offering end-to-end job vacancy, hiring vault, and escrow payment management for employers and mentors.

---

## 📑 Table of Contents

- [🌟 VORA Frontend](#-vora-frontend)
  - [📑 Table of Contents](#-table-of-contents)
  - [✨ Core Capabilities \& Modules](#-core-capabilities--modules)
    - [1. 👤 Talent Assessment \& Multi-Gate Flow Engine](#1--talent-assessment--multi-gate-flow-engine)
    - [2. 🏢 Employer Job Wizard, Hiring Vaults \& Applicant Management](#2--employer-job-wizard-hiring-vaults--applicant-management)
    - [3. 💳 Payments, Escrow \& Wallet Infrastructure](#3--payments-escrow--wallet-infrastructure)
    - [4. 🎓 Mentor Portal \& Upskilling Catalog](#4--mentor-portal--upskilling-catalog)
    - [5. 🛡️ Anti-Cheat, Resiliency \& Offline Safeguards](#5-️-anti-cheat-resiliency--offline-safeguards)
  - [🛠️ Technology Stack](#️-technology-stack)
  - [📂 Project Architecture \& Directory Structure](#-project-architecture--directory-structure)
  - [⚙️ Environment Configuration](#️-environment-configuration)
  - [⚡ Getting Started](#-getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Development Server](#development-server)
    - [Type Checking \& Production Build](#type-checking--production-build)
    - [Preview Production Build](#preview-production-build)
    - [Linting](#linting)
  - [🔒 Authentication \& Security Architecture](#-authentication--security-architecture)
  - [📊 Assessment Item Type Registry](#-assessment-item-type-registry)
  - [🤝 Contributing \& Code Conventions](#-contributing--code-conventions)

---

## ✨ Core Capabilities & Modules

### 1. 👤 Talent Assessment & Multi-Gate Flow Engine

* **Candidate Onboarding & AI Profile Matching**:
  * **CV Parsing & Validation**: Real-time resume upload (`RoleCvUpload`) and extraction.
  * **AI Matching Pipeline**: Animated matching engine (`RoleProfileMatchBuilding`) assessing role suitability against domain criteria.
  * **Match Outcomes**: Dynamically routes candidates based on match state:
    * `RoleProfileMatchResult`: Eligible candidates proceed to role-specific requirements and assessments.
    * `RoleProfileMatchBlocked` / `RoleProfileMatchWaitlist`: Candidate holds or domain restrictions.
    * `RoleProfileMatchUpskill`: Recommended mentor profiles and educational pathways to bridge skill gaps.
    * `RoleProfileRolesFound`: Alternative job vacancies matched to the candidate's existing strengths.
  * **Role-Specific Employer Asks**: Multi-step questionnaires capturing candidate preferences, experience, and eligibility before starting assessments.

* **Gate 1: Active Cognitive & Psychometric Assessment**:
  * **Comprehensive Evaluation**: Orchestrates forced-choice psychometrics, workplace values trade-offs, situational judgment (SJT), reading comprehension, and cognitive/pattern problem solving.
  * **Live vs. Mock Engine**: Toggleable via `VITE_GATE1_API_ENABLED` to support in-app simulations or live backend assessment sessions.
  * **Asynchronous Scoring & Verdict Polling**:
    * **PASS (`RoleAssessmentSessionTwoResults`)**: Highlights candidate score percentiles, narrative feedback, trait radar breakdowns, and next-stage unlocking.
    * **FAIL (`RoleAssessmentSessionTwoOutcome`)**: Pinpoints specific shortfalls with benchmark score comparisons, diagnostic rationale, and matched mentor recommendations.

* **Gate 2: Domain Knowledge & Clinical/Practical Simulation Engine**:
  * **Sequential Pillar Architecture**:
    1. **Pillar 1 (Knowledge)**: Pharmacology, Biostatistics, and Clinical/Regulatory Compliance.
    2. **Pillar 2 (Expertise)**: Child Malnutrition, Malaria Protocols, and Cold Chain Logistics.
    3. **Pillar 3 (Reasoning)**: Critical Appraisal, Data Interpretation, and Diagnostic Reasoning.
    4. **Pillar 4 (Practical & Simulation)**: Interactive scenario simulations (Simulations 1–4).
  * **Content-Ready Resiliency (`contentReady: false`)**: Gracefully handles async question generation latency by showing a preparing screen and polling `GET .../gates/2/pillars/{pillar}/items` every 2.5s with a 60s timeout safeguard.
  * **Dynamic Progression & Timer Interception**: Handles HTTP 400 timeout or double-submission responses (`"This component has already been submitted"`, `"The time limit for this question has ended"`) by locking local draft states and automatically advancing candidates across windows without trapping them.

* **Gate 3: Async Video Response Studio (`RoleAssessmentStageThreeVideo`)**:
  * Embedded camera and microphone capture suite with device permission checks, recording countdowns, max retake limits, preview playback, and direct video upload endpoints.

* **Gate 4: Evaluation Verdict & Post-Hire Tracking**:
  * Comprehensive assessment debrief, scoring breakdown, and candidate post-hire tracking view (`PostHireTrackingView`).

---

### 2. 🏢 Employer Job Wizard, Hiring Vaults & Applicant Management

* **Post Job Wizard (`PostJobWizard`)**:
  * 5-step intuitive wizard configuring role metadata, compensation structures (Salary, Contract, Hourly, Stipend) across global currencies, timezone multi-selectors, candidate qualification criteria, and job description file uploads.
* **Hiring Vault Management**:
  * **Vault Role Configuration & Review**: Steppers mapping lock-in fees, timeline rules, and allowed edit quotas (`EditVaultRole`, `VaultEditReview`, `VaultRoleConfirmation`).
  * **Edit Allowance Meter & Escrow Recalculation**: Live calculation of financial escrow adjustments when role terms or candidate counts change.
* **Applicant Pipeline & Actions**:
  * Candidate evaluation lists (`ApplicantsTabView`, `ApplicantDetailsModal`), rejection workflows with customizable feedback templates (`Rejection`), and scheduling for Final Alignment Sessions (`FinalAlignmentSession`).

---

### 3. 💳 Payments, Escrow & Wallet Infrastructure

* **Wallet & Escrow Dashboard (`PaymentsOverview`)**:
  * Overview of available wallet balance, funds held in escrow, spent amounts, and pending transactions.
* **Escrow & True-Up Engine**:
  * Real-time calculation of locked escrow commitments and automated True-Up banners/modals (`TrueUpOwedBanner`, `TrueUpModal`) when hiring terms shift.
* **Top-Up & Withdrawal Workflows**:
  * Multi-method fund management (Bank Transfer, Credit/Debit Cards, External Wallets) with transaction fee calculations, security badges, and downloadable receipts (`TransactionReceiptModal`).
* **Transaction History**:
  * Filterable audit trail (`TransactionsTable`) with type indicators, search, date range pickers, and export capabilities.

---

### 4. 🎓 Mentor Portal & Upskilling Catalog

* **Mentor Application & Onboarding (`MentorApply`, `MentorOnboarding`)**:
  * Specialized onboarding workflow for industry mentors to define domain specialties, years of experience, credentials, hourly/session rates, and availability.
* **Mentor Dashboard (`MentorDashboard`)**:
  * Mentorship engagement tracking, candidate review requests, and scheduled mentoring sessions.

---

### 5. 🛡️ Anti-Cheat, Resiliency & Offline Safeguards

* **Anti-Cheat Engine**:
  * **Tab-Switch Detection**: Monitors document visibility states (`visibilitychange`). Dispatches warnings and automatically submits timed sessions upon exceeding cheat thresholds (configurable via `VITE_ENABLE_ANTI_CHEAT_TAB_SWITCH`).
  * **Clipboard Paste Blocking**: Prevents pasting into open-ended response textareas when `VITE_ENABLE_ANTI_CHEAT_PASTE=true`.
* **Network & Offline Recovery (`useOnlineStatus`)**:
  * Detects connection drops and triggers an emergency backup to save local draft progress before smoothly redirecting the candidate.
* **State Resumption (`/interview/resume`)**:
  * Candidates can safely resume active assessments from their exact state and question window across any browser session.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Core Framework** | [React 19](https://react.dev/) (`19.2.5`), [React DOM](https://react.dev/) (`19.2.5`), [Vite 8](https://vite.dev/) (`8.0.10`) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (`~6.0.2`) with strict type-safety |
| **Styling & Design** | [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite` `4.2.4`), CSS Variables, Raleway Typography |
| **UI Components & Icons** | [MUI Material v9](https://mui.com/) (`9.0.1`), [MUI Icons](https://mui.com/) (`9.0.1`), Emotion (`11.14.x`) |
| **Routing & Navigation** | [React Router DOM v7](https://reactrouter.com/) (`7.15.0`) with lazy route splitting |
| **Server State & Caching**| [TanStack React Query v5](https://tanstack.com/query/latest) (`5.100.10`) |
| **Authentication** | [Google OAuth](https://www.npmjs.com/package/@react-oauth/google) (`0.13.5`), JWT Tokens with single-flight refresh |
| **Geopolitical Data** | [country-state-city](https://www.npmjs.com/package/country-state-city) (`3.2.1`) for ISO-2 localization |
| **Notifications** | [React Hot Toast](https://react-hot-toast.com/) (`2.6.0`) with custom styling |
| **Code Quality** | ESLint 10 (`@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`) |

---

## 📂 Project Architecture & Directory Structure

```text
Vora-Frontend/
├── .env.example                  # Environment variable blueprint
├── catalog/                      # Canonical Gate 2 submit shapes & validation utilities
│   ├── gate2-submit-shape.util.ts
│   └── gate2-submit-shape.util.test.ts
├── public/                       # Static public assets
├── src/
│   ├── catalog/                  # Assessment shape catalog reference
│   ├── components/               # Modular component library
│   │   ├── auth/                 # Route guards (EmployerRoute, RoleApplyRoute) & auth forms
│   │   ├── common/               # 47+ reusable UI primitives (Buttons, Inputs, DatePicker, Selects, etc.)
│   │   ├── dashboard/            # Stat cards, quick actions, job cards
│   │   ├── employer/             # PostJobWizard, modals, applicant tables
│   │   ├── jobs/                 # Job management views
│   │   ├── mentor/               # Mentor dashboard components
│   │   ├── payments/             # Escrow cards, true-up modals, top-up/withdraw flows
│   │   ├── roleLanding/          # Role landing sections & call-to-actions
│   │   ├── settings/             # Tabbed settings panels & profile configuration
│   │   ├── talent/               # Talent assessment screens, journey rails, match cards
│   │   │   ├── assessment/       # AssessmentItemRenderer, Gate1ScreenView, SessionRails
│   │   │   │   ├── items/        # 20 item type renderers (MCQ, Cloze, Code, Rank, etc.)
│   │   │   │   └── shared/       # DataDisplayBlock, ReasonTextarea, CustomSelect, OptionButton
│   │   │   └── profileMatch/     # Match state cards (Building, Result, Upskill, Blocked)
│   │   └── vault/                # Vault edit meters, escrow recalculations, countdowns
│   ├── config/                   # Global configuration (gate1Api, toastOptions)
│   ├── constants/                # Currencies, brand colors, navigation, wizard constants
│   ├── context/                  # AuthContext (multi-token support, session handling)
│   ├── data/                     # Static reference datasets
│   ├── hooks/                    # 19 custom hooks (useAssessmentScreen, useCountdown, useOnlineStatus, etc.)
│   ├── layout/                   # MainLayout, DashboardLayout, ProtectedDashboardLayout
│   ├── mocks/                    # Mock data generators for Gate 1 & Stage 1 offline testing
│   ├── pages/                    # Route page components
│   │   ├── auth/                 # Login, Signup, RoleSignup, VerifyOTP, SelectAccountType
│   │   ├── employer/             # Jobs, JobDetails, Payments, Hiring Vault, Rejection, Alignment
│   │   ├── mentor/               # MentorApply, MentorOnboarding
│   │   ├── onboarding/           # Welcome, OnboardingContainer
│   │   ├── public/               # RoleLanding
│   │   ├── talent/               # 66 assessment stages, gates, simulations & match views
│   │   ├── Dashboard.tsx         # Unified role-aware dashboard
│   │   ├── Settings.tsx          # User & company settings
│   │   └── NotFound.tsx          # Custom 404 page
│   ├── services/                 # API & Data services
│   │   ├── api/                  # Fetch wrapper, single-flight refresh token interceptor, error formatter
│   │   └── queries/              # TanStack Query hooks (assessments, auth, onboarding, rolePostings, talent)
│   ├── types/                    # 27 TypeScript domain type definition files
│   ├── utils/                    # 44 helper utilities (assessmentFlow, validation, dates, OAuth, etc.)
│   ├── App.tsx                   # Master routing configuration with suspense & guards
│   ├── index.css                 # Tailwind CSS v4 design tokens & Raleway typography
│   └── main.tsx                  # Application bootstrap (QueryClientProvider, BrowserRouter, AuthProvider)
├── package.json                  # Dependencies & execution scripts
├── tsconfig.json                 # TypeScript compiler configuration
└── vite.config.ts                # Vite 8 & Tailwind CSS configuration
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the project root based on `.env.example`:

```bash
cp .env.example .env
```

| Variable | Description | Default / Example |
|---|---|---|
| `VITE_API_BASE_URL` | Base endpoint for the VORA backend API (include `/api/v1` prefix if applicable) | `https://api.vora.com/v1` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID for candidate and employer social authentication | `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` |
| `VITE_GATE1_API_ENABLED` | Set to `"true"` to communicate with live Gate 1 endpoints; `"false"` to use in-app simulation mocks | `false` |
| `VITE_ENABLE_ANTI_CHEAT_TAB_SWITCH` | Set to `"true"` to enable tab-switch visibility warnings & auto-submit triggers; `"false"` for local debugging | `false` |
| `VITE_ENABLE_ANTI_CHEAT_PASTE` | Set to `"true"` to restrict clipboard paste operations in open textareas; `"false"` for dev debugging | `false` |

---

## ⚡ Getting Started

### Prerequisites

* **Node.js**: `v20.0.0` or higher recommended
* **Package Manager**: [pnpm](https://pnpm.io/) (`>= 9.x`) or [npm](https://www.npmjs.com/)

### Installation

Install dependencies using `pnpm`:

```bash
pnpm install
```

*(Alternatively, use `npm install`)*

### Development Server

Start the local Vite development server:

```bash
pnpm run dev
```

The application will be accessible at `http://localhost:5173`.

### Type Checking & Production Build

Verify strict TypeScript types and compile the optimized production bundle:

```bash
# Type check without emitting files
pnpm exec tsc --noEmit

# Build production bundle
pnpm run build
```

The compiled assets will be output to the `dist/` directory.

### Preview Production Build

Preview the generated build locally:

```bash
pnpm run preview
```

### Linting

Run ESLint to check for code quality and syntax standards:

```bash
pnpm run lint
```

---

## 🔒 Authentication & Security Architecture

* **Multi-Token Authorization Model**:
  * **Standard Access Token (`auth_token`)**: Bearer token attached to protected API requests.
  * **OAuth Setup Token (`oauth_setup_token`)**: Temporary token utilized during Google OAuth onboarding before account finalization.
* **Single-Flight Token Refresh**:
  * `services/api/refreshToken.ts` queues concurrent 401 requests and executes a single background token refresh operation to prevent race conditions.
* **Role-Based Guards**:
  * `ProtectedDashboardLayout`: Enforces authenticated sessions for dashboard pages.
  * `EmployerRoute`: Restricts employer-only views (Job Creation, Hiring Vaults, Payments, Escrow, Alignment Sessions).
  * `RoleApplyRoute`: Protects dynamic candidate job-link application and assessment paths (`/onboarding/talent/:roleSlug/*`).

---

## 📊 Assessment Item Type Registry

VORA supports 53 domain assessment item types mapped dynamically to specialized UI renderers via `AssessmentItemRenderer` and `registry.ts`:

| Family | Item Types | Component |
|---|---|---|
| **Single-Select & Reasoning** | `sb`, `jb`, `allocate`, `mcq`, `sjt_single_best`, `data`, `dashboard`, `chartread`, `abtest`, `diagnose`, `architect`, `liveplan`, `liveui`, `livemedia`, `liveadapt`, `livecrisis`, `liveedit`, `livepost`, `risktriage`, `orchestrate`, `factcheck`, `proofread`, `querybuild`, `metric`, `threshold`, `visual`, `coverage`, `dataquality`, `editbay`, `errorbudget`, `grade`, `leveledit`, `audiomix`, `palette`, `position`, `shotlist`, `systemcheck`, `nextq` | `SingleSelectItem.tsx` + `ReasonTextarea.tsx` |
| **Compare A/B** | `compare` | `CompareItem.tsx` |
| **Multi-Select** | `ms`, `sjt_multi_select` | `MultiSelectItem.tsx` |
| **Ranking** | `rank`, `drag_rank`, `sjt_rank_all`, `visualrank` | `RankItem.tsx` |
| **Matching** | `match` | `MatchItem.tsx` |
| **Cloze Dropdowns** | `cloze` | `ClozeItem.tsx` + `CustomSelect.tsx` |
| **Categorization** | `cat` | `CatItem.tsx` |
| **Free-Text Probes** | `probe` | `ProbeItem.tsx` (Word Count Enforced) |
| **Work Samples** | `work_sample` | `WorkSampleItem.tsx` |
| **Numeric & Rating Scales** | `numeric`, `scale` | `NumericScaleItem.tsx` |
| **Code & Scripting** | `code`, `livecode` | `CodeItem.tsx` (Syntax Formatting) |
| **Visual Spot & Hotspots** | `hotspot`, `visualspot` | `HotspotItem.tsx` |
| **Text Highlight** | `highlight` | `HighlightItem.tsx` |
| **Situational Judgment** | `ml`, `sjt_most_least` | `SjtMostLeastItem.tsx` |
| **Psychometric & Values** | `likert_scale`, `forced_choice`, `values_ab_pairs`, `values_tradeoff`, `sjt_values_tradeoff` | `LikertItem.tsx`, `ForcedChoiceItem.tsx`, `ValuesAbPairsItem.tsx`, `ValuesTradeoffItem.tsx` |
| **Adaptive MCQ** | `adaptive_mcq` | `AdaptiveMcqItem.tsx` |
| **Data Visualizations** | Nested / Flat / Time-Series Bar & Metric Displays | `DataDisplayBlock.tsx` |

---

## 🤝 Contributing & Code Conventions

1. **Strict Type Safety**: Avoid `any` where possible; leverage domain types in `src/types/` and `src/services/queries/`.
2. **Design Tokens**: Use predefined CSS variables (`--primary`, `--text-main`, `--border-default`) and Tailwind theme classes.
3. **Component Modularity**: Place reusable widgets in `src/components/common/` and domain-specific UI in feature directories.
4. **Error Handling**: Use `formatValidationError` and `getApiErrorMessage` from `src/services/api/` for human-friendly error messages.

---

<div align="center">
  <sub>Built with ❤️ by the <b>VORA Engineering Team</b></sub>
</div>
