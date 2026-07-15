# 🌟 VORA Frontend

VORA is a modern, high-fidelity talent matching and employer alignment platform built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**. It provides seamless, beautiful, and secure workflows for three primary user roles: **Talent**, **Mentors**, and **Employers**.

---

## 🚀 Key Features

### 🏢 Employer Hub & Premium Post Job Flow
*   **Unified Post Job Entry**: Seamless modal-to-wizard transition. Clicking "Post a job" triggers a selection modal (`PostJobModal`) allowing employers to choose hiring modes and upload job descriptions before entering the full-screen flow.
*   **Premium Post Job Wizard (`PostJobWizard`)**: A state-of-the-art multi-step form built with a highly responsive sidebar navigation, regional timezone shortcuts, and geopolitical policy configurations.
*   **Escrow & Vault Integration (Scheduled Hiring)**: Custom-designed Vault lifecycle panel that expands dynamically, featuring:
    *   Dynamic **Role specification version allowance meter** that tracks remaining allowed edits.
    *   Escrow lock fee warnings.
    *   Start/end date schedulers.
    *   Beautiful visual stepper of the Vault lifecycle.

### 👤 Talent Hub & Modernized Onboarding
*   **Robust Multi-Step Onboarding**: Smoothly guides professionals through identity verification, interest mapping, and professional backgrounds.
*   **Stage 1 Verdict & Interview Route Renovation**:
    *   Renamed active assessment routes to `/interview/stage-1` for a clean applicant-facing layout.
    *   Fully integrated asynchronous verdict evaluation (`GET .../gates/1/verdict`), introducing polling feedback spinners while scoring completes.
    *   Renders dynamic LLM outcome content on pass (headlines, narrative logs, traits percentages, and next-stage window slots).
    *   Renders targeted feedback on fail (gap metrics, diagnosis, recommended mentors, and future matches).
*   **Bidirectional ISO-2 Translation**: Seamlessly translates user-friendly dropdown options (like `Nigeria`, `United Kingdom`) into standard 2-letter ISO codes (`NG`, `GB`) to conform with strict backend API schemas, while performing reverse-mapping to keep components fully populated and reactive upon page reloads.

### 🔒 Core Services & Security
*   **VORA Query Client**: Unified query services structured in `@tanstack/react-query` under `src/services/queries/`.
*   **Secure Authentication Flow**: Integrated OTP verification and OAuth authentication.
*   **Resend Verification Code**: Updated standard registration flows to point to the correct backend `/api/v1/auth/resend-verification` endpoint.

---

## 🛠️ Tech Stack

*   **Framework**: React 18+ (Vite)
*   **Language**: TypeScript (strict type checks)
*   **Styles**: Tailwind CSS + custom premium animations
*   **State Management**: React Context (`AuthContext`)
*   **Server State**: `@tanstack/react-query` (v5)
*   **Icons**: Custom Lucide wrapper icons

---

## 📦 Project Directory Layout

```
src/
├── components/          # Reusable shared components
│   ├── common/          # Buttons, Inputs, Icons, Tags
│   └── employer/        # PostJobWizard, PostJobModal, ApplicantsTabView
├── context/             # Authentication & global context providers
├── data/                # Static lists, onboarding options, mapping data
├── layout/              # Multi-tier route wrapper templates
├── pages/               # Page routes grouped by role
│   ├── auth/            # Login, Signup, OTP Verification
│   ├── employer/        # Jobs management, Employer Onboarding
│   ├── mentor/          # Mentor Onboarding, Mentor Dashboard
│   └── talent/          # Talent Onboarding, Profile Setup
├── services/            # API client and TanStack mutations/queries
└── types/               # Strictly declared TypeScript interfaces
```

---

## ⚡ Development & Build

### Install dependencies:
```bash
pnpm install
# or
npm install
```

### Start Vite development server:
```bash
npm run dev
```

### Typecheck code for errors:
```bash
npx tsc --noEmit
```

### Build production bundle:
```bash
npm run build
```
