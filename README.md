# TC Flow — Total Compensation Visualizer

> See where every dollar of your TC actually goes.

A client-side SPA that visualizes how a software engineer's total compensation flows from gross TC through taxes and deductions to take-home pay. Built with Vite + React + TypeScript, powered by a pure-function tax engine with 2024–2026 federal and all-50-state data.

**Live:** https://charryWu.github.io/tc-flow/

---

## Features

- **Sankey diagram** — interactive left-to-right flow: Gross TC → pre-tax deductions → taxes → take-home
- **Donut chart** — at-a-glance percentage breakdown
- **Federal bracket table** — highlights the bracket containing your taxable income
- **KPI summary cards** — gross TC, take-home, effective tax rate, total taxes
- **All 50 states + D.C.** state income tax data
- **Multi-year support** — 2024, 2025, 2026 tax data (lazy-loaded per year)
- **Zero backend** — all computation in the browser, no data leaves your device

---

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173/tc-flow/

## Tests

```bash
npm test
```

## Build

```bash
npm run build
```

---

## Architecture

```
src/engine/       Pure tax calculation functions (no React)
src/data/         Static 2026 tax data (instant load)
public/tax-data/  JSON files per tax year (lazy-loaded)
src/store/        Zustand state management
src/components/   React UI components
src/utils/        Sankey builder, currency formatting
```

**Key rule:** The engine never contains hardcoded tax numbers. All parameters come from `TaxYearData` JSON. Adding a new tax year = one JSON file + one line in `manifest.json`.

---

## Tax Data Sources

- Federal brackets: IRS Revenue Procedure 2025-32 (2026), Rev. Proc. 2024-40 (2025), Rev. Proc. 2023-34 (2024)
- FICA wage base: Social Security Administration
- State rates: State revenue departments

*Figures are estimates. Consult a tax professional for actual tax advice.*
