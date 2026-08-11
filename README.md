# 🌟 VORA Frontend

Vora is a high-fidelity React application for talent assessment, professional mentoring, and vacancy matching, built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**.

It facilitates dynamic applicant-facing cognitive, numerical, and clinical simulations, alongside streamlined job vacancy and versioning tools for employers.

---

## 🚀 Key Modules & Capabilities

### 👤 Talent Assessment Suite & Gate Flow Engine
*   **Gate 1 Active Assessment (`/interview/stage-1`)**: Ordered onboarding, personality inventories, values queries, numerical, cognitive, pattern, and verbal sessions.
*   **Stage 1 Verdict & Outcomes**: Polls async scoring state while generating results:
    *   **PASS (`RoleAssessmentSessionTwoResults`)**: Renders personalized headline highlights, dynamic narrative feedback, traits breakdown progress, and details for Stage 2.
    *   **FAIL (`RoleAssessmentSessionTwoOutcome`)**: Pinpoints specific shortfalls (gaps list with scores), diagnosis (mentorship vs course rationale), catalog mentor profiles, and projected uplifts for alternative vacancies.
*   **Stage 2 Domain Simulations & Interviews**: Interactive clinical biostatistics, compliance, expertise, reasoning, and pharmacology scenarios.
    *   **Preparing State Resiliency (`contentReady: false`)**: Gracefully handles async question generation latency by displaying a preparing screen and polling `GET .../gates/2/pillars/{pillar}/items` (every 2.5s) with a 60s timeout safeguard.
    *   **Automatic Progression**: Automatically advances candidates across windows and pillars (Knowledge $\rightarrow$ Expertise $\rightarrow$ Reasoning $\rightarrow$ Simulation $\rightarrow$ Review) without trapping users on repeated questions.
    *   **Submission & Timer Interception**: Handles HTTP 400 responses (`"This component has already been submitted"`, `"The time limit for this question has ended"`) by locking local draft states and permitting smooth navigation.
*   **Data Visualization & Code Display**:
    *   **Grouped Multi-Series Bar Charts (`DataDisplayBlock`)**: Renders flat, nested, and time-series chart data structures with color-coded legends and relative value scaling.
    *   **IDE Code Snippet Formatter (`OptionButton`)**: Formats inline code choices into multi-line indented code blocks for technical items.
    *   **Unclipped Custom Dropdowns (`CustomSelect`)**: Dynamic dropdown expansion and text wrapping for fill-in-the-gap (`ClozeItem`) options.
*   **Stage 3 Video Response Recorder**: Embedded camera capture tools for recording, reviewing, and uploading candidate responses.
*   **Onboarding & Geopolitical Translation**: Country options dynamically translate to standard ISO-2 codes (`NG`, `GB`) to align with API specs, with inverse translation on resume.

### 🏢 Employer Job Wizard & Vaults
*   **Dynamic Post Job Wizard (`PostJobWizard`)**: Configures role descriptions, timezone selectors, and regional target inputs.
*   **Hiring Vault Stepper**: Steppers mapping lock-in fees, timeline rules, and allowed role edit quotas.

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

### Verify type safety & build:
```bash
pnpm exec tsc --noEmit
pnpm run build
```

