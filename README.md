# 🌟 VORA Frontend

Vora is a high-fidelity React application for talent assessment, professional mentoring, and vacancy matching, built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**.

It facilitates dynamic applicant-facing cognitive and clinical simulations, alongside streamlined job vacancy and versioning tools for employers.

---

## 🚀 Key Modules & Capabilities

### 👤 Talent Assessment Suite
*   **Gate 1 Active Assessment (`/interview/stage-1`)**: Ordered onboarding, personality inventories, values queries, numerical, cognitive, pattern, and verbal sessions.
*   **Stage 1 Verdict & Outcomes**: Polls async scoring state while generating results:
    *   **PASS (`RoleAssessmentSessionTwoResults`)**: Renders personalized headline highlights, dynamic narrative feedback, traits breakdown progress, and details for Stage 2.
    *   **FAIL (`RoleAssessmentSessionTwoOutcome`)**: Pinpoints specific shortfalls (gaps list with scores), diagnosis (mentorship vs course rationale), catalog mentor profiles, and projected uplifts for alternative vacancies.
*   **Stage 2 Domain Simulations**: Interactive clinical biostatistics, compliance, and pharmacology scenarios.
*   **Stage 3 Video Response Recorder**: Embedded camera capture tools for recording, reviewing, and uploading candidate responses.
*   **Onboarding & Geopolitical Translation**: Country options dynamically translate to standard ISO-2 codes (`NG`, `GB`) to align with API specs, with inverse translation on resume.

### 🏢 Employer Job Wizard & Vaults
*   **Dynamic Post Job Wizard (`PostJobWizard`)**: Configures role descriptions, timezone selectors, and regional target inputs.
*   **Hiring Vault Stepper**: steppers mapping lock-in fees, timeline rules, and allowed role edit quotas.

---

## 🛠️ Technology Stack

*   **Framework**: React 18 (Vite-powered)
*   **Language**: TypeScript (Strict checks)
*   **Server State**: `@tanstack/react-query` (v5 cached workflows)
*   **Styling**: Tailwind CSS + custom mobile-responsive utility overrides
*   **Navigation**: React Router DOM (v6)

---

## ⚡ Development & Maintenance

### Install dependencies:
```bash
pnpm install
```

### Start Vite development server:
```bash
pnpm run dev
```

### Verify type safety:
```bash
pnpm exec tsc --noEmit
```
